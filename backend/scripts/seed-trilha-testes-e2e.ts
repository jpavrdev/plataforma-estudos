// Seed da trilha Testes E2E com Cypress e Playwright (intermediario). Idempotente e não
// destrutivo: se a trilha já tiver aulas, não faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-testes-e2e.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Testes E2E com Cypress e Playwright";
const DESCRICAO =
    "Trilha de testes de ponta a ponta no navegador: o que o E2E prova e o que ele custa, Cypress e Playwright na prática, seletores que não quebram, espera por condição em vez de pausa fixa, interceptação e simulação de rede, autenticação e preparação de dados por atalho, organização da suíte com Page Objects e etiquetas, execução no pipeline com evidências e paralelismo, e as camadas vizinhas de API, acessibilidade, teste visual e teste de componente.";
const CARGA_HORARIA = 20;

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULOS: Modulo[] = [
    {
        titulo: "Módulo 1 - O que é teste E2E e quando usar",
        aulas: [
            {
                titulo: "O que um teste E2E faz e o que ele custa",
                blocks: [
                    {
                        type: "text",
                        value: '# O que um teste E2E faz e o que ele custa\n\nBem-vindo ao topo da pirâmide de testes. Aqui os testes abrem um navegador de verdade, clicam nos botões de verdade e percorrem o sistema do mesmo jeito que uma pessoa percorreria.\n\nUm teste **end-to-end** (ponta a ponta, ou simplesmente E2E) verifica um fluxo completo, atravessando todas as camadas: interface, rede, backend, banco e integrações. É o único tipo de teste que responde à pergunta que mais importa para quem paga a conta: **"dá para comprar no meu site?"**.\n\nNenhum outro nível responde isso. O teste de unidade prova que a regra de desconto calcula certo. O teste de API prova que a rota devolve o valor certo. Só o E2E prova que a pessoa consegue, de fato, colocar o produto no carrinho, aplicar o cupom, pagar e ver a confirmação.',
                    },
                    {
                        type: "text",
                        value: "## O que ele garante que os outros não garantem\n\nExistem defeitos que **só** aparecem no fluxo inteiro:\n\n- O botão que existe, funciona, mas está atrás de um banner de cookies e ninguém consegue clicar.\n- A tela que chama a rota errada, com a regra certa dos dois lados.\n- O campo que envia a data em formato diferente do que a API espera.\n- O fluxo que funciona isolado e quebra quando o passo anterior deixa a sessão em outro estado.\n- O erro de JavaScript que só acontece naquele navegador, naquela resolução.\n\nSão defeitos de **ligação**. Cada peça está certa; a montagem está errada. E montagem é exatamente o que o E2E testa.",
                    },
                    {
                        type: "text",
                        value: '## E o preço disso\n\nAgora a parte que todo time descobre tarde. O E2E é, disparado, o teste mais caro que existe, em três dimensões:\n\n**Lento.** Um teste de unidade roda em milissegundos. Um E2E sobe um navegador, carrega a aplicação, espera requisições, navega entre telas. Segundos por teste, na melhor das hipóteses. Uma suíte de 300 testes E2E leva dezenas de minutos, mesmo paralelizada.\n\n**Frágil.** Ele depende de tudo: o layout, os textos, a rede, o banco, os serviços externos, o tempo. Qualquer um desses muda e o teste quebra, mesmo sem defeito nenhum no produto.\n\n**Caro de investigar.** Quando um teste de unidade falha, a mensagem aponta a função. Quando um E2E falha, você sabe que "o fluxo de compra não completou" e precisa descobrir se foi a regra, a rota, o layout, um serviço externo fora do ar ou o próprio teste.',
                    },
                    {
                        type: "table",
                        value: '[["", "Unidade", "API / Integração", "E2E"], ["Tempo por teste", "Milissegundos", "Segundos", "Segundos a minutos"], ["O que quebra o teste", "Mudança na função", "Mudança no contrato", "Layout, rede, dado, tempo, tudo"], ["Falha aponta", "A função exata", "A rota e o contrato", "Que o fluxo não completou"], ["Garante", "A regra", "A conversa entre as peças", "Que o produto funciona de verdade"], ["Quantidade saudável", "Centenas", "Dezenas", "Poucos, bem escolhidos"]]',
                    },
                    {
                        type: "quote",
                        value: "A regra que governa esta trilha inteira: **E2E é para os fluxos que, se quebrarem, param o negócio**. Comprar, pagar, entrar, cadastrar. Todo o resto deve ser verificado embaixo, onde é rápido e estável.",
                    },
                    {
                        type: "text",
                        value: '## Como escolher o que vira E2E\n\nUm filtro prático, em três perguntas:\n\n1. **Se este fluxo quebrar em produção, quanto dói?** Se a resposta for "perdemos dinheiro" ou "ninguém entra no sistema", é candidato.\n2. **Este defeito seria pego numa camada mais barata?** Se a regra de cálculo pode ser testada na unidade, teste lá. Leve ao E2E só a prova de que a tela está ligada na regra.\n3. **Este fluxo está estável?** Automatizar tela que muda toda semana é pagar manutenção sem receber garantia.\n\nNa prática, a maioria dos produtos precisa de algo entre 10 e 50 testes E2E bem escolhidos. Quando um time chega a 400, quase sempre é sinal de que o E2E virou o lugar onde tudo é testado, e a suíte já está no caminho de ser abandonada.',
                    },
                ],
                questions: [
                    {
                        statement:
                            "O que um teste E2E verifica que os outros níveis não verificam?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O fluxo completo atravessando interface, rede, backend e banco.",
                                isCorrect: true,
                            },
                            {
                                text: "A correção das regras de negócio implementadas em cada função isolada do sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "O contrato entre dois serviços que trocam mensagens durante a execução do processo.",
                                isCorrect: false,
                            },
                            {
                                text: "A quantidade de linhas de código que foram executadas durante a bateria de testes.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual defeito só apareceria em um teste E2E?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Um botão que funciona, mas está atrás de um banner e não recebe o clique.",
                                isCorrect: true,
                            },
                            {
                                text: "Um cálculo de desconto que aplica o percentual errado para clientes de uma faixa etária.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma rota que devolve status 500 quando recebe um parâmetro fora do formato esperado.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma função que não trata o caso em que a lista recebida está completamente vazia.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Quando um teste E2E falha, qual é a principal dificuldade?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Saber se a causa foi a regra, o layout, a rede ou o próprio teste.",
                                isCorrect: true,
                            },
                            {
                                text: "Reproduzir a falha localmente, porque o teste só roda no ambiente de integração.",
                                isCorrect: false,
                            },
                            {
                                text: "Identificar qual pessoa do time alterou o código que provocou a quebra do cenário.",
                                isCorrect: false,
                            },
                            {
                                text: "Descobrir se o defeito encontrado já havia sido registrado em versões anteriores.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Segundo a aula, qual fluxo é bom candidato a virar teste E2E?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Um fluxo que, se quebrar, para o negócio, como comprar ou entrar.",
                                isCorrect: true,
                            },
                            {
                                text: "Um fluxo novo, ainda em construção, cuja interface muda a cada sprint do time.",
                                isCorrect: false,
                            },
                            {
                                text: "Um cálculo com trinta combinações de regra que precisam ser todas verificadas.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma validação de formato de campo que exibe mensagem quando o dado está errado.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Um time chegou a 400 testes E2E. O que isso costuma indicar?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Que o E2E virou o lugar onde tudo é testado, e a suíte caminha para ser abandonada.",
                                isCorrect: true,
                            },
                            {
                                text: "Que a cobertura do produto está adequada e o time pode reduzir os testes de unidade.",
                                isCorrect: false,
                            },
                            {
                                text: "Que a equipe amadureceu na automação e conseguiu cobrir todos os fluxos existentes.",
                                isCorrect: false,
                            },
                            {
                                text: "Que o produto é grande o bastante para justificar essa quantidade de cenários no topo.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Cypress e Playwright: como escolher",
                blocks: [
                    {
                        type: "text",
                        value: "## As duas ferramentas do momento\n\nSelenium dominou a automação web por mais de uma década e ainda aparece em muitos projetos. Mas, para projetos novos, a escolha hoje é quase sempre entre **Cypress** e **Playwright**.\n\nAs duas resolvem o mesmo problema e chegaram a soluções parecidas: rodam em JavaScript ou TypeScript, esperam automaticamente pelos elementos, trazem interface de depuração e gravam evidência das falhas. A diferença está na arquitetura e nas consequências dela.",
                    },
                    {
                        type: "text",
                        value: "## Cypress\n\nO Cypress roda **dentro do navegador**, no mesmo laço de eventos da aplicação. Isso dá a ele acesso privilegiado ao que acontece na página e uma experiência de desenvolvimento muito boa: o Test Runner mostra cada comando executado, você volta no tempo entre os passos e vê o estado da tela em cada um.\n\nPontos fortes: curva de aprendizado suave, documentação excelente, depuração visual difícil de superar, comunidade grande em português.\n\nLimitações que vêm da arquitetura: historicamente teve dificuldade com múltiplas abas e múltiplos domínios (melhorou bastante, mas ainda incomoda), e o suporte a navegadores fora do Chromium chegou depois. A execução paralela de verdade depende do serviço pago (Cypress Cloud) ou de gambiarra no CI.",
                    },
                    {
                        type: "text",
                        value: "## Playwright\n\nO Playwright, da Microsoft, roda **fora do navegador** e o controla por protocolo. Isso remove as limitações de arquitetura do Cypress e abre portas.\n\nPontos fortes: suporte nativo a Chromium, Firefox e WebKit (ou seja, dá para testar em algo próximo do Safari); múltiplas abas, domínios e contextos sem drama; paralelismo real e gratuito, incluído; o **trace viewer**, que grava uma linha do tempo completa da execução com print de cada passo, a rede e o console, e é a melhor ferramenta de investigação de falha que existe hoje; e recursos como o codegen, que grava suas ações e gera o teste.\n\nLimitações: a API é um pouco mais verbosa, exige entender `async` e `await` de verdade, e a comunidade em português ainda é menor que a do Cypress.",
                    },
                    {
                        type: "table",
                        value: '[["", "Cypress", "Playwright"], ["Arquitetura", "Roda dentro do navegador", "Controla o navegador por protocolo"], ["Navegadores", "Chromium, Firefox, Edge", "Chromium, Firefox e WebKit"], ["Múltiplas abas e domínios", "Limitado", "Nativo"], ["Paralelismo", "Pago ou configurado à mão", "Incluído e gratuito"], ["Depuração", "Test Runner com viagem no tempo", "Trace viewer com linha do tempo"], ["Curva de aprendizado", "Mais suave", "Um pouco mais íngreme"], ["Sintaxe", "Encadeada, sem await", "Assíncrona, com await"]]',
                    },
                    {
                        type: "code",
                        value: "// O mesmo teste nas duas ferramentas\n\n// Cypress\nit('faz login', () => {\n  cy.visit('/login')\n  cy.get('[data-testid=\"email\"]').type('maria@exemplo.com')\n  cy.get('[data-testid=\"senha\"]').type('Senha@2026')\n  cy.get('[data-testid=\"entrar\"]').click()\n  cy.contains('Bem-vinda, Maria').should('be.visible')\n})\n\n// Playwright\ntest('faz login', async ({ page }) => {\n  await page.goto('/login')\n  await page.getByTestId('email').fill('maria@exemplo.com')\n  await page.getByTestId('senha').fill('Senha@2026')\n  await page.getByTestId('entrar').click()\n  await expect(page.getByText('Bem-vinda, Maria')).toBeVisible()\n})",
                    },
                    {
                        type: "quote",
                        value: "Uma recomendação honesta para 2026: se você está começando um projeto do zero, **Playwright** é a escolha mais segura, principalmente pelo paralelismo gratuito e pelo trace viewer. Se o seu time já usa Cypress e está feliz, **não troque só por trocar**: migrar uma suíte inteira custa caro e entrega pouco. O que você aprende nesta trilha vale para as duas.",
                    },
                    {
                        type: "text",
                        value: "## O que não muda entre elas\n\nVale insistir nisso, porque é o que faz o conhecimento durar: a ferramenta é a menor parte do problema.\n\nEscolher bons seletores, esperar sem usar `sleep`, preparar dados pela API, isolar os testes, decidir o que merece estar no E2E, combater instabilidade, rodar no CI: nada disso muda de uma ferramenta para a outra. É exatamente o que os próximos seis módulos cobrem.\n\nTimes que trocam de ferramenta esperando resolver instabilidade quase sempre se decepcionam. A instabilidade não estava na ferramenta.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a diferença arquitetural entre Cypress e Playwright?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O Cypress roda dentro do navegador e o Playwright o controla por protocolo.",
                                isCorrect: true,
                            },
                            {
                                text: "O Cypress é escrito em JavaScript e o Playwright é escrito na linguagem TypeScript.",
                                isCorrect: false,
                            },
                            {
                                text: "O Cypress executa testes de interface e o Playwright executa apenas testes de API.",
                                isCorrect: false,
                            },
                            {
                                text: "O Cypress precisa de um servidor dedicado e o Playwright roda direto na máquina local.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual recurso do Playwright é destacado como a melhor ferramenta de investigação de falha?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O trace viewer, com linha do tempo, prints, rede e console.",
                                isCorrect: true,
                            },
                            {
                                text: "O codegen, que grava as ações da pessoa e gera automaticamente o código do teste.",
                                isCorrect: false,
                            },
                            {
                                text: "O suporte nativo aos três motores de navegador disponíveis no mercado atualmente.",
                                isCorrect: false,
                            },
                            {
                                text: "A execução paralela incluída, que reduz o tempo total da suíte no servidor de CI.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é uma limitação histórica do Cypress que vem da sua arquitetura?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A dificuldade com múltiplas abas e múltiplos domínios no mesmo teste.",
                                isCorrect: true,
                            },
                            {
                                text: "A impossibilidade de esperar automaticamente pelos elementos antes de interagir com eles.",
                                isCorrect: false,
                            },
                            {
                                text: "A ausência de uma interface visual para acompanhar a execução dos comandos do teste.",
                                isCorrect: false,
                            },
                            {
                                text: "A falta de suporte a TypeScript, que obriga o time a escrever tudo em JavaScript puro.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um time já usa Cypress e está satisfeito. O que a aula recomenda?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Não trocar só por trocar, porque migrar custa caro e entrega pouco.",
                                isCorrect: true,
                            },
                            {
                                text: "Migrar para Playwright, porque o paralelismo gratuito compensa o esforço em qualquer caso.",
                                isCorrect: false,
                            },
                            {
                                text: "Manter as duas ferramentas em paralelo, escolhendo a melhor para cada tipo de cenário.",
                                isCorrect: false,
                            },
                            {
                                text: "Migrar gradualmente, convertendo os testes mais antigos a cada sprint de desenvolvimento.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Segundo a aula, o que acontece com times que trocam de ferramenta esperando resolver instabilidade?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Costumam se decepcionar, porque a instabilidade não estava na ferramenta.",
                                isCorrect: true,
                            },
                            {
                                text: "Conseguem reduzir a instabilidade, já que as ferramentas modernas esperam automaticamente.",
                                isCorrect: false,
                            },
                            {
                                text: "Resolvem o problema apenas quando migram também os testes para a camada de API.",
                                isCorrect: false,
                            },
                            {
                                text: "Aumentam a instabilidade, porque a equipe precisa reaprender a escrever os cenários.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Preparando o projeto e o primeiro teste",
                blocks: [
                    {
                        type: "text",
                        value: "## Instalando\n\nAs duas ferramentas instalam com um comando e criam a estrutura inicial do projeto. Você precisa apenas do Node instalado.",
                    },
                    {
                        type: "code",
                        value: "# Playwright\nnpm init playwright@latest\n# escolhe a pasta (tests), TypeScript ou JavaScript, e se quer o workflow do GitHub Actions\n# baixa os navegadores automaticamente\n\nnpx playwright test              # roda tudo, sem interface\nnpx playwright test --ui         # modo interativo\nnpx playwright show-report       # abre o relatório da última execução\n\n# Cypress\nnpm install --save-dev cypress\nnpx cypress open                 # abre o Test Runner e cria a estrutura\nnpx cypress run                  # roda tudo no terminal",
                    },
                    {
                        type: "text",
                        value: "## A estrutura que nasce\n\nNos dois casos você termina com algo parecido: uma pasta de testes, um arquivo de configuração e um exemplo funcionando.\n\nO arquivo de configuração é onde vive quase tudo que importa depois: a URL base da aplicação, os tempos de espera, quais navegadores usar, onde salvar print e vídeo, quantos processos rodar em paralelo, e o que fazer quando um teste falha.\n\nUma configuração mínima e bem escolhida evita muito código repetido. O `baseURL` é o melhor exemplo: com ele definido, você escreve `/login` em vez da URL inteira, e trocar de ambiente vira uma variável.",
                    },
                    {
                        type: "code",
                        value: "// playwright.config.ts (enxuto e suficiente para começar)\nimport { defineConfig, devices } from '@playwright/test'\n\nexport default defineConfig({\n  testDir: './tests',\n  fullyParallel: true,\n  retries: process.env.CI ? 2 : 0,\n  reporter: 'html',\n  use: {\n    baseURL: process.env.BASE_URL ?? 'http://localhost:5173',\n    trace: 'on-first-retry',\n    screenshot: 'only-on-failure',\n    video: 'retain-on-failure',\n  },\n  projects: [\n    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },\n  ],\n})",
                    },
                    {
                        type: "text",
                        value: "## Lendo essa configuração\n\nVale entender cada linha, porque elas resolvem problemas que você teria mais adiante:\n\n- **fullyParallel**: roda os testes em paralelo. Só funciona se os testes forem independentes, e essa é uma boa razão para escrevê-los assim desde o primeiro dia.\n- **retries no CI**: repete o teste que falhou, apenas no servidor. Não é para mascarar instabilidade, e sim para reduzir ruído de falhas de infraestrutura. Localmente fica zero, para você **ver** a instabilidade em vez de escondê-la.\n- **trace on-first-retry**: grava a linha do tempo completa só quando o teste falha e é repetido. Custa quase nada e salva a investigação.\n- **screenshot e video only-on-failure**: evidência automática do que aconteceu, sem encher o disco com execuções que passaram.\n- **baseURL por variável de ambiente**: a mesma suíte roda contra local, homologação ou uma preview de pull request, sem tocar no código.",
                    },
                    {
                        type: "code",
                        value: "// tests/login.spec.ts\nimport { test, expect } from '@playwright/test'\n\ntest.describe('Login', () => {\n  test('entra com credenciais válidas', async ({ page }) => {\n    await page.goto('/login')\n\n    await page.getByLabel('Email').fill('maria@exemplo.com')\n    await page.getByLabel('Senha').fill('Senha@2026')\n    await page.getByRole('button', { name: 'Entrar' }).click()\n\n    await expect(page).toHaveURL('/inicio')\n    await expect(page.getByText('Bem-vinda, Maria')).toBeVisible()\n  })\n\n  test('mostra mensagem com senha incorreta', async ({ page }) => {\n    await page.goto('/login')\n\n    await page.getByLabel('Email').fill('maria@exemplo.com')\n    await page.getByLabel('Senha').fill('senha-errada')\n    await page.getByRole('button', { name: 'Entrar' }).click()\n\n    await expect(page.getByText('Email ou senha inválidos')).toBeVisible()\n    await expect(page).toHaveURL('/login')\n  })\n})",
                    },
                    {
                        type: "quote",
                        value: "Repare no segundo teste: ele verifica **duas** coisas, a mensagem que aparece **e** que a pessoa continua na tela de login. Verificar só a mensagem deixaria passar um defeito em que o sistema mostra o erro e mesmo assim redireciona.",
                    },
                ],
                questions: [
                    {
                        statement: "Para que serve o baseURL na configuração?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Permite escrever caminhos curtos e trocar de ambiente por variável.",
                                isCorrect: true,
                            },
                            {
                                text: "Define qual navegador será usado para executar os testes da suíte automatizada.",
                                isCorrect: false,
                            },
                            {
                                text: "Estabelece o tempo máximo de espera antes de o teste ser considerado falho.",
                                isCorrect: false,
                            },
                            {
                                text: "Indica em qual pasta os relatórios e as evidências de execução serão gravados.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que a configuração define retries apenas no CI e zero localmente?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Para reduzir ruído no servidor e ainda enxergar a instabilidade na máquina.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque a execução local é mais lenta e repetir os testes aumentaria muito o tempo total.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o ambiente local não gera evidências suficientes para investigar uma nova tentativa.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o servidor de integração contínua exige ao menos duas tentativas por execução.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que a opção fullyParallel exige dos testes?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Que sejam independentes entre si.",
                                isCorrect: true,
                            },
                            {
                                text: "Que estejam todos escritos no mesmo arquivo para compartilhar o contexto da execução.",
                                isCorrect: false,
                            },
                            {
                                text: "Que usem o mesmo usuário de teste para evitar conflitos durante a execução simultânea.",
                                isCorrect: false,
                            },
                            {
                                text: "Que sejam executados sempre na mesma ordem definida pela configuração do projeto.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Por que gravar trace e vídeo apenas em caso de falha?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Porque dá a evidência quando ela é necessária sem encher o disco.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque a gravação contínua deixa a execução dos testes significativamente mais lenta.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque as ferramentas não conseguem gravar execuções que terminam com sucesso.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o relatório em HTML só aceita anexos de execuções que apresentaram problema.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No teste de senha incorreta, por que verificar também que a pessoa continua em /login?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Porque o sistema poderia mostrar o erro e ainda assim redirecionar.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque a ferramenta exige ao menos duas asserções por teste automatizado escrito.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a verificação de URL é mais confiável do que a verificação de texto na tela.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque sem ela o teste ficaria mais rápido e perderia a garantia de estabilidade.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Anatomia de um teste E2E",
                blocks: [
                    {
                        type: "text",
                        value: "## A mesma estrutura de sempre\n\nSe você veio da trilha de Fundamentos de QA, vai reconhecer o formato imediatamente. Um teste E2E é um caso de teste com três partes, exatamente como o padrão AAA e como o Dado, Quando, Então:\n\n**Preparar.** Deixar o sistema no estado inicial: criar o usuário, o produto, o pedido; autenticar; navegar até a tela.\n\n**Agir.** Executar o fluxo que está sendo verificado.\n\n**Verificar.** Conferir o resultado observável.\n\nO que muda em relação ao teste de unidade é o **peso** da primeira parte. Preparar o estado de um E2E é frequentemente mais trabalhoso que o próprio fluxo, e é onde as suítes ficam lentas e instáveis. Os módulos 4 e 5 tratam disso a fundo.",
                    },
                    {
                        type: "code",
                        value: "test('conclui a compra com cupom válido', async ({ page }) => {\n  // Preparar\n  await login(page, 'cliente1@exemplo.com', 'Senha@2026')\n  await criarCupomViaApi({ codigo: 'PROMO10', percentual: 10 })\n  await page.goto('/produtos/SKU-4471')\n\n  // Agir\n  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click()\n  await page.getByRole('link', { name: 'Ir para o checkout' }).click()\n  await page.getByLabel('Cupom').fill('PROMO10')\n  await page.getByRole('button', { name: 'Aplicar' }).click()\n  await page.getByRole('button', { name: 'Finalizar compra' }).click()\n\n  // Verificar\n  await expect(page.getByText('Pedido confirmado')).toBeVisible()\n  await expect(page.getByTestId('total')).toHaveText('R$ 90,00')\n})",
                    },
                    {
                        type: "text",
                        value: "## Um teste, um objetivo\n\nO maior erro estrutural em E2E é o teste que faz tudo: cadastra, entra, compra, cancela, pede reembolso e confere o extrato. Ele parece eficiente, porque reaproveita a preparação. Na prática:\n\n- Quando falha no passo 14, você não sabe o estado real nem consegue reportar direito.\n- Ele demora minutos, e um único ponto instável derruba a verificação inteira.\n- Ele nunca pode rodar em paralelo consigo mesmo.\n- Uma mudança em qualquer uma das seis funcionalidades quebra o teste.\n\nO padrão saudável é **um fluxo por teste**, com preparação feita por atalho (API, sessão salva, dado semeado), e não repetindo o fluxo anterior pela interface.",
                    },
                    {
                        type: "table",
                        value: '[["Estrutura", "Consequência quando falha", "Tempo típico", "Paraleliza?"], ["Um teste com 6 fluxos", "Não se sabe onde nem em qual estado", "Minutos", "Não"], ["6 testes com 1 fluxo cada", "A falha aponta o fluxo exato", "Segundos cada", "Sim"]]',
                    },
                    {
                        type: "quote",
                        value: "Cada teste deve poder rodar **sozinho, em qualquer ordem, quantas vezes quiser**, e dar sempre o mesmo resultado. Se o teste B só passa depois do A, você não tem dois testes: tem um teste partido ao meio, com o dobro da fragilidade.",
                    },
                    {
                        type: "text",
                        value: "## Nomeando bem\n\nO nome do teste é lido em dois momentos ruins: quando ele falha no CI às onze da noite, e quando alguém precisa entender a suíte seis meses depois. Ele precisa dizer **o cenário e o esperado**, sem abrir o código.\n\nRuim: `test('checkout')`, `test('teste 3')`, `test('funciona')`.\n\nBom: `test('cupom expirado não aplica desconto e mostra mensagem')`, `test('compra sem estoque bloqueia a finalização')`.\n\nUm bom formato é agrupar por funcionalidade com `describe` e deixar o nome do teste descrever o cenário. A saída do relatório fica legível como um documento: \"Checkout > cupom expirado não aplica desconto e mostra mensagem\".",
                    },
                ],
                questions: [
                    {
                        statement: "Quais são as três partes de um teste E2E?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Preparar o estado, agir no fluxo e verificar o resultado observável.",
                                isCorrect: true,
                            },
                            {
                                text: "Configurar o ambiente, executar a suíte completa e publicar o relatório da execução.",
                                isCorrect: false,
                            },
                            {
                                text: "Escolher o seletor, aguardar o elemento aparecer e registrar a evidência da tela.",
                                isCorrect: false,
                            },
                            {
                                text: "Instalar a ferramenta, escrever o cenário e integrar a execução ao pipeline do time.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O que mais pesa em um teste E2E, comparado a um teste de unidade?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A preparação do estado inicial, que costuma dar mais trabalho que o próprio fluxo.",
                                isCorrect: true,
                            },
                            {
                                text: "A verificação do resultado, porque exige comparar muitos valores diferentes na tela.",
                                isCorrect: false,
                            },
                            {
                                text: "A escrita das asserções, que precisam ser muito mais específicas nesse tipo de teste.",
                                isCorrect: false,
                            },
                            {
                                text: "A escolha da ferramenta, porque cada uma exige uma forma diferente de estruturar o caso.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é o problema de um teste E2E que cadastra, entra, compra, cancela e confere o extrato?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Se falhar no meio, não se sabe o estado, e qualquer mudança quebra o teste.",
                                isCorrect: true,
                            },
                            {
                                text: "Consome mais memória do navegador do que a ferramenta consegue gerenciar com segurança.",
                                isCorrect: false,
                            },
                            {
                                text: "Não permite gravar evidências em vídeo por causa da duração total da execução.",
                                isCorrect: false,
                            },
                            {
                                text: "Impede o uso de seletores estáveis, já que percorre telas de funcionalidades diferentes.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O teste B só passa se o teste A tiver rodado antes. O que isso significa?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Que não são dois testes, e sim um teste partido com o dobro da fragilidade.",
                                isCorrect: true,
                            },
                            {
                                text: "Que a ordem de execução precisa ser fixada na configuração do projeto de testes.",
                                isCorrect: false,
                            },
                            {
                                text: "Que o teste A prepara os dados corretamente e o B apenas reaproveita esse trabalho.",
                                isCorrect: false,
                            },
                            {
                                text: "Que os dois deveriam ser unidos em um único cenário para reduzir o tempo de execução.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual nome de teste segue a recomendação da aula?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "cupom expirado não aplica desconto e mostra mensagem.",
                                isCorrect: true,
                            },
                            {
                                text: "checkout com validação de cupom e conferência do valor total exibido para o cliente.",
                                isCorrect: false,
                            },
                            {
                                text: "teste do fluxo de finalização de compra com aplicação de desconto promocional.",
                                isCorrect: false,
                            },
                            {
                                text: "verifica se o sistema está funcionando corretamente na tela de finalização.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "O ambiente de teste: dados, usuários e isolamento",
                blocks: [
                    {
                        type: "text",
                        value: "## O maior inimigo do E2E não é o código\n\nÉ o **dado**.\n\nA esmagadora maioria dos testes E2E instáveis não falha por causa do teste em si. Falha porque o cupom que ele usava expirou, o produto saiu de estoque, o usuário foi bloqueado por tentativas de login, outro teste rodando em paralelo consumiu o mesmo item, ou alguém mexeu no ambiente de homologação na terça de manhã.\n\nPor isso a decisão sobre dados é a mais importante da sua suíte, e precisa ser tomada antes de escrever o segundo teste.",
                    },
                    {
                        type: "text",
                        value: "## As três estratégias de dado\n\n**Dado fixo (compartilhado).** Um conjunto de usuários e registros que já existe no ambiente e é usado por todos os testes.\n\n- A favor: simples de começar, rápido, não precisa criar nada.\n- Contra: os testes se contaminam, não dá para rodar em paralelo com segurança, e o estado degrada com o tempo. Um teste que cancela o pedido do usuário compartilhado quebra outro que esperava esse pedido ativo.\n\n**Dado criado por teste.** Cada teste cria o que precisa (usuário, produto, cupom) e usa só o que criou.\n\n- A favor: isolamento total, paralelismo seguro, teste reproduzível.\n- Contra: exige API ou script de preparação, e é preciso pensar em limpeza.\n\n**Ambiente recriado.** O banco é restaurado a um estado conhecido antes da execução.\n\n- A favor: previsibilidade máxima.\n- Contra: lento, e inviável quando o ambiente é compartilhado com outras pessoas.\n\nNa prática, a combinação que funciona é: **dado criado por teste, com identificadores únicos**, e um ambiente recriado de vez em quando para limpar o acúmulo.",
                    },
                    {
                        type: "code",
                        value: "// Identificador único evita colisão entre testes em paralelo\nfunction unico(prefixo: string) {\n  return `${prefixo}-${Date.now()}-${Math.floor(Math.random() * 10000)}`\n}\n\ntest('cadastra um cliente novo', async ({ page, request }) => {\n  const email = `${unico('cliente')}@exemplo.test`\n\n  await page.goto('/cadastro')\n  await page.getByLabel('Email').fill(email)\n  await page.getByLabel('Senha').fill('Senha@2026')\n  await page.getByRole('button', { name: 'Criar conta' }).click()\n\n  await expect(page.getByText('Conta criada')).toBeVisible()\n})",
                    },
                    {
                        type: "quote",
                        value: "Se dois testes rodando ao mesmo tempo podem disputar o mesmo dado, sua suíte **vai** ficar instável quando você ligar o paralelismo. Identificador único por teste é a solução mais barata e a que resolve mais casos.",
                    },
                    {
                        type: "text",
                        value: "## Onde apontar a suíte\n\nQuatro opções, cada uma com um perfil de uso:\n\n**Local.** A aplicação rodando na sua máquina. Rápido, isolado, ideal para escrever e depurar. É onde você deve passar a maior parte do tempo.\n\n**Ambiente efêmero por pull request.** Um ambiente criado automaticamente para cada mudança e destruído depois. É o melhor cenário: isolado, com o código exato daquela alteração, sem disputar com ninguém.\n\n**Homologação compartilhada.** O mais comum, e o mais problemático: outras pessoas mexem, dados mudam, versões se sobrepõem. Boa parte da instabilidade que os times atribuem à ferramenta nasce aqui.\n\n**Produção.** Só para um punhado de verificações de disponibilidade, com dados marcados como teste e sem efeito colateral. Nunca para a suíte de regressão.",
                    },
                    {
                        type: "text",
                        value: "## Serviços externos\n\nUm teste que depende de verdade do gateway de pagamento, do serviço de email ou da API dos Correios vai falhar quando esses serviços estiverem lentos ou fora do ar, e você vai passar a manhã investigando um problema que não é seu.\n\nAs saídas, em ordem de preferência:\n\n1. **Ambiente de sandbox do fornecedor**, quando existe e é confiável.\n2. **Simular a resposta na camada de rede**, interceptando a chamada e devolvendo uma resposta fixa. É o assunto do módulo 4.\n3. **Um serviço falso** rodando junto do ambiente de teste, que responde de forma previsível.\n\nE vale a regra: se o comportamento do serviço externo não é o objetivo do teste, **não deixe o teste depender dele**.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Segundo a aula, qual é a maior fonte de instabilidade em suítes E2E?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O dado usado pelos testes.",
                                isCorrect: true,
                            },
                            {
                                text: "A escolha da ferramenta de automação adotada pelo time no início do projeto.",
                                isCorrect: false,
                            },
                            {
                                text: "A quantidade de asserções escritas em cada um dos cenários automatizados.",
                                isCorrect: false,
                            },
                            {
                                text: "A velocidade da máquina em que a suíte é executada durante o ciclo de entrega.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a desvantagem principal do dado fixo compartilhado entre os testes?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Os testes se contaminam e o paralelismo deixa de ser seguro.",
                                isCorrect: true,
                            },
                            {
                                text: "A preparação fica lenta porque cada teste precisa criar seus próprios registros.",
                                isCorrect: false,
                            },
                            {
                                text: "O ambiente precisa ser recriado antes de cada execução da suíte automatizada.",
                                isCorrect: false,
                            },
                            {
                                text: "As ferramentas modernas não oferecem suporte a esse tipo de estratégia de dados.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a solução mais barata para evitar colisão entre testes em paralelo?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Usar identificadores únicos por teste.",
                                isCorrect: true,
                            },
                            {
                                text: "Executar a suíte inteira de forma sequencial, sem nenhum tipo de paralelismo ativo.",
                                isCorrect: false,
                            },
                            {
                                text: "Restaurar o banco de dados a um estado conhecido antes de cada cenário executado.",
                                isCorrect: false,
                            },
                            {
                                text: "Reduzir a quantidade de testes até que não haja mais disputa pelos mesmos registros.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual ambiente a aula aponta como o melhor cenário para rodar a suíte?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Um ambiente efêmero criado por pull request e destruído depois.",
                                isCorrect: true,
                            },
                            {
                                text: "A homologação compartilhada, por ser a mais próxima da configuração de produção.",
                                isCorrect: false,
                            },
                            {
                                text: "A produção, porque garante que o teste reflete exatamente o que o cliente encontra.",
                                isCorrect: false,
                            },
                            {
                                text: "A máquina local, por ser rápida e não depender de nenhuma infraestrutura adicional.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O teste verifica o checkout e depende do gateway de pagamento real. Qual é a orientação da aula?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Não deixar o teste depender dele, já que o gateway não é o objetivo da verificação.",
                                isCorrect: true,
                            },
                            {
                                text: "Manter a dependência real, porque só assim o fluxo é verificado de ponta a ponta.",
                                isCorrect: false,
                            },
                            {
                                text: "Aumentar o tempo de espera do teste para tolerar a lentidão do serviço externo.",
                                isCorrect: false,
                            },
                            {
                                text: "Executar esse teste apenas uma vez por semana, quando o serviço estiver mais estável.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 2 - Encontrando e interagindo com elementos",
        aulas: [
            {
                titulo: "Seletores: o que quebra e o que resiste",
                blocks: [
                    {
                        type: "text",
                        value: "## A decisão que define a manutenção da sua suíte\n\nTodo teste E2E precisa **encontrar** os elementos na tela antes de interagir com eles. A forma como você faz isso é, de longe, o que mais determina quanto tempo você vai gastar consertando testes.\n\nUm seletor ruim quebra quando o design muda, quando alguém troca uma classe de CSS, quando um elemento ganha um contêiner novo. Um seletor bom sobrevive a tudo isso e só quebra quando o comportamento realmente muda, que é exatamente quando você quer ser avisado.",
                    },
                    {
                        type: "table",
                        value: '[["Tipo de seletor", "Exemplo", "Resistência", "Quebra quando"], ["Papel e nome acessível", "getByRole(\'button\', { name: \'Entrar\' })", "Alta", "O texto ou a função do elemento muda"], ["Rótulo do campo", "getByLabel(\'Email\')", "Alta", "O rótulo visível muda"], ["Atributo de teste", "getByTestId(\'total\')", "Muito alta", "Alguém remove o atributo de propósito"], ["Texto visível", "getByText(\'Pedido confirmado\')", "Média", "O texto muda, inclusive por tradução"], ["Classe de CSS", ".btn-primary-lg", "Baixa", "Qualquer ajuste de estilo"], ["Caminho no DOM", "div > div:nth-child(3) > button", "Péssima", "Qualquer mudança de estrutura"]]',
                    },
                    {
                        type: "text",
                        value: "## A ordem de preferência\n\nA regra que as duas ferramentas recomendam hoje, e que vale seguir:\n\n**1. Papel e nome acessível.** `getByRole('button', { name: 'Finalizar compra' })`. Esse seletor busca o elemento do jeito que uma tecnologia assistiva encontraria. Ele tem uma propriedade excelente: se ele não acha o botão, provavelmente uma pessoa usando leitor de tela também não acharia. O teste vira uma verificação de acessibilidade de graça.\n\n**2. Rótulo, placeholder ou texto associado.** `getByLabel('Senha')`. Também parte do que a pessoa vê.\n\n**3. Atributo dedicado a teste.** `data-testid`, para os casos em que não existe um jeito semântico razoável de identificar o elemento.\n\n**4. Texto visível.** Útil, mas cuidado: quebra em internacionalização e em ajuste de copy.\n\n**5. CSS ou XPath estrutural.** Último recurso, e sinal de que talvez falte semântica no HTML.",
                    },
                    {
                        type: "code",
                        value: "// Do pior para o melhor, encontrando o mesmo botão\n\n// Péssimo: quebra se qualquer div entrar no meio\npage.locator('div.container > div:nth-child(2) > form > button')\n\n// Ruim: quebra quando o design mudar a classe\npage.locator('.btn.btn-primary.btn-lg')\n\n// Aceitável: quebra se o texto mudar, e não distingue de outro \"Entrar\"\npage.getByText('Entrar')\n\n// Bom: identifica por papel e nome, do jeito que a pessoa enxerga\npage.getByRole('button', { name: 'Entrar' })\n\n// Ótimo quando não há semântica clara: contrato explícito com o time\npage.getByTestId('login-submit')",
                    },
                    {
                        type: "quote",
                        value: "Um seletor deve descrever **o que o elemento é para quem usa**, não **onde ele está na estrutura**. Posição no DOM é detalhe de implementação, e detalhe de implementação muda o tempo todo sem que o comportamento mude.",
                    },
                    {
                        type: "text",
                        value: "## O sinal de alerta\n\nSe você precisou de um seletor complicado, com muitos níveis ou dependente de posição, pare um instante. Quase sempre isso indica um dos dois:\n\n**O HTML não tem semântica.** Um `div` com um evento de clique não é um botão, não aparece para leitor de tela e não é encontrável por papel. Nesse caso, a solução certa costuma ser corrigir o HTML: trocar por `<button>` melhora a acessibilidade **e** o teste ao mesmo tempo. É um ótimo argumento para levar ao time.\n\n**Falta um identificador de teste.** Quando o elemento é genuinamente ambíguo (a terceira linha de uma tabela, um card entre vinte iguais), pedir um `data-testid` é legítimo e barato.\n\nEm ambos os casos, a conversa com quem desenvolve resolve melhor do que um seletor engenhoso. Seletor engenhoso é dívida.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual tipo de seletor tem a pior resistência a mudanças?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O caminho estrutural no DOM, baseado em posição dos elementos.",
                                isCorrect: true,
                            },
                            {
                                text: "O papel do elemento combinado com o nome acessível apresentado na interface.",
                                isCorrect: false,
                            },
                            {
                                text: "O atributo dedicado a teste, adicionado especificamente para a automação usar.",
                                isCorrect: false,
                            },
                            {
                                text: "O rótulo do campo, que é lido diretamente da interface apresentada para quem usa.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a vantagem extra de usar seletores por papel e nome acessível?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Se o teste não acha o elemento, provavelmente um leitor de tela também não acharia.",
                                isCorrect: true,
                            },
                            {
                                text: "Eles executam mais rápido do que os demais tipos de seletor disponíveis nas ferramentas.",
                                isCorrect: false,
                            },
                            {
                                text: "Eles funcionam mesmo quando o elemento ainda não terminou de ser carregado na página.",
                                isCorrect: false,
                            },
                            {
                                text: "Eles dispensam a necessidade de esperar pelo elemento antes de interagir com ele.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o principal risco de usar o texto visível como seletor?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Ele quebra em internacionalização e em ajustes de escrita da interface.",
                                isCorrect: true,
                            },
                            {
                                text: "Ele não consegue distinguir elementos que estão dentro de formulários diferentes.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele exige que a equipe adicione atributos específicos em cada elemento da página.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele deixa de funcionar quando a página é renderizada no lado do servidor.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Você precisou de um seletor com cinco níveis de estrutura. O que isso costuma indicar?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Que falta semântica no HTML ou um identificador de teste no elemento.",
                                isCorrect: true,
                            },
                            {
                                text: "Que a página é complexa demais e deveria ser dividida em telas menores pelo time.",
                                isCorrect: false,
                            },
                            {
                                text: "Que a ferramenta escolhida não oferece recursos adequados de busca de elementos.",
                                isCorrect: false,
                            },
                            {
                                text: "Que o teste está verificando uma funcionalidade que não deveria estar no E2E.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um elemento clicável foi construído como div com evento de clique. Qual é a melhor solução?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Corrigir o HTML para button, o que melhora acessibilidade e teste juntos.",
                                isCorrect: true,
                            },
                            {
                                text: "Criar um seletor estrutural que localize a div pela posição dentro do contêiner.",
                                isCorrect: false,
                            },
                            {
                                text: "Adicionar um atributo de teste na div e seguir sem alterar o restante do código.",
                                isCorrect: false,
                            },
                            {
                                text: "Usar o texto interno da div como seletor, já que ele identifica o elemento na tela.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "data-testid e a estratégia de seletor do time",
                blocks: [
                    {
                        type: "text",
                        value: '## Um contrato explícito\n\nO `data-testid` (o nome do atributo varia, mas a ideia é a mesma) é um atributo colocado no HTML **com o único propósito de ser usado por testes**.\n\nA grande vantagem é que ele estabelece um **contrato**. Quando o elemento tem `data-testid="total-pedido"`, quem for mexer no layout entende que aquele atributo não é decoração, e que removê-lo quebra alguma coisa. Já uma classe de CSS não carrega essa mensagem: ninguém hesita em renomear `.valor-destaque`.',
                    },
                    {
                        type: "code",
                        value: '<!-- Sem contrato: o teste depende de estilo e estrutura -->\n<div class="resumo">\n  <span class="valor-destaque">R$ 90,00</span>\n</div>\n\n<!-- Com contrato explícito -->\n<div class="resumo">\n  <span data-testid="total-pedido" class="valor-destaque">R$ 90,00</span>\n</div>',
                    },
                    {
                        type: "code",
                        value: "// Cypress\ncy.get('[data-testid=\"total-pedido\"]').should('have.text', 'R$ 90,00')\n\n// Cypress com comando customizado (mais legível)\ncy.getByTestId('total-pedido').should('have.text', 'R$ 90,00')\n\n// Playwright: suporte nativo\nawait expect(page.getByTestId('total-pedido')).toHaveText('R$ 90,00')",
                    },
                    {
                        type: "text",
                        value: "## Quando usar e quando não usar\n\nO `data-testid` é excelente, mas não é para tudo. Usar em todo elemento acaba com o benefício da busca semântica e enche o HTML de ruído.\n\n**Use quando:**\n- O elemento não tem papel semântico claro (um contêiner, um card, uma área de resumo).\n- Existem vários elementos idênticos e você precisa de um específico.\n- O texto muda com frequência ou depende de tradução.\n- O valor é dinâmico e o texto não serve para identificar.\n\n**Não use quando:**\n- Existe um botão com nome claro: `getByRole('button', { name: 'Salvar' })` é melhor e ainda verifica acessibilidade.\n- Existe um campo com rótulo: `getByLabel('Email')` já resolve.",
                    },
                    {
                        type: "table",
                        value: '[["Situação", "Melhor abordagem", "Por quê"], ["Botão com texto estável", "Papel e nome", "Verifica acessibilidade de brinde"], ["Campo de formulário com rótulo", "Rótulo", "Descreve o que a pessoa vê"], ["Card em uma lista de vinte iguais", "data-testid com identificador", "Sem ele, a busca é ambígua"], ["Valor calculado sem rótulo próprio", "data-testid", "O texto muda a cada execução"], ["Área ou contêiner sem papel", "data-testid", "Não existe semântica para usar"]]',
                    },
                    {
                        type: "quote",
                        value: "Combine a estratégia de seletores com o time **antes** de escrever cinquenta testes. Depois disso, mudar de abordagem custa uma refatoração inteira da suíte, e ninguém tem tempo para isso.",
                    },
                    {
                        type: "text",
                        value: '## Elementos dinâmicos e listas\n\nO caso mais comum de ambiguidade é a lista. Vinte produtos, todos com o botão "Adicionar ao carrinho". Como escolher o certo?\n\nDuas abordagens que funcionam bem:\n\n**Identificador no item.** O elemento da lista recebe `data-testid="produto-SKU-4471"`, e você busca dentro dele.\n\n**Busca por escopo.** Localize primeiro o item pelo que ele tem de único (o nome do produto) e depois procure o botão **dentro** dele.',
                    },
                    {
                        type: "code",
                        value: "// Escopo: acha o card pelo nome e o botão dentro dele\nconst card = page.getByRole('listitem').filter({ hasText: 'Teclado mecânico' })\nawait card.getByRole('button', { name: 'Adicionar ao carrinho' }).click()\n\n// Identificador por item, quando o nome não é confiável\nawait page.getByTestId('produto-SKU-4471')\n  .getByRole('button', { name: 'Adicionar ao carrinho' })\n  .click()\n\n// Evite: depende da ordem, que pode mudar por ordenação ou estoque\nawait page.getByRole('button', { name: 'Adicionar ao carrinho' }).nth(2).click()",
                    },
                    {
                        type: "text",
                        value: "## Por que evitar o índice\n\nO último exemplo merece destaque, porque é uma armadilha comum. Usar `nth(2)` ou `.eq(2)` parece prático e funciona na primeira execução.\n\nSó que a ordem de uma lista muda por qualquer motivo: uma ordenação diferente, um produto que saiu de estoque, um item novo cadastrado, um resultado de busca que mudou de ranking. Quando isso acontece, o teste continua passando, mas passa **testando o item errado**, e isso é pior do que falhar. Falha você investiga; um teste verde verificando a coisa errada não avisa ninguém.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual é a principal vantagem do data-testid em relação a uma classe de CSS?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Ele estabelece um contrato explícito de que aquele atributo é usado por testes.",
                                isCorrect: true,
                            },
                            {
                                text: "Ele é encontrado mais rapidamente pelas ferramentas de automação durante a execução.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele funciona mesmo quando o elemento ainda não foi renderizado na página do sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele permite verificar a acessibilidade do elemento junto com o comportamento esperado.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Em qual situação NÃO vale a pena usar data-testid?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Quando existe um botão com nome claro, que pode ser encontrado por papel.",
                                isCorrect: true,
                            },
                            {
                                text: "Quando o elemento é um contêiner sem papel semântico definido dentro da página.",
                                isCorrect: false,
                            },
                            {
                                text: "Quando existem vários elementos idênticos e é preciso identificar um deles.",
                                isCorrect: false,
                            },
                            {
                                text: "Quando o valor exibido é dinâmico e o texto não serve para identificar o elemento.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Como escolher o botão certo em uma lista de vinte produtos iguais?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Localizar o item pelo que ele tem de único e buscar o botão dentro dele.",
                                isCorrect: true,
                            },
                            {
                                text: "Usar o índice do elemento na lista, escolhendo a posição correspondente ao produto.",
                                isCorrect: false,
                            },
                            {
                                text: "Buscar todos os botões e clicar naquele cujo elemento pai contém a classe esperada.",
                                isCorrect: false,
                            },
                            {
                                text: "Ordenar a lista antes do teste para garantir que o item desejado fique na primeira posição.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Por que usar o índice do elemento é perigoso?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "O teste pode continuar passando enquanto verifica o item errado.",
                                isCorrect: true,
                            },
                            {
                                text: "A ferramenta demora mais para localizar elementos quando o índice é informado.",
                                isCorrect: false,
                            },
                            {
                                text: "O índice deixa de funcionar quando a lista tem mais de vinte itens carregados.",
                                isCorrect: false,
                            },
                            {
                                text: "A execução em paralelo altera a ordem em que os elementos são renderizados na tela.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Segundo a aula, quando a estratégia de seletores deve ser combinada com o time?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Antes de escrever muitos testes, porque mudar depois custa uma refatoração.",
                                isCorrect: true,
                            },
                            {
                                text: "Depois da primeira execução no CI, quando os problemas de estabilidade aparecerem.",
                                isCorrect: false,
                            },
                            {
                                text: "Durante a revisão de código de cada teste novo adicionado à suíte automatizada.",
                                isCorrect: false,
                            },
                            {
                                text: "Somente quando a equipe decidir migrar de ferramenta de automação de interface.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Interações: clique, digitação e formulários",
                blocks: [
                    {
                        type: "text",
                        value: "## As ações básicas\n\nEncontrado o elemento, é hora de agir. As interações mais comuns cobrem quase tudo que uma pessoa faz numa aplicação web.",
                    },
                    {
                        type: "code",
                        value: "// Playwright\nawait page.getByRole('button', { name: 'Entrar' }).click()\nawait page.getByLabel('Email').fill('maria@exemplo.com')      // limpa e escreve\nawait page.getByLabel('Busca').pressSequentially('teclado')   // tecla a tecla\nawait page.getByLabel('Aceito os termos').check()\nawait page.getByLabel('Estado').selectOption('SP')\nawait page.getByRole('textbox').press('Enter')\nawait page.getByRole('link', { name: 'Sair' }).hover()\nawait page.getByLabel('Busca').clear()\n\n// Cypress\ncy.contains('button', 'Entrar').click()\ncy.get('[data-testid=\"email\"]').clear().type('maria@exemplo.com')\ncy.get('[data-testid=\"termos\"]').check()\ncy.get('select[name=\"estado\"]').select('SP')\ncy.get('[data-testid=\"busca\"]').type('teclado{enter}')",
                    },
                    {
                        type: "text",
                        value: "## fill e type não são a mesma coisa\n\nUma diferença que gera confusão e vale entender.\n\nO `fill` do Playwright define o valor do campo de uma vez, disparando os eventos necessários. É rápido e é o que você quer na maior parte dos casos.\n\nO `pressSequentially` (e o `type` do Cypress) digita **tecla por tecla**, disparando um evento por caractere. É mais lento, mas necessário quando o comportamento depende da digitação: um campo de busca com sugestões que aparecem a cada letra, uma máscara de CPF que formata enquanto você digita, um contador de caracteres.\n\nRegra prática: use o preenchimento direto por padrão, e a digitação tecla a tecla só quando o teste precisa exercitar o comportamento durante a digitação. Escolher errado deixa a suíte lenta sem motivo, ou deixa passar defeito de máscara.",
                    },
                    {
                        type: "table",
                        value: '[["Situação", "Playwright", "Cypress", "Por quê"], ["Preencher campo comum", "fill", "type", "Rápido e suficiente"], ["Busca com sugestão a cada letra", "pressSequentially", "type", "O comportamento depende de cada tecla"], ["Campo com máscara", "pressSequentially", "type", "A formatação acontece durante a digitação"], ["Limpar antes de escrever", "fill já limpa", "clear().type()", "Cypress não limpa sozinho"]]',
                    },
                    {
                        type: "quote",
                        value: "Uma armadilha clássica no Cypress: `type` **não limpa** o campo antes de escrever. Se o campo já tinha valor, você acaba com os dois textos concatenados e um teste que falha por um motivo que não é o defeito. Sempre `clear()` antes, ou use um comando que faça as duas coisas.",
                    },
                    {
                        type: "text",
                        value: "## Interações que exigem cuidado\n\n**Duplo clique e clique com o botão direito.** Existem (`dblclick`, `click({ button: 'right' })`), mas antes de usar vale conferir se a aplicação realmente exige isso: interação escondida atrás de duplo clique é problema de usabilidade.\n\n**Arrastar e soltar.** É a interação mais frágil de automatizar, porque depende de uma sequência de eventos de mouse que varia entre implementações. Quando existir uma alternativa acessível (mover com teclado, um menu de ações), prefira testar por ela: é mais estável e ainda cobre acessibilidade.\n\n**Rolagem.** As duas ferramentas rolam automaticamente até o elemento antes de interagir. Rolar manualmente costuma ser desnecessário, e quando é necessário (carregamento infinito), o certo é esperar o conteúdo novo, não rolar e torcer.\n\n**Elementos cobertos.** Um clique que falha com \"elemento não recebe eventos\" geralmente significa que algo está por cima: um banner de cookies, um modal, um cabeçalho fixo. Não force o clique com `{ force: true }`. Esse parâmetro **esconde um defeito real**: se o teste precisa forçar, a pessoa também não conseguiria clicar.",
                    },
                    {
                        type: "text",
                        value: "## Formulários completos\n\nUma dica de organização que paga muito: quando um formulário aparece em vários testes, extraia o preenchimento para uma função. Assim, quando um campo novo é adicionado, você conserta em um lugar só.",
                    },
                    {
                        type: "code",
                        value: "async function preencherEndereco(page, dados) {\n  await page.getByLabel('CEP').fill(dados.cep)\n  await page.getByLabel('Número').fill(dados.numero)\n  await page.getByLabel('Complemento').fill(dados.complemento ?? '')\n  await page.getByLabel('Estado').selectOption(dados.estado)\n}\n\ntest('finaliza compra com entrega em casa', async ({ page }) => {\n  await preencherEndereco(page, { cep: '01310-100', numero: '1000', estado: 'SP' })\n  await page.getByRole('button', { name: 'Continuar' }).click()\n  await expect(page.getByText('Endereço confirmado')).toBeVisible()\n})",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Quando é necessário digitar tecla por tecla em vez de preencher o campo de uma vez?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Quando o comportamento depende da digitação, como sugestões ou máscara.",
                                isCorrect: true,
                            },
                            {
                                text: "Sempre, porque a digitação reproduz com mais fidelidade o comportamento de quem usa.",
                                isCorrect: false,
                            },
                            {
                                text: "Quando o campo é obrigatório e o formulário valida o preenchimento ao ser enviado.",
                                isCorrect: false,
                            },
                            {
                                text: "Quando o campo aceita mais de vinte caracteres no total do valor informado.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a armadilha do comando type do Cypress?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Ele não limpa o campo antes de escrever, concatenando com o valor anterior.",
                                isCorrect: true,
                            },
                            {
                                text: "Ele não dispara os eventos necessários para que a aplicação reconheça a mudança.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele só funciona em campos de texto simples, sem suporte a áreas de texto maiores.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele exige que o elemento esteja visível na tela antes de a digitação ser iniciada.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um clique falha com a mensagem de que o elemento não recebe eventos. O que fazer?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Investigar o que está por cima, porque a pessoa também não conseguiria clicar.",
                                isCorrect: true,
                            },
                            {
                                text: "Usar a opção de forçar o clique, que ignora a verificação feita pela ferramenta.",
                                isCorrect: false,
                            },
                            {
                                text: "Aumentar o tempo de espera até que o elemento se torne clicável na interface.",
                                isCorrect: false,
                            },
                            {
                                text: "Trocar o seletor por um caminho estrutural, que localiza o elemento com precisão.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que a aula desaconselha automatizar arrastar e soltar quando existe alternativa?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque é a interação mais frágil, e a alternativa acessível é mais estável.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque nenhuma das duas ferramentas oferece suporte a esse tipo de interação.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque esse tipo de interação não pode ser executado em navegadores diferentes.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque exige que o elemento tenha um atributo de teste específico para funcionar.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é o ganho de extrair o preenchimento de um formulário para uma função?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Quando um campo novo é adicionado, o conserto acontece em um lugar só.",
                                isCorrect: true,
                            },
                            {
                                text: "A execução do teste fica mais rápida porque a função é reutilizada em memória.",
                                isCorrect: false,
                            },
                            {
                                text: "A ferramenta consegue paralelizar melhor os testes que compartilham funções auxiliares.",
                                isCorrect: false,
                            },
                            {
                                text: "Os seletores passam a ser resolvidos uma única vez para todos os testes da suíte.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Listas, tabelas e elementos repetidos",
                blocks: [
                    {
                        type: "text",
                        value: "## O terreno mais escorregadio\n\nListas e tabelas concentram a maior parte dos seletores frágeis de uma suíte, por três motivos: os elementos são parecidos, a ordem muda, e a quantidade varia.\n\nA boa notícia é que existem padrões que resolvem quase todos os casos.",
                    },
                    {
                        type: "text",
                        value: "## Padrão 1: filtrar pelo conteúdo único\n\nEm vez de escolher pela posição, localize o item pelo que ele tem de único e trabalhe dentro dele. É o padrão mais útil e o que você vai usar o tempo todo.",
                    },
                    {
                        type: "code",
                        value: "// Playwright: filtra a linha pelo texto e age dentro dela\nconst linha = page.getByRole('row').filter({ hasText: 'Pedido 1042' })\nawait expect(linha.getByTestId('status')).toHaveText('Enviado')\nawait linha.getByRole('button', { name: 'Cancelar' }).click()\n\n// Cypress: encontra a linha e busca dentro\ncy.contains('tr', 'Pedido 1042').within(() => {\n  cy.get('[data-testid=\"status\"]').should('have.text', 'Enviado')\n  cy.contains('button', 'Cancelar').click()\n})",
                    },
                    {
                        type: "text",
                        value: "## Padrão 2: verificar a lista como conjunto\n\nÀs vezes o que importa não é um item, e sim o conteúdo da lista inteira. Verificar quantidade e ordem de uma vez é mais legível e mais estável do que checar item por item.",
                    },
                    {
                        type: "code",
                        value: "// Quantidade\nawait expect(page.getByRole('listitem')).toHaveCount(3)\n\n// Conteúdo e ordem, em uma asserção só\nawait expect(page.getByTestId('nome-produto')).toHaveText([\n  'Teclado mecânico',\n  'Monitor 27 polegadas',\n  'Cadeira ergonômica',\n])\n\n// Cypress\ncy.get('[data-testid=\"nome-produto\"]').should('have.length', 3)\ncy.get('[data-testid=\"nome-produto\"]').eq(0).should('have.text', 'Teclado mecânico')",
                    },
                    {
                        type: "text",
                        value: '## Padrão 3: a lista vazia\n\nO estado vazio é uma das maiores fontes de defeito em interface, e um dos cenários mais esquecidos na automação. Vale ter um teste dedicado.\n\nO que verificar: a mensagem de estado vazio aparece; nenhum item é exibido; e nada quebrou (sem erro no console, sem "undefined" na tela, sem total dividido por zero).',
                    },
                    {
                        type: "code",
                        value: "test('mostra estado vazio quando a busca não encontra nada', async ({ page }) => {\n  await page.goto('/produtos?q=xyzabc123')\n\n  await expect(page.getByText('Nenhum produto encontrado')).toBeVisible()\n  await expect(page.getByRole('listitem')).toHaveCount(0)\n  await expect(page.getByTestId('total-resultados')).toHaveText('0 resultados')\n})",
                    },
                    {
                        type: "quote",
                        value: "Três cenários de lista que rendem defeito em quase todo sistema: **lista vazia**, **um único item** (o singular e o plural do texto costumam estar errados) e **lista com muitos itens** (a paginação, a rolagem infinita e o desempenho).",
                    },
                    {
                        type: "text",
                        value: "## Paginação e carregamento infinito\n\nDois padrões de interface que exigem cuidado.\n\nNa **paginação**, teste a navegação entre páginas, o comportamento na primeira e na última (os botões devem estar desabilitados nos extremos) e o que acontece ao pedir uma página que não existe pela URL. Uma armadilha comum: um item que aparece em duas páginas diferentes, ou some entre elas, quando a ordenação não é determinística no backend.\n\nNo **carregamento infinito**, o erro clássico é rolar e verificar imediatamente. O certo é **esperar o conteúdo novo aparecer**: aguardar a contagem de itens aumentar, ou esperar a requisição de mais itens terminar. Rolar e conferir na sequência produz um teste que passa numa máquina rápida e falha no CI.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual é o padrão mais confiável para agir sobre um item específico de uma lista?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Filtrar o item pelo conteúdo único e agir dentro dele.",
                                isCorrect: true,
                            },
                            {
                                text: "Escolher pela posição, usando o índice correspondente ao item desejado na lista.",
                                isCorrect: false,
                            },
                            {
                                text: "Buscar todos os elementos com o mesmo seletor e agir sobre o primeiro encontrado.",
                                isCorrect: false,
                            },
                            {
                                text: "Ordenar a lista antes da verificação para garantir uma posição fixa para cada item.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a vantagem de verificar o conteúdo da lista com uma asserção sobre o conjunto?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Fica mais legível e mais estável do que checar item por item.",
                                isCorrect: true,
                            },
                            {
                                text: "Reduz o tempo de execução porque a ferramenta consulta o DOM uma única vez.",
                                isCorrect: false,
                            },
                            {
                                text: "Permite que o teste continue passando mesmo quando a ordem dos itens muda.",
                                isCorrect: false,
                            },
                            {
                                text: "Dispensa a necessidade de esperar que a lista termine de carregar na tela.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que verificar em um teste de estado vazio?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Que a mensagem aparece, nenhum item é exibido e nada quebrou na tela.",
                                isCorrect: true,
                            },
                            {
                                text: "Apenas que a mensagem de lista vazia é exibida na posição correta da interface.",
                                isCorrect: false,
                            },
                            {
                                text: "Que a requisição ao servidor foi feita e devolveu uma resposta com status válido.",
                                isCorrect: false,
                            },
                            {
                                text: "Que o tempo de carregamento da tela vazia é menor do que o da tela com resultados.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Segundo a aula, qual cenário de lista costuma revelar erro de singular e plural?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "A lista com um único item.",
                                isCorrect: true,
                            },
                            {
                                text: "A lista vazia, em que nenhum resultado é retornado pela busca realizada.",
                                isCorrect: false,
                            },
                            {
                                text: "A lista com muitos itens, que exige paginação ou carregamento sob demanda.",
                                isCorrect: false,
                            },
                            {
                                text: "A lista ordenada de forma diferente do padrão definido pela aplicação.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "No carregamento infinito, qual é o erro clássico ao automatizar?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Rolar e verificar em seguida, sem esperar o conteúdo novo aparecer.",
                                isCorrect: true,
                            },
                            {
                                text: "Verificar a quantidade de itens antes de rolar a página até o final do conteúdo.",
                                isCorrect: false,
                            },
                            {
                                text: "Usar seletores por papel em vez de atributos de teste nos itens carregados.",
                                isCorrect: false,
                            },
                            {
                                text: "Executar o teste em paralelo com outros que também carregam a mesma listagem.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Uploads, downloads e diálogos do navegador",
                blocks: [
                    {
                        type: "text",
                        value: "## As interações que saem da página\n\nAlguns fluxos envolvem o navegador em si, e não só o conteúdo da página: escolher um arquivo, baixar um relatório, responder a um alerta, abrir uma nova aba. Cada um tem um jeito próprio de ser automatizado.",
                    },
                    {
                        type: "text",
                        value: "## Upload de arquivo\n\nO campo de arquivo abre uma janela do sistema operacional, que a ferramenta não controla. A solução das duas é a mesma: em vez de abrir a janela, define-se o arquivo diretamente no campo.",
                    },
                    {
                        type: "code",
                        value: "// Playwright\nawait page.getByLabel('Comprovante').setInputFiles('tests/fixtures/comprovante.pdf')\n\n// Vários arquivos\nawait page.getByLabel('Fotos').setInputFiles([\n  'tests/fixtures/foto1.jpg',\n  'tests/fixtures/foto2.jpg',\n])\n\n// Arquivo gerado na hora, sem precisar de um arquivo real no disco\nawait page.getByLabel('Comprovante').setInputFiles({\n  name: 'nota.txt',\n  mimeType: 'text/plain',\n  buffer: Buffer.from('conteúdo da nota'),\n})\n\n// Limpar a seleção\nawait page.getByLabel('Comprovante').setInputFiles([])\n\n// Cypress (a partir da versão 9.3)\ncy.get('input[type=file]').selectFile('cypress/fixtures/comprovante.pdf')",
                    },
                    {
                        type: "text",
                        value: "## O que testar em upload\n\nO caminho feliz é o menos interessante. Os cenários que rendem defeito:\n\n- **Arquivo acima do tamanho máximo**: a mensagem aparece e nada é enviado?\n- **Formato não permitido**: um `.exe` renomeado para `.pdf` passa?\n- **Arquivo vazio** (zero bytes).\n- **Nome com acento, espaço ou caractere especial.**\n- **Trocar o arquivo depois de selecionar**, e cancelar a seleção.\n- **Envio duplo**: clicar duas vezes no botão de enviar.\n\nRepare que são as bordas e os caminhos de erro da trilha de Fundamentos, aplicados a upload.",
                    },
                    {
                        type: "text",
                        value: "## Download\n\nBaixar arquivo tem uma peculiaridade: você precisa aguardar o evento de download **antes** de disparar a ação, senão o evento acontece enquanto você ainda não está escutando.",
                    },
                    {
                        type: "code",
                        value: "// Playwright: espera o download começar antes de clicar\nconst [download] = await Promise.all([\n  page.waitForEvent('download'),\n  page.getByRole('button', { name: 'Exportar CSV' }).click(),\n])\n\nexpect(download.suggestedFilename()).toBe('pedidos.csv')\nconst caminho = await download.path()\n// dá para ler o arquivo e conferir o conteúdo",
                    },
                    {
                        type: "text",
                        value: "## Diálogos do navegador\n\n`alert`, `confirm` e `prompt` bloqueiam a página até serem respondidos. As ferramentas lidam com isso de formas diferentes, e a diferença surpreende quem vem do Cypress.\n\nO **Cypress** responde automaticamente: aceita alertas e confirmações sem você fazer nada. Se quiser verificar o texto, precisa registrar um ouvinte.\n\nO **Playwright** também dispensa por padrão, mas permite registrar um manipulador para aceitar, recusar ou verificar a mensagem.",
                    },
                    {
                        type: "code",
                        value: "// Playwright: aceita e confere a mensagem\npage.on('dialog', async (dialog) => {\n  expect(dialog.message()).toBe('Deseja mesmo excluir este pedido?')\n  await dialog.accept()\n})\nawait page.getByRole('button', { name: 'Excluir' }).click()\n\n// Cypress: verifica o texto do confirm\ncy.on('window:confirm', (texto) => {\n  expect(texto).to.equal('Deseja mesmo excluir este pedido?')\n  return true   // retornar false cancela\n})\ncy.contains('button', 'Excluir').click()",
                    },
                    {
                        type: "quote",
                        value: 'Um detalhe que economiza horas: quando o teste "trava" sem explicação numa ação que abre confirmação, quase sempre é um diálogo esperando resposta. Nas duas ferramentas dá para verificar isso rapidamente registrando um manipulador e observando se ele é chamado.',
                    },
                    {
                        type: "text",
                        value: '## Nova aba e nova janela\n\nClicar num link com `target="_blank"` abre outra aba, e o teste continua olhando para a primeira. No Playwright, você espera pela nova página e passa a interagir com ela. No Cypress, a limitação de múltiplas abas leva a uma solução diferente e bastante usada: em vez de abrir a aba, verificar que o link **aponta** para o lugar certo, e visitar a URL diretamente se precisar testar o destino.',
                    },
                    {
                        type: "code",
                        value: "// Playwright: captura a nova aba\nconst [novaAba] = await Promise.all([\n  page.context().waitForEvent('page'),\n  page.getByRole('link', { name: 'Ver nota fiscal' }).click(),\n])\nawait expect(novaAba).toHaveURL(/\\/notas\\/\\d+/)\n\n// Cypress: verifica o destino sem abrir a aba\ncy.contains('a', 'Ver nota fiscal')\n  .should('have.attr', 'target', '_blank')\n  .and('have.attr', 'href')\n  .and('match', /\\/notas\\/\\d+/)",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Como as ferramentas resolvem o problema da janela do sistema no upload de arquivo?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Definem o arquivo diretamente no campo, sem abrir a janela do sistema.",
                                isCorrect: true,
                            },
                            {
                                text: "Controlam a janela do sistema operacional por meio de comandos específicos da ferramenta.",
                                isCorrect: false,
                            },
                            {
                                text: "Simulam o clique no botão de seleção e aguardam a resposta do sistema operacional.",
                                isCorrect: false,
                            },
                            {
                                text: "Copiam o arquivo para a área de transferência e colam no campo correspondente da tela.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual cenário de upload tem mais chance de revelar defeito?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Um arquivo acima do tamanho máximo permitido pela aplicação.",
                                isCorrect: true,
                            },
                            {
                                text: "Um arquivo PDF pequeno e válido, enviado pelo caminho principal do formulário.",
                                isCorrect: false,
                            },
                            {
                                text: "Um arquivo escolhido e enviado imediatamente após o carregamento da tela.",
                                isCorrect: false,
                            },
                            {
                                text: "Um arquivo com o mesmo nome de outro que já foi enviado anteriormente pelo usuário.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que é preciso aguardar o evento de download antes de clicar no botão?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque o evento acontece antes de você começar a escutar, e se perde.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque o navegador bloqueia downloads iniciados por comandos automatizados.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a ferramenta precisa reservar espaço em disco antes de iniciar a transferência.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o clique dispara uma navegação que encerra o contexto atual da página aberta.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O teste trava sem explicação em uma ação que abre uma confirmação. Qual é a causa provável?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Um diálogo do navegador esperando resposta e bloqueando a página.",
                                isCorrect: true,
                            },
                            {
                                text: "Um seletor incorreto que não conseguiu localizar o botão de confirmação na tela.",
                                isCorrect: false,
                            },
                            {
                                text: "Um tempo de espera configurado com valor alto demais na configuração do projeto.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma requisição de rede pendente que impede a página de terminar o carregamento.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a abordagem comum no Cypress para links que abrem em nova aba?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Verificar que o link aponta para o destino certo, sem abrir a aba.",
                                isCorrect: true,
                            },
                            {
                                text: "Capturar a nova aba criada e passar a interagir com ela normalmente no teste.",
                                isCorrect: false,
                            },
                            {
                                text: "Alterar o atributo do link por script para que ele abra na mesma aba do teste.",
                                isCorrect: false,
                            },
                            {
                                text: "Executar o teste em modo de aba única, opção disponível na configuração da ferramenta.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 3 - Asserções e espera",
        aulas: [
            {
                titulo: "Asserções: o que verificar de verdade",
                blocks: [
                    {
                        type: "text",
                        value: "## Um teste sem asserção não é um teste\n\nParece óbvio, mas acontece: um teste que só percorre a tela, clica em tudo e termina. Ele passa sempre, inclusive quando o produto está quebrado. Ele só falha se um elemento sumir, e isso é bem pouco.\n\nA asserção é o que transforma um roteiro de cliques em verificação. E a qualidade da asserção define o que o teste realmente protege.",
                    },
                    {
                        type: "code",
                        value: "// Playwright: as asserções de expect esperam automaticamente\nawait expect(page.getByText('Pedido confirmado')).toBeVisible()\nawait expect(page.getByTestId('total')).toHaveText('R$ 90,00')\nawait expect(page.getByTestId('total')).toContainText('90')\nawait expect(page).toHaveURL('/pedidos/confirmado')\nawait expect(page).toHaveTitle(/Pedido confirmado/)\nawait expect(page.getByRole('button', { name: 'Finalizar' })).toBeDisabled()\nawait expect(page.getByRole('listitem')).toHaveCount(3)\nawait expect(page.getByLabel('Email')).toHaveValue('maria@exemplo.com')\nawait expect(page.getByTestId('erro')).toBeHidden()\n\n// Cypress\ncy.contains('Pedido confirmado').should('be.visible')\ncy.get('[data-testid=\"total\"]').should('have.text', 'R$ 90,00')\ncy.url().should('include', '/pedidos/confirmado')\ncy.contains('button', 'Finalizar').should('be.disabled')\ncy.get('[data-testid=\"item\"]').should('have.length', 3)",
                    },
                    {
                        type: "text",
                        value: '## Verificar o que importa\n\nAqui está a diferença entre um teste que protege e um que dá falsa sensação de segurança.\n\nVoltando ao exemplo do cancelamento de pedido da trilha de Fundamentos: o teste que verifica só a mensagem "Pedido cancelado" na tela deixa passar um defeito em que o estorno não acontece e o estoque não volta.\n\nUm teste E2E de um fluxo importante deve verificar **os efeitos que o fluxo promete**, não apenas a confirmação visual. E isso frequentemente significa olhar além da tela: conferir pela API que o status mudou, que o estoque voltou, que o email entrou na fila.',
                    },
                    {
                        type: "code",
                        value: "test('cancelar pedido pago estorna e devolve o estoque', async ({ page, request }) => {\n  const pedido = await criarPedidoPago({ sku: 'SKU-4471', quantidade: 1 })\n  const estoqueAntes = await estoqueDe('SKU-4471', request)\n\n  await page.goto(`/pedidos/${pedido.id}`)\n  await page.getByRole('button', { name: 'Cancelar pedido' }).click()\n  await page.getByRole('button', { name: 'Confirmar' }).click()\n\n  // O que a tela promete\n  await expect(page.getByText('Pedido cancelado')).toBeVisible()\n  await expect(page.getByTestId('status')).toHaveText('Cancelado')\n\n  // O que o fluxo promete de verdade\n  const depois = await request.get(`/api/pedidos/${pedido.id}`)\n  expect((await depois.json()).status).toBe('cancelado')\n  expect(await estoqueDe('SKU-4471', request)).toBe(estoqueAntes + 1)\n})",
                    },
                    {
                        type: "quote",
                        value: "Pergunte-se sempre: **se essa funcionalidade quebrar de um jeito silencioso, meu teste falha?** Se a resposta for não, o teste está verificando a casca e não o conteúdo.",
                    },
                    {
                        type: "text",
                        value: "## Asserções negativas exigem cuidado\n\nVerificar que algo **não** está presente é traiçoeiro, porque um elemento que ainda não carregou também não está presente. O teste passa por acidente.\n\nAs duas ferramentas ajudam: `toBeHidden` e `not.toBeVisible` no Playwright, e `should('not.exist')` no Cypress, todos com espera automática. Mesmo assim, o padrão mais seguro é **primeiro esperar algo que prove que a página chegou ao estado esperado, e só então verificar a ausência**.",
                    },
                    {
                        type: "code",
                        value: "// Frágil: passa se a página ainda não carregou\nawait expect(page.getByTestId('erro')).toBeHidden()\n\n// Seguro: prova que chegou ao estado certo antes de negar\nawait expect(page.getByText('Pedido confirmado')).toBeVisible()\nawait expect(page.getByTestId('erro')).toBeHidden()",
                    },
                    {
                        type: "text",
                        value: '## Quantas asserções por teste\n\nNão existe regra fixa, mas existe um bom critério: **verifique tudo que pertence ao mesmo comportamento, e nada além disso**.\n\nUm teste de "finalizar compra com cupom" pode legitimamente verificar a mensagem, o total, o status e o estoque. Todas fazem parte do mesmo comportamento. O que ele não deve fazer é aproveitar a carona e verificar o menu, o rodapé e a foto de perfil, porque aí a falha deixa de indicar o que quebrou.\n\nUma dica de legibilidade: quando a asserção falha, a mensagem precisa ser suficiente para entender o problema sem abrir o código. Verificar o texto exato (`toHaveText`) produz uma mensagem melhor do que verificar apenas que o elemento existe.',
                    },
                ],
                questions: [
                    {
                        statement: "O que caracteriza um teste sem asserções úteis?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Ele passa sempre, inclusive quando o produto está quebrado.",
                                isCorrect: true,
                            },
                            {
                                text: "Ele demora mais para executar porque percorre toda a interface da aplicação.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele falha com frequência porque depende do carregamento completo da página.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele não consegue ser executado em paralelo com os demais testes da suíte.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um teste de cancelamento verifica só a mensagem na tela. Qual defeito ele deixaria passar?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O estorno não acontecer e o estoque não ser devolvido.",
                                isCorrect: true,
                            },
                            {
                                text: "A mensagem ser exibida em uma posição diferente da definida pela equipe de design.",
                                isCorrect: false,
                            },
                            {
                                text: "O botão de cancelamento demorar mais que o esperado para responder ao clique.",
                                isCorrect: false,
                            },
                            {
                                text: "A tela de detalhes do pedido não carregar corretamente em navegadores antigos.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual pergunta a aula sugere para avaliar a qualidade de uma asserção?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Se a funcionalidade quebrar de forma silenciosa, o meu teste falha?",
                                isCorrect: true,
                            },
                            {
                                text: "Quantas asserções esse teste tem em comparação com os demais testes da suíte?",
                                isCorrect: false,
                            },
                            {
                                text: "Essa asserção consegue ser executada em todos os navegadores suportados pelo produto?",
                                isCorrect: false,
                            },
                            {
                                text: "A asserção verifica um elemento identificado por atributo de teste dedicado?",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Por que asserções negativas exigem cuidado?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque um elemento que ainda não carregou também não está presente.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque as ferramentas não oferecem espera automática para verificações de ausência.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a mensagem de falha gerada não indica qual elemento deveria estar ausente.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque elas exigem seletores estruturais, que são mais frágeis que os semânticos.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é o critério proposto para decidir quantas asserções colocar em um teste?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Verificar tudo que pertence ao mesmo comportamento, e nada além disso.",
                                isCorrect: true,
                            },
                            {
                                text: "Usar no máximo três asserções para manter a mensagem de falha compreensível.",
                                isCorrect: false,
                            },
                            {
                                text: "Concentrar todas as verificações possíveis para aproveitar a preparação já feita.",
                                isCorrect: false,
                            },
                            {
                                text: "Escrever uma única asserção por teste, garantindo que a falha aponte um só problema.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "O problema da espera e por que sleep é veneno",
                blocks: [
                    {
                        type: "text",
                        value: "## A causa número um de teste instável\n\nSe existe um único vilão na automação de interface, é a **espera**.\n\nUma aplicação web é assíncrona por natureza. Você clica, uma requisição sai, o servidor responde, o JavaScript processa, a tela atualiza. Entre o clique e a mudança visível passa um tempo que **varia**: varia com a rede, com a carga do servidor, com a máquina, com o navegador, com o que mais está rodando.\n\nO teste, por outro lado, executa na velocidade da máquina. Ele clica e imediatamente tenta verificar. Se a tela ainda não atualizou, ele falha, mesmo com o produto funcionando perfeitamente.",
                    },
                    {
                        type: "text",
                        value: "## A solução errada que todo mundo tenta\n\nA primeira reação é sempre a mesma: colocar uma pausa.",
                    },
                    {
                        type: "code",
                        value: "// NÃO faça isso\nawait page.getByRole('button', { name: 'Salvar' }).click()\nawait page.waitForTimeout(3000)                  // Playwright\nawait expect(page.getByText('Salvo')).toBeVisible()\n\ncy.contains('button', 'Salvar').click()\ncy.wait(3000)                                    // Cypress\ncy.contains('Salvo').should('be.visible')",
                    },
                    {
                        type: "text",
                        value: "## Por que isso é veneno\n\nUma pausa fixa é errada nos dois sentidos ao mesmo tempo.\n\n**É lenta demais quando dá certo.** Se a tela atualizou em 200 ms, você desperdiçou 2,8 segundos. Multiplique por trezentas ocorrências e a suíte ganha quinze minutos de espera pura.\n\n**É curta demais quando dá errado.** No dia em que o servidor está mais lento, ou o CI está carregado, 3 segundos não bastam. O teste falha. Alguém aumenta para 5. Meses depois, para 10. A suíte fica cada vez mais lenta e continua instável.\n\nE existe um efeito colateral pior: a pausa **esconde o problema real**. Se a tela demora três segundos para responder, isso talvez seja um defeito de desempenho que ninguém está vendo, porque o teste está compensando em silêncio.",
                    },
                    {
                        type: "table",
                        value: '[["Abordagem", "O que acontece quando é rápido", "O que acontece quando é lento", "Veredito"], ["Pausa fixa", "Desperdiça o tempo todo", "Falha mesmo assim", "Nunca"], ["Esperar a condição", "Segue na hora", "Espera o necessário", "Sempre"], ["Esperar a requisição", "Segue na hora", "Espera a resposta chegar", "Ótimo para fluxos com API"]]',
                    },
                    {
                        type: "quote",
                        value: 'A regra: **espere por uma condição, nunca por um tempo**. "Espere até o texto aparecer" se adapta; "espere 3 segundos" é um chute que estará errado em alguma execução.',
                    },
                    {
                        type: "text",
                        value: "## As exceções raras\n\nExistem pouquíssimos casos em que uma pausa é defensável, e vale conhecê-los para não usar como desculpa:\n\n- **Depuração local**, para ver o que está acontecendo na tela. Nunca vai para o repositório.\n- **Animação sem estado observável**, quando não há nenhuma forma de saber que ela terminou. Mesmo aí, o melhor caminho é pedir ao time um sinal observável, como uma classe que muda no fim da animação.\n- **Limitação de taxa deliberada**, quando o teste precisa respeitar um intervalo mínimo imposto pelo sistema.\n\nFora isso, se você sentiu vontade de usar uma pausa, é porque não encontrou a condição certa para esperar. A próxima aula mostra quais são elas.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Por que a espera é a principal causa de instabilidade em testes de interface?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Porque o tempo entre a ação e a mudança na tela varia a cada execução.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque as ferramentas de automação não conseguem detectar quando a página carregou.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o navegador limita a quantidade de requisições simultâneas que podem ser feitas.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque os seletores precisam ser recalculados sempre que a página sofre alteração.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o duplo problema de uma pausa fixa?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "É lenta demais quando dá certo e curta demais quando dá errado.",
                                isCorrect: true,
                            },
                            {
                                text: "Consome memória do navegador e impede a execução paralela dos testes da suíte.",
                                isCorrect: false,
                            },
                            {
                                text: "Funciona apenas em uma das ferramentas e precisa ser adaptada quando o time migra.",
                                isCorrect: false,
                            },
                            {
                                text: "Exige configuração no arquivo do projeto e não pode ser definida dentro do teste.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Além de lentidão e instabilidade, qual efeito colateral a pausa fixa provoca?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Esconde um possível problema de desempenho da aplicação.",
                                isCorrect: true,
                            },
                            {
                                text: "Impede que as evidências de falha sejam gravadas corretamente pela ferramenta.",
                                isCorrect: false,
                            },
                            {
                                text: "Faz com que a ferramenta ignore as asserções escritas depois do comando de espera.",
                                isCorrect: false,
                            },
                            {
                                text: "Desativa a espera automática dos demais comandos executados no mesmo teste.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a regra que a aula propõe sobre espera?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Espere por uma condição, nunca por um tempo.",
                                isCorrect: true,
                            },
                            {
                                text: "Configure um tempo máximo global e deixe a ferramenta gerenciar cada verificação.",
                                isCorrect: false,
                            },
                            {
                                text: "Use pausas curtas distribuídas em vez de uma única pausa longa no meio do teste.",
                                isCorrect: false,
                            },
                            {
                                text: "Espere sempre pelo carregamento completo da página antes de qualquer interação.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Você sentiu vontade de usar uma pausa fixa. O que isso costuma indicar?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Que ainda não foi encontrada a condição certa para esperar.",
                                isCorrect: true,
                            },
                            {
                                text: "Que a aplicação tem um defeito de desempenho que precisa ser corrigido antes.",
                                isCorrect: false,
                            },
                            {
                                text: "Que o teste está no nível errado e deveria ser movido para a camada de API.",
                                isCorrect: false,
                            },
                            {
                                text: "Que a ferramenta escolhida não oferece recursos suficientes de espera automática.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Espera automática e as condições certas",
                blocks: [
                    {
                        type: "text",
                        value: "## As ferramentas já esperam por você\n\nA boa notícia é que Cypress e Playwright resolvem a maior parte do problema sozinhos.\n\nQuando você escreve `await page.getByRole('button', { name: 'Salvar' }).click()`, o Playwright não tenta clicar imediatamente. Ele espera até que o elemento exista, esteja visível, esteja estável (parou de se mover), possa receber eventos e esteja habilitado. Só então clica. Se em alguns segundos nada disso acontecer, ele falha com uma mensagem que diz **qual** das condições não foi satisfeita.\n\nO Cypress faz algo equivalente: cada comando tenta de novo até o tempo limite. E as asserções (`should`) participam dessa repetição, o que é a chave para usá-lo bem.",
                    },
                    {
                        type: "text",
                        value: '## O que a espera automática cobre e o que não cobre\n\n**Cobre bem:** elemento que aparece depois de uma requisição, botão que fica habilitado, texto que muda, elemento que sai da tela, lista que carrega.\n\n**Não cobre:** efeitos que não têm reflexo na interface. Se você clica em "Enviar email" e a tela não muda, nenhuma espera automática vai saber quando o email saiu. Aí você precisa esperar por outra coisa: a requisição, um registro na API, um estado no backend.',
                    },
                    {
                        type: "code",
                        value: "// A espera automática resolve\nawait page.getByRole('button', { name: 'Salvar' }).click()\nawait expect(page.getByText('Salvo com sucesso')).toBeVisible()\n\n// Precisa esperar a requisição: a tela não muda\nconst [resposta] = await Promise.all([\n  page.waitForResponse((r) => r.url().includes('/api/emails') && r.status() === 202),\n  page.getByRole('button', { name: 'Enviar email' }).click(),\n])\nexpect(resposta.status()).toBe(202)",
                    },
                    {
                        type: "text",
                        value: "## O erro clássico no Cypress\n\nO Cypress tem uma pegadinha específica que derruba muita gente: comandos são enfileirados, mas código JavaScript comum executa **imediatamente**.",
                    },
                    {
                        type: "code",
                        value: "// ERRADO: o if roda antes do get terminar\nlet existe = false\ncy.get('[data-testid=\"banner\"]').then(($el) => { existe = $el.length > 0 })\nif (existe) {                    // sempre false: roda antes\n  cy.contains('Fechar').click()\n}\n\n// CERTO: tudo dentro do then, na fila do Cypress\ncy.get('body').then(($body) => {\n  if ($body.find('[data-testid=\"banner\"]').length > 0) {\n    cy.contains('Fechar').click()\n  }\n})",
                    },
                    {
                        type: "table",
                        value: '[["O que esperar", "Playwright", "Cypress"], ["Elemento visível", "expect(...).toBeVisible()", "should(\'be.visible\')"], ["Texto específico", "expect(...).toHaveText(...)", "should(\'have.text\', ...)"], ["Requisição terminar", "waitForResponse(...)", "cy.intercept + cy.wait(\'@alias\')"], ["URL mudar", "expect(page).toHaveURL(...)", "cy.url().should(...)"], ["Elemento sumir", "expect(...).toBeHidden()", "should(\'not.exist\')"], ["Contagem estabilizar", "expect(...).toHaveCount(n)", "should(\'have.length\', n)"]]',
                    },
                    {
                        type: "quote",
                        value: 'Quando um teste falha por tempo, a pergunta certa não é "quanto tempo devo esperar?", e sim **"o que exatamente eu deveria estar esperando?"**. A resposta quase sempre é uma condição observável que estava na sua frente.',
                    },
                    {
                        type: "text",
                        value: "## Ajustando o tempo limite\n\nO tempo limite padrão (alguns segundos) serve para a maioria dos casos. Quando um passo é legitimamente mais lento (um relatório pesado, uma importação de arquivo), o certo é aumentar **naquele passo**, e não globalmente.\n\nAumentar o limite global mascara os problemas: um teste que deveria falhar em 5 segundos passa a demorar 30 antes de falhar, e a suíte inteira fica lenta em toda falha.",
                    },
                    {
                        type: "code",
                        value: "// Playwright: só nesta asserção\nawait expect(page.getByText('Relatório pronto')).toBeVisible({ timeout: 60_000 })\n\n// Cypress: só neste comando\ncy.contains('Relatório pronto', { timeout: 60000 }).should('be.visible')",
                    },
                ],
                questions: [
                    {
                        statement: "O que o Playwright verifica antes de executar um clique?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Que o elemento existe, está visível, estável, habilitado e recebe eventos.",
                                isCorrect: true,
                            },
                            {
                                text: "Que a página terminou de carregar todos os recursos declarados no documento HTML.",
                                isCorrect: false,
                            },
                            {
                                text: "Que nenhuma requisição de rede está pendente no momento em que a ação será feita.",
                                isCorrect: false,
                            },
                            {
                                text: "Que o seletor usado corresponde a exatamente um elemento presente na página aberta.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Em qual situação a espera automática não resolve?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Quando o efeito da ação não tem reflexo visível na interface.",
                                isCorrect: true,
                            },
                            {
                                text: "Quando o elemento aparece na tela apenas depois de uma requisição ao servidor.",
                                isCorrect: false,
                            },
                            {
                                text: "Quando o botão fica habilitado somente após o preenchimento completo do formulário.",
                                isCorrect: false,
                            },
                            {
                                text: "Quando a lista de resultados demora para ser renderizada por causa do volume de dados.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a pegadinha do Cypress destacada na aula?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Comandos são enfileirados, mas código JavaScript comum executa na hora.",
                                isCorrect: true,
                            },
                            {
                                text: "As asserções não participam da repetição automática feita pelos comandos anteriores.",
                                isCorrect: false,
                            },
                            {
                                text: "Os comandos precisam ser aguardados com await para que a fila seja respeitada.",
                                isCorrect: false,
                            },
                            {
                                text: "O tempo limite configurado se aplica a cada teste inteiro, e não a cada comando.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual pergunta a aula sugere quando um teste falha por tempo?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O que exatamente eu deveria estar esperando?",
                                isCorrect: true,
                            },
                            {
                                text: "Qual é o tempo limite adequado para esse tipo de operação na aplicação?",
                                isCorrect: false,
                            },
                            {
                                text: "Esse teste deveria estar sendo executado em uma camada mais barata da pirâmide?",
                                isCorrect: false,
                            },
                            {
                                text: "A máquina que executa a suíte tem recursos suficientes para rodar esses testes?",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Por que aumentar o tempo limite global é uma má ideia?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque toda falha passa a demorar muito mais, deixando a suíte lenta.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque a ferramenta ignora o valor global quando existe configuração por comando.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o limite global não se aplica às asserções, apenas aos comandos de interação.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque valores altos impedem a execução paralela dos testes no servidor de integração.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Carregamento, animação e requisições",
                blocks: [
                    {
                        type: "text",
                        value: "## Os três momentos que confundem o teste\n\nNa prática, quase toda falha de tempo cai em uma destas três situações. Vale saber reconhecer cada uma pelo sintoma.",
                    },
                    {
                        type: "text",
                        value: '## 1. Conteúdo que ainda não chegou\n\nO sintoma clássico: o teste encontra o elemento, mas com o conteúdo errado. Ele lê "Carregando..." em vez do valor, ou lê "R$ 0,00" antes de o total ser calculado.\n\nIsso acontece porque o elemento **já existe** no DOM, e a espera por visibilidade se satisfaz. O que ainda não chegou é o conteúdo.\n\nA solução é esperar pelo **valor esperado**, não pela existência do elemento. As asserções de texto das duas ferramentas repetem até o conteúdo bater, o que resolve o caso naturalmente.',
                    },
                    {
                        type: "code",
                        value: "// Frágil: o elemento existe, mas pode estar com \"Carregando...\"\nconst total = await page.getByTestId('total').textContent()\nexpect(total).toBe('R$ 90,00')\n\n// Robusto: repete até o texto bater ou o tempo esgotar\nawait expect(page.getByTestId('total')).toHaveText('R$ 90,00')\n\n// Também funciona: esperar o indicador de carregamento sumir\nawait expect(page.getByTestId('carregando')).toBeHidden()\nawait expect(page.getByTestId('total')).toHaveText('R$ 90,00')",
                    },
                    {
                        type: "quote",
                        value: "Reparou na diferença? Ler o valor com `textContent` tira uma **fotografia** do estado naquele instante. A asserção `toHaveText` **repete** até dar certo. Sempre que possível, deixe a asserção fazer a espera em vez de capturar o valor antes.",
                    },
                    {
                        type: "text",
                        value: "## 2. Elemento que ainda está se movendo\n\nModais que deslizam, menus que expandem, listas com transição: durante a animação, o elemento está visível mas em movimento. Um clique disparado nesse instante pode acertar o lugar errado.\n\nO Playwright já espera a estabilidade (o elemento parar de se mover) antes de clicar, o que resolve a maioria dos casos. Quando ainda assim houver problema, duas saídas boas:\n\n**Esperar o estado final**, e não a animação: aguardar que o modal esteja aberto pelo atributo que a aplicação define, por exemplo.\n\n**Desligar as animações no ambiente de teste.** É a solução mais eficaz e a mais subestimada: um pequeno CSS injetado que zera durações torna a suíte inteira mais rápida e mais estável de uma vez.",
                    },
                    {
                        type: "code",
                        value: "/* Injetado apenas no ambiente de teste */\n*, *::before, *::after {\n  animation-duration: 0s !important;\n  transition-duration: 0s !important;\n}",
                    },
                    {
                        type: "text",
                        value: '## 3. Requisição que ainda não terminou\n\nO caso mais comum em aplicações modernas. Você clica em "Salvar", a requisição sai, e o teste segue antes de a resposta chegar.\n\nQuando a tela reflete o resultado, a espera automática resolve. Quando não reflete (ou quando você quer ter certeza de que a chamada aconteceu), o caminho é esperar pela requisição.',
                    },
                    {
                        type: "code",
                        value: "// Cypress: intercepta, dá um apelido e espera por ele\ncy.intercept('POST', '/api/pedidos').as('criarPedido')\ncy.contains('button', 'Finalizar compra').click()\ncy.wait('@criarPedido').its('response.statusCode').should('eq', 201)\ncy.contains('Pedido confirmado').should('be.visible')\n\n// Playwright: espera a resposta específica\nconst [resposta] = await Promise.all([\n  page.waitForResponse((r) => r.url().includes('/api/pedidos') && r.request().method() === 'POST'),\n  page.getByRole('button', { name: 'Finalizar compra' }).click(),\n])\nexpect(resposta.status()).toBe(201)\nawait expect(page.getByText('Pedido confirmado')).toBeVisible()",
                    },
                    {
                        type: "text",
                        value: "## O padrão que resolve quase tudo\n\nGuarde esta sequência, porque ela cobre a maior parte dos fluxos com requisição:\n\n1. **Prepare a escuta** da requisição (intercepte ou registre a espera).\n2. **Dispare a ação.**\n3. **Espere a resposta** chegar.\n4. **Verifique o efeito na tela.**\n\nA ordem importa: preparar a escuta **antes** de disparar a ação. Se você clicar primeiro e escutar depois, a requisição pode terminar antes de você começar a ouvir, e o teste vai esperar por algo que já passou até o tempo esgotar.",
                    },
                ],
                questions: [
                    {
                        statement:
                            'O teste lê "Carregando..." em vez do valor esperado. Qual é a causa?',
                        difficulty: "facil",
                        options: [
                            {
                                text: "O elemento já existe no DOM, mas o conteúdo ainda não chegou.",
                                isCorrect: true,
                            },
                            {
                                text: "O seletor usado localiza um elemento diferente do que o teste pretendia verificar.",
                                isCorrect: false,
                            },
                            {
                                text: "A requisição ao servidor falhou e a aplicação manteve o estado de carregamento.",
                                isCorrect: false,
                            },
                            {
                                text: "A ferramenta não conseguiu esperar pela visibilidade do elemento antes de ler o texto.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a diferença entre ler o texto com textContent e usar a asserção toHaveText?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A leitura tira uma fotografia do instante; a asserção repete até bater.",
                                isCorrect: true,
                            },
                            {
                                text: "A leitura funciona em qualquer elemento; a asserção só funciona em campos de texto.",
                                isCorrect: false,
                            },
                            {
                                text: "A leitura é mais rápida; a asserção adiciona um tempo fixo de espera ao comando.",
                                isCorrect: false,
                            },
                            {
                                text: "A leitura considera o texto oculto; a asserção considera apenas o texto visível na tela.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a solução mais eficaz para problemas causados por animação?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Desligar as animações no ambiente de teste com um CSS que zera durações.",
                                isCorrect: true,
                            },
                            {
                                text: "Adicionar uma pausa fixa proporcional à duração configurada para cada animação.",
                                isCorrect: false,
                            },
                            {
                                text: "Clicar duas vezes no elemento para garantir que o segundo clique acerte o alvo.",
                                isCorrect: false,
                            },
                            {
                                text: "Aumentar o tempo limite global para acomodar a duração das transições da interface.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a ordem correta ao esperar por uma requisição?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Preparar a escuta, disparar a ação, esperar a resposta e verificar a tela.",
                                isCorrect: true,
                            },
                            {
                                text: "Disparar a ação, preparar a escuta, esperar a resposta e verificar o efeito na tela.",
                                isCorrect: false,
                            },
                            {
                                text: "Verificar a tela, disparar a ação e depois conferir se a requisição foi realizada.",
                                isCorrect: false,
                            },
                            {
                                text: "Disparar a ação, verificar a tela e por último conferir a resposta recebida do servidor.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O que acontece se você clicar primeiro e só depois começar a escutar a requisição?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "A requisição pode terminar antes, e o teste espera por algo que já passou.",
                                isCorrect: true,
                            },
                            {
                                text: "A ferramenta registra a requisição retroativamente e o teste segue normalmente.",
                                isCorrect: false,
                            },
                            {
                                text: "O clique é bloqueado até que a escuta esteja registrada pela ferramenta de teste.",
                                isCorrect: false,
                            },
                            {
                                text: "A requisição é executada duas vezes, uma para a ação e outra para a escuta registrada.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Depurando um teste que falha",
                blocks: [
                    {
                        type: "text",
                        value: "## A habilidade que separa quem sofre de quem resolve\n\nEscrever teste que passa é fácil. Descobrir por que um teste falhou no CI às duas da manhã, quando ele passa na sua máquina, é o que realmente pesa no dia a dia.\n\nAntes das ferramentas, uma pergunta de triagem: **o produto quebrou ou o teste quebrou?** Essa é a primeira coisa a determinar, e quase toda a investigação decorre dela.",
                    },
                    {
                        type: "table",
                        value: '[["Sintoma", "Causa provável", "Primeira coisa a olhar"], ["Falha só no CI", "Tempo, ambiente ou dado diferente", "Trace ou vídeo da execução no CI"], ["Falha só em paralelo", "Testes disputando o mesmo dado", "Isolamento e identificadores únicos"], ["Falha na segunda execução", "Estado deixado pela primeira", "Limpeza entre testes"], ["Falha intermitente", "Espera insuficiente ou dado instável", "Onde o teste espera por tempo"], ["Falha sempre, em todo lugar", "Provavelmente é defeito real", "Reproduzir à mão"]]',
                    },
                    {
                        type: "text",
                        value: "## As ferramentas de investigação\n\n**Playwright: o trace viewer.** É a melhor ferramenta da categoria. Ele grava uma linha do tempo completa: cada ação, um print antes e depois, o estado do DOM, as requisições de rede, o console. Você abre o trace de uma execução que falhou no servidor e navega pela execução inteira como se estivesse assistindo.",
                    },
                    {
                        type: "code",
                        value: "# Rodar com trace e abrir depois\nnpx playwright test --trace on\nnpx playwright show-trace test-results/.../trace.zip\n\n# Modo interativo: roda passo a passo, com inspetor\nnpx playwright test --ui\nnpx playwright test --debug\n\n# Rodar um teste só, num navegador visível\nnpx playwright test tests/checkout.spec.ts --headed --project=chromium",
                    },
                    {
                        type: "text",
                        value: "**Cypress: o Test Runner.** Mostra a lista de comandos executados e permite voltar no tempo: ao passar o mouse sobre um comando, a tela volta ao estado daquele instante. Combinado com o console do navegador aberto, resolve a maioria dos casos localmente.",
                    },
                    {
                        type: "code",
                        value: "# Cypress\nnpx cypress open                         # interativo\nnpx cypress run --spec cypress/e2e/checkout.cy.ts\nnpx cypress run --headed --no-exit       # deixa o navegador aberto no fim",
                    },
                    {
                        type: "text",
                        value: '## Um roteiro de investigação\n\nQuando um teste falha e você não sabe por quê, siga esta ordem. Ela resolve a maior parte dos casos sem chute:\n\n1. **Leia a mensagem de erro até o fim.** As duas ferramentas dizem qual condição não foi satisfeita, e frequentemente a resposta está ali: "elemento encontrado, mas não visível", "dois elementos correspondem ao seletor", "elemento coberto por outro".\n2. **Olhe o print ou o vídeo do momento da falha.** Muitas vezes a tela mostra um erro do sistema, um modal inesperado ou um banner de cookies que ninguém previu.\n3. **Verifique se o produto realmente funciona**, fazendo o fluxo à mão no mesmo ambiente.\n4. **Rode só esse teste, isolado.** Se passar sozinho e falhar na suíte, o problema é interferência entre testes.\n5. **Rode dez vezes seguidas.** Se falhar em duas, é instabilidade, não defeito. Procure a espera frágil.\n6. **Compare os ambientes.** Versão da aplicação, dados, variáveis, fuso horário, resolução de tela.',
                    },
                    {
                        type: "quote",
                        value: "O erro mais caro na investigação é **corrigir o sintoma**. Aumentar o tempo limite porque o teste falhou por tempo resolve a execução de hoje e devolve o problema na semana que vem, maior. Vale sempre gastar dez minutos entendendo a causa antes de mexer no número.",
                    },
                    {
                        type: "text",
                        value: "## Testes intermitentes merecem tratamento próprio\n\nUm teste que falha uma vez a cada vinte execuções é o pior tipo de problema, porque não dói o suficiente para ser priorizado e envenena a suíte aos poucos.\n\nA recomendação prática: quando um teste é identificado como intermitente, **marque-o e trate como defeito**, com dono e prazo. Deixá-lo falhando de vez em quando ensina o time a reexecutar sem olhar, e a partir daí toda falha real também é ignorada.\n\nSe não houver tempo para corrigir agora, é melhor **desativá-lo temporariamente** com um comentário explicando o motivo, do que deixá-lo poluindo o resultado. Suíte com dez testes confiáveis vale mais do que cinquenta em que ninguém confia.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a primeira pergunta de triagem quando um teste falha?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O produto quebrou ou o teste quebrou?",
                                isCorrect: true,
                            },
                            {
                                text: "Qual pessoa do time alterou o código que provocou a falha nessa execução?",
                                isCorrect: false,
                            },
                            {
                                text: "O tempo limite configurado é suficiente para o ambiente em que o teste rodou?",
                                isCorrect: false,
                            },
                            {
                                text: "Quantas vezes esse mesmo teste falhou nas últimas execuções do pipeline?",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um teste falha apenas quando a suíte roda em paralelo. Qual é a causa provável?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Testes disputando o mesmo dado durante a execução simultânea.",
                                isCorrect: true,
                            },
                            {
                                text: "Tempo limite insuficiente por causa da carga maior na máquina que executa a suíte.",
                                isCorrect: false,
                            },
                            {
                                text: "Diferença de versão entre o código do ambiente local e o do servidor de integração.",
                                isCorrect: false,
                            },
                            {
                                text: "Falta de evidências gravadas, o que impede identificar o momento exato da falha.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um teste passa sozinho e falha quando roda com a suíte. O que isso indica?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Interferência entre testes, provavelmente por estado compartilhado.",
                                isCorrect: true,
                            },
                            {
                                text: "Um defeito real que só se manifesta quando a aplicação recebe várias requisições.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma espera insuficiente que só aparece quando a máquina está com carga maior.",
                                isCorrect: false,
                            },
                            {
                                text: "Um problema de seletor que localiza elementos diferentes conforme a ordem de execução.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Segundo a aula, qual é o erro mais caro na investigação de uma falha?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Corrigir o sintoma, como aumentar o tempo limite sem entender a causa.",
                                isCorrect: true,
                            },
                            {
                                text: "Reproduzir o fluxo à mão antes de analisar as evidências gravadas pela ferramenta.",
                                isCorrect: false,
                            },
                            {
                                text: "Executar o teste isoladamente antes de rodar a suíte completa no ambiente local.",
                                isCorrect: false,
                            },
                            {
                                text: "Comparar as versões da aplicação entre o ambiente local e o de integração contínua.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O que a aula recomenda para um teste identificado como intermitente?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Tratar como defeito com dono e prazo, ou desativar com justificativa.",
                                isCorrect: true,
                            },
                            {
                                text: "Manter na suíte e reexecutar quando falhar, já que ele passa na maioria das vezes.",
                                isCorrect: false,
                            },
                            {
                                text: "Aumentar o número de tentativas automáticas até que ele deixe de aparecer vermelho.",
                                isCorrect: false,
                            },
                            {
                                text: "Movê-lo para uma suíte separada que roda apenas uma vez por semana no pipeline.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 4 - Rede, autenticação e estado",
        aulas: [
            {
                titulo: "Interceptando requisições",
                blocks: [
                    {
                        type: "text",
                        value: "## Enxergar a rede muda tudo\n\nAté aqui você testou pela tela. Mas boa parte do que acontece numa aplicação web passa pela **rede**, e as duas ferramentas permitem observar e intervir nesse tráfego.\n\nInterceptar requisições abre três possibilidades que mudam o que é possível testar:\n\n1. **Observar**: confirmar que a chamada certa foi feita, com o corpo certo, e que a resposta veio como esperado.\n2. **Esperar**: sincronizar o teste com o fim da requisição, em vez de esperar por tempo.\n3. **Simular**: devolver uma resposta fixa sem falar com o servidor, o que é o assunto da próxima aula.",
                    },
                    {
                        type: "code",
                        value: "// Cypress: interceptar e dar um apelido\ncy.intercept('POST', '/api/pedidos').as('criarPedido')\n\ncy.contains('button', 'Finalizar compra').click()\n\ncy.wait('@criarPedido').then(({ request, response }) => {\n  expect(request.body.itens).to.have.length(2)\n  expect(request.body.cupom).to.equal('PROMO10')\n  expect(response.statusCode).to.equal(201)\n})",
                    },
                    {
                        type: "code",
                        value: "// Playwright: esperar a resposta e inspecionar\nconst [resposta] = await Promise.all([\n  page.waitForResponse((r) => r.url().includes('/api/pedidos') && r.request().method() === 'POST'),\n  page.getByRole('button', { name: 'Finalizar compra' }).click(),\n])\n\nexpect(resposta.status()).toBe(201)\nconst corpoEnviado = JSON.parse(resposta.request().postData() ?? '{}')\nexpect(corpoEnviado.cupom).toBe('PROMO10')\n\nconst corpoRecebido = await resposta.json()\nexpect(corpoRecebido.status).toBe('aguardando_pagamento')",
                    },
                    {
                        type: "text",
                        value: '## O que vale verificar no tráfego\n\nNem toda requisição merece inspeção. Mas em alguns casos ela pega defeitos que a tela esconde:\n\n**O corpo enviado.** A tela mostra "Pedido confirmado", mas o cupom foi enviado? A quantidade está certa? O formato da data bate com o que a API espera? Esse é o defeito clássico de ligação entre front e back.\n\n**A quantidade de chamadas.** Um clique deveria disparar **uma** requisição. Se dispara três, você achou um defeito que ninguém veria pela tela: envio duplicado, laço de renderização, ou um botão sem proteção contra clique duplo.\n\n**As chamadas que não deveriam existir.** Uma tela que faz cinquenta requisições ao carregar tem um problema de desempenho esperando para acontecer.',
                    },
                    {
                        type: "code",
                        value: "// Cypress: garantir que só uma requisição saiu\ncy.intercept('POST', '/api/pedidos').as('criarPedido')\ncy.contains('button', 'Finalizar compra').dblclick()   // clique duplo de propósito\ncy.wait('@criarPedido')\ncy.get('@criarPedido.all').should('have.length', 1)    // não pode ter duplicado\n\n// Playwright: contar as chamadas\nlet chamadas = 0\npage.on('request', (r) => {\n  if (r.url().includes('/api/pedidos') && r.method() === 'POST') chamadas++\n})\nawait page.getByRole('button', { name: 'Finalizar compra' }).dblclick()\nawait expect(page.getByText('Pedido confirmado')).toBeVisible()\nexpect(chamadas).toBe(1)",
                    },
                    {
                        type: "quote",
                        value: "O teste de **clique duplo no botão de confirmar** é um dos que mais rendem defeito em qualquer sistema, e ele só é verificável olhando a rede. Pela tela, dois pedidos criados parecem um pedido criado.",
                    },
                    {
                        type: "text",
                        value: "## Cuidado com o excesso\n\nVerificar a rede é poderoso, e por isso é fácil exagerar. Um teste E2E que confere o formato de cada campo de cada requisição virou um teste de contrato mal colocado: ele deveria estar na camada de API, onde roda em segundos e não depende de navegador.\n\nO critério: no E2E, verifique a rede quando ela revela algo que **a tela esconde** (chamada duplicada, campo que não foi enviado, chamada que não aconteceu). O contrato completo da API pertence aos testes de API.",
                    },
                ],
                questions: [
                    {
                        statement: "Quais possibilidades a interceptação de requisições abre?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Observar a chamada, sincronizar a espera e simular a resposta.",
                                isCorrect: true,
                            },
                            {
                                text: "Acelerar a execução, reduzir o consumo de memória e paralelizar os testes da suíte.",
                                isCorrect: false,
                            },
                            {
                                text: "Substituir os testes de API, dispensando a verificação de contrato entre os serviços.",
                                isCorrect: false,
                            },
                            {
                                text: "Gravar evidências automáticas de cada passo executado durante o cenário de teste.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual defeito a verificação do corpo enviado costuma revelar?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Campo que a tela não envia ou envia em formato diferente do esperado pela API.",
                                isCorrect: true,
                            },
                            {
                                text: "Regra de negócio implementada de forma incorreta dentro do serviço do servidor.",
                                isCorrect: false,
                            },
                            {
                                text: "Elemento de interface posicionado fora do lugar definido pela equipe de design.",
                                isCorrect: false,
                            },
                            {
                                text: "Consulta ao banco de dados que demora mais do que o limite aceitável configurado.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um clique dispara três requisições em vez de uma. O que isso indica?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Envio duplicado, laço de renderização ou botão sem proteção contra clique.",
                                isCorrect: true,
                            },
                            {
                                text: "Um problema de rede que fez o navegador repetir automaticamente a mesma chamada.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma configuração incorreta do tempo limite de resposta definida na aplicação.",
                                isCorrect: false,
                            },
                            {
                                text: "Um seletor que corresponde a três elementos diferentes na mesma página aberta.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que o teste de clique duplo só é verificável olhando a rede?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque pela tela dois pedidos criados parecem um pedido criado.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque a ferramenta não consegue simular dois cliques rápidos em sequência na interface.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o segundo clique é bloqueado automaticamente pelo navegador durante o teste.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a tela demora para atualizar e a asserção acontece antes da segunda resposta.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é o critério para decidir o que verificar na rede durante um teste E2E?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Verificar o que a tela esconde, deixando o contrato para os testes de API.",
                                isCorrect: true,
                            },
                            {
                                text: "Verificar todas as requisições feitas, garantindo cobertura total da comunicação.",
                                isCorrect: false,
                            },
                            {
                                text: "Verificar apenas as requisições que retornam erro durante a execução do cenário.",
                                isCorrect: false,
                            },
                            {
                                text: "Verificar somente as chamadas feitas durante o carregamento inicial de cada tela.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Simulando respostas da API",
                blocks: [
                    {
                        type: "text",
                        value: "## Quando não falar com o servidor é melhor\n\nInterceptar permite ir além de observar: você pode **devolver uma resposta fixa** sem deixar a requisição chegar ao servidor. Isso se chama simular, ou fazer mock, da rede.\n\nÀ primeira vista parece contradizer a ideia de E2E, que é justamente testar o sistema inteiro de verdade. E contradiz mesmo, em parte. Por isso o mock de rede é uma ferramenta **cirúrgica**, para casos específicos em que o ganho compensa a perda.",
                    },
                    {
                        type: "text",
                        value: "## Os casos em que compensa\n\n**Cenários impossíveis ou caríssimos de reproduzir.** Como fazer o gateway de pagamento recusar o cartão por suspeita de fraude? Como fazer a API dos Correios devolver erro 503? Como testar o comportamento com um saldo negativo que o sistema nunca permitiria criar? Simulando a resposta, cada um vira um teste de dez linhas.\n\n**Serviços externos.** Se o teste depende de um provedor de terceiros, ele fica refém da disponibilidade e da lentidão desse provedor. E cobrar um cartão de verdade a cada execução não é opção.\n\n**Estados de erro em geral.** Timeout, 500, resposta malformada, campo faltando. São os cenários que mais quebram aplicação em produção e os mais difíceis de provocar de verdade.\n\n**Isolar a interface para depurar.** Quando você quer testar só o comportamento da tela com uma resposta conhecida, sem variação do backend.",
                    },
                    {
                        type: "code",
                        value: "// Cypress: simular erro do gateway\ncy.intercept('POST', '/api/pagamentos', {\n  statusCode: 402,\n  body: { erro: 'cartao_recusado', mensagem: 'Cartão recusado pelo emissor' },\n}).as('pagamento')\n\ncy.contains('button', 'Pagar').click()\ncy.wait('@pagamento')\ncy.contains('Cartão recusado pelo emissor').should('be.visible')\ncy.contains('button', 'Tentar outro cartão').should('be.visible')",
                    },
                    {
                        type: "code",
                        value: "// Playwright: simular lista vazia e depois erro 500\nawait page.route('**/api/produtos*', (route) =>\n  route.fulfill({ status: 200, json: { itens: [], total: 0 } }),\n)\nawait page.goto('/produtos')\nawait expect(page.getByText('Nenhum produto encontrado')).toBeVisible()\n\n// Erro do servidor\nawait page.route('**/api/produtos*', (route) => route.fulfill({ status: 500 }))\nawait page.reload()\nawait expect(page.getByText('Não conseguimos carregar os produtos')).toBeVisible()\nawait expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeVisible()\n\n// Simular lentidão da rede\nawait page.route('**/api/produtos*', async (route) => {\n  await new Promise((r) => setTimeout(r, 3000))\n  await route.continue()\n})",
                    },
                    {
                        type: "table",
                        value: '[["Cenário", "Simular?", "Por quê"], ["Cartão recusado pelo emissor", "Sim", "Impossível provocar de verdade com confiabilidade"], ["API externa fora do ar", "Sim", "Não dá para derrubar o serviço de terceiros"], ["Lista vazia de resultados", "Talvez", "Melhor com dado real, se for barato criar"], ["Fluxo de compra do começo ao fim", "Não", "É exatamente o que o E2E existe para provar"], ["Cálculo de desconto", "Não", "Simular a resposta apaga a regra que se quer testar"]]',
                    },
                    {
                        type: "quote",
                        value: "O risco de simular demais: você acaba com uma suíte que testa **a tela conversando com um servidor imaginário**. Ela passa verde enquanto a integração real está quebrada. Se o mock cobre o caminho principal, o teste deixou de ser E2E e virou um teste de interface caro.",
                    },
                    {
                        type: "text",
                        value: "## A regra prática\n\n**Deixe o caminho principal real. Simule as bordas.**\n\nO fluxo de compra bem-sucedido roda contra o backend de verdade, porque provar que ele funciona é o motivo de o teste existir. Já o cartão recusado, o serviço fora do ar e o timeout são simulados, porque não há como provocá-los de forma confiável.\n\nE vale um cuidado adicional: mock de rede **congela um contrato**. Se a API mudar o formato da resposta, o teste com mock continua passando com o formato antigo, e você só descobre em produção. Por isso, sempre que existir mock de uma rota, deve existir também um teste de contrato ou de API cobrindo aquela rota de verdade.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual é o principal caso em que simular a resposta da API compensa?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Cenários impossíveis ou caríssimos de reproduzir de verdade.",
                                isCorrect: true,
                            },
                            {
                                text: "O fluxo principal do produto, para tornar a execução da suíte mais rápida e estável.",
                                isCorrect: false,
                            },
                            {
                                text: "As regras de negócio complexas, para isolar o comportamento da interface do cálculo.",
                                isCorrect: false,
                            },
                            {
                                text: "Todas as requisições, para eliminar a dependência do backend durante os testes.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o risco de simular demais nos testes E2E?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A suíte passa verde testando a tela contra um servidor imaginário.",
                                isCorrect: true,
                            },
                            {
                                text: "A execução fica mais lenta porque a ferramenta precisa interceptar cada chamada feita.",
                                isCorrect: false,
                            },
                            {
                                text: "Os testes deixam de gerar evidências úteis para investigar as falhas encontradas.",
                                isCorrect: false,
                            },
                            {
                                text: "As asserções passam a depender do formato interno usado pela ferramenta de teste.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a regra prática proposta pela aula?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Deixar o caminho principal real e simular as bordas.",
                                isCorrect: true,
                            },
                            {
                                text: "Simular todas as chamadas externas e manter apenas as internas reais no teste.",
                                isCorrect: false,
                            },
                            {
                                text: "Simular o caminho principal para ganhar velocidade e testar as bordas de verdade.",
                                isCorrect: false,
                            },
                            {
                                text: "Evitar qualquer simulação, porque ela contradiz a natureza do teste de ponta a ponta.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Por que o mock de rede congela um contrato?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Se a API mudar o formato, o teste segue passando com o formato antigo.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque a ferramenta salva a resposta simulada e a reutiliza nas execuções seguintes.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a rota interceptada deixa de ser chamada e o servidor não recebe a requisição.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o contrato precisa ser declarado no arquivo de configuração do projeto de testes.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Que precaução a aula recomenda quando existe mock de uma rota?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Ter também um teste de contrato ou de API cobrindo aquela rota de verdade.",
                                isCorrect: true,
                            },
                            {
                                text: "Atualizar o mock a cada sprint para refletir as mudanças feitas pela equipe de backend.",
                                isCorrect: false,
                            },
                            {
                                text: "Executar o teste com mock e sem mock em execuções alternadas do pipeline do time.",
                                isCorrect: false,
                            },
                            {
                                text: "Documentar o formato simulado no repositório para que a equipe possa consultá-lo.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Login rápido: sessão, token e estado reaproveitado",
                blocks: [
                    {
                        type: "text",
                        value: "## O maior desperdício das suítes E2E\n\nQuase todo teste precisa de alguém autenticado. E a forma intuitiva de conseguir isso é fazer o login pela tela: abrir /login, preencher, clicar, esperar redirecionar.\n\nFaça as contas. Se o login pela interface leva 4 segundos e você tem 60 testes, são 4 minutos de suíte só digitando email e senha. E cada um desses logins é um ponto a mais que pode falhar por motivo alheio ao que o teste verifica: um teste de checkout que falha porque a tela de login mudou não está dizendo nada útil sobre o checkout.",
                    },
                    {
                        type: "quote",
                        value: "Princípio geral, e o mais importante deste módulo: **teste o login pela interface uma vez; em todos os outros testes, chegue autenticado pelo caminho mais rápido possível.**",
                    },
                    {
                        type: "text",
                        value: "## As três formas de acelerar\n\n**1. Login pela API.** Chame a rota de autenticação diretamente, pegue o token e coloque onde a aplicação espera (cookie, localStorage). É rápido e funciona nas duas ferramentas.\n\n**2. Sessão salva e reaproveitada.** Faça o login uma vez, salve o estado do navegador (cookies e armazenamento) em arquivo, e carregue esse estado em todos os testes. É a solução mais elegante do Playwright.\n\n**3. Sessão em cache.** No Cypress, `cy.session` faz o login uma vez e restaura o estado nas execuções seguintes, com validação opcional.",
                    },
                    {
                        type: "code",
                        value: "// Playwright: um setup faz o login e salva o estado\n// auth.setup.ts\nimport { test as setup, expect } from '@playwright/test'\n\nconst ARQUIVO = 'playwright/.auth/cliente.json'\n\nsetup('autentica o cliente', async ({ page }) => {\n  await page.goto('/login')\n  await page.getByLabel('Email').fill(process.env.TEST_EMAIL!)\n  await page.getByLabel('Senha').fill(process.env.TEST_SENHA!)\n  await page.getByRole('button', { name: 'Entrar' }).click()\n  await expect(page.getByText('Bem-vinda')).toBeVisible()\n\n  await page.context().storageState({ path: ARQUIVO })\n})\n\n// playwright.config.ts\nprojects: [\n  { name: 'setup', testMatch: /auth\\.setup\\.ts/ },\n  {\n    name: 'chromium',\n    use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/cliente.json' },\n    dependencies: ['setup'],\n  },\n]",
                    },
                    {
                        type: "code",
                        value: "// Cypress: cy.session guarda e restaura a sessão\nCypress.Commands.add('login', (email, senha) => {\n  cy.session([email, senha], () => {\n    cy.request('POST', '/api/auth/login', { email, senha }).then(({ body }) => {\n      window.localStorage.setItem('token', body.token)\n    })\n  }, {\n    validate() {\n      cy.request('/api/me').its('status').should('eq', 200)\n    },\n  })\n})\n\n// No teste\nbeforeEach(() => {\n  cy.login('cliente1@exemplo.com', 'Senha@2026')\n  cy.visit('/inicio')\n})",
                    },
                    {
                        type: "text",
                        value: "## Perfis diferentes\n\nSistemas costumam ter mais de um tipo de usuário: cliente, administrador, atendente, visitante. Cada perfil vê telas diferentes e tem permissões diferentes.\n\nO padrão que funciona: **um estado salvo por perfil**, e cada teste declara com qual perfil quer rodar. Assim você não paga o custo do login em nenhum deles, e ainda ganha a possibilidade de rodar em paralelo com perfis diferentes sem conflito.\n\nE vale um lembrete de cobertura: **permissão é um cenário que merece teste**. Um usuário comum acessando a URL de administrador precisa ser bloqueado, e essa verificação é rápida e barata de escrever com estados salvos.",
                    },
                    {
                        type: "code",
                        value: "// Playwright: perfis separados\ntest.use({ storageState: 'playwright/.auth/admin.json' })\n\ntest('admin vê o painel de relatórios', async ({ page }) => {\n  await page.goto('/admin/relatorios')\n  await expect(page.getByRole('heading', { name: 'Relatórios' })).toBeVisible()\n})\n\n// Cenário de permissão, com o outro perfil\ntest.describe('sem permissão', () => {\n  test.use({ storageState: 'playwright/.auth/cliente.json' })\n\n  test('cliente não acessa o painel de admin', async ({ page }) => {\n    await page.goto('/admin/relatorios')\n    await expect(page.getByText('Você não tem permissão')).toBeVisible()\n  })\n})",
                    },
                    {
                        type: "text",
                        value: "## Um cuidado importante\n\nReaproveitar sessão é ótimo, mas cria uma dependência silenciosa: se a sessão expirar no meio da execução, ou se o token salvo ficar inválido, vários testes falham de uma vez, com mensagens confusas.\n\nDuas proteções simples: **valide a sessão** antes de reutilizá-la (é o que o `validate` do Cypress faz, e o que uma requisição rápida resolve no Playwright), e **mantenha o teste de login pela interface** na suíte. Ele é o único que prova que a tela de login realmente funciona, e sem ele um defeito ali passaria despercebido por toda a suíte.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual é o princípio geral proposto pela aula sobre autenticação nos testes?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Testar o login pela interface uma vez e chegar autenticado nos demais testes.",
                                isCorrect: true,
                            },
                            {
                                text: "Fazer login pela interface em todos os testes, garantindo o fluxo real de quem usa.",
                                isCorrect: false,
                            },
                            {
                                text: "Desativar a autenticação no ambiente de teste para simplificar a execução da suíte.",
                                isCorrect: false,
                            },
                            {
                                text: "Usar sempre o mesmo usuário em todos os testes para reduzir o custo de preparação.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um teste de checkout falha porque a tela de login mudou. Qual é o problema disso?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A falha não diz nada útil sobre o checkout, que é o que o teste deveria verificar.",
                                isCorrect: true,
                            },
                            {
                                text: "A execução do teste fica mais lenta porque a autenticação precisa ser refeita.",
                                isCorrect: false,
                            },
                            {
                                text: "O teste passa a depender de dados que não foram criados durante a preparação.",
                                isCorrect: false,
                            },
                            {
                                text: "A ferramenta não consegue gravar evidências quando a falha ocorre na autenticação.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Como o Playwright reaproveita a autenticação entre os testes?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Salva o estado do navegador em arquivo e carrega em cada teste.",
                                isCorrect: true,
                            },
                            {
                                text: "Mantém o mesmo contexto de navegador aberto durante toda a execução da suíte.",
                                isCorrect: false,
                            },
                            {
                                text: "Injeta o token diretamente no cabeçalho de cada requisição feita pela aplicação.",
                                isCorrect: false,
                            },
                            {
                                text: "Executa o login antes de cada teste, mas de forma otimizada pela camada de rede.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que manter o teste de login pela interface mesmo usando sessão salva?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque ele é o único que prova que a tela de login realmente funciona.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque a ferramenta exige ao menos um teste de autenticação por projeto configurado.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o estado salvo precisa ser regenerado a cada execução completa da suíte.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque sem ele os demais testes não conseguem restaurar a sessão corretamente.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é o padrão recomendado quando o sistema tem vários perfis de usuário?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Um estado salvo por perfil, com cada teste declarando qual usar.",
                                isCorrect: true,
                            },
                            {
                                text: "Um único estado salvo com o perfil de maior permissão, que cobre todos os cenários.",
                                isCorrect: false,
                            },
                            {
                                text: "Login pela interface para os perfis menos usados e estado salvo para o principal.",
                                isCorrect: false,
                            },
                            {
                                text: "Criação de um usuário novo com o perfil adequado no início de cada teste executado.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Preparando dados pela API",
                blocks: [
                    {
                        type: "text",
                        value: "## O mesmo princípio, agora para os dados\n\nA ideia da aula anterior vale para tudo que é **preparação**, não só para o login.\n\nSe o teste verifica o cancelamento de um pedido, ele precisa de um pedido pago. Criar esse pedido pela interface significa: entrar, buscar o produto, adicionar ao carrinho, preencher o endereço, escolher o pagamento, finalizar. São vinte passos e trinta segundos, e nenhum deles é o que o teste quer verificar.\n\nPior: se qualquer um desses vinte passos quebrar, o teste de cancelamento falha. Você acaba com um teste que só passa quando **toda a compra** funciona, o que o torna redundante com o teste de compra e frágil sem necessidade.",
                    },
                    {
                        type: "quote",
                        value: "Regra de ouro da preparação: **use a interface só para o que está sendo testado. Todo o resto, pelo caminho mais rápido e mais estável.** Na prática isso quer dizer API, e às vezes um script direto no banco.",
                    },
                    {
                        type: "code",
                        value: "// Playwright: request faz chamadas HTTP sem passar pela interface\nasync function criarPedidoPago(request, { sku, quantidade }) {\n  const resposta = await request.post('/api/testes/pedidos', {\n    data: { sku, quantidade, status: 'pago' },\n  })\n  expect(resposta.ok()).toBeTruthy()\n  return resposta.json()\n}\n\ntest('cancelar pedido pago devolve o estoque', async ({ page, request }) => {\n  const pedido = await criarPedidoPago(request, { sku: 'SKU-4471', quantidade: 1 })\n\n  await page.goto(`/pedidos/${pedido.id}`)\n  await page.getByRole('button', { name: 'Cancelar pedido' }).click()\n  await page.getByRole('button', { name: 'Confirmar' }).click()\n\n  await expect(page.getByTestId('status')).toHaveText('Cancelado')\n})",
                    },
                    {
                        type: "code",
                        value: "// Cypress: cy.request para preparar\nCypress.Commands.add('criarPedidoPago', (dados) => {\n  return cy.request('POST', '/api/testes/pedidos', { ...dados, status: 'pago' })\n    .then(({ body }) => body)\n})\n\nit('cancela um pedido pago', () => {\n  cy.criarPedidoPago({ sku: 'SKU-4471', quantidade: 1 }).then((pedido) => {\n    cy.visit(`/pedidos/${pedido.id}`)\n    cy.contains('button', 'Cancelar pedido').click()\n    cy.contains('button', 'Confirmar').click()\n    cy.get('[data-testid=\"status\"]').should('have.text', 'Cancelado')\n  })\n})",
                    },
                    {
                        type: "table",
                        value: '[["Preparação", "Pela interface", "Pela API"], ["Tempo típico", "20 a 40 segundos", "Menos de um segundo"], ["Pontos de falha", "Todas as telas do caminho", "Uma chamada"], ["Quebra quando", "Qualquer tela do fluxo muda", "O contrato da API muda"], ["O que o teste passa a exigir", "Que o fluxo inteiro funcione", "Que a API funcione"]]',
                    },
                    {
                        type: "text",
                        value: "## E se não existir API para isso?\n\nNem sempre existe uma rota que cria exatamente o estado de que você precisa. Três saídas, em ordem de preferência:\n\n**Compor com as APIs que existem.** Muitas vezes dá para montar o estado com duas ou três chamadas das rotas normais do produto, sem precisar de nada novo.\n\n**Pedir um endpoint de teste.** Uma rota que só existe fora de produção e cria estados úteis rapidamente. Vale conversar com o time: costuma ser barato de fazer e beneficia todo mundo.\n\n**Semear direto no banco.** Rápido, mas perigoso: você pode criar um estado que a aplicação nunca produziria, e passar a testar uma situação irreal. Use com parcimônia e prefira sempre a API.\n\nUm cuidado que vale destacar: se existir endpoint de teste, ele **precisa** estar desabilitado em produção. Uma rota que cria pedidos pagos sem pagamento é um problema de segurança sério se vazar para o ambiente real.",
                    },
                    {
                        type: "text",
                        value: "## Onde a preparação vive\n\nUm detalhe de organização que faz diferença: mantenha as funções de preparação em um lugar só, separadas dos testes, com nomes que descrevem o **estado** que produzem.\n\n`criarPedidoPago()`, `criarClienteComAssinaturaVencida()`, `criarCupomExpirado()`. Lendo o nome, quem for ler o teste entende o cenário sem abrir a função. E quando a API mudar, você conserta em um lugar em vez de trinta.",
                    },
                ],
                questions: [
                    {
                        statement: "Por que preparar um pedido pago pela interface é problemático?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O teste passa a depender de todo o fluxo de compra funcionar.",
                                isCorrect: true,
                            },
                            {
                                text: "A interface não permite criar pedidos com o status necessário para o cenário.",
                                isCorrect: false,
                            },
                            {
                                text: "Os dados criados pela interface não ficam disponíveis para os demais testes da suíte.",
                                isCorrect: false,
                            },
                            {
                                text: "A ferramenta não consegue navegar por fluxos com mais de dez passos consecutivos.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a regra de ouro da preparação de dados?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Usar a interface só para o que está sendo testado e o resto pelo caminho mais rápido.",
                                isCorrect: true,
                            },
                            {
                                text: "Criar todos os dados pela interface, garantindo que o estado seja realista e válido.",
                                isCorrect: false,
                            },
                            {
                                text: "Reaproveitar dados já existentes no ambiente para evitar o custo de criação a cada teste.",
                                isCorrect: false,
                            },
                            {
                                text: "Semear os dados diretamente no banco, que é sempre a forma mais rápida disponível.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Não existe API que cria o estado necessário. Qual é a primeira alternativa recomendada?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Compor o estado com duas ou três chamadas das rotas que já existem.",
                                isCorrect: true,
                            },
                            {
                                text: "Semear os dados diretamente no banco de dados do ambiente de teste utilizado.",
                                isCorrect: false,
                            },
                            {
                                text: "Criar o estado pela interface e aceitar o custo de tempo dessa preparação.",
                                isCorrect: false,
                            },
                            {
                                text: "Simular a resposta da API para que a tela apresente o estado desejado no teste.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o perigo de semear dados direto no banco?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Criar um estado que a aplicação nunca produziria, testando uma situação irreal.",
                                isCorrect: true,
                            },
                            {
                                text: "Deixar a preparação mais lenta do que fazer o mesmo caminho pela interface do sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "Impedir que os testes sejam executados em paralelo por causa do bloqueio das tabelas.",
                                isCorrect: false,
                            },
                            {
                                text: "Gerar dados que não podem ser removidos após a execução dos testes da suíte.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual cuidado a aula destaca sobre endpoints de teste?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Precisam estar desabilitados em produção, senão viram problema de segurança.",
                                isCorrect: true,
                            },
                            {
                                text: "Devem ser documentados no repositório para que toda a equipe saiba como usá-los.",
                                isCorrect: false,
                            },
                            {
                                text: "Precisam ser versionados junto com a API principal para não quebrar os testes.",
                                isCorrect: false,
                            },
                            {
                                text: "Devem devolver sempre a mesma resposta para garantir que o teste seja determinístico.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Limpando o estado entre testes",
                blocks: [
                    {
                        type: "text",
                        value: "## Por que testes se contaminam\n\nVocê escreveu dez testes. Todos passam quando rodam sozinhos. Rodando juntos, três falham. Rodando em outra ordem, falham outros dois.\n\nO nome disso é **contaminação de estado**: um teste deixa o sistema diferente de como encontrou, e o próximo tropeça nisso.\n\nOs culpados mais comuns:\n\n- Dados criados e nunca removidos, que se acumulam e mudam contagens, listas e resultados de busca.\n- Sessão, cookie ou armazenamento local que sobrevive de um teste para o outro.\n- Estado do servidor: um cupom que foi marcado como usado, um estoque que foi consumido, uma assinatura cancelada.\n- Filas e trabalhos assíncronos que ainda estão processando quando o próximo teste começa.",
                    },
                    {
                        type: "text",
                        value: "## As duas estratégias\n\n**Limpar depois (teardown).** Cada teste remove o que criou. Cypress e Playwright oferecem ganchos para isso.\n\n- A favor: o ambiente fica limpo, sem acúmulo.\n- Contra: se o teste falhar no meio, a limpeza pode não rodar; e a ordem de remoção importa quando há dependência entre registros.\n\n**Não depender de limpeza (isolamento por dado único).** Cada teste cria o próprio universo, com identificadores únicos, e não se importa com o que os outros deixaram.\n\n- A favor: robusto, funciona em paralelo, não quebra quando um teste falha no meio.\n- Contra: o ambiente acumula lixo, e é preciso limpar de tempos em tempos.\n\nA combinação que funciona bem: **isolamento por dado único como base** (é o que garante o paralelismo) **mais uma limpeza periódica do ambiente**, e teardown apenas para o que é caro deixar para trás.",
                    },
                    {
                        type: "code",
                        value: "// Playwright: limpeza garantida mesmo se o teste falhar\ntest('cria e remove um cupom', async ({ page, request }) => {\n  const codigo = `PROMO-${Date.now()}`\n  await request.post('/api/testes/cupons', { data: { codigo, percentual: 10 } })\n\n  try {\n    await page.goto('/admin/cupons')\n    await expect(page.getByText(codigo)).toBeVisible()\n  } finally {\n    await request.delete(`/api/testes/cupons/${codigo}`)\n  }\n})\n\n// Ou com o gancho, aplicado a todos os testes do arquivo\ntest.afterEach(async ({ request }) => {\n  await request.post('/api/testes/limpar', { data: { prefixo: 'teste-' } })\n})",
                    },
                    {
                        type: "code",
                        value: "// Cypress: limpar armazenamento e cookies entre testes\nbeforeEach(() => {\n  cy.clearCookies()\n  cy.clearLocalStorage()\n})\n\n// Cuidado: cy.session guarda a sessão, então limpar tudo\n// no beforeEach anula o ganho de reaproveitar a autenticação.\n// Nesse caso, limpe seletivamente o que interfere.",
                    },
                    {
                        type: "quote",
                        value: "O melhor teste é aquele que **não precisa de limpeza para dar certo**. Se ele cria o próprio universo com identificadores únicos, a ordem de execução deixa de importar, o paralelismo funciona, e uma falha no meio não estraga os próximos.",
                    },
                    {
                        type: "text",
                        value: '## O checklist do teste independente\n\nAntes de considerar um teste pronto, confira:\n\n1. **Ele passa rodando sozinho?**\n2. **Ele passa rodando duas vezes seguidas?** É o teste que mais revela contaminação. Se falhar na segunda, ele depende de um estado que ele mesmo consumiu, ou cria algo que não pode existir duas vezes.\n3. **Ele passa em ordem aleatória?** As duas ferramentas permitem embaralhar a ordem.\n4. **Ele passa em paralelo com os outros?**\n5. **Ele passa num ambiente recém-criado, sem nenhum dado prévio?** Se depender de um registro que "sempre esteve lá", ele vai quebrar no dia em que o ambiente for recriado.\n\nRodar a suíte duas vezes seguidas é o teste mais barato dessa lista e o que mais encontra problema. Vale colocar no pipeline de vez em quando.',
                    },
                    {
                        type: "text",
                        value: "## Trabalhos assíncronos\n\nUm caso que confunde bastante: o teste termina, mas o sistema ainda está processando. Um email na fila, um webhook a caminho, um relatório sendo gerado. O próximo teste começa e encontra o sistema num estado intermediário.\n\nA solução não é esperar por tempo, e sim **esperar pelo estado final observável**: consultar a API até o status mudar, verificar que a fila está vazia, aguardar o registro aparecer. Se não houver nada observável, vale pedir ao time um endpoint que informe isso: é útil para o teste e para a operação.",
                    },
                ],
                questions: [
                    {
                        statement: "O que é contaminação de estado entre testes?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Um teste deixa o sistema diferente de como encontrou e o próximo tropeça nisso.",
                                isCorrect: true,
                            },
                            {
                                text: "Dois testes verificam o mesmo comportamento com dados de entrada diferentes entre si.",
                                isCorrect: false,
                            },
                            {
                                text: "Um teste falha porque o ambiente de execução ficou indisponível durante a suíte.",
                                isCorrect: false,
                            },
                            {
                                text: "Vários testes compartilham o mesmo arquivo de configuração dentro do projeto.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a desvantagem da estratégia de limpar depois de cada teste?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Se o teste falhar no meio, a limpeza pode não ser executada.",
                                isCorrect: true,
                            },
                            {
                                text: "O ambiente acumula lixo ao longo do tempo e precisa ser recriado periodicamente.",
                                isCorrect: false,
                            },
                            {
                                text: "Os identificadores gerados deixam de ser únicos quando muitos testes rodam juntos.",
                                isCorrect: false,
                            },
                            {
                                text: "A execução em paralelo fica impossível porque todos limpam os mesmos registros.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual verificação do checklist mais revela contaminação de estado?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Rodar o mesmo teste duas vezes seguidas.",
                                isCorrect: true,
                            },
                            {
                                text: "Rodar o teste isoladamente, sem os demais testes da suíte automatizada.",
                                isCorrect: false,
                            },
                            {
                                text: "Rodar o teste em navegadores diferentes para conferir a compatibilidade do fluxo.",
                                isCorrect: false,
                            },
                            {
                                text: "Rodar o teste com o tempo limite reduzido para verificar a velocidade da aplicação.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            'Um teste depende de um registro que "sempre esteve lá" no ambiente. Qual é o risco?',
                        difficulty: "medio",
                        options: [
                            {
                                text: "Ele quebra no dia em que o ambiente for recriado.",
                                isCorrect: true,
                            },
                            {
                                text: "Ele fica mais lento porque precisa consultar o registro antes de cada execução.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele impede que outros testes usem o mesmo registro durante a execução paralela.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele deixa de gerar evidências suficientes quando a verificação apresenta falha.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O sistema ainda processa um trabalho assíncrono quando o teste termina. Qual é a solução correta?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Esperar por um estado final observável, como o status mudar ou a fila esvaziar.",
                                isCorrect: true,
                            },
                            {
                                text: "Adicionar uma pausa fixa ao final do teste, proporcional ao tempo médio do processamento.",
                                isCorrect: false,
                            },
                            {
                                text: "Executar os testes que dependem de processamento assíncrono sempre em sequência.",
                                isCorrect: false,
                            },
                            {
                                text: "Simular a resposta do serviço assíncrono para que o teste não precise aguardar nada.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 5 - Organizando a suíte",
        aulas: [
            {
                titulo: "Page Objects e a camada de abstração",
                blocks: [
                    {
                        type: "text",
                        value: '## O problema que aparece no teste número trinta\n\nNos primeiros testes, escrever os seletores direto no cenário parece perfeito: é explícito, é fácil de ler, funciona.\n\nAí a tela de checkout muda. O botão "Finalizar compra" vira "Concluir pedido". E você descobre que esse seletor aparece em dezenove arquivos.\n\nO **Page Object** resolve isso: uma classe (ou um objeto, ou um conjunto de funções) que concentra os seletores e as ações de uma tela. O teste passa a falar em termos de negócio, e os detalhes de interface ficam num lugar só.',
                    },
                    {
                        type: "code",
                        value: "// pages/CheckoutPage.ts\nexport class CheckoutPage {\n  constructor(private page: Page) {}\n\n  async abrir() {\n    await this.page.goto('/checkout')\n  }\n\n  async aplicarCupom(codigo: string) {\n    await this.page.getByLabel('Cupom').fill(codigo)\n    await this.page.getByRole('button', { name: 'Aplicar' }).click()\n  }\n\n  async finalizar() {\n    await this.page.getByRole('button', { name: 'Finalizar compra' }).click()\n  }\n\n  get total() {\n    return this.page.getByTestId('total')\n  }\n\n  get mensagem() {\n    return this.page.getByTestId('mensagem-cupom')\n  }\n}",
                    },
                    {
                        type: "code",
                        value: "// O teste fica legível e independente do layout\ntest('cupom expirado não aplica desconto', async ({ page }) => {\n  const checkout = new CheckoutPage(page)\n\n  await checkout.abrir()\n  await checkout.aplicarCupom('PROMO10')\n\n  await expect(checkout.mensagem).toHaveText('Cupom expirado')\n  await expect(checkout.total).toHaveText('R$ 100,00')\n})",
                    },
                    {
                        type: "table",
                        value: '[["", "Seletores no teste", "Page Object"], ["Mudança de layout", "Consertar em todos os arquivos", "Consertar em um lugar"], ["Leitura do cenário", "Misturada com detalhe técnico", "Em termos de negócio"], ["Reuso entre testes", "Copiar e colar", "Chamar o método"], ["Custo inicial", "Zero", "Uma camada a manter"], ["Risco", "Duplicação que cresce", "Abstração exagerada"]]',
                    },
                    {
                        type: "text",
                        value: "## Onde o Page Object dá errado\n\nA abstração tem um lado ruim quando é levada longe demais. Dois erros comuns:\n\n**Método para cada clique.** Se a classe vira `clicarBotaoAplicar()`, `preencherCampoCupom()`, `clicarBotaoFinalizar()`, você só renomeou os seletores e ganhou uma camada extra sem ganhar clareza. O método deve representar uma **ação de negócio** (`aplicarCupom`), não um evento de mouse.\n\n**Asserção dentro do Page Object.** Quando a classe tem `verificarQueCupomFoiRecusado()`, a verificação some do teste, e ler o cenário deixa de contar a história. Os objetos expõem os elementos e as ações; **quem verifica é o teste**.\n\nExiste também uma alternativa mais leve que muitos times preferem: em vez de classes, um módulo de funções auxiliares por tela. Resolve o mesmo problema com menos cerimônia, e é uma escolha perfeitamente válida.",
                    },
                    {
                        type: "quote",
                        value: "O critério para saber se a abstração está boa: leia o teste em voz alta. Se ele conta a história do que uma pessoa faz e do que deveria acontecer, está bom. Se ele parece um manual de instruções de cliques, a abstração ainda não apareceu.",
                    },
                    {
                        type: "text",
                        value: "## Quando introduzir\n\nNão comece pelo Page Object. Escreva os primeiros testes com os seletores diretos e observe onde a repetição aparece de verdade. Abstrair cedo demais produz camadas que ninguém usa e que atrapalham a leitura.\n\nO sinal para extrair é simples: **quando o mesmo seletor ou a mesma sequência aparece pela terceira vez**, é hora.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual problema o Page Object resolve?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Concentra os seletores e as ações de uma tela em um lugar só.",
                                isCorrect: true,
                            },
                            {
                                text: "Reduz o tempo de execução dos testes ao reaproveitar o contexto do navegador.",
                                isCorrect: false,
                            },
                            {
                                text: "Permite que os testes rodem em paralelo sem disputar os mesmos dados do ambiente.",
                                isCorrect: false,
                            },
                            {
                                text: "Elimina a necessidade de esperar pelos elementos antes de interagir com a página.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um Page Object com métodos como clicarBotaoAplicar e preencherCampoCupom tem qual problema?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Só renomeou os seletores, sem representar ações de negócio.",
                                isCorrect: true,
                            },
                            {
                                text: "Deixa a execução mais lenta porque cada método faz uma chamada adicional à ferramenta.",
                                isCorrect: false,
                            },
                            {
                                text: "Impede que o teste verifique o resultado das ações realizadas na tela do sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "Cria acoplamento com a ferramenta escolhida e dificulta uma futura migração do time.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que a aula desaconselha colocar asserções dentro do Page Object?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque a verificação some do teste e o cenário deixa de contar a história.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque as asserções perdem a espera automática quando ficam fora do arquivo de teste.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a ferramenta não permite executar verificações fora do escopo de um teste.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o Page Object passaria a depender da biblioteca de asserções utilizada.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o sinal de que chegou a hora de extrair um Page Object?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Quando o mesmo seletor ou a mesma sequência aparece pela terceira vez.",
                                isCorrect: true,
                            },
                            {
                                text: "Assim que o primeiro teste da tela for escrito, para evitar duplicação futura.",
                                isCorrect: false,
                            },
                            {
                                text: "Quando a suíte atingir cem testes automatizados distribuídos entre as telas.",
                                isCorrect: false,
                            },
                            {
                                text: "Quando a equipe decidir migrar de ferramenta de automação de interface.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual critério a aula propõe para avaliar se a abstração está boa?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Ler o teste em voz alta e ver se ele conta a história do que a pessoa faz.",
                                isCorrect: true,
                            },
                            {
                                text: "Contar quantos métodos a classe tem e garantir que não passe de dez por tela.",
                                isCorrect: false,
                            },
                            {
                                text: "Verificar se todos os seletores da aplicação estão declarados nos Page Objects.",
                                isCorrect: false,
                            },
                            {
                                text: "Medir a redução no tempo de execução da suíte após a introdução da camada nova.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Comandos customizados e fixtures",
                blocks: [
                    {
                        type: "text",
                        value: "## Estendendo a ferramenta\n\nAlém de organizar os seletores, você vai querer reaproveitar **ações** e **preparações**. As duas ferramentas oferecem mecanismos para isso, com nomes diferentes.\n\nNo Cypress são os **comandos customizados**: você adiciona um comando novo ao `cy`, disponível em todos os testes.\n\nNo Playwright são as **fixtures**: você estende o `test` com recursos que chegam prontos como parâmetro. É mais poderoso, porque a fixture pode preparar algo antes e limpar depois, automaticamente.",
                    },
                    {
                        type: "code",
                        value: "// Cypress: comandos customizados\nCypress.Commands.add('getByTestId', (id) => cy.get(`[data-testid=\"${id}\"]`))\n\nCypress.Commands.add('login', (email, senha) => {\n  cy.session([email, senha], () => {\n    cy.request('POST', '/api/auth/login', { email, senha }).then(({ body }) => {\n      window.localStorage.setItem('token', body.token)\n    })\n  })\n})\n\n// Uso\ncy.login('cliente1@exemplo.com', 'Senha@2026')\ncy.getByTestId('total').should('have.text', 'R$ 90,00')",
                    },
                    {
                        type: "code",
                        value: "// Playwright: fixture que cria e limpa sozinha\nimport { test as base } from '@playwright/test'\n\ntype Fixtures = {\n  pedidoPago: { id: string; sku: string }\n}\n\nexport const test = base.extend<Fixtures>({\n  pedidoPago: async ({ request }, use) => {\n    const resposta = await request.post('/api/testes/pedidos', {\n      data: { sku: 'SKU-4471', quantidade: 1, status: 'pago' },\n    })\n    const pedido = await resposta.json()\n\n    await use(pedido)          // o teste roda aqui\n\n    await request.delete(`/api/testes/pedidos/${pedido.id}`)   // limpeza garantida\n  },\n})\n\n// O teste recebe o pedido pronto e não se preocupa com limpeza\ntest('cancela um pedido pago', async ({ page, pedidoPago }) => {\n  await page.goto(`/pedidos/${pedidoPago.id}`)\n  await page.getByRole('button', { name: 'Cancelar pedido' }).click()\n  await expect(page.getByTestId('status')).toHaveText('Cancelado')\n})",
                    },
                    {
                        type: "text",
                        value: "## Por que a fixture é elegante\n\nRepare no que aconteceu no exemplo: o teste declarou que precisa de um `pedidoPago` e recebeu um. Ele não sabe como o pedido é criado, não sabe que existe limpeza, e não pode esquecer de limpar. A parte depois do `use` roda **sempre**, inclusive quando o teste falha.\n\nIsso resolve o problema da aula anterior de um jeito estrutural: a limpeza não depende de disciplina de quem escreve o teste.",
                    },
                    {
                        type: "text",
                        value: "## Dados de teste em arquivo\n\nAs duas ferramentas chamam de **fixtures** também os arquivos de dados, o que confunde um pouco. São arquivos JSON (ou de qualquer formato) com dados reutilizáveis: um catálogo de produtos, uma resposta de API para simular, um PDF para upload.",
                    },
                    {
                        type: "code",
                        value: '// cypress/fixtures/produtos.json ou tests/fixtures/produtos.json\n{\n  "itens": [\n    { "sku": "SKU-4471", "nome": "Teclado mecânico", "preco": 349.9 },\n    { "sku": "SKU-8802", "nome": "Monitor 27 polegadas", "preco": 1299.0 }\n  ]\n}\n\n// Cypress\ncy.intercept(\'GET\', \'/api/produtos*\', { fixture: \'produtos.json\' }).as(\'lista\')\n\n// Playwright\nimport produtos from \'./fixtures/produtos.json\'\nawait page.route(\'**/api/produtos*\', (route) => route.fulfill({ json: produtos }))',
                    },
                    {
                        type: "quote",
                        value: "Um cuidado com dados em arquivo: eles **congelam** o formato da API, exatamente como o mock de rede. Quando o backend adiciona um campo obrigatório, o arquivo continua com o formato antigo e o teste segue passando enquanto a integração real quebra. Vale revisar esses arquivos junto com mudanças de contrato.",
                    },
                    {
                        type: "text",
                        value: "## O equilíbrio\n\nComandos e fixtures reduzem repetição, mas cada abstração é uma coisa a mais para entender. Um projeto com quarenta comandos customizados que ninguém lembra exige abrir a documentação a cada teste novo.\n\nUm critério prático: crie a abstração quando ela **for usada em pelo menos três lugares** e quando o nome dela **descrever a intenção** com clareza. `criarClienteComAssinaturaVencida` é um bom nome; `setup2` não é.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual é a vantagem da fixture do Playwright sobre um simples auxiliar?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Ela pode preparar antes e limpar depois, mesmo quando o teste falha.",
                                isCorrect: true,
                            },
                            {
                                text: "Ela executa mais rápido porque é carregada uma única vez para toda a suíte.",
                                isCorrect: false,
                            },
                            {
                                text: "Ela permite que o teste seja escrito sem precisar de asserções explícitas.",
                                isCorrect: false,
                            },
                            {
                                text: "Ela substitui a necessidade de organizar os seletores em Page Objects.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "No exemplo da fixture, quando a limpeza é executada?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Depois do use, sempre, inclusive quando o teste falha.",
                                isCorrect: true,
                            },
                            {
                                text: "Antes do teste começar, para garantir que o ambiente esteja em estado conhecido.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas quando o teste termina com sucesso, evitando remover dados de uma falha.",
                                isCorrect: false,
                            },
                            {
                                text: "Ao final da execução completa da suíte, junto com a limpeza geral do ambiente.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é o risco de usar arquivos de dados para simular respostas da API?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Eles congelam o formato, e o teste passa enquanto a integração real quebra.",
                                isCorrect: true,
                            },
                            {
                                text: "Eles aumentam o tempo de execução porque precisam ser lidos do disco a cada teste.",
                                isCorrect: false,
                            },
                            {
                                text: "Eles não podem ser reutilizados entre testes diferentes dentro do mesmo projeto.",
                                isCorrect: false,
                            },
                            {
                                text: "Eles impedem que a ferramenta gere evidências corretas quando o teste falha.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual critério a aula propõe antes de criar uma abstração?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Que seja usada em pelo menos três lugares e tenha nome que descreve a intenção.",
                                isCorrect: true,
                            },
                            {
                                text: "Que reduza em pelo menos vinte por cento o tempo de execução da suíte completa.",
                                isCorrect: false,
                            },
                            {
                                text: "Que seja aprovada em revisão de código por outra pessoa da equipe de qualidade.",
                                isCorrect: false,
                            },
                            {
                                text: "Que substitua ao menos dois comandos nativos oferecidos pela ferramenta escolhida.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é o problema de um projeto com quarenta comandos customizados?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Cada abstração é mais uma coisa a entender, e ninguém lembra de todas.",
                                isCorrect: true,
                            },
                            {
                                text: "A ferramenta passa a demorar mais para carregar antes de cada execução de teste.",
                                isCorrect: false,
                            },
                            {
                                text: "Comandos customizados em excesso deixam a suíte incompatível com execução paralela.",
                                isCorrect: false,
                            },
                            {
                                text: "O limite máximo suportado pelas ferramentas é de cerca de vinte comandos por projeto.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Organizando os arquivos da suíte",
                blocks: [
                    {
                        type: "text",
                        value: '## Uma estrutura que envelhece bem\n\nSuítes crescem. O que começou com cinco arquivos vira quarenta, e a partir daí a organização determina se alguém consegue encontrar as coisas.\n\nNão existe uma estrutura única correta, mas existe um princípio que funciona: **organize por funcionalidade do produto, não por tipo de artefato**. Uma pasta chamada "testes de botão" não ajuda ninguém; uma pasta "checkout" ajuda todo mundo.',
                    },
                    {
                        type: "code",
                        value: "tests/\n  fixtures/                 # dados e arquivos usados pelos testes\n    produtos.json\n    comprovante.pdf\n  support/                  # infraestrutura da suíte\n    auth.setup.ts\n    fixtures.ts             # fixtures customizadas\n    api.ts                  # funções de preparação via API\n  pages/                    # objetos de página\n    LoginPage.ts\n    CheckoutPage.ts\n  e2e/\n    autenticacao/\n      login.spec.ts\n      recuperar-senha.spec.ts\n    checkout/\n      cupom.spec.ts\n      pagamento.spec.ts\n      frete.spec.ts\n    pedidos/\n      cancelamento.spec.ts\n      historico.spec.ts",
                    },
                    {
                        type: "text",
                        value: "## Agrupando dentro do arquivo\n\nDentro de cada arquivo, `describe` (ou `test.describe`) agrupa por contexto, e o nome de cada teste descreve o cenário. O relatório fica legível como um documento de comportamento.",
                    },
                    {
                        type: "code",
                        value: "test.describe('Checkout: cupom de desconto', () => {\n  test.beforeEach(async ({ page }) => {\n    await page.goto('/checkout')\n  })\n\n  test('cupom válido aplica o percentual sobre o subtotal', async ({ page }) => { /* ... */ })\n  test('cupom expirado exibe mensagem e mantém o total', async ({ page }) => { /* ... */ })\n  test('cupom inexistente exibe mensagem de código inválido', async ({ page }) => { /* ... */ })\n  test('segundo cupom substitui o primeiro', async ({ page }) => { /* ... */ })\n})\n\n// No relatório:\n//   Checkout: cupom de desconto > cupom expirado exibe mensagem e mantém o total",
                    },
                    {
                        type: "text",
                        value: "## Etiquetas para separar o que roda quando\n\nNem toda a suíte precisa rodar em toda situação. Etiquetar os testes permite executar subconjuntos.\n\nOs grupos que costumam fazer sentido:\n\n- **smoke**: um punhado de testes rápidos que provam que o ambiente está de pé. Rodam a cada implantação.\n- **crítico**: os fluxos que não podem quebrar. Rodam em todo pull request.\n- **completo**: a suíte inteira. Roda de madrugada ou antes de uma entrega maior.\n- **lento**: testes que demoram muito e não precisam rodar sempre.",
                    },
                    {
                        type: "code",
                        value: "// Playwright: etiqueta no título ou na anotação\ntest('@smoke a home carrega', async ({ page }) => { /* ... */ })\ntest('@critico compra com cartão', { tag: '@critico' }, async ({ page }) => { /* ... */ })\n\n// Rodar só um grupo\n// npx playwright test --grep @smoke\n\n// Cypress: por etiqueta no título ou por caminho\n// npx cypress run --spec \"cypress/e2e/checkout/**\"",
                    },
                    {
                        type: "quote",
                        value: "Uma suíte que só sabe rodar por inteiro acaba não rodando. Quando ela leva quarenta minutos, ninguém executa antes de abrir o pull request, e o feedback chega tarde demais. Poder rodar dez testes críticos em dois minutos muda o comportamento do time.",
                    },
                    {
                        type: "text",
                        value: '## Nomeando arquivos e testes\n\nTrês convenções que economizam tempo:\n\n**Nome do arquivo pelo domínio.** `cupom.spec.ts`, e não `teste2.spec.ts` nem `checkoutTests.spec.ts`.\n\n**Nome do teste no comportamento esperado.** "cupom expirado exibe mensagem e mantém o total" diz o cenário e a expectativa. "testa cupom" não diz nada.\n\n**Um arquivo por assunto, não por tela.** Se a tela de checkout tem cupom, frete e pagamento, três arquivos separados são mais fáceis de navegar e permitem rodar só a parte que interessa depois de uma mudança.',
                    },
                ],
                questions: [
                    {
                        statement: "Qual princípio de organização a aula propõe?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Organizar por funcionalidade do produto, e não por tipo de artefato.",
                                isCorrect: true,
                            },
                            {
                                text: "Organizar por tipo de teste, separando cliques, formulários e verificações visuais.",
                                isCorrect: false,
                            },
                            {
                                text: "Organizar por ordem de criação, mantendo o histórico de evolução da suíte automatizada.",
                                isCorrect: false,
                            },
                            {
                                text: "Organizar por pessoa responsável, facilitando a manutenção dos testes de cada área.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Para que servem as etiquetas nos testes?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Permitir executar subconjuntos, como só os testes críticos ou de fumaça.",
                                isCorrect: true,
                            },
                            {
                                text: "Identificar quem escreveu cada teste para facilitar a atribuição das correções.",
                                isCorrect: false,
                            },
                            {
                                text: "Definir a ordem em que os testes serão executados durante a rodada do pipeline.",
                                isCorrect: false,
                            },
                            {
                                text: "Marcar os testes que já foram revisados pela equipe de qualidade do projeto.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O que acontece com uma suíte que só sabe rodar por inteiro e leva quarenta minutos?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Ninguém executa antes de abrir o pull request e o feedback chega tarde.",
                                isCorrect: true,
                            },
                            {
                                text: "A ferramenta passa a apresentar falhas de memória durante a execução completa.",
                                isCorrect: false,
                            },
                            {
                                text: "Os testes começam a interferir uns nos outros por causa da duração da execução.",
                                isCorrect: false,
                            },
                            {
                                text: "O relatório gerado fica grande demais para ser analisado pela equipe do projeto.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual nome de arquivo segue a convenção recomendada?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "cupom.spec.ts",
                                isCorrect: true,
                            },
                            {
                                text: "checkoutTestsCompletos.spec.ts, indicando a tela e o escopo dos casos incluídos.",
                                isCorrect: false,
                            },
                            {
                                text: "teste2.spec.ts, seguindo a ordem em que os arquivos foram criados no projeto.",
                                isCorrect: false,
                            },
                            {
                                text: "telaDeFinalizacaoDeCompra.spec.ts, descrevendo por completo a tela verificada.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que separar a tela de checkout em arquivos de cupom, frete e pagamento?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Facilita navegar e permite rodar só a parte afetada por uma mudança.",
                                isCorrect: true,
                            },
                            {
                                text: "Reduz o tempo total de execução porque os arquivos menores carregam mais rápido.",
                                isCorrect: false,
                            },
                            {
                                text: "Evita que os testes da mesma tela disputem os mesmos dados durante a execução.",
                                isCorrect: false,
                            },
                            {
                                text: "Permite que cada arquivo tenha uma configuração de tempo limite independente.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "O que não colocar no E2E",
                blocks: [
                    {
                        type: "text",
                        value: "## Saber o que deixar de fora\n\nBoa parte da saúde de uma suíte E2E vem das decisões de **não** automatizar ali. Esta aula é uma lista do que costuma acabar no E2E por inércia e deveria estar em outro lugar.",
                    },
                    {
                        type: "table",
                        value: '[["Não coloque no E2E", "Coloque em", "Por quê"], ["Variações de regra de negócio", "Teste de unidade", "Trinta combinações em segundos, sem navegador"], ["Validação de campo obrigatório", "Unidade ou componente", "Não precisa do sistema inteiro"], ["Contrato completo da API", "Teste de API", "Roda em segundos e aponta o campo exato"], ["Todos os caminhos de erro", "Unidade e API", "No E2E só um representante"], ["Aparência e estilo", "Teste visual", "Asserção de pixel no E2E é frágil"], ["Desempenho sob carga", "Teste de carga", "Ferramenta e ambiente diferentes"]]',
                    },
                    {
                        type: "text",
                        value: "## O caso mais comum: as variações de regra\n\nUm exemplo concreto. A regra de frete tem: grátis acima de 200, R$ 15 para o Sudeste, R$ 25 para as outras regiões, e frete dobrado para itens acima de 30 kg.\n\nAutomatizar isso no E2E significaria montar carrinho, preencher endereço e finalizar para cada combinação: doze cenários, cada um com trinta segundos, seis minutos de suíte, e todos quebrando junto quando a tela de endereço mudar.\n\nO certo é testar as doze combinações no nível da regra (milissegundos) e levar ao E2E **um** cenário, que prova que a tela envia o endereço certo e mostra o frete que a regra devolveu.",
                    },
                    {
                        type: "quote",
                        value: "Pergunta filtro antes de escrever um teste E2E: **este defeito seria pego mais barato em outro nível?** Se sim, escreva lá. O E2E existe para provar que as peças estão ligadas, não para exercitar cada regra.",
                    },
                    {
                        type: "text",
                        value: "## Os outros casos\n\n**Validação de formulário campo a campo.** Vinte cenários de campo obrigatório, formato de email e tamanho de senha não precisam de navegador completo. Um teste de componente resolve mais rápido e mais estável. No E2E, um cenário mostrando que a validação aparece já basta.\n\n**Aparência.** Verificar cor, tamanho e posição no E2E produz um teste que quebra a cada ajuste de design sem indicar defeito real. Se comparação visual for necessária, existe ferramenta dedicada para isso (assunto do módulo 7), com fluxo de aprovação de diferenças.\n\n**Testes de terceiros.** Verificar se o Google Analytics registrou o evento, se o chat de suporte abriu ou se o mapa carregou. Você está testando o produto de outra empresa, e vai falhar quando ele estiver instável, sem que nada seu esteja errado.\n\n**Fluxos administrativos raros.** Uma configuração usada duas vezes por ano por uma pessoa não justifica o custo de manutenção permanente. Uma verificação manual periódica é mais barata.",
                    },
                    {
                        type: "text",
                        value: '## O teste da pergunta única\n\nQuando estiver em dúvida se algo merece um teste E2E, responda a esta pergunta: **"se isso quebrar e ninguém perceber por uma semana, qual é o tamanho do estrago?"**\n\nSe a resposta for "perdemos vendas", "ninguém consegue entrar" ou "cobramos errado", automatize no topo. Se for "alguém abre um chamado e a gente corrige", provavelmente há um lugar mais barato para essa verificação.\n\nUma suíte E2E enxuta, rápida e confiável protege mais do que uma suíte grande e ignorada. Vinte testes que o time olha valem mais do que trezentos que ninguém investiga.',
                    },
                ],
                questions: [
                    {
                        statement:
                            "Onde devem ficar as variações de uma regra de negócio com muitas combinações?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "No teste de unidade, deixando um cenário representativo no E2E.",
                                isCorrect: true,
                            },
                            {
                                text: "No teste E2E, porque só ele verifica o comportamento completo percebido por quem usa.",
                                isCorrect: false,
                            },
                            {
                                text: "No teste visual, que compara o resultado apresentado na tela com uma imagem de referência.",
                                isCorrect: false,
                            },
                            {
                                text: "No teste de carga, que executa muitas combinações em paralelo de forma automatizada.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a pergunta filtro antes de escrever um teste E2E?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Este defeito seria pego mais barato em outro nível?",
                                isCorrect: true,
                            },
                            {
                                text: "Este cenário pode ser automatizado com a ferramenta escolhida pelo time?",
                                isCorrect: false,
                            },
                            {
                                text: "Quanto tempo esse teste vai levar para ser executado no servidor de integração?",
                                isCorrect: false,
                            },
                            {
                                text: "Quantas pessoas do time conseguem entender esse cenário sem ajuda adicional?",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que não vale a pena testar no E2E se o Google Analytics registrou o evento?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque é o produto de outra empresa, e ele falha sem que nada seu esteja errado.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque ferramentas de análise não expõem informações acessíveis pela automação.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque esse tipo de verificação exige permissões que o ambiente de teste não possui.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o evento só é registrado em produção, onde a suíte não deve ser executada.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual pergunta ajuda a decidir se algo merece um teste E2E?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Se isso quebrar e ninguém perceber por uma semana, qual o tamanho do estrago?",
                                isCorrect: true,
                            },
                            {
                                text: "Quantos usuários acessam essa funcionalidade por mês dentro da aplicação hoje?",
                                isCorrect: false,
                            },
                            {
                                text: "Essa funcionalidade já teve defeitos registrados nas últimas entregas do time?",
                                isCorrect: false,
                            },
                            {
                                text: "A equipe tem conhecimento técnico suficiente para automatizar esse cenário?",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual afirmação sobre o tamanho da suíte E2E é coerente com a aula?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Vinte testes que o time olha valem mais que trezentos que ninguém investiga.",
                                isCorrect: true,
                            },
                            {
                                text: "Quanto maior a suíte, maior a proteção contra defeitos que chegam em produção.",
                                isCorrect: false,
                            },
                            {
                                text: "O tamanho ideal é proporcional à quantidade de telas existentes na aplicação.",
                                isCorrect: false,
                            },
                            {
                                text: "A suíte deve cobrir todos os critérios de aceitação escritos para cada história.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Combatendo testes instáveis",
                blocks: [
                    {
                        type: "text",
                        value: "## O inimigo que mata suítes\n\nUm teste **instável** (flaky) passa às vezes e falha às vezes, sem nenhuma mudança no código. É o problema mais destrutivo de uma suíte E2E, e o motivo número um pelo qual times abandonam automação.\n\nO estrago não é a falha em si. É o que ela ensina: quando um teste falha e a pessoa reexecuta e passa, o time aprende que **teste vermelho não significa nada**. A partir daí, toda falha real também é reexecutada sem investigação, e a suíte deixou de proteger.",
                    },
                    {
                        type: "table",
                        value: '[["Causa", "Sintoma típico", "Solução"], ["Espera por tempo", "Falha em máquina lenta ou no CI", "Esperar por condição observável"], ["Dado compartilhado", "Falha só em paralelo", "Identificador único por teste"], ["Estado deixado para trás", "Falha na segunda execução", "Isolamento ou limpeza garantida"], ["Ordem entre testes", "Falha em ordem aleatória", "Tornar cada teste independente"], ["Serviço externo", "Falha em horários específicos", "Simular a resposta"], ["Animação", "Clique acerta o lugar errado", "Desligar animações no teste"], ["Data e hora", "Falha na virada do dia ou do mês", "Fixar o relógio ou usar datas relativas"]]',
                    },
                    {
                        type: "text",
                        value: '## A armadilha das tentativas automáticas\n\nAs ferramentas permitem repetir automaticamente um teste que falhou. É um recurso útil e perigoso ao mesmo tempo.\n\n**Útil**: no CI, absorve falhas genuínas de infraestrutura (rede instável, contêiner que demorou a subir) sem quebrar o pipeline por motivo alheio ao produto.\n\n**Perigoso**: se você não olhar quais testes precisaram de tentativa, elas viram um tapete embaixo do qual a instabilidade se acumula em silêncio. Meses depois, metade da suíte só passa na segunda tentativa e ninguém sabe.\n\nA prática que resolve: mantenha as tentativas, mas **trate "passou na segunda tentativa" como um sinal**, não como sucesso. As duas ferramentas reportam isso. Um teste que aparece nessa lista com frequência entra na fila para ser corrigido.',
                    },
                    {
                        type: "quote",
                        value: "Tentativa automática é analgésico, não tratamento. Ela deixa o pipeline utilizável enquanto o problema real é resolvido. Se ela virar a solução permanente, a suíte já está doente e ninguém percebeu.",
                    },
                    {
                        type: "text",
                        value: '## Data e hora: uma causa silenciosa\n\nVale destacar essa, porque pega muita gente de surpresa.\n\nTestes que dependem da data atual funcionam por meses e falham num dia específico: na virada do mês, no primeiro dia do ano, no fim de semana, na mudança de horário. Um cupom "válido até amanhã" criado às 23h58 expira no meio da execução. Um relatório "do mês atual" fica vazio no dia primeiro.\n\nDuas soluções: **datas relativas e generosas** na preparação (válido por trinta dias, e não até amanhã), ou **fixar o relógio** do navegador, o que as duas ferramentas permitem.',
                    },
                    {
                        type: "code",
                        value: "// Playwright: fixa o relógio do navegador\nawait page.clock.setFixedTime(new Date('2026-07-29T10:00:00'))\n\n// Cypress\ncy.clock(new Date('2026-07-29T10:00:00').getTime())",
                    },
                    {
                        type: "text",
                        value: "## Um processo que funciona\n\nInstabilidade não se resolve num mutirão. Ela se resolve com um processo leve e contínuo:\n\n1. **Meça.** Registre quais testes falharam e quantas vezes por semana. Sem esse número, a conversa vira opinião.\n2. **Priorize os piores.** Normalmente dois ou três testes respondem pela maioria das falhas.\n3. **Trate como defeito**, com dono e prazo, e não como tarefa de fim de semana.\n4. **Corrija a causa, não o sintoma.** Aumentar o tempo limite quase nunca é a correção certa.\n5. **Se não der para corrigir agora, desative** com um comentário explicando o motivo e um item no backlog. Um teste desativado é honesto; um teste instável ligado é enganoso.\n6. **Estabeleça um acordo:** a suíte principal precisa ficar verde. Quando ela fica vermelha, alguém para e olha. Esse acordo é o que dá valor a todo o resto.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o maior estrago causado por um teste instável?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Ensina o time que teste vermelho não significa nada.",
                                isCorrect: true,
                            },
                            {
                                text: "Aumenta o tempo total de execução da suíte por causa das tentativas repetidas.",
                                isCorrect: false,
                            },
                            {
                                text: "Impede que novos testes sejam adicionados ao mesmo arquivo do projeto.",
                                isCorrect: false,
                            },
                            {
                                text: "Consome recursos do servidor de integração contínua durante as reexecuções.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um teste falha somente quando a suíte roda em paralelo. Qual é a solução indicada?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Usar identificador único por teste para não disputar o mesmo dado.",
                                isCorrect: true,
                            },
                            {
                                text: "Aumentar o tempo limite dos comandos para tolerar a carga extra da execução.",
                                isCorrect: false,
                            },
                            {
                                text: "Desativar o paralelismo e executar a suíte de forma sequencial no pipeline.",
                                isCorrect: false,
                            },
                            {
                                text: "Repetir automaticamente o teste até que ele passe em uma das tentativas.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o perigo das tentativas automáticas de reexecução?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A instabilidade se acumula em silêncio se ninguém olhar quem precisou de tentativa.",
                                isCorrect: true,
                            },
                            {
                                text: "O tempo de execução da suíte cresce até inviabilizar a execução no pipeline do time.",
                                isCorrect: false,
                            },
                            {
                                text: "As evidências geradas na primeira tentativa são descartadas pela ferramenta usada.",
                                isCorrect: false,
                            },
                            {
                                text: "Os testes passam a depender da ordem em que as tentativas são executadas.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Um cupom criado com validade até amanhã faz o teste falhar de vez em quando. Qual é a melhor solução?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Usar datas relativas generosas na preparação ou fixar o relógio do navegador.",
                                isCorrect: true,
                            },
                            {
                                text: "Executar esse teste apenas em horários específicos, evitando a virada do dia.",
                                isCorrect: false,
                            },
                            {
                                text: "Aumentar o tempo limite para que o teste termine antes de o cupom expirar.",
                                isCorrect: false,
                            },
                            {
                                text: "Repetir o teste automaticamente sempre que ele falhar por causa da validade.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O que a aula recomenda quando não há tempo para corrigir um teste instável agora?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Desativar com um comentário explicando o motivo e um item no backlog.",
                                isCorrect: true,
                            },
                            {
                                text: "Manter ligado e reexecutar sempre que falhar, já que ele passa na maioria das vezes.",
                                isCorrect: false,
                            },
                            {
                                text: "Aumentar o número de tentativas automáticas até que ele deixe de aparecer vermelho.",
                                isCorrect: false,
                            },
                            {
                                text: "Mover o teste para um arquivo separado que não é executado no pipeline principal.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 6 - E2E no pipeline",
        aulas: [
            {
                titulo: "Rodando a suíte no CI",
                blocks: [
                    {
                        type: "text",
                        value: "## Por que rodar no servidor\n\nUm teste que só roda na sua máquina protege só você. O valor da automação aparece quando a suíte roda **automaticamente**, a cada mudança, sem depender de alguém lembrar.\n\nÉ isso que a integração contínua faz: a cada pull request, o servidor sobe a aplicação, executa os testes e diz se pode seguir. O feedback chega em minutos, para quem escreveu, enquanto o contexto ainda está fresco.",
                    },
                    {
                        type: "code",
                        value: "# .github/workflows/e2e.yml\nname: E2E\n\non:\n  pull_request:\n    branches: [main, develop]\n\njobs:\n  e2e:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n          cache: npm\n\n      - run: npm ci\n      - run: npx playwright install --with-deps chromium\n\n      - name: Subir a aplicação\n        run: npm run start:test &\n\n      - name: Esperar a aplicação responder\n        run: npx wait-on http://localhost:5173 --timeout 60000\n\n      - name: Rodar os testes\n        run: npx playwright test\n        env:\n          BASE_URL: http://localhost:5173\n\n      - name: Guardar o relatório\n        if: always()\n        uses: actions/upload-artifact@v4\n        with:\n          name: playwright-report\n          path: playwright-report/\n          retention-days: 7",
                    },
                    {
                        type: "text",
                        value: '## Os detalhes que fazem diferença\n\n**Esperar a aplicação responder.** Subir a aplicação em segundo plano e rodar os testes na linha seguinte é a receita para um pipeline instável: a suíte começa antes de a aplicação estar de pé. Uma ferramenta de espera resolve isso em uma linha.\n\n**Guardar os artefatos com `if: always()`.** Sem isso, o relatório só é salvo quando tudo passa, que é exatamente quando você não precisa dele. Com `always()`, o relatório da execução que falhou fica disponível para download.\n\n**Cachear o que dá.** Dependências e navegadores levam minutos para instalar a cada execução. O cache derruba isso para segundos.\n\n**Fixar a versão do Node e do navegador.** "Funciona na minha máquina" também vale para o CI: versões diferentes produzem comportamentos diferentes.',
                    },
                    {
                        type: "table",
                        value: '[["Erro comum no CI", "Sintoma", "Correção"], ["Não esperar a aplicação subir", "Falha nos primeiros testes, sempre", "Ferramenta de espera pela URL"], ["Artefato só quando passa", "Falhou e não há evidência", "Salvar com always()"], ["Sem cache", "Pipeline lento e caro", "Cachear dependências e navegadores"], ["Versão flutuante", "Passa hoje, falha amanhã", "Fixar versões"], ["Rodar tudo em todo commit", "Feedback demora demais", "Etiquetas: crítico no PR, completo à noite"]]',
                    },
                    {
                        type: "quote",
                        value: "A regra de ouro do E2E no CI: **o pipeline precisa ser confiável antes de ser completo**. Uma suíte de dez testes que sempre diz a verdade vale mais do que uma de duzentos que falha por conta própria duas vezes por dia, porque a primeira o time respeita.",
                    },
                    {
                        type: "text",
                        value: "## Contra o que rodar\n\nTrês montagens comuns, da melhor para a mais problemática:\n\n**Aplicação subida no próprio job.** O pipeline sobe a aplicação e o banco em contêineres, roda os testes e destrói tudo. É isolado, reprodutível e não disputa ambiente com ninguém. É o padrão que mais evita instabilidade.\n\n**Ambiente efêmero de pull request.** Um ambiente publicado automaticamente para cada mudança. Excelente também, e permite testar o que foi implantado de verdade.\n\n**Homologação compartilhada.** Funciona, mas outras pessoas mexem no ambiente enquanto a suíte roda, e as falhas resultantes consomem tempo de investigação sem revelar defeito nenhum.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o valor principal de rodar a suíte no CI?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "A suíte roda a cada mudança, sem depender de alguém lembrar.",
                                isCorrect: true,
                            },
                            {
                                text: "Os testes são executados em máquinas mais rápidas do que as usadas pelo time.",
                                isCorrect: false,
                            },
                            {
                                text: "A ferramenta consegue gerar evidências que não estão disponíveis na execução local.",
                                isCorrect: false,
                            },
                            {
                                text: "Os testes passam a ser executados em todos os navegadores suportados pelo produto.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que é preciso esperar a aplicação responder antes de rodar os testes?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Porque senão a suíte começa antes de a aplicação estar de pé.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque a ferramenta precisa registrar a URL base antes de iniciar a execução.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o servidor de integração limita o número de processos simultâneos por job.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o navegador precisa ser instalado depois que a aplicação estiver rodando.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é o problema de salvar os artefatos apenas quando a execução passa?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O relatório fica indisponível justamente quando ele seria necessário.",
                                isCorrect: true,
                            },
                            {
                                text: "O armazenamento do servidor de integração é consumido de forma desnecessária.",
                                isCorrect: false,
                            },
                            {
                                text: "Os relatórios de execuções bem-sucedidas ocupam mais espaço do que os de falha.",
                                isCorrect: false,
                            },
                            {
                                text: "A ferramenta não consegue gerar o relatório quando algum teste apresenta erro.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a regra de ouro do E2E no CI segundo a aula?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O pipeline precisa ser confiável antes de ser completo.",
                                isCorrect: true,
                            },
                            {
                                text: "O pipeline precisa executar todos os testes disponíveis a cada alteração enviada.",
                                isCorrect: false,
                            },
                            {
                                text: "O pipeline precisa terminar em menos de cinco minutos para não atrapalhar o time.",
                                isCorrect: false,
                            },
                            {
                                text: "O pipeline precisa rodar em todos os navegadores suportados oficialmente pelo produto.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual montagem de ambiente a aula aponta como a que mais evita instabilidade?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "A aplicação e o banco subidos em contêineres dentro do próprio job.",
                                isCorrect: true,
                            },
                            {
                                text: "A homologação compartilhada, por ser o ambiente mais parecido com a produção real.",
                                isCorrect: false,
                            },
                            {
                                text: "A produção, com dados marcados como teste e verificações sem efeito colateral.",
                                isCorrect: false,
                            },
                            {
                                text: "A máquina local de quem abriu o pull request, garantindo o mesmo comportamento.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Paralelismo e distribuição",
                blocks: [
                    {
                        type: "text",
                        value: "## Quando a suíte cresce\n\nCinquenta testes E2E a dez segundos cada dão oito minutos, executados em sequência. Duzentos dão trinta e três minutos. A partir de certo ponto, ninguém espera.\n\nA saída é rodar vários testes **ao mesmo tempo**. Duas formas, que se combinam:\n\n**Paralelismo local**: vários processos de navegador na mesma máquina. Limitado pelo número de núcleos e pela memória.\n\n**Distribuição (sharding)**: dividir a suíte entre várias máquinas do CI. Cada uma roda um pedaço, e os resultados são juntados no fim.",
                    },
                    {
                        type: "code",
                        value: "// playwright.config.ts\nexport default defineConfig({\n  fullyParallel: true,\n  workers: process.env.CI ? 4 : undefined,   // local usa metade dos núcleos\n})",
                    },
                    {
                        type: "code",
                        value: "# GitHub Actions: dividir entre 4 máquinas\njobs:\n  e2e:\n    strategy:\n      fail-fast: false\n      matrix:\n        shard: [1, 2, 3, 4]\n    steps:\n      - run: npx playwright test --shard=${{ matrix.shard }}/4",
                    },
                    {
                        type: "text",
                        value: "## O pré-requisito inegociável\n\nParalelismo só funciona com **testes independentes**. Se dois testes usam o mesmo usuário, o mesmo cupom ou o mesmo produto, rodar ao mesmo tempo produz falhas aleatórias que parecem mágica negra.\n\nÉ por isso que os módulos anteriores insistiram tanto em identificador único, preparação por teste e ausência de estado compartilhado. Tudo aquilo era, entre outras coisas, preparação para este momento.\n\nUm sintoma que confirma o diagnóstico: a suíte passa em sequência e falha em paralelo. Quando isso acontece, o problema é sempre compartilhamento de estado, e nunca a ferramenta.",
                    },
                    {
                        type: "table",
                        value: '[["Estratégia", "Ganho", "Requisito", "Custo"], ["Sequencial", "Nenhum", "Nenhum", "Tempo total"], ["Paralelo local", "Bom, limitado pela máquina", "Testes independentes", "Memória e CPU"], ["Distribuído no CI", "Escala com o número de máquinas", "Testes independentes", "Minutos de CI"], ["Só o crítico no PR", "Feedback em minutos", "Etiquetas bem definidas", "Cobertura parcial no PR"]]',
                    },
                    {
                        type: "quote",
                        value: "Antes de investir em paralelismo, tire da suíte o que não deveria estar nela. Reduzir de duzentos para quarenta testes bem escolhidos costuma dar mais resultado, em tempo e em confiabilidade, do que dividir duzentos testes ruins entre oito máquinas.",
                    },
                    {
                        type: "text",
                        value: "## Quanto paralelismo é demais\n\nMais processos nem sempre significa mais velocidade. Três limites aparecem:\n\n**A máquina.** Cada navegador consome memória. Passar do que a máquina aguenta faz tudo ficar mais lento, e testes começam a falhar por lentidão, o que parece instabilidade mas é saturação.\n\n**O backend.** Doze testes simultâneos são doze vezes mais carga no servidor de teste. Se ele não aguenta, os testes falham por timeout e você vai investigar o lugar errado.\n\n**O banco.** Testes que gravam ao mesmo tempo podem gerar disputa de bloqueio, principalmente quando tocam as mesmas tabelas.\n\nO ajuste é empírico: aumente aos poucos, meça o tempo total e a taxa de falha, e pare quando a taxa começar a subir.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a diferença entre paralelismo local e distribuição?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O paralelismo usa vários processos na mesma máquina; a distribuição usa várias.",
                                isCorrect: true,
                            },
                            {
                                text: "O paralelismo executa testes diferentes e a distribuição repete os mesmos em ambientes.",
                                isCorrect: false,
                            },
                            {
                                text: "O paralelismo funciona apenas localmente e a distribuição apenas no servidor de CI.",
                                isCorrect: false,
                            },
                            {
                                text: "O paralelismo divide por arquivo e a distribuição divide por navegador utilizado.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é o pré-requisito inegociável para rodar em paralelo?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Que os testes sejam independentes entre si.",
                                isCorrect: true,
                            },
                            {
                                text: "Que a suíte tenha menos de cem testes para caber na memória disponível na máquina.",
                                isCorrect: false,
                            },
                            {
                                text: "Que todos os testes usem a mesma sessão salva para reduzir o custo de autenticação.",
                                isCorrect: false,
                            },
                            {
                                text: "Que o servidor de integração ofereça pelo menos quatro máquinas simultâneas ativas.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A suíte passa em sequência e falha em paralelo. O que isso indica?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Compartilhamento de estado entre os testes.",
                                isCorrect: true,
                            },
                            {
                                text: "Um limite de memória atingido pela quantidade de navegadores abertos ao mesmo tempo.",
                                isCorrect: false,
                            },
                            {
                                text: "Um defeito real na aplicação que só aparece sob carga simultânea de requisições.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma incompatibilidade entre a versão da ferramenta e a do navegador utilizado.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que a aula recomenda fazer antes de investir em paralelismo?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Tirar da suíte o que não deveria estar nela.",
                                isCorrect: true,
                            },
                            {
                                text: "Aumentar a quantidade de máquinas disponíveis no servidor de integração contínua.",
                                isCorrect: false,
                            },
                            {
                                text: "Converter todos os testes manuais restantes em cenários automatizados de ponta a ponta.",
                                isCorrect: false,
                            },
                            {
                                text: "Migrar para a ferramenta que oferece o melhor suporte a execução simultânea.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Testes começam a falhar por timeout depois que o paralelismo foi aumentado. Qual é a causa provável?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Saturação da máquina, do backend ou do banco pela carga simultânea.",
                                isCorrect: true,
                            },
                            {
                                text: "Um defeito de espera nos testes que só aparece quando a execução é mais rápida.",
                                isCorrect: false,
                            },
                            {
                                text: "Um problema de configuração do tempo limite que precisa ser aumentado globalmente.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma limitação da ferramenta, que não suporta mais de dois processos simultâneos.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Evidências: print, vídeo e trace",
                blocks: [
                    {
                        type: "text",
                        value: '## O teste falhou no servidor. E agora?\n\nVocê não estava lá, não viu a tela, não pode reproduzir do mesmo jeito. As evidências são o que transforma "falhou no CI" em algo investigável.\n\nAs ferramentas oferecem três níveis, do mais leve ao mais completo.',
                    },
                    {
                        type: "table",
                        value: '[["Evidência", "O que mostra", "Peso", "Quando ligar"], ["Print", "A tela no instante da falha", "Leve", "Sempre, em caso de falha"], ["Vídeo", "A execução inteira do teste", "Médio", "Em caso de falha"], ["Trace", "Linha do tempo com DOM, rede e console", "Maior", "Na primeira repetição"], ["Log de rede", "Requisições e respostas", "Leve", "Junto do trace"]]',
                    },
                    {
                        type: "code",
                        value: "// Playwright: a configuração equilibrada\nuse: {\n  screenshot: 'only-on-failure',\n  video: 'retain-on-failure',\n  trace: 'on-first-retry',\n}\n\n// Cypress\n{\n  screenshotOnRunFailure: true,\n  video: true,\n  videoCompression: 32,\n}",
                    },
                    {
                        type: "text",
                        value: "## O trace merece destaque\n\nO trace do Playwright é diferente das outras evidências porque não é uma foto nem um filme: é a **execução inteira navegável**.\n\nVocê abre o arquivo e vê a lista de ações. Ao clicar em qualquer uma, aparece o print de antes e depois, o estado do DOM naquele instante (dá para inspecionar os elementos como no navegador), as requisições de rede que aconteceram e as mensagens do console.\n\nNa prática, isso responde perguntas que print e vídeo não respondem: o elemento estava lá com outro texto? A requisição saiu? Deu erro de JavaScript? O botão estava desabilitado?\n\nÉ o recurso que mais reduz o tempo de investigação de falhas no CI, e o principal argumento técnico a favor do Playwright.",
                    },
                    {
                        type: "quote",
                        value: "Uma evidência que quase todo mundo esquece de coletar e que resolve muito caso: o **console do navegador**. Um erro de JavaScript que quebrou a página aparece ali, e sem ele você fica horas procurando o problema no lugar errado.",
                    },
                    {
                        type: "text",
                        value: "## Coletando o console e os erros de página\n\nVale registrar erros de console mesmo em testes que passam. Uma página que funciona mas dispara exceções tem um problema esperando para aparecer.",
                    },
                    {
                        type: "code",
                        value: "// Playwright: falhar o teste se houver erro de console\ntest.beforeEach(async ({ page }) => {\n  const erros: string[] = []\n  page.on('console', (msg) => {\n    if (msg.type() === 'error') erros.push(msg.text())\n  })\n  page.on('pageerror', (e) => erros.push(e.message))\n\n  // Ao final, expõe os erros coletados\n  test.info().annotations.push({ type: 'console', description: erros.join('\\n') })\n})\n\n// Cypress\nCypress.on('window:before:load', (win) => {\n  cy.spy(win.console, 'error').as('consoleError')\n})",
                    },
                    {
                        type: "text",
                        value: "## Relatórios\n\nAlém das evidências por teste, o relatório é o que o time olha primeiro. Os dois geram relatório em HTML com a lista de testes, a duração e os anexos de cada falha.\n\nDuas práticas que ajudam:\n\n**Publique o relatório em algum lugar acessível.** Se para ver o resultado é preciso baixar um arquivo compactado e abrir na mão, quase ninguém vai olhar.\n\n**Acompanhe a duração ao longo do tempo.** Uma suíte que crescia dois minutos por mês costuma ser percebida só quando já está insuportável. O número por execução mostra a tendência antes disso.",
                    },
                ],
                questions: [
                    {
                        statement: "O que diferencia o trace das outras evidências?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Ele é a execução inteira navegável, com DOM, rede e console de cada passo.",
                                isCorrect: true,
                            },
                            {
                                text: "Ele grava a tela em vídeo com qualidade maior do que a gravação convencional.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele registra apenas o instante exato em que o teste apresentou a falha.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele consome menos espaço em disco do que as capturas de tela geradas por passo.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual evidência a aula aponta como frequentemente esquecida e muito útil?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O console do navegador.",
                                isCorrect: true,
                            },
                            {
                                text: "O vídeo completo da execução de cada teste realizado durante a suíte.",
                                isCorrect: false,
                            },
                            {
                                text: "O relatório em HTML gerado ao final da execução no servidor de integração.",
                                isCorrect: false,
                            },
                            {
                                text: "A captura de tela do momento em que o teste começou a ser executado.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Que pergunta o trace responde e o print não?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Se a requisição saiu e se houve erro de JavaScript durante a execução.",
                                isCorrect: true,
                            },
                            {
                                text: "Qual era o texto exibido na tela no momento exato em que o teste falhou.",
                                isCorrect: false,
                            },
                            {
                                text: "Quanto tempo o teste levou para ser executado do início até o fim do cenário.",
                                isCorrect: false,
                            },
                            {
                                text: "Em qual navegador o teste estava sendo executado quando apresentou a falha.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Por que registrar erros de console mesmo em testes que passam?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque uma página que funciona mas dispara exceções tem problema esperando.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque a ferramenta exige a captura do console para gerar o relatório final.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque erros de console impedem a gravação correta do vídeo da execução.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o console é a única forma de identificar qual seletor foi utilizado.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Por que acompanhar a duração da suíte ao longo do tempo?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Porque o crescimento gradual só é percebido quando já está insuportável.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque o servidor de integração cobra por minuto de execução consumido no mês.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a ferramenta reduz automaticamente o paralelismo quando a suíte cresce.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a duração indica quantos testes instáveis existem na suíte automatizada.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Contra qual ambiente rodar",
                blocks: [
                    {
                        type: "text",
                        value: "## A decisão que define a confiabilidade\n\nVocê já viu o panorama no módulo 1. Agora vale detalhar, porque essa escolha determina boa parte da instabilidade que o time vai enfrentar.\n\nA pergunta central é: **o que você quer provar com essa execução?** A resposta muda o ambiente ideal.",
                    },
                    {
                        type: "table",
                        value: '[["Ambiente", "O que prova", "Instabilidade", "Quando usar"], ["Local", "Que o código na sua máquina funciona", "Baixa", "Escrever e depurar"], ["Contêineres no job de CI", "Que a mudança do PR funciona", "Baixa", "Todo pull request"], ["Efêmero por PR", "Que a mudança implantada funciona", "Baixa", "Quando a infraestrutura permite"], ["Homologação", "Que a integração com o resto funciona", "Alta", "Antes de uma entrega maior"], ["Produção", "Que o sistema está de pé agora", "Média", "Poucos testes de disponibilidade"]]',
                    },
                    {
                        type: "text",
                        value: "## Por que homologação compartilhada dá tanto problema\n\nÉ o ambiente mais usado e o que mais gera falha sem defeito. Os motivos são todos organizacionais, não técnicos:\n\n- Outra pessoa está testando à mão e altera dados que o teste esperava encontrar.\n- Uma versão diferente é implantada no meio da execução.\n- Um serviço integrado está fora do ar por manutenção.\n- Um teste anterior deixou dados que interferem.\n- Alguém alterou uma configuração para investigar outra coisa.\n\nNenhuma dessas falhas indica defeito no produto, e todas consomem tempo de investigação. Um time que gasta duas horas por semana investigando falhas de ambiente perde mais do que ganharia rodando num ambiente isolado.",
                    },
                    {
                        type: "quote",
                        value: "Se você só puder melhorar uma coisa na sua suíte, e ela roda contra homologação compartilhada, **mude o ambiente antes de mexer nos testes**. É a mudança de maior retorno, e a que nenhuma refatoração de código compensa.",
                    },
                    {
                        type: "text",
                        value: "## Testes em produção\n\nRodar E2E em produção assusta, mas tem um lugar legítimo, desde que com escopo bem definido.\n\n**O que faz sentido**: um punhado de verificações de disponibilidade rodando de tempos em tempos. A home carrega, o login funciona, a busca responde, a API principal está de pé. É monitoramento sintético, e ele avisa antes de o cliente reclamar.\n\n**O que não faz sentido**: a suíte de regressão. Ela criaria dados reais, dispararia emails para pessoas reais e poderia mexer em estoque, pedido e cobrança.\n\n**As regras**, se você for fazer:\n- Usar conta e dados claramente marcados como teste.\n- Nenhum efeito colateral: nada de comprar, cobrar ou enviar email de verdade.\n- Excluir esses dados dos relatórios e das métricas de negócio.\n- Alertar a operação de que existem esses acessos automatizados.",
                    },
                    {
                        type: "text",
                        value: "## Configuração por ambiente\n\nNa prática você vai querer a mesma suíte rodando em lugares diferentes, com diferenças de configuração. A forma mais simples é variável de ambiente, e ela cobre quase tudo.",
                    },
                    {
                        type: "code",
                        value: "# Local\nBASE_URL=http://localhost:5173 npx playwright test\n\n# Ambiente efêmero criado pelo pipeline\nBASE_URL=https://pr-482.preview.exemplo.com npx playwright test --grep @critico\n\n# Produção, só o smoke\nBASE_URL=https://app.exemplo.com npx playwright test --grep @smoke",
                    },
                ],
                questions: [
                    {
                        statement: "Qual pergunta define a escolha do ambiente de execução?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "O que você quer provar com essa execução?",
                                isCorrect: true,
                            },
                            {
                                text: "Qual ambiente está disponível no momento em que a suíte precisa ser executada?",
                                isCorrect: false,
                            },
                            {
                                text: "Quantos testes a suíte tem e quanto tempo cada um leva para ser concluído?",
                                isCorrect: false,
                            },
                            {
                                text: "Qual ferramenta de automação foi escolhida pela equipe no início do projeto?",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que a homologação compartilhada gera tanta falha sem defeito?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Porque outras pessoas alteram dados, versões e configurações durante a execução.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque o ambiente tem menos recursos de máquina do que o servidor de produção.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a aplicação implantada ali é compilada de forma diferente da de produção.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque as ferramentas de automação não conseguem acessar ambientes remotos.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "A suíte roda contra homologação compartilhada e é instável. O que a aula recomenda primeiro?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Mudar o ambiente antes de mexer nos testes.",
                                isCorrect: true,
                            },
                            {
                                text: "Refatorar os testes para eliminar as esperas frágeis existentes na suíte atual.",
                                isCorrect: false,
                            },
                            {
                                text: "Aumentar o número de tentativas automáticas para absorver as falhas do ambiente.",
                                isCorrect: false,
                            },
                            {
                                text: "Reduzir a quantidade de testes até que a instabilidade fique em nível aceitável.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que faz sentido rodar em produção?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Poucas verificações de disponibilidade, como home, login e busca.",
                                isCorrect: true,
                            },
                            {
                                text: "A suíte de regressão completa, garantindo que o ambiente real está funcionando.",
                                isCorrect: false,
                            },
                            {
                                text: "Os testes de fluxo de compra, já que são os mais críticos para o negócio da empresa.",
                                isCorrect: false,
                            },
                            {
                                text: "Os testes que falharam em homologação, para confirmar se o defeito é real ou não.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a forma mais simples de fazer a mesma suíte rodar em ambientes diferentes?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Variável de ambiente definindo a URL base da aplicação.",
                                isCorrect: true,
                            },
                            {
                                text: "Um arquivo de configuração separado para cada ambiente, versionado no repositório.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma cópia da suíte para cada ambiente, ajustada às particularidades de cada um.",
                                isCorrect: false,
                            },
                            {
                                text: "Um parâmetro passado em cada teste, indicando contra qual ambiente ele deve rodar.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Quando a suíte fica lenta demais",
                blocks: [
                    {
                        type: "text",
                        value: "## O problema que chega sem avisar\n\nA suíte começa com cinco minutos. Ninguém reclama. Vira dez, quinze, vinte e cinco. Um dia alguém comenta que o pipeline está demorando, e a partir daí o time começa a evitá-lo: mergeia sem esperar, desativa em pull requests pequenos, roda só à noite.\n\nA suíte não parou de funcionar; parou de ser usada. E uma suíte que não roda no momento certo não protege ninguém.",
                    },
                    {
                        type: "text",
                        value: "## Onde o tempo é gasto\n\nAntes de otimizar, meça. As duas ferramentas reportam a duração por teste, e a distribuição costuma surpreender: alguns poucos testes normalmente respondem por boa parte do tempo total.\n\nAs causas mais comuns, em ordem de impacto:\n\n**Preparação pela interface.** Cada teste fazendo login e montando estado pela tela. É quase sempre a maior fatia, e a mais fácil de resolver com preparação por API.\n\n**Esperas fixas.** Pausas espalhadas pela suíte. Trinta ocorrências de três segundos são um minuto e meio de espera pura.\n\n**Testes que não deveriam ser E2E.** Variações de regra sendo exercitadas pela tela.\n\n**Sem paralelismo.** Rodar em sequência o que poderia rodar em quatro processos.\n\n**Aplicação lenta no ambiente de teste.** Às vezes o problema não é o teste: é o ambiente com poucos recursos ou o banco sem índice.",
                    },
                    {
                        type: "table",
                        value: '[["Ação", "Ganho típico", "Esforço"], ["Preparar por API em vez da interface", "Muito alto", "Médio"], ["Remover esperas fixas", "Alto", "Baixo"], ["Ligar o paralelismo", "Alto", "Baixo, se os testes forem independentes"], ["Mover testes para níveis mais baratos", "Alto e permanente", "Alto"], ["Distribuir entre máquinas", "Proporcional ao número de máquinas", "Médio"], ["Rodar só o crítico no PR", "Alto no feedback", "Baixo"]]',
                    },
                    {
                        type: "quote",
                        value: "A pergunta que reorienta a discussão: **quanto tempo o time aceita esperar por feedback num pull request?** Se a resposta é dez minutos, esse é o orçamento, e a suíte precisa caber nele. O que não couber roda em outro momento, não deixa de existir.",
                    },
                    {
                        type: "text",
                        value: "## A estratégia em camadas\n\nA saída que funciona não é ter uma suíte, e sim organizar a execução em momentos diferentes:\n\n**A cada push, em segundos**: testes de unidade e de componente. Não são E2E, mas são o que dá o feedback mais rápido.\n\n**A cada pull request, em minutos**: os testes E2E críticos, marcados por etiqueta. Cinco a quinze cenários que provam que o essencial funciona.\n\n**Ao integrar na branch principal**: a suíte E2E completa.\n\n**De madrugada**: a suíte completa em vários navegadores, mais os testes lentos, os visuais e os de acessibilidade.\n\n**Continuamente, em produção**: o smoke de disponibilidade.\n\nAssim ninguém espera trinta minutos por um ajuste de texto, e a cobertura completa continua acontecendo todo dia.",
                    },
                    {
                        type: "text",
                        value: '## O que não fazer\n\nDuas saídas tentadoras que pioram a situação:\n\n**Aumentar o tempo limite para "resolver" lentidão.** Isso não acelera nada, só adia a falha e faz cada erro custar mais tempo.\n\n**Desligar testes que estão incomodando, sem critério.** Se um teste é lento mas cobre um fluxo crítico, o certo é torná-lo mais rápido, não removê-lo. Se ele é lento e cobre algo que outro nível cobriria melhor, aí sim ele deve sair, mas com a verificação recriada no lugar certo.\n\nA pergunta que separa os dois casos: **o que eu perco de proteção se este teste sumir?** Se a resposta for "nada, porque a mesma coisa é verificada no nível de API", pode sair sem culpa.',
                    },
                ],
                questions: [
                    {
                        statement: "O que acontece com uma suíte que fica lenta demais?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Ela não para de funcionar, mas para de ser usada no momento certo.",
                                isCorrect: true,
                            },
                            {
                                text: "Ela passa a apresentar falhas por timeout em quase todos os cenários executados.",
                                isCorrect: false,
                            },
                            {
                                text: "Ela deixa de gerar evidências úteis por causa do volume de dados acumulado.",
                                isCorrect: false,
                            },
                            {
                                text: "Ela precisa ser reescrita do zero com uma ferramenta mais rápida disponível.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual costuma ser a maior fatia do tempo em suítes E2E lentas?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "A preparação de estado feita pela interface, incluindo o login.",
                                isCorrect: true,
                            },
                            {
                                text: "A execução das asserções, que precisam consultar o DOM repetidas vezes.",
                                isCorrect: false,
                            },
                            {
                                text: "O carregamento inicial do navegador antes de cada cenário ser executado.",
                                isCorrect: false,
                            },
                            {
                                text: "A geração das evidências em vídeo durante a execução de cada teste da suíte.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual pergunta a aula propõe para definir o orçamento de tempo da suíte?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Quanto tempo o time aceita esperar por feedback num pull request?",
                                isCorrect: true,
                            },
                            {
                                text: "Quantos testes a suíte precisa ter para cobrir todos os fluxos do produto?",
                                isCorrect: false,
                            },
                            {
                                text: "Quantas máquinas o servidor de integração disponibiliza para cada execução?",
                                isCorrect: false,
                            },
                            {
                                text: "Qual é a duração média das suítes E2E em projetos parecidos do mercado?",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Na estratégia em camadas, o que roda a cada pull request?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Os testes E2E críticos, marcados por etiqueta.",
                                isCorrect: true,
                            },
                            {
                                text: "A suíte E2E completa, em todos os navegadores suportados oficialmente pelo produto.",
                                isCorrect: false,
                            },
                            {
                                text: "Apenas os testes de unidade e de componente, que dão o feedback mais rápido.",
                                isCorrect: false,
                            },
                            {
                                text: "O smoke de disponibilidade executado contra o ambiente de produção da aplicação.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual pergunta ajuda a decidir se um teste lento pode ser removido?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "O que eu perco de proteção se este teste sumir?",
                                isCorrect: true,
                            },
                            {
                                text: "Quanto tempo de execução seria economizado com a remoção desse cenário?",
                                isCorrect: false,
                            },
                            {
                                text: "Quantas vezes esse teste falhou nas últimas execuções feitas pelo pipeline?",
                                isCorrect: false,
                            },
                            {
                                text: "Esse teste foi escrito antes ou depois da última refatoração feita na suíte?",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 7 - Além do fluxo funcional",
        aulas: [
            {
                titulo: "Testando API pela própria ferramenta",
                blocks: [
                    {
                        type: "text",
                        value: "## Sem abrir o navegador\n\nCypress e Playwright não servem só para clicar em tela. As duas fazem requisições HTTP diretas, e isso abre uma possibilidade excelente: **testar a API na mesma ferramenta, no mesmo repositório e no mesmo pipeline** que os testes de interface.\n\nO ganho é grande. A camada de API é a de melhor retorno da pirâmide: roda em segundos, não depende de layout, cobre regra de negócio de ponta a ponta e falha apontando o campo exato. Poder escrever esses testes sem adotar outra ferramenta remove a principal barreira para tê-los.",
                    },
                    {
                        type: "code",
                        value: "// Playwright: teste de API puro, sem navegador\nimport { test, expect } from '@playwright/test'\n\ntest.describe('POST /api/pedidos', () => {\n  test('cria o pedido e devolve 201', async ({ request }) => {\n    const resposta = await request.post('/api/pedidos', {\n      data: { sku: 'SKU-4471', quantidade: 2 },\n    })\n\n    expect(resposta.status()).toBe(201)\n    const pedido = await resposta.json()\n    expect(pedido).toMatchObject({ status: 'aguardando_pagamento', quantidade: 2 })\n    expect(pedido.id).toBeTruthy()\n  })\n\n  test('recusa quantidade zero com 422', async ({ request }) => {\n    const resposta = await request.post('/api/pedidos', {\n      data: { sku: 'SKU-4471', quantidade: 0 },\n    })\n\n    expect(resposta.status()).toBe(422)\n    expect((await resposta.json()).erro).toBe('quantidade_invalida')\n  })\n})",
                    },
                    {
                        type: "code",
                        value: "// Cypress\ndescribe('POST /api/pedidos', () => {\n  it('recusa cupom expirado com 422', () => {\n    cy.request({\n      method: 'POST',\n      url: '/api/carrinho/cupom',\n      body: { codigo: 'PROMO10' },\n      failOnStatusCode: false,          // sem isso, o Cypress falha em status de erro\n    }).then(({ status, body }) => {\n      expect(status).to.eq(422)\n      expect(body.mensagem).to.eq('Cupom expirado')\n    })\n  })\n})",
                    },
                    {
                        type: "text",
                        value: "## O que mover para a camada de API\n\nVolte à lista do módulo 5, do que não deveria estar no E2E. Boa parte dela tem endereço certo aqui:\n\n- **As trinta combinações da regra de frete**: trinta testes de API, cada um em milissegundos.\n- **Todos os caminhos de erro**: 400, 401, 403, 404, 409, 422. Rápidos de escrever e de executar.\n- **Permissões**: cada perfil batendo em cada rota, verificando quem pode e quem não pode.\n- **Validação de entrada**: campo faltando, tipo errado, valor fora da faixa.\n- **Contrato**: os campos que a resposta precisa ter, e o formato de cada um.\n\nE fica no E2E apenas **um** cenário representativo, que prova que a tela está ligada a essa API.",
                    },
                    {
                        type: "table",
                        value: '[["Verificação", "No E2E", "Na API", "Diferença de tempo"], ["Regra de frete, 12 combinações", "6 minutos", "2 segundos", "Cerca de 180 vezes"], ["Permissão de 4 perfis em 10 rotas", "Inviável", "Poucos segundos", "Ordem de grandeza"], ["Erro 500 tratado na tela", "1 teste com mock", "Não se aplica", "Cada um no seu lugar"], ["Fluxo de compra completo", "1 teste", "Não prova a ligação", "Só o E2E resolve"]]',
                    },
                    {
                        type: "quote",
                        value: "Um caminho prático para times que sofrem com suíte E2E gigante: em vez de tentar consertar os duzentos testes de interface, **escreva os testes de API que cobrem as mesmas regras** e depois apague os testes de tela que ficaram redundantes. A cobertura permanece e a suíte encolhe de horas para minutos.",
                    },
                    {
                        type: "text",
                        value: "## Um detalhe que engana\n\nUm teste que usa `request` no Playwright ou `cy.request` no Cypress **não passa pelo navegador**. Isso quer dizer que ele não carrega cookies da sessão do navegador automaticamente, e que qualquer lógica que a aplicação faz no front (montar cabeçalho, assinar requisição, converter formato) **não acontece**.\n\nNa prática: se a sua API exige um cabeçalho de autenticação, o teste precisa obtê-lo e enviá-lo explicitamente. Não é um problema, mas é uma fonte comum de confusão para quem está começando, porque o mesmo endpoint que funciona no navegador devolve 401 no teste.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Qual é o principal ganho de testar API na mesma ferramenta do E2E?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Ter a camada de melhor retorno sem adotar outra ferramenta e outro pipeline.",
                                isCorrect: true,
                            },
                            {
                                text: "Reduzir a quantidade de testes de interface exigidos pela equipe de qualidade.",
                                isCorrect: false,
                            },
                            {
                                text: "Garantir que o navegador execute as requisições exatamente como quem usa faria.",
                                isCorrect: false,
                            },
                            {
                                text: "Permitir que os testes de API sejam gravados automaticamente pela ferramenta.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Onde devem ficar as verificações de permissão de cada perfil em cada rota?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Na camada de API, que executa em segundos.",
                                isCorrect: true,
                            },
                            {
                                text: "No E2E, porque só ele reproduz a experiência real de cada perfil na interface.",
                                isCorrect: false,
                            },
                            {
                                text: "No teste de unidade, isolando a função que decide se o acesso é permitido.",
                                isCorrect: false,
                            },
                            {
                                text: "No teste visual, comparando as telas que cada perfil consegue visualizar no sistema.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual caminho a aula sugere para times com suíte E2E gigante?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Escrever os testes de API equivalentes e depois apagar os de tela redundantes.",
                                isCorrect: true,
                            },
                            {
                                text: "Aumentar o paralelismo até que o tempo total de execução fique aceitável no CI.",
                                isCorrect: false,
                            },
                            {
                                text: "Migrar toda a suíte para uma ferramenta mais rápida e reescrever os cenários.",
                                isCorrect: false,
                            },
                            {
                                text: "Dividir a suíte em grupos e executar apenas um grupo por dia da semana.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O que acontece quando um teste usa request em vez do navegador?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Ele não carrega os cookies do navegador nem executa a lógica do front.",
                                isCorrect: true,
                            },
                            {
                                text: "Ele executa mais devagar porque precisa estabelecer uma conexão HTTP nova.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele deixa de gerar evidências, já que não existe tela para ser capturada.",
                                isCorrect: false,
                            },
                            {
                                text: "Ele passa a depender da mesma espera automática usada nos comandos de interface.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O mesmo endpoint funciona no navegador e devolve 401 no teste de API. Qual é a causa provável?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "O teste não está enviando o cabeçalho de autenticação que o front monta.",
                                isCorrect: true,
                            },
                            {
                                text: "A rota exige que a requisição venha de um navegador com sessão ativa aberta.",
                                isCorrect: false,
                            },
                            {
                                text: "O ambiente de teste bloqueia requisições feitas fora do contexto do navegador.",
                                isCorrect: false,
                            },
                            {
                                text: "A ferramenta precisa ser configurada para aceitar respostas com status de erro.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Acessibilidade automatizada",
                blocks: [
                    {
                        type: "text",
                        value: "## Uma camada que pega muito com pouco\n\nAcessibilidade digital não é opcional: no Brasil, a Lei Brasileira de Inclusão exige que serviços digitais sejam utilizáveis por pessoas com deficiência. E, na prática, é uma das áreas menos verificadas nos times de produto.\n\nA boa notícia é que uma parte relevante dos problemas de acessibilidade é **detectável automaticamente**, e integrar essa verificação a uma suíte E2E que já existe custa pouco.",
                    },
                    {
                        type: "code",
                        value: "// Playwright com axe\nimport AxeBuilder from '@axe-core/playwright'\n\ntest('a página de checkout não tem violações de acessibilidade', async ({ page }) => {\n  await page.goto('/checkout')\n\n  const resultado = await new AxeBuilder({ page })\n    .withTags(['wcag2a', 'wcag2aa'])\n    .analyze()\n\n  expect(resultado.violations).toEqual([])\n})\n\n// Cypress com cypress-axe\nit('a página inicial é acessível', () => {\n  cy.visit('/')\n  cy.injectAxe()\n  cy.checkA11y(null, { runOnly: ['wcag2a', 'wcag2aa'] })\n})",
                    },
                    {
                        type: "text",
                        value: '## O que a automação encontra\n\nAs ferramentas de verificação automática (o axe é a mais usada) detectam bem os problemas objetivos:\n\n- **Contraste insuficiente** entre texto e fundo.\n- **Imagem sem texto alternativo.**\n- **Campo sem rótulo associado**, o que deixa o leitor de tela anunciar "campo de edição" sem dizer do quê.\n- **Botão sem nome acessível**, muito comum em botões que só têm um ícone.\n- **Hierarquia de títulos quebrada**, pulando de h1 para h4.\n- **Atributos ARIA inválidos** ou usados de forma contraditória.\n- **Idioma da página não declarado.**',
                    },
                    {
                        type: "text",
                        value: '## O que ela não encontra\n\nAqui está o limite, e é importante conhecê-lo para não criar falsa sensação de segurança. Estudos consistentes apontam que a verificação automática encontra em torno de **um terço** dos problemas reais de acessibilidade. O resto exige julgamento humano:\n\n- A **ordem de navegação por teclado** faz sentido? Dá para completar a compra sem mouse?\n- O **texto alternativo** descreve a imagem de forma útil, ou diz apenas "imagem1.png"?\n- O **foco fica visível** enquanto se navega por teclado?\n- Ao abrir um modal, o **foco vai para dentro dele** e fica preso lá até fechar?\n- Uma mudança dinâmica na tela é **anunciada** para quem não a vê?\n- A informação depende **só da cor** para ser compreendida?',
                    },
                    {
                        type: "table",
                        value: '[["Verificação", "Automática?", "Como fazer"], ["Contraste de cor", "Sim", "axe na suíte E2E"], ["Imagem sem alt", "Sim", "axe na suíte E2E"], ["Campo sem rótulo", "Sim", "axe na suíte E2E"], ["Navegar o fluxo só por teclado", "Parcial", "Teste E2E navegando por Tab"], ["Alt descreve bem a imagem", "Não", "Revisão humana"], ["Leitor de tela anuncia direito", "Não", "Teste manual com leitor"]]',
                    },
                    {
                        type: "quote",
                        value: "Um teste E2E que você já tem pode virar teste de acessibilidade quase de graça: se ele usa seletores por **papel e nome acessível**, ele já está exercitando a mesma estrutura que uma tecnologia assistiva usaria. Seletor semântico é acessibilidade testada sem custo extra.",
                    },
                    {
                        type: "text",
                        value: "## Navegação por teclado no E2E\n\nUm cenário que vale automatizar e quase ninguém escreve: completar um fluxo importante usando **apenas o teclado**. Ele pega problemas que o axe não vê, como um elemento que não recebe foco ou uma ordem de tabulação sem sentido.",
                    },
                    {
                        type: "code",
                        value: "test('dá para concluir o login só com o teclado', async ({ page }) => {\n  await page.goto('/login')\n\n  await page.keyboard.press('Tab')\n  await expect(page.getByLabel('Email')).toBeFocused()\n  await page.keyboard.type('maria@exemplo.com')\n\n  await page.keyboard.press('Tab')\n  await expect(page.getByLabel('Senha')).toBeFocused()\n  await page.keyboard.type('Senha@2026')\n\n  await page.keyboard.press('Tab')\n  await expect(page.getByRole('button', { name: 'Entrar' })).toBeFocused()\n  await page.keyboard.press('Enter')\n\n  await expect(page).toHaveURL('/inicio')\n})",
                    },
                ],
                questions: [
                    {
                        statement:
                            "Aproximadamente que parcela dos problemas de acessibilidade a verificação automática encontra?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Cerca de um terço.",
                                isCorrect: true,
                            },
                            {
                                text: "Praticamente todos, desde que as regras corretas sejam configuradas na ferramenta.",
                                isCorrect: false,
                            },
                            {
                                text: "Menos de cinco por cento, já que quase tudo depende de julgamento humano.",
                                isCorrect: false,
                            },
                            {
                                text: "Cerca de noventa por cento, restando apenas casos raros para verificação manual.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual problema o axe detecta automaticamente?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Contraste insuficiente entre texto e fundo.",
                                isCorrect: true,
                            },
                            {
                                text: "Ordem de navegação por teclado que não faz sentido para quem usa o sistema.",
                                isCorrect: false,
                            },
                            {
                                text: "Texto alternativo que existe mas não descreve a imagem de forma útil.",
                                isCorrect: false,
                            },
                            {
                                text: "Mudança dinâmica na tela que não é anunciada para quem não enxerga o conteúdo.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que seletores por papel e nome acessível já testam acessibilidade?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Porque exercitam a mesma estrutura que uma tecnologia assistiva usaria.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque as ferramentas executam a verificação do axe automaticamente nesses casos.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque esses seletores só funcionam em páginas que seguem as normas de acessibilidade.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque eles verificam o contraste dos elementos antes de interagir com a página.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual cenário automatizável pega problemas que o axe não vê?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Completar um fluxo importante usando apenas o teclado.",
                                isCorrect: true,
                            },
                            {
                                text: "Verificar o contraste de todos os elementos presentes em cada uma das telas.",
                                isCorrect: false,
                            },
                            {
                                text: "Conferir se todas as imagens da aplicação possuem texto alternativo definido.",
                                isCorrect: false,
                            },
                            {
                                text: "Checar se a hierarquia de títulos da página segue a ordem correta dos níveis.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que conhecer o limite da verificação automática é importante?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Para não criar falsa sensação de segurança sobre a acessibilidade do produto.",
                                isCorrect: true,
                            },
                            {
                                text: "Para justificar a contratação de ferramentas pagas de auditoria de acessibilidade.",
                                isCorrect: false,
                            },
                            {
                                text: "Para decidir quais páginas devem ser verificadas e quais podem ficar de fora.",
                                isCorrect: false,
                            },
                            {
                                text: "Para configurar corretamente quais regras a ferramenta deve executar na suíte.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Teste visual e comparação de tela",
                blocks: [
                    {
                        type: "text",
                        value: "## O que o E2E funcional não vê\n\nUm teste E2E verifica comportamento: o botão existe, o clique funciona, o total está certo. Ele passa tranquilamente se o botão estiver branco sobre branco, se o texto vazar da caixa ou se o rodapé cobrir metade da tela.\n\nO **teste visual** (ou de regressão visual) preenche essa lacuna: ele tira uma imagem da tela e compara com uma imagem aprovada anteriormente. Se houver diferença acima de um limite, o teste falha e mostra as duas versões lado a lado com as diferenças destacadas.",
                    },
                    {
                        type: "code",
                        value: "// Playwright: comparação de imagem nativa\ntest('a página de checkout não mudou visualmente', async ({ page }) => {\n  await page.goto('/checkout')\n  await expect(page).toHaveScreenshot('checkout.png', { maxDiffPixelRatio: 0.01 })\n})\n\n// Só um componente, o que é bem mais estável\nawait expect(page.getByTestId('resumo-pedido')).toHaveScreenshot('resumo.png')\n\n// Ignorando áreas que mudam sempre\nawait expect(page).toHaveScreenshot('painel.png', {\n  mask: [page.getByTestId('data-atual'), page.getByTestId('grafico')],\n})",
                    },
                    {
                        type: "text",
                        value: "## O grande problema: a instabilidade visual\n\nComparação de pixel é sensível a coisas que não são defeito:\n\n- **Fontes** renderizam diferente em sistemas operacionais diferentes. Uma imagem gerada no macOS quase nunca bate com a do Linux do CI.\n- **Dados dinâmicos**: data de hoje, nome do usuário, valores aleatórios, gráficos.\n- **Animações** capturadas no meio.\n- **Rolagem e tamanho de janela** ligeiramente diferentes.\n- **Antialiasing** e versão do navegador.\n\nSem cuidado, o teste visual vira a coisa mais instável da suíte, e times abandonam a prática nas primeiras semanas.",
                    },
                    {
                        type: "table",
                        value: '[["Cuidado", "Efeito"], ["Gerar as imagens de referência no mesmo ambiente do CI", "Elimina a diferença de fonte e de renderização"], ["Mascarar áreas dinâmicas", "Remove data, gráfico e valor aleatório da comparação"], ["Desligar animações", "Evita capturar o meio de uma transição"], ["Fixar o tamanho da janela", "Mantém o mesmo enquadramento"], ["Comparar componente em vez da página", "Reduz a área e a chance de ruído"], ["Definir um limite de diferença", "Tolera antialiasing sem perder mudança real"]]',
                    },
                    {
                        type: "quote",
                        value: "A regra que salva a prática: **gere as imagens de referência no mesmo ambiente em que a comparação vai rodar**. Referência gerada na máquina de alguém e comparada no contêiner do CI vai falhar por diferença de fonte, e a equipe vai concluir, erradamente, que teste visual não funciona.",
                    },
                    {
                        type: "text",
                        value: "## O fluxo de aprovação\n\nTeste visual tem uma particularidade: quando a interface muda de propósito, o teste falha **corretamente**. Isso significa que existe um passo humano no processo: alguém olha a diferença e decide se é defeito ou se é a mudança esperada. Se for esperada, a nova imagem vira a referência.",
                    },
                    {
                        type: "code",
                        value: "# Playwright: atualizar as referências depois de revisar as diferenças\nnpx playwright test --update-snapshots",
                    },
                    {
                        type: "text",
                        value: "## Quando vale a pena\n\nO teste visual não é para todo mundo, e vale ser honesto sobre isso.\n\n**Vale muito**: em bibliotecas de componentes e design systems, onde a aparência **é** o produto e a mudança precisa ser controlada; em telas de alto tráfego, onde uma quebra visual custa caro; e em produtos com muitas variações (temas, idiomas, tamanhos de tela).\n\n**Não vale**: em produtos que ainda estão mudando de layout toda semana, onde cada sprint exigiria reaprovar dezenas de imagens; e em telas cheias de dado dinâmico, onde mascarar tudo deixa pouca coisa para comparar.\n\nUm bom ponto de partida, e o mais barato: comparar **componentes isolados**, e não páginas inteiras. Área menor, menos ruído, e a falha aponta o componente exato que mudou.",
                    },
                ],
                questions: [
                    {
                        statement:
                            "O que o teste visual verifica que o E2E funcional não verifica?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "A aparência da tela, comparando com uma imagem aprovada antes.",
                                isCorrect: true,
                            },
                            {
                                text: "O comportamento dos elementos quando o usuário interage com a interface.",
                                isCorrect: false,
                            },
                            {
                                text: "A resposta das requisições feitas pela aplicação durante o carregamento da tela.",
                                isCorrect: false,
                            },
                            {
                                text: "O tempo que a página leva para ficar disponível para interação do usuário.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Por que uma imagem de referência gerada no macOS costuma falhar no CI em Linux?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Porque as fontes renderizam de forma diferente em cada sistema operacional.",
                                isCorrect: true,
                            },
                            {
                                text: "Porque o tamanho da janela do navegador é definido pelo sistema operacional.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque a ferramenta comprime as imagens de forma diferente em cada plataforma.",
                                isCorrect: false,
                            },
                            {
                                text: "Porque o Linux do servidor executa uma versão mais antiga do mesmo navegador.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a regra que a aula considera essencial para o teste visual funcionar?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Gerar as referências no mesmo ambiente em que a comparação vai rodar.",
                                isCorrect: true,
                            },
                            {
                                text: "Comparar sempre páginas inteiras para não deixar nenhuma área sem verificação.",
                                isCorrect: false,
                            },
                            {
                                text: "Definir um limite de diferença alto o suficiente para tolerar qualquer variação.",
                                isCorrect: false,
                            },
                            {
                                text: "Executar a comparação apenas nos navegadores baseados no motor Chromium.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "O que acontece quando a interface muda de propósito em um projeto com teste visual?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O teste falha corretamente e alguém precisa revisar e aprovar a nova imagem.",
                                isCorrect: true,
                            },
                            {
                                text: "A ferramenta atualiza a referência automaticamente ao detectar a mudança.",
                                isCorrect: false,
                            },
                            {
                                text: "O teste continua passando porque o limite de diferença absorve a alteração feita.",
                                isCorrect: false,
                            },
                            {
                                text: "O teste precisa ser reescrito, já que a referência antiga não pode ser substituída.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é o ponto de partida mais barato para teste visual, segundo a aula?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Comparar componentes isolados em vez de páginas inteiras.",
                                isCorrect: true,
                            },
                            {
                                text: "Comparar as páginas mais acessadas do produto em uma única resolução de tela.",
                                isCorrect: false,
                            },
                            {
                                text: "Comparar todas as telas do sistema com um limite de diferença bem tolerante.",
                                isCorrect: false,
                            },
                            {
                                text: "Comparar apenas as telas que passaram por alteração na sprint mais recente.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Testes de componente",
                blocks: [
                    {
                        type: "text",
                        value: "## A camada entre a unidade e o E2E\n\nExiste um tipo de teste que fica exatamente no meio do caminho e que resolve muita coisa que hoje acaba no E2E: o **teste de componente**.\n\nEle monta **um único componente de interface** isolado, num navegador de verdade, sem subir a aplicação inteira, sem backend e sem rotas. Você entrega as propriedades, interage com ele e verifica o resultado.\n\nÉ um navegador real (então o CSS e os eventos funcionam de verdade, ao contrário dos testes de unidade de interface que rodam num DOM simulado), mas sem o custo de montar o sistema completo.",
                    },
                    {
                        type: "code",
                        value: "// Playwright Component Testing\nimport { test, expect } from '@playwright/experimental-ct-react'\nimport { CampoCupom } from '../src/components/CampoCupom'\n\ntest('mostra a mensagem de erro quando o cupom é recusado', async ({ mount }) => {\n  const componente = await mount(\n    <CampoCupom aoAplicar={async () => ({ ok: false, mensagem: 'Cupom expirado' })} />,\n  )\n\n  await componente.getByLabel('Cupom').fill('PROMO10')\n  await componente.getByRole('button', { name: 'Aplicar' }).click()\n\n  await expect(componente.getByRole('alert')).toHaveText('Cupom expirado')\n})",
                    },
                    {
                        type: "code",
                        value: "// Cypress Component Testing\nimport { CampoCupom } from '../src/components/CampoCupom'\n\nit('desabilita o botão enquanto está aplicando', () => {\n  cy.mount(<CampoCupom aoAplicar={() => new Promise(() => {})} />)\n\n  cy.get('[data-testid=\"cupom\"]').type('PROMO10')\n  cy.contains('button', 'Aplicar').click()\n  cy.contains('button', 'Aplicando').should('be.disabled')\n})",
                    },
                    {
                        type: "table",
                        value: '[["", "Unidade de interface", "Componente", "E2E"], ["Onde roda", "DOM simulado", "Navegador real", "Navegador real"], ["O que monta", "O componente, sem estilo real", "O componente isolado", "A aplicação inteira"], ["Precisa de backend?", "Não", "Não", "Sim"], ["Verifica CSS de verdade?", "Não", "Sim", "Sim"], ["Velocidade", "Muito rápida", "Rápida", "Lenta"]]',
                    },
                    {
                        type: "text",
                        value: "## O que migrar para essa camada\n\nGrande parte do que incha uma suíte E2E cabe muito melhor aqui:\n\n- **Estados visuais de um componente**: carregando, erro, vazio, desabilitado, sucesso.\n- **Validação de formulário campo a campo**: obrigatório, formato, tamanho, mensagem de cada caso.\n- **Comportamento de interação**: menu que abre e fecha, campo que mostra sugestões, componente que desabilita durante o envio.\n- **Variações de propriedade**: o mesmo componente com dez configurações diferentes.\n\nCada um desses no E2E significa montar o sistema, autenticar, navegar até a tela e provocar o estado. No teste de componente, você entrega o estado direto como propriedade e verifica em segundos.",
                    },
                    {
                        type: "quote",
                        value: "Se o seu teste E2E existe para verificar **como um componente se comporta**, e não **se o sistema está ligado de ponta a ponta**, ele está na camada errada. Teste de componente entrega a mesma verificação com uma fração do custo e da fragilidade.",
                    },
                    {
                        type: "text",
                        value: "## Onde essa camada não chega\n\nTeste de componente não substitui E2E, porque ele por definição não verifica a integração: as rotas de verdade, a resposta real da API, o estado global compartilhado entre telas, a navegação entre páginas.\n\nO desenho saudável para uma aplicação web moderna combina as camadas assim: **unidade** para as regras puras, **componente** para o comportamento de interface, **API** para contratos e regras de ponta a ponta no servidor, e **E2E** para provar que os fluxos críticos estão ligados. Cada verificação no lugar mais barato que consegue fazê-la, que é exatamente a regra da pirâmide.",
                    },
                ],
                questions: [
                    {
                        statement: "O que caracteriza um teste de componente?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Monta um componente isolado em navegador real, sem a aplicação inteira.",
                                isCorrect: true,
                            },
                            {
                                text: "Executa a aplicação completa e verifica o comportamento de uma tela específica.",
                                isCorrect: false,
                            },
                            {
                                text: "Verifica uma função isolada do código sem envolver nenhum elemento de interface.",
                                isCorrect: false,
                            },
                            {
                                text: "Compara a aparência do componente com uma imagem de referência aprovada antes.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual é a diferença entre teste de componente e teste de unidade de interface?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O de componente roda em navegador real, então CSS e eventos funcionam de verdade.",
                                isCorrect: true,
                            },
                            {
                                text: "O de componente exige backend disponível para responder às requisições da tela.",
                                isCorrect: false,
                            },
                            {
                                text: "O de componente verifica várias telas ao mesmo tempo dentro de um único cenário.",
                                isCorrect: false,
                            },
                            {
                                text: "O de componente é executado apenas no pipeline, e nunca na máquina de quem programa.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Qual verificação cabe melhor no teste de componente do que no E2E?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Os estados visuais de um componente, como carregando, erro e vazio.",
                                isCorrect: true,
                            },
                            {
                                text: "A ligação entre a tela de checkout e a rota que cria o pedido no servidor.",
                                isCorrect: false,
                            },
                            {
                                text: "O fluxo completo de compra, do login até a confirmação enviada por email.",
                                isCorrect: false,
                            },
                            {
                                text: "A navegação entre páginas diferentes durante o preenchimento de um cadastro.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual pergunta indica que um teste E2E está na camada errada?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Ele existe para verificar como um componente se comporta?",
                                isCorrect: true,
                            },
                            {
                                text: "Ele leva mais de trinta segundos para ser executado no ambiente de integração?",
                                isCorrect: false,
                            },
                            {
                                text: "Ele precisa de dados preparados antes de o cenário começar a ser executado?",
                                isCorrect: false,
                            },
                            {
                                text: "Ele usa seletores por atributo de teste em vez de papel e nome acessível?",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "O que o teste de componente não consegue verificar?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "A integração real: rotas, resposta da API e navegação entre páginas.",
                                isCorrect: true,
                            },
                            {
                                text: "O comportamento do CSS aplicado ao componente durante as interações realizadas.",
                                isCorrect: false,
                            },
                            {
                                text: "Os eventos de clique e digitação disparados sobre os elementos do componente.",
                                isCorrect: false,
                            },
                            {
                                text: "As variações de propriedade que alteram o estado apresentado pelo componente.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
            {
                titulo: "Sua suíte E2E saudável",
                blocks: [
                    {
                        type: "text",
                        value: "## O que você construiu\n\nSete módulos atrás, teste E2E provavelmente parecia um script que clica em botões. Agora você tem um conjunto de decisões:\n\n- **O que é e o que custa**: o E2E prova que o produto funciona de verdade, e é o teste mais lento, frágil e caro de investigar. Ele é para os fluxos que, se quebrarem, param o negócio.\n- **Ferramentas**: Cypress e Playwright, o que muda entre elas e o muito que não muda.\n- **Seletores**: papel e nome acessível primeiro, atributo de teste quando falta semântica, nunca posição no DOM.\n- **Espera**: por condição, jamais por tempo. A pausa fixa é lenta quando dá certo e curta quando dá errado.\n- **Rede e estado**: interceptar para observar, simular só as bordas, autenticar por atalho, preparar dados pela API e isolar cada teste com dado único.\n- **Organização**: Page Objects sem exagero, arquivos por funcionalidade, etiquetas para separar o que roda quando, e uma lista clara do que não deve estar no E2E.\n- **Pipeline**: rodar no CI com evidência, paralelizar quando os testes forem independentes, escolher bem o ambiente e manter a suíte dentro de um orçamento de tempo.\n- **Além do funcional**: API na mesma ferramenta, acessibilidade automatizada, teste visual com cuidado e teste de componente para aliviar o topo.",
                    },
                    {
                        type: "quote",
                        value: "Se levar uma frase desta trilha, que seja esta: **uma suíte E2E enxuta em que o time confia protege infinitamente mais do que uma suíte grande que ninguém investiga.** Todo o resto é consequência disso.",
                    },
                    {
                        type: "text",
                        value: '## O checklist de uma suíte saudável\n\nUm resumo prático para avaliar a sua, ou a do seu time:\n\n- Quando um teste falha, alguém **para e olha**, em vez de reexecutar.\n- Os testes rodam **em qualquer ordem**, sozinhos e em paralelo.\n- Cada teste **cria o que precisa** e não depende de dado que "sempre esteve lá".\n- Não existe **pausa fixa** no código.\n- Os seletores descrevem **o que o elemento é**, e não onde ele está.\n- O login acontece **uma vez** pela interface, e por atalho nos demais.\n- A suíte crítica cabe no **orçamento de tempo** do pull request.\n- Toda falha deixa **evidência** suficiente para investigar sem reproduzir à mão.\n- O que pode ser verificado mais barato **está em outra camada**.\n- Testes instáveis são tratados como **defeito**, com dono e prazo.',
                    },
                    {
                        type: "table",
                        value: '[["Sinal de suíte doente", "Sinal de suíte saudável"], ["\\"Roda de novo que passa\\"", "Falha vermelha para o time"], ["Só roda de madrugada", "Os críticos rodam em todo pull request"], ["Duzentos testes de interface", "Poucos no topo, muitos embaixo"], ["Pausas fixas espalhadas", "Espera por condição observável"], ["Todo mundo evita mexer", "Escrever um teste novo é rotina"]]',
                    },
                    {
                        type: "text",
                        value: "## Para onde ir agora\n\nTrês direções, conforme o que você quer fazer a seguir.\n\n**Aprofundar na automação.** Se a parte de código foi o que mais te interessou, o caminho é o de desenvolvimento: linguagem, estrutura de projeto, boas práticas de código. Um teste é código, e quem escreve código melhor escreve teste melhor.\n\n**Aprofundar em qualidade.** Se o que te chamou atenção foi decidir o que testar e como reduzir risco, volte às trilhas **Fundamentos de QA** (estratégia, técnicas e risco) e **Testes e Qualidade** (unidade, integração, mocks e TDD). Elas sustentam tudo o que você viu aqui.\n\n**Aprofundar em áreas vizinhas.** Desempenho, segurança de aplicação e acessibilidade são especializações com demanda alta e pouca gente disponível. Cada uma delas começa exatamente onde esta trilha encostou.\n\nE a recomendação que vale mais que as três: **pegue um produto real e escreva cinco testes**. Pode ser um projeto seu, um site aberto, o sistema do trabalho. Cinco testes escritos, rodando e mantidos ensinam mais do que qualquer material, porque só na prática aparecem o dado que expira, o seletor que quebra e a espera que faltou.",
                    },
                    {
                        type: "quote",
                        value: "Você terminou o topo da pirâmide. Daqui em diante, quando alguém propuser automatizar tudo pela interface, você vai saber exatamente o que vai acontecer e o que sugerir no lugar. Isso é o que separa quem escreve testes de quem constrói uma estratégia de testes.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a frase que resume a trilha?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Uma suíte enxuta em que o time confia protege mais do que uma grande e ignorada.",
                                isCorrect: true,
                            },
                            {
                                text: "Quanto mais cenários automatizados no topo da pirâmide, maior a proteção do produto.",
                                isCorrect: false,
                            },
                            {
                                text: "A escolha da ferramenta é o fator que mais determina a qualidade da automação.",
                                isCorrect: false,
                            },
                            {
                                text: "Todo fluxo do produto deve ter ao menos um teste de ponta a ponta correspondente.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual item faz parte do checklist de uma suíte saudável?",
                        difficulty: "facil",
                        options: [
                            {
                                text: "Cada teste cria o que precisa e não depende de dado preexistente.",
                                isCorrect: true,
                            },
                            {
                                text: "A suíte roda por completo em toda alteração enviada por qualquer pessoa do time.",
                                isCorrect: false,
                            },
                            {
                                text: "Todos os fluxos do produto possuem cobertura automatizada na camada de interface.",
                                isCorrect: false,
                            },
                            {
                                text: "As pausas fixas estão concentradas em um único arquivo de configuração do projeto.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual comportamento indica uma suíte doente?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "O time reexecuta o teste quando ele falha, em vez de investigar.",
                                isCorrect: true,
                            },
                            {
                                text: "Os testes críticos são executados a cada pull request aberto pela equipe do produto.",
                                isCorrect: false,
                            },
                            {
                                text: "As evidências de falha são gravadas automaticamente pela ferramenta configurada.",
                                isCorrect: false,
                            },
                            {
                                text: "Os seletores usados descrevem o papel do elemento em vez da posição na estrutura.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement:
                            "Quais trilhas a aula indica para quem quer aprofundar em qualidade?",
                        difficulty: "medio",
                        options: [
                            {
                                text: "Fundamentos de QA e Testes e Qualidade.",
                                isCorrect: true,
                            },
                            {
                                text: "Apenas a trilha de Testes e Qualidade, que cobre a parte prática da automação.",
                                isCorrect: false,
                            },
                            {
                                text: "As trilhas de desempenho e de segurança de aplicação, que são especializações.",
                                isCorrect: false,
                            },
                            {
                                text: "Uma trilha de linguagem de programação, já que teste automatizado também é código.",
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        statement: "Qual é a recomendação final que a aula considera mais valiosa?",
                        difficulty: "dificil",
                        options: [
                            {
                                text: "Pegar um produto real e escrever cinco testes, rodando e mantendo eles.",
                                isCorrect: true,
                            },
                            {
                                text: "Estudar a documentação completa das duas ferramentas antes de começar a praticar.",
                                isCorrect: false,
                            },
                            {
                                text: "Obter uma certificação que comprove o conhecimento adquirido durante a trilha.",
                                isCorrect: false,
                            },
                            {
                                text: "Automatizar toda a suíte de regressão manual que o time executa hoje em dia.",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

async function seed() {
    let [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        [trilha] = await db
            .insert(trails)
            .values({
                name: NOME,
                trailLevel: "intermediario",
                description: DESCRICAO,
                workloadHours: CARGA_HORARIA,
            })
            .returning();
        console.log("Trilha criada: " + trilha.name);
    }

    const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
    if (existentes.length > 0) {
        console.log("Trilha " + NOME + " já tem " + existentes.length + " aulas. Nada a fazer.");
        return;
    }

    let totalAulas = 0;
    let totalQuestoes = 0;
    for (let mi = 0; mi < MODULOS.length; mi++) {
        const m = MODULOS[mi];
        const [mod] = await db
            .insert(modules)
            .values({ trailId: trilha.id, title: m.titulo, position: mi + 1 })
            .returning();
        for (let li = 0; li < m.aulas.length; li++) {
            const a = m.aulas[li];
            const [lesson] = await db
                .insert(lessons)
                .values({
                    trailId: trilha.id,
                    moduleId: mod.id,
                    title: a.titulo,
                    content: null,
                    contentBlocks: a.blocks,
                    position: li + 1,
                    published: true,
                })
                .returning();
            for (let qi = 0; qi < a.questions.length; qi++) {
                const q = a.questions[qi];
                const [questao] = await db
                    .insert(questions)
                    .values({
                        lessonId: lesson.id,
                        statement: q.statement,
                        difficulty: q.difficulty,
                        position: qi + 1,
                    })
                    .returning();
                await db.insert(questionOptions).values(
                    q.options.map((o, k) => ({
                        questionId: questao.id,
                        text: o.text,
                        isCorrect: o.isCorrect,
                        position: k + 1,
                    })),
                );
            }
            totalAulas++;
            totalQuestoes += a.questions.length;
        }
    }
    console.log(
        "Seed concluído: " +
            MODULOS.length +
            " módulos, " +
            totalAulas +
            " aulas, " +
            totalQuestoes +
            " questões.",
    );
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
