// Seed da trilha Testes e Qualidade (intermediario), estagio 7 do roadmap de Back-end.
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-testes-qualidade.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Testes e Qualidade";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "intermediario";
const DESCRICAO =
    "Garanta que seu back-end continua correto quando o código muda: testes unitários e de integração, mocks, TDD, cobertura, testes end-to-end, e a qualidade além dos testes (lint, formatação, tipos). A rede de segurança da sua aplicação.";

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
        "titulo": "Módulo 1 - Por que testar e a pirâmide de testes",
        "aulas": [
            {
                "titulo": "O que os testes te dão (e o custo de não testar)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Por que testar (e o que custa não testar)\n\nVocê já construiu APIs com Express, modelou banco de dados, implementou autenticação com JWT e até cache com o padrão cache-aside. Seu código funciona. Mas ele vai continuar funcionando depois que alguém (você mesmo, daqui a três meses) mexer nele de novo?\n\nÉ essa pergunta que os testes automatizados respondem. Não são um extra burocrático: são a diferença entre mudar código com confiança e mudar código torcendo para não quebrar nada."
                    },
                    {
                        "type": "text",
                        "value": "## Confiança pra mudar sem medo\n\nTodo sistema em produção precisa mudar: corrigir bug, adicionar campo, trocar biblioteca, otimizar uma query lenta. Sem testes, cada mudança é um salto no escuro. Você mexe numa função do middleware de autenticação e fica se perguntando: será que ainda bloqueia token expirado? O cache-aside ainda invalida a chave certa depois da alteração?\n\nCom uma suíte de testes, essa pergunta tem resposta objetiva: roda o comando e em segundos sabe se algo quebrou. A confiança não vem de \"eu revisei com cuidado\", vem de \"o computador checou de novo, em todos os cenários que a gente já cobriu antes\"."
                    },
                    {
                        "type": "text",
                        "value": "## Pegar regressão: o que quebrou sem querer\n\nRegressão é quando uma mudança nova quebra algo que já funcionava. É o clássico consertar uma coisa e quebrar outras três sem perceber. Sem testes, regressão só aparece quando alguém, geralmente um usuário, esbarra nela em produção.\n\nUm teste automatizado funciona como uma trava: se o comportamento esperado muda sem intenção, o teste fica vermelho antes do código chegar em produção. É o que separa \"eu acho que não quebrei nada\" de \"eu sei que não quebrei nada\"."
                    },
                    {
                        "type": "text",
                        "value": "## Documentação viva\n\nTestes bem escritos também documentam como usar o código, e essa documentação não fica desatualizada: se o comportamento mudar e o teste não acompanhar, o teste quebra. Um README pode mentir depois de um tempo. Um teste que passa não mente.\n\nVeja um exemplo: uma função que valida se uma senha é forte o suficiente pro cadastro de usuário, e o teste que documenta exatamente essa regra."
                    },
                    {
                        "type": "code",
                        "value": "// src/utils/senha.js\nexport function senhaEhForte(senha) {\n  return senha.length >= 8 && /[0-9]/.test(senha) && /[A-Z]/.test(senha);\n}\n\n// src/utils/senha.test.js\nimport { describe, it, expect } from 'vitest';\nimport { senhaEhForte } from './senha.js';\n\ndescribe('senhaEhForte', () => {\n  it('aceita senha com 8+ caracteres, número e maiúscula', () => {\n    expect(senhaEhForte('Segredo123')).toBe(true);\n  });\n\n  it('rejeita senha com menos de 8 caracteres', () => {\n    expect(senhaEhForte('Ab1')).toBe(false);\n  });\n\n  it('rejeita senha sem número', () => {\n    expect(senhaEhForte('SenhaForte')).toBe(false);\n  });\n});"
                    },
                    {
                        "type": "text",
                        "value": "## O custo de não testar\n\nSem testes automatizados, três coisas acontecem, quase sempre nessa ordem:\n\n- **Medo de mexer**: o time evita refatorar ou melhorar código antigo porque ninguém tem certeza do que pode quebrar. O código \"funciona, não encosta\".\n- **Bug em produção**: o que não foi checado antes do deploy é checado depois, pelo usuário. Corrigir um bug que já afetou gente de verdade custa muito mais caro do que pegar ele antes.\n- **Testar tudo na mão, toda vez**: cada mudança pequena vira uma rodada de reteste manual em cada fluxo afetado (login, cadastro, checkout), repetindo à mão o roteiro que um script rodaria em segundos.\n\nNão testar não é economizar tempo. É empurrar o mesmo tempo pra frente, com juros."
                    },
                    {
                        "type": "quote",
                        "value": "Testes automatizados não existem pra provar que o código está perfeito. Existem pra avisar rápido quando ele deixa de fazer o que deveria."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual das opções abaixo é um benefício direto de ter uma suíte de testes automatizados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Detectar rapidamente quando uma mudança quebrou um comportamento existente",
                                "isCorrect": true
                            },
                            {
                                "text": "Eliminar por completo a necessidade de revisão de código antes do deploy",
                                "isCorrect": false
                            },
                            {
                                "text": "Garantir que o código nunca vai ter nenhum tipo de bug em produção",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir toda a documentação técnica escrita pela equipe do projeto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No contexto de testes automatizados, o que é uma regressão?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Algo que já funcionava e passou a falhar depois de uma mudança no código",
                                "isCorrect": true
                            },
                            {
                                "text": "Um teste que demora mais tempo que o esperado pra terminar de rodar",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma função do sistema que nunca foi coberta por nenhum teste automatizado",
                                "isCorrect": false
                            },
                            {
                                "text": "Um erro de sintaxe que impede o projeto de ser iniciado ou compilado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um colega diz que não precisa escrever testes porque o README já explica como cada função deve ser usada. Qual é o problema principal desse argumento?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O README pode desatualizar sem ninguém notar, mas o teste acusa a mudança",
                                "isCorrect": true
                            },
                            {
                                "text": "READMEs escritos em markdown perdem informação técnica importante do projeto",
                                "isCorrect": false
                            },
                            {
                                "text": "Testes automatizados são sempre mais rápidos de escrever do que um README completo",
                                "isCorrect": false
                            },
                            {
                                "text": "Ferramentas de teste como o Vitest não conseguem ler arquivos README do projeto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de meses sem escrever nenhum teste, o time passa a evitar mexer em partes antigas do sistema, mesmo havendo bugs claros pra corrigir. Isso ilustra diretamente qual custo de não testar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O medo de mexer no código, porque ninguém tem certeza do que pode quebrar",
                                "isCorrect": true
                            },
                            {
                                "text": "A obrigação de reescrever o sistema inteiro numa linguagem diferente",
                                "isCorrect": false
                            },
                            {
                                "text": "A necessidade de contratar mais desenvolvedores pro mesmo projeto",
                                "isCorrect": false
                            },
                            {
                                "text": "O aumento do tempo de resposta da API em produção",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dizer que testes automatizados dão confiança pra mudar o código significa, com precisão, que:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O time sabe rápido se um comportamento já coberto por teste deixou de funcionar",
                                "isCorrect": true
                            },
                            {
                                "text": "O código testado nunca mais vai precisar de correção depois de ir pra produção",
                                "isCorrect": false
                            },
                            {
                                "text": "Toda mudança futura no sistema passa a dispensar qualquer revisão humana",
                                "isCorrect": false
                            },
                            {
                                "text": "A cobertura de testes garante que não existe bug em nenhuma parte do sistema",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Manual x automatizado",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Testar na mão: o que parece bastar no começo\n\nNo início de um projeto, testar na mão funciona bem: você sobe o servidor, chama o endpoint pelo Postman ou Insomnia, olha a resposta, confere se o status e o corpo vieram certos. Poucos endpoints, poucas regras, roteiro curto. É rápido de fazer e não parece exigir nenhum investimento extra."
                    },
                    {
                        "type": "text",
                        "value": "## Por que não escala\n\nO projeto cresce: mais endpoints, mais regras de negócio, mais combinações de entrada pra checar. Repetir o mesmo roteiro manual a cada mudança pequena começa a tomar um tempo desproporcional. E tempo apertado é exatamente quando passos começam a ser pulados: \"essa parte eu não mudei, deve estar ok\" é como bug conhecido vira bug em produção.\n\nTestar na mão não escala porque o esforço cresce junto com o sistema, enquanto a paciência (e o tempo disponível) do time não."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Manual\",\"Automatizado\"],[\"Velocidade por execução\",\"Lenta, depende de alguém clicar ou chamar a API\",\"Rápida, roda em segundos\"],[\"Repetição\",\"Cansa e induz a pular passo\",\"Executa sempre o mesmo roteiro, sem pular nada\"],[\"Quando roda\",\"Só quando alguém lembra de rodar\",\"Pode rodar a cada commit, no CI\"],[\"Casos de borda\",\"Tende a cobrir só o caminho feliz\",\"Cobre os casos raros, se estiverem escritos\"],[\"Custo no início\",\"Baixo, não precisa escrever nada\",\"Mais alto, precisa escrever o teste\"],[\"Custo ao longo do tempo\",\"Cresce a cada nova mudança no sistema\",\"Se mantém baixo, o teste já existe\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O que o automatizado resolve\n\nUm teste automatizado repete exatamente os mesmos passos, sempre, sem cansar e sem esquecer o caso estranho que só acontece \"às vezes\". Ele pode rodar a cada commit, integrado ao CI, sem depender de alguém lembrar de testar. O ganho não é só velocidade: é consistência. O teste não tem um dia ruim."
                    },
                    {
                        "type": "code",
                        "value": "// Isso é o que você faria na mão pra testar o endpoint de login:\ncurl -X POST http://localhost:3000/login -H \"Content-Type: application/json\" -d '{\"email\":\"ana@exemplo.com\",\"senha\":\"123456\"}'\n\n// E depois conferir a resposta na mão: status, token no corpo... de novo a cada mudança.\n\n// O mesmo teste, automatizado com supertest:\nimport { describe, it, expect } from 'vitest';\nimport request from 'supertest';\nimport { app } from '../app.js';\n\ndescribe('POST /login', () => {\n  it('retorna 200 e um token quando as credenciais são válidas', async () => {\n    const resposta = await request(app)\n      .post('/login')\n      .send({ email: 'ana@exemplo.com', senha: '123456' });\n\n    expect(resposta.status).toBe(200);\n    expect(resposta.body.token).toBeDefined();\n  });\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Manual não desaparece, só muda de papel\n\nTeste manual continua tendo lugar, só que em outro tipo de trabalho: testes exploratórios (mexer no sistema sem roteiro fixo, tentando achar o que ninguém previu), avaliação de usabilidade, checagem de uma funcionalidade nova e ainda instável. O que muda é que o roteiro repetitivo e previsível (esse fluxo ainda retorna 200 depois do refactor?) deixa de fazer sentido ser feito à mão toda vez.\n\nA régua é simples: se o passo a passo é sempre o mesmo, automatiza. Se depende de julgamento humano sobre a experiência, continua manual."
                    },
                    {
                        "type": "quote",
                        "value": "Testar na mão prova que funcionou uma vez, num computador, num dia. Testar automatizado prova que continua funcionando, toda vez, em qualquer lugar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que testar manualmente cada funcionalidade a cada mudança no código não escala num projeto que cresce?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque o tempo gasto testando na mão cresce junto com o número de funcionalidades",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque ferramentas como o Postman não conseguem testar rotas protegidas por JWT",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Express não permite mais de uma rota sendo testada no mesmo dia",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque testes manuais só funcionam em ambientes de desenvolvimento local",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é uma vantagem direta de um teste automatizado sobre um teste manual?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ele repete exatamente os mesmos passos toda vez que é executado",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele nunca mais precisa ser atualizado depois de escrito uma vez",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele substitui a necessidade de qualquer teste exploratório no projeto",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele decide sozinho quais funcionalidades o time deveria construir",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Perto do prazo de entrega, o time decide pular a checagem manual de alguns fluxos secundários do sistema pra ganhar tempo. Que risco isso ilustra sobre o teste manual?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sob pressão, passos do roteiro manual são pulados e casos deixam de ser checados",
                                "isCorrect": true
                            },
                            {
                                "text": "O ambiente de testes manuais fica indisponível perto de prazos de entrega",
                                "isCorrect": false
                            },
                            {
                                "text": "Fluxos secundários não podem ser testados de forma manual em nenhuma situação",
                                "isCorrect": false
                            },
                            {
                                "text": "A equipe perde acesso ao código-fonte quando o prazo está próximo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de automatizar os testes do fluxo de checkout, o time ainda acha útil, de vez em quando, alguém testar esse fluxo na mão. Em que situação isso faz mais sentido?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Pra avaliar a experiência de uso, algo que um teste automatizado não julga",
                                "isCorrect": true
                            },
                            {
                                "text": "Pra substituir os testes automatizados que já existem pra esse mesmo fluxo",
                                "isCorrect": false
                            },
                            {
                                "text": "Pra reduzir o número de vezes que o teste automatizado roda no CI",
                                "isCorrect": false
                            },
                            {
                                "text": "Pra evitar ter que escrever testes automatizados em fluxos futuros",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um projeto tem uma suíte automatizada robusta, mas o time também mantém uma rotina de exploração manual sem roteiro fixo antes de todo lançamento grande. Por que isso não é contraditório?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Teste automatizado segue um roteiro fixo, testar sem roteiro acha problema que ninguém previu",
                                "isCorrect": true
                            },
                            {
                                "text": "Teste automatizado só funciona em ambiente de desenvolvimento, nunca perto de um lançamento",
                                "isCorrect": false
                            },
                            {
                                "text": "A rotina manual serve só pra confirmar que o CI executou os testes automatizados",
                                "isCorrect": false
                            },
                            {
                                "text": "Testes automatizados perdem a validade sempre que uma versão nova é lançada",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "A pirâmide de testes",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Três níveis, um objetivo\n\nNem todo teste automatizado olha pro sistema do mesmo jeito. Um teste pode focar numa função isolada, numa rota inteira conversando com o banco, ou no fluxo completo que um usuário faria no navegador. Esses são os três níveis clássicos: **unitário**, **integração** e **end-to-end (e2e)**. Cada um pega um tipo diferente de problema, e entender a diferença evita escrever o teste errado no lugar errado."
                    },
                    {
                        "type": "text",
                        "value": "## Teste unitário: a base\n\nTesta uma unidade de código isolada, geralmente uma função ou um método, sem tocar banco de dados, rede ou sistema de arquivos. Dependências externas são trocadas por versões falsas (você vai ver isso em detalhe no módulo de mocks). Por rodar só em memória, um teste unitário roda em milissegundos, o que permite ter centenas ou milhares deles numa suíte sem o tempo de execução explodir."
                    },
                    {
                        "type": "code",
                        "value": "// src/utils/desconto.js\nexport function calcularTotalComDesconto(precoTotal, percentualDesconto) {\n  if (percentualDesconto < 0 || percentualDesconto > 100) {\n    throw new Error('Percentual de desconto inválido');\n  }\n  return precoTotal - (precoTotal * percentualDesconto) / 100;\n}\n\n// src/utils/desconto.test.js\nimport { describe, it, expect } from 'vitest';\nimport { calcularTotalComDesconto } from './desconto.js';\n\ndescribe('calcularTotalComDesconto', () => {\n  it('aplica o percentual de desconto sobre o preço total', () => {\n    expect(calcularTotalComDesconto(200, 10)).toBe(180);\n  });\n\n  it('lança erro quando o percentual é inválido', () => {\n    expect(() => calcularTotalComDesconto(200, 150)).toThrow();\n  });\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Teste de integração: o meio\n\nTesta várias peças do sistema funcionando juntas: a rota do Express, o service com a lógica, o banco de dados (uma instância de teste, não a de produção). É o nível que pega problema que um teste unitário não vê, como uma query SQL errada ou um middleware de autenticação que não está sendo aplicado na rota certa. Como toca banco de verdade, é mais lento que o unitário, e a suíte tem bem menos testes desse tipo. O módulo 4 é inteiro sobre esse nível.\n\n## Teste end-to-end: o topo\n\nTesta o fluxo inteiro do jeito que o usuário viveria: cadastro, login, criar um recurso, ver ele aparecer na tela, tudo em sequência, muitas vezes passando pelo navegador de verdade. É o nível mais lento e mais caro de manter, então fica reservado pros fluxos mais críticos do sistema. O módulo 6 entra nesse nível com mais detalhe."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Nível\",\"O que testa\",\"Quantidade\",\"Velocidade\"],[\"Unitário\",\"Uma função ou unidade isolada, sem dependências reais\",\"Muitos\",\"Muito rápida (milissegundos)\"],[\"Integração\",\"Peças juntas, como rota, service e banco de teste\",\"Uma quantidade média\",\"Média (dezenas a centenas de ms)\"],[\"E2E\",\"O fluxo inteiro, do jeito que o usuário usa o sistema\",\"Poucos\",\"Lenta (segundos)\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que a base é larga\n\nA pirâmide tem essa forma, base larga e topo estreito, por causa do custo. Um teste unitário é barato: rápido de escrever, rápido de rodar, e quando falha aponta quase direto pra linha com o problema. Um teste e2e é caro: mais lento, mais frágil (depende de mais peças funcionando ao mesmo tempo, incluindo rede e às vezes navegador), e quando falha é mais difícil saber qual das muitas peças envolvidas causou o problema.\n\nPor isso a estratégia é: muitos testes unitários cobrindo a lógica de cada peça, uma quantidade média de integração confirmando que as peças se encaixam, e só um punhado de e2e confirmando que os fluxos mais importantes funcionam de ponta a ponta. Uma suíte com a pirâmide invertida (poucos unitários, muitos e2e) tende a ficar lenta e instável, e até ganhou apelido: casquinha de sorvete."
                    },
                    {
                        "type": "quote",
                        "value": "A pirâmide não diz qual teste é melhor. Diz onde cada um vale o custo: rápido e barato na base, completo e caro no topo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Na pirâmide de testes, qual nível fica na base, com a maior quantidade de testes?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O nível unitário, que testa uma função ou unidade isolada",
                                "isCorrect": true
                            },
                            {
                                "text": "O nível de integração, que testa rota, service e banco juntos",
                                "isCorrect": false
                            },
                            {
                                "text": "O nível end-to-end, que testa o fluxo inteiro pelo usuário",
                                "isCorrect": false
                            },
                            {
                                "text": "O nível de aceitação, que testa a documentação da API",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que um teste unitário roda tão mais rápido que um teste end-to-end?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque não toca banco, rede ou disco, só a unidade isolada em memória",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Vitest executa testes unitários num servidor diferente do e2e",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque testes unitários não verificam o valor retornado pela função",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o navegador não participa da execução de nenhum teste automatizado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um teste falha depois de uma alteração no service que calcula o frete. O teste unitário da função de cálculo continua verde, mas o teste de integração da rota /pedido fica vermelho. O que isso sugere primeiro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O problema está mais na forma como a rota usa o service, não no cálculo",
                                "isCorrect": true
                            },
                            {
                                "text": "O teste unitário está desatualizado e não reflete mais a regra de negócio",
                                "isCorrect": false
                            },
                            {
                                "text": "O banco de dados de teste perdeu a conexão durante a execução da suíte",
                                "isCorrect": false
                            },
                            {
                                "text": "O Vitest não conseguiu carregar o arquivo de configuração do projeto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time decide escrever a suíte majoritariamente com testes end-to-end, com poucos unitários. Depois de alguns meses, a suíte demora 40 minutos pra rodar e falha de forma intermitente. Que problema clássico isso ilustra?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A pirâmide invertida, poucos testes rápidos na base e muitos lentos no topo",
                                "isCorrect": true
                            },
                            {
                                "text": "A falta de um banco de dados dedicado só para os testes de integração",
                                "isCorrect": false
                            },
                            {
                                "text": "A ausência completa de testes manuais complementando a suíte automatizada",
                                "isCorrect": false
                            },
                            {
                                "text": "Um erro de configuração do Vitest que impede testes de rodar em paralelo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que normalmente não faz sentido testar todas as variações de uma regra de negócio só no nível end-to-end, mesmo que isso também cubra a função por baixo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque cada variação testada em e2e paga o custo total do fluxo, ficando lenta",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque testes e2e não têm acesso às mesmas regras de negócio que os unitários",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque ferramentas de e2e como Playwright não suportam múltiplos casos de teste",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o resultado de um teste end-to-end não pode ser verificado com expect",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O que vale a pena testar",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Nem tudo merece o mesmo teste\n\nVocê não tem tempo infinito, e testar tudo com o mesmo cuidado não é o objetivo, é usar mal o tempo. A pergunta certa não é \"isso está testado?\", é \"o que acontece se isso quebrar, e vale a pena garantir que não quebre?\". Tem código que carrega uma regra de negócio importante e merece atenção grande. Tem código simples demais pra justificar o esforço."
                    },
                    {
                        "type": "text",
                        "value": "## O que vale testar: lógica de negócio\n\nRegra de negócio é qualquer decisão que o sistema toma que, se estiver errada, causa dano real: calcular o valor de um pedido errado, deixar um usuário sem permissão acessar um recurso, aceitar um cadastro com dado inválido, autorizar um desconto que não deveria existir. É o tipo de código que muda com frequência (a regra muda porque o negócio muda) e que, se quebrar, ninguém percebe até o prejuízo aparecer. Isso inclui cálculo, validação, transição de estado (um pedido que vai de \"pendente\" pra \"pago\") e qualquer condicional que decide o que o sistema vai fazer."
                    },
                    {
                        "type": "text",
                        "value": "## Casos de borda: onde o bug mora\n\nCasos de borda são as entradas nos extremos ou fora do esperado: lista vazia, número zero ou negativo, string vazia, valor nulo, o limite exato de uma regra (desconto de exatamente 100%), muitos itens de uma vez. Ninguém escreve calcularTotalComDesconto(200, 10) errado. É calcularTotalComDesconto(200, -5) ou calcularTotalComDesconto(200, 100) que revelam se a função está preparada pra realidade, não só pro exemplo bonito do caminho feliz."
                    },
                    {
                        "type": "code",
                        "value": "// src/utils/desconto.test.js (continuando o exemplo da aula anterior)\nimport { describe, it, expect } from 'vitest';\nimport { calcularTotalComDesconto } from './desconto.js';\n\ndescribe('calcularTotalComDesconto: casos de borda', () => {\n  it('aceita desconto de 0%, o total não muda', () => {\n    expect(calcularTotalComDesconto(200, 0)).toBe(200);\n  });\n\n  it('aceita desconto de 100%, o total fica zero', () => {\n    expect(calcularTotalComDesconto(200, 100)).toBe(0);\n  });\n\n  it('rejeita desconto negativo', () => {\n    expect(() => calcularTotalComDesconto(200, -5)).toThrow();\n  });\n\n  it('rejeita desconto acima de 100%', () => {\n    expect(() => calcularTotalComDesconto(200, 150)).toThrow();\n  });\n});"
                    },
                    {
                        "type": "text",
                        "value": "## O que geralmente não precisa de teste\n\nUm getter trivial, que só devolve uma propriedade de um objeto sem nenhuma lógica no meio, raramente vale o teste: se ele quebrar, é porque o próprio JavaScript quebrou. Vale o mesmo pra código de configuração estática (uma lista de constantes) e pra código de biblioteca que não é seu, como confirmar que o Express registra uma rota (isso já é responsabilidade de quem mantém o Express).\n\nIsso não é uma regra fixa pra sempre: uma função que hoje só devolve usuario.nome e amanhã passa a formatar o nome ou aplicar uma regra de capitalização deixou de ser trivial, e nesse momento passa a valer um teste."
                    },
                    {
                        "type": "table",
                        "value": "[[\"O que é\",\"Vale testar de perto?\",\"Por quê\"],[\"Cálculo de preço com desconto e imposto\",\"Sim\",\"Errar aqui custa dinheiro de verdade\"],[\"Validação de dado de entrada de um cadastro\",\"Sim\",\"Dado inválido que passa vira problema lá na frente\"],[\"Caso de borda de uma regra (zero, negativo, limite)\",\"Sim\",\"É onde a maioria dos bugs reais aparece\"],[\"Getter que só devolve uma propriedade do objeto\",\"Não\",\"Não existe lógica ali pra quebrar\"],[\"Lista de constantes ou configuração estática\",\"Não\",\"Não toma nenhuma decisão\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Teste o que decide, calcula ou valida. Não teste o que só repassa um valor sem pensar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual das opções abaixo é um exemplo de lógica de negócio que vale a pena testar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma função que calcula o valor final de um pedido aplicando desconto e imposto",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma função que só devolve o valor da propriedade email de um objeto usuário",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma lista fixa de constantes com os nomes de todos os estados brasileiros",
                                "isCorrect": false
                            },
                            {
                                "text": "Um arquivo de configuração que define a porta em que o servidor sobe",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que um getter trivial, que só retorna uma propriedade do objeto sem nenhuma lógica, geralmente não precisa de teste?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque não existe nenhuma decisão ou cálculo ali que possa estar errado",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Vitest não testa bem funções que retornam um valor simples",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque getters não fazem parte da lógica de negócio de nenhum sistema",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque testar um getter sempre deixa a suíte de testes mais lenta",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você revisa os testes de um CRUD de produtos e vê um teste extenso pra função getNomeProduto(produto), que só faz return produto.nome, mas nenhum teste pra função que calcula o preço com imposto. O que essa priorização tem de errado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O tempo foi gasto testando algo sem lógica, deixando o cálculo sem cobertura",
                                "isCorrect": true
                            },
                            {
                                "text": "Getters nunca deveriam existir em nenhum CRUD de produtos bem projetado",
                                "isCorrect": false
                            },
                            {
                                "text": "Funções de cálculo de imposto não podem ser testadas com Vitest da forma usual",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema é só de nomenclatura, a função deveria se chamar de outro jeito",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa função que calcula parcelas de um pagamento, um bug em produção só aconteceu quando o valor total era exatamente divisível pelo número de parcelas, sem sobrar centavo. Que tipo de caso esse bug representa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um caso de borda da regra de negócio que os testes não tinham coberto",
                                "isCorrect": true
                            },
                            {
                                "text": "Um erro de sintaxe que o Vitest deveria ter impedido de rodar",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma falha de configuração do banco de dados usado em produção",
                                "isCorrect": false
                            },
                            {
                                "text": "Um problema exclusivo de teste end-to-end, e não de lógica de negócio",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma função formatarStatusPedido(status) só faz um switch que traduz um código interno ('P', 'E', 'C') pro texto em português (Pendente, Enviado, Cancelado), sem nenhum outro cálculo. Ela merece teste automatizado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Sim, um mapeamento código-texto errado também é uma regra que pode falhar",
                                "isCorrect": true
                            },
                            {
                                "text": "Não, qualquer função com switch é considerada trivial e não precisa de teste",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, mas só se a função também acessar o banco de dados em algum momento",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, funções de formatação de texto não fazem parte da lógica de negócio",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Como um teste se parece e como rodar",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Antes de escrever, vamos olhar\n\nNos próximos módulos você vai escrever dezenas de testes: unitários, com mock, de integração com banco de verdade. Antes disso, vale conhecer a forma que um teste tem, por cima, e como ele roda no dia a dia. Isso tira o mistério antes de entrar no detalhe."
                    },
                    {
                        "type": "text",
                        "value": "## Anatomia por cima: describe, it, expect\n\nUm arquivo de teste com Vitest normalmente tem três peças:\n\n- **describe**: agrupa testes relacionados, geralmente todos os testes de uma mesma função ou módulo. É só organização, não é obrigatório.\n- **it** (ou test, são sinônimos no Vitest): descreve um comportamento específico, quase em português direto, tipo \"rejeita senha sem número\" ou \"retorna 404 quando o usuário não existe\".\n- **expect**: a afirmação em si. Pega o resultado que o código produziu e compara com o que era esperado, usando um matcher como toBe ou toEqual (a lista completa vem no módulo 2).\n\nO módulo 2 entra fundo em cada peça. Por agora, o que importa é reconhecer o formato quando você ver."
                    },
                    {
                        "type": "code",
                        "value": "import { describe, it, expect } from 'vitest';\nimport { senhaEhForte } from './senha.js';\n\n// describe agrupa: \"tudo isso aqui é sobre a função senhaEhForte\"\ndescribe('senhaEhForte', () => {\n\n  // cada it é um comportamento específico, com nome que se lê quase como frase\n  it('aceita senha com 8+ caracteres, número e maiúscula', () => {\n    const resultado = senhaEhForte('Segredo123');\n\n    // expect compara o resultado com o que era esperado\n    expect(resultado).toBe(true);\n  });\n\n  it('rejeita senha curta', () => {\n    expect(senhaEhForte('Ab1')).toBe(false);\n  });\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Verde ou vermelho: o veredito\n\nQuando a suíte roda, cada it só termina de dois jeitos: passou (verde) ou falhou (vermelho). Não tem meio termo. Quando passa, o terminal mostra um resumo rápido. Quando falha, o Vitest mostra exatamente qual expect não bateu, o valor esperado e o valor que realmente veio, lado a lado. É esse veredito binário, com mensagem de erro clara, que faz o teste funcionar como alarme: não deixa dúvida sobre se algo quebrou."
                    },
                    {
                        "type": "text",
                        "value": "## Onde os testes ficam no projeto\n\nDuas convenções são comuns, e o Vitest reconhece as duas sem configuração extra:\n\n- **Ao lado do arquivo que testam**: senha.js e senha.test.js na mesma pasta. É a convenção mais comum em projeto Node hoje, porque fica fácil achar o teste de uma função.\n- **Numa pasta separada**: uma pasta tests/ ou __tests__/ espelhando a estrutura de src/.\n\nO que importa é o nome do arquivo: terminando em .test.js (ou .spec.js), o Vitest encontra e roda sozinho, sem precisar listar arquivo por arquivo."
                    },
                    {
                        "type": "code",
                        "value": "# Roda a suíte inteira uma vez e encerra\nnpx vitest run\n\n# Modo watch: fica de olho nos arquivos e roda de novo a cada mudança salva\nnpx vitest\n\n# Roda só os testes de um arquivo ou pasta específica\nnpx vitest run src/utils/senha.test.js\n\n# Roda com relatório de cobertura (quanto do código os testes exercitam)\nnpx vitest run --coverage\n\n# Se o package.json tiver \"test\": \"vitest\" nos scripts, o mesmo comando fica:\nnpm test"
                    },
                    {
                        "type": "quote",
                        "value": "Um teste é uma frase: describe isso, it faz aquilo, expect que o resultado seja este. A forma se repete, só o conteúdo muda."
                    }
                ],
                "questions": [
                    {
                        "statement": "No Vitest, qual é a função do describe num arquivo de teste?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Agrupar testes relacionados, geralmente da mesma função ou módulo",
                                "isCorrect": true
                            },
                            {
                                "text": "Executar o código de produção antes de cada teste começar",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir qual matcher será usado dentro de cada bloco it do arquivo",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir o expect quando o teste não precisa de nenhuma asserção",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de rodar a suíte, um teste aparece em vermelho no terminal. O que isso indica?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Que o valor recebido não bateu com o valor esperado no expect",
                                "isCorrect": true
                            },
                            {
                                "text": "Que o arquivo de teste tem algum problema de formatação de código",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o Vitest não encontrou teste nenhum pra executar naquele arquivo",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a suíte inteira está rodando mais lenta do que o configurado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você cria o arquivo src/utils/frete.js com uma função nova e escreve os testes num arquivo chamado src/utils/frete.spec.js, na mesma pasta. Ao rodar npx vitest, o que acontece?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Vitest encontra e roda o arquivo normalmente, porque reconhece o sufixo spec.js",
                                "isCorrect": true
                            },
                            {
                                "text": "O Vitest ignora o arquivo, porque só reconhece nomes terminados em test.js",
                                "isCorrect": false
                            },
                            {
                                "text": "O Vitest lança um erro, porque teste e código não podem ficar na mesma pasta",
                                "isCorrect": false
                            },
                            {
                                "text": "O Vitest roda o arquivo, mas não mostra o resultado de cada it separado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um novo integrante do time abre o projeto e não sabe qual comando roda os testes uma única vez, sem ficar em watch mode, e encerra sozinho. Qual comando resolve isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "npx vitest run",
                                "isCorrect": true
                            },
                            {
                                "text": "npx vitest watch",
                                "isCorrect": false
                            },
                            {
                                "text": "npx vitest --once",
                                "isCorrect": false
                            },
                            {
                                "text": "npx vitest init",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um desenvolvedor remove todos os blocos describe de um arquivo de teste, deixando só os blocos it soltos, direto no arquivo. O que acontece quando a suíte roda?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Os testes continuam rodando normalmente, describe é só organização, não obrigatório",
                                "isCorrect": true
                            },
                            {
                                "text": "O Vitest lança erro de sintaxe, porque todo it precisa estar dentro de um describe",
                                "isCorrect": false
                            },
                            {
                                "text": "Os testes rodam, mas nenhum expect dentro deles é avaliado de verdade",
                                "isCorrect": false
                            },
                            {
                                "text": "O Vitest agrupa os it automaticamente num describe implícito, com nome vazio",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - Seu primeiro teste unitário",
        "aulas": [
            {
                "titulo": "O que é um teste unitário e subir o Vitest",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Módulo 2 - Seu primeiro teste unitário\n\nVocê já construiu APIs com Express, modelou tabelas, protegeu rotas com JWT e colocou cache na frente de consultas pesadas. Chegou a hora de garantir que esse código continua funcionando quando alguém (inclusive você, seis meses depois) mexer nele. Isso começa pelo nível mais simples da pirâmide de testes: o teste unitário.\n\nO runner que vamos usar é o **Vitest**. Se você já cruzou com **Jest** em algum projeto, pode ficar tranquilo: a API é praticamente idêntica (`describe`, `it`, `expect`, os mesmos matchers), então boa parte do que vem a seguir vale pros dois. O Vitest só troca o motor por baixo (usa Vite) pra rodar mais rápido e integrar melhor com projetos modernos."
                    },
                    {
                        "type": "text",
                        "value": "## O que é testar uma unidade\n\nUm teste unitário testa **uma unidade de código isolada**, geralmente uma função, sem depender de banco de dados, chamada de rede, sistema de arquivos ou qualquer outra parte do sistema. Se você tem uma função `ehValidoEmail(email)` que recebe uma string e devolve um booleano, testar ela isoladamente não exige subir o Express nem conectar no Postgres: basta chamar a função e conferir o resultado.\n\nIsso é diferente de testar a rota `POST /usuarios` inteira, que passa pelo middleware de auth, valida o corpo da requisição, grava no banco e devolve uma resposta HTTP. Isso é teste de integração, assunto do Módulo 4. Aqui o foco é menor e mais direto: uma função, uma entrada, uma saída esperada."
                    },
                    {
                        "type": "text",
                        "value": "## Por que isolar traz confiança\n\nIsolar a unidade tem efeitos bem práticos no dia a dia:\n\n- **Roda rápido**: sem banco nem rede, um teste unitário costuma levar milissegundos, então dá pra ter centenas deles rodando em poucos segundos.\n- **É confiável**: não depende do banco estar de pé ou da rede estar funcionando, então quando ele falha, a causa é o código, não o ambiente.\n- **Aponta o problema exato**: se `ehValidoEmail` quebrar, só o teste dela falha, sem arrastar outras dez partes do sistema junto."
                    },
                    {
                        "type": "code",
                        "value": "# instala o Vitest como dependencia de desenvolvimento\nnpm install -D vitest\n\n# roda os testes do projeto\nnpx vitest"
                    },
                    {
                        "type": "text",
                        "value": "## Onde o arquivo de teste fica\n\nO Vitest reconhece automaticamente qualquer arquivo terminado em `.test.ts` (ou `.spec.ts`) no projeto, exceto dentro de `node_modules`. A convenção mais comum é colocar o teste ao lado do arquivo que ele testa, com o mesmo nome:\n\n- `src/utils/validacao.ts`\n- `src/utils/validacao.test.ts`\n\nAlguns times preferem centralizar tudo numa pasta `__tests__/`, mas para testes unitários pequenos, deixar o teste ao lado do arquivo original costuma facilitar achar as duas pontas rápido."
                    },
                    {
                        "type": "code",
                        "value": "// src/utils/validacao.test.ts\nimport { describe, it, expect } from \"vitest\";\n\ndescribe(\"primeiro teste\", () => {\n  it(\"soma dois numeros corretamente\", () => {\n    expect(1 + 1).toBe(2);\n  });\n});\n\n// depois de \"npm install -D vitest\", rode \"npx vitest\"\n// esse arquivo ja aparece verde no terminal"
                    },
                    {
                        "type": "quote",
                        "value": "Teste unitário testa uma função sozinha, sem banco e sem rede: por isso roda rápido e, quando falha, você já sabe exatamente onde olhar."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza um teste unitário, como os que você vai escrever no Vitest?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Testa uma função isolada, sem tocar banco de dados ou rede",
                                "isCorrect": true
                            },
                            {
                                "text": "Testa a aplicação inteira aberta dentro de um navegador real",
                                "isCorrect": false
                            },
                            {
                                "text": "Testa a rota HTTP completa junto com o banco de produção",
                                "isCorrect": false
                            },
                            {
                                "text": "Testa a tela clicando manualmente em cada botão do sistema",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual comando instala o Vitest como dependência de desenvolvimento do projeto?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "npm install -D vitest",
                                "isCorrect": true
                            },
                            {
                                "text": "npm install --global vitest",
                                "isCorrect": false
                            },
                            {
                                "text": "npx create-vitest-app",
                                "isCorrect": false
                            },
                            {
                                "text": "npm publish vitest --dev",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você roda `npx vitest` no terminal e ele não termina sozinho, fica ali esperando. O que está acontecendo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O Vitest entrou em watch mode e reroda a cada mudança salva",
                                "isCorrect": true
                            },
                            {
                                "text": "O pacote foi instalado errado e precisa ser reinstalado",
                                "isCorrect": false
                            },
                            {
                                "text": "Falta criar um arquivo de configuração antes de rodar",
                                "isCorrect": false
                            },
                            {
                                "text": "O terminal perdeu a conexão com o processo do Node",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual nome de arquivo o Vitest reconhece automaticamente como um arquivo de teste?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "validacao.test.ts, seguindo o sufixo que o Vitest procura",
                                "isCorrect": true
                            },
                            {
                                "text": "validacaoTests.ts, com a palavra Tests em algum ponto",
                                "isCorrect": false
                            },
                            {
                                "text": "test_validacao.ts, com prefixo e underline separando",
                                "isCorrect": false
                            },
                            {
                                "text": "validacao.unit.ts, usando unit como marcador do tipo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Seu time usa Jest em outros projetos e você está começando um serviço novo com Vitest. O que é verdade sobre os dois?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A API de describe, it e expect é quase idêntica entre eles",
                                "isCorrect": true
                            },
                            {
                                "text": "Os dois usam sintaxes completamente diferentes entre si",
                                "isCorrect": false
                            },
                            {
                                "text": "Vitest só roda em projetos que nunca usaram Jest antes",
                                "isCorrect": false
                            },
                            {
                                "text": "Jest parou de funcionar e todo projeto precisa migrar",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "describe, it, expect: anatomia",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## As três peças de todo teste\n\nPraticamente todo teste que você vai escrever com Vitest usa a mesma gramática básica: `describe` agrupa testes relacionados, `it` (ou `test`) descreve um caso específico, e `expect` verifica se o resultado bateu com o esperado. São só essas três peças, e dá pra escrever a maior parte dos testes unitários combinando elas."
                    },
                    {
                        "type": "text",
                        "value": "## O que cada peça faz\n\n- **describe(nome, funcao)**: cria uma suíte, um agrupamento de testes que compartilham o mesmo contexto (por exemplo, todos os testes da função `ehValidoEmail`).\n- **it(nome, funcao)** ou **test(nome, funcao)**: representa um caso concreto, com um nome que descreve o comportamento esperado. `it` e `test` são sinônimos: fazem exatamente a mesma coisa, é só escolha de estilo do time.\n- **expect(valor)**: recebe o resultado que você quer verificar, encadeado com um matcher (como `.toBe(2)`) que decide se o teste passa ou falha."
                    },
                    {
                        "type": "code",
                        "value": "// src/utils/validacao.ts\nexport function ehValidoEmail(email: string): boolean {\n  const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n  return regex.test(email);\n}"
                    },
                    {
                        "type": "code",
                        "value": "// src/utils/validacao.test.ts\nimport { describe, it, expect } from \"vitest\";\nimport { ehValidoEmail } from \"./validacao\";\n\ndescribe(\"ehValidoEmail\", () => {\n  it(\"retorna true para um email valido\", () => {\n    expect(ehValidoEmail(\"ana@exemplo.com\")).toBe(true);\n  });\n\n  it(\"retorna false para um email sem arroba\", () => {\n    expect(ehValidoEmail(\"ana.exemplo.com\")).toBe(false);\n  });\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Agrupando cenários com describe aninhado\n\nQuando uma função tem vários grupos de cenário (por exemplo, \"quando o email é válido\" e \"quando falta alguma parte\"), dá pra aninhar `describe` dentro de `describe` pra organizar a leitura. O nome de cada `it` também importa: prefira frases que descrevem o comportamento, como \"retorna false para um email sem arroba\", em vez de nomes genéricos como \"teste 1\" ou \"caso 2\". É esse nome que aparece no terminal quando o teste falha, e é ele que vai te dizer o que quebrou sem precisar abrir o arquivo."
                    },
                    {
                        "type": "quote",
                        "value": "describe agrupa, it descreve um caso, expect verifica o resultado: a gramática básica que sustenta praticamente qualquer teste que você vai escrever."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual função do Vitest agrupa vários testes relacionados sob um mesmo nome?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "describe",
                                "isCorrect": true
                            },
                            {
                                "text": "expect",
                                "isCorrect": false
                            },
                            {
                                "text": "beforeAll",
                                "isCorrect": false
                            },
                            {
                                "text": "require",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dentro de um it, qual função afirma que um valor bateu com o esperado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "expect",
                                "isCorrect": true
                            },
                            {
                                "text": "describe",
                                "isCorrect": false
                            },
                            {
                                "text": "import",
                                "isCorrect": false
                            },
                            {
                                "text": "module",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um colega trocou it por test no mesmo teste: test(\"soma dois numeros\", () => {...}). O que muda ao rodar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nada muda, porque test e it são sinônimos na mesma API",
                                "isCorrect": true
                            },
                            {
                                "text": "O Vitest ignora o bloco, porque test não existe ali",
                                "isCorrect": false
                            },
                            {
                                "text": "O teste passa a rodar de forma assíncrona forçada",
                                "isCorrect": false
                            },
                            {
                                "text": "O Vitest passa a exigir um describe extra por fora",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que agrupar testes relacionados dentro de um describe ajuda na leitura do resultado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A saída do terminal fica organizada por suíte de teste",
                                "isCorrect": true
                            },
                            {
                                "text": "O describe faz os testes rodarem sempre em paralelo",
                                "isCorrect": false
                            },
                            {
                                "text": "Sem describe o Vitest recusa rodar qualquer arquivo",
                                "isCorrect": false
                            },
                            {
                                "text": "O describe substitui a necessidade de escrever expect",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você quer testar ehValidoEmail tanto no caso de email válido quanto no caso de domínio ausente, mantendo a leitura organizada por cenário. Qual estrutura faz mais sentido?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um describe para a função com um it por cenário testado",
                                "isCorrect": true
                            },
                            {
                                "text": "Um único it gigante cobrindo todos os cenários juntos",
                                "isCorrect": false
                            },
                            {
                                "text": "Um arquivo de teste separado pra cada linha de código",
                                "isCorrect": false
                            },
                            {
                                "text": "Um describe vazio, com os cenários soltos no arquivo",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Matchers (toBe x toEqual, toThrow)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O matcher decide o que \"passar\" significa\n\nDepois do `expect(valor)`, o matcher é quem decide como a comparação é feita. Usar o matcher errado é uma das formas mais comuns de escrever um teste que passa sem provar nada de fato, ou que falha por um motivo que não tem relação nenhuma com o bug real."
                    },
                    {
                        "type": "text",
                        "value": "## A pegadinha do toBe com objetos\n\n`toBe` compara por **referência**, o mesmo que o `===` do JavaScript faz: funciona perfeito com número, string e booleano, porque esses valores já são comparados pelo conteúdo mesmo com `===`. O problema aparece com objetos e arrays: dois objetos com o mesmo conteúdo, criados separadamente, são referências diferentes na memória, então `toBe` falha entre eles mesmo parecendo iguais. Pra comparar o **conteúdo** de um objeto ou array, o matcher certo é `toEqual`, que compara campo a campo."
                    },
                    {
                        "type": "code",
                        "value": "import { describe, it, expect } from \"vitest\";\n\ndescribe(\"toBe x toEqual\", () => {\n  it(\"toBe funciona direto com primitivos\", () => {\n    expect(2 + 2).toBe(4);\n  });\n\n  it(\"toEqual compara o conteudo de dois objetos diferentes\", () => {\n    const usuarioA = { nome: \"Ana\" };\n    const usuarioB = { nome: \"Ana\" };\n\n    expect(usuarioA).toEqual(usuarioB);\n    // expect(usuarioA).toBe(usuarioB) falharia: sao referencias diferentes\n  });\n});"
                    },
                    {
                        "type": "code",
                        "value": "// src/utils/matematica.ts\nexport function dividir(a: number, b: number): number {\n  if (b === 0) {\n    throw new Error(\"Nao e possivel dividir por zero\");\n  }\n  return a / b;\n}\n\n// src/utils/matematica.test.ts\nimport { describe, it, expect } from \"vitest\";\nimport { dividir } from \"./matematica\";\n\ndescribe(\"dividir\", () => {\n  it(\"lanca erro ao dividir por zero\", () => {\n    expect(() => dividir(10, 0)).toThrow();\n  });\n\n  it(\"divide normalmente quando o divisor nao e zero\", () => {\n    expect(dividir(10, 2)).toBe(5);\n  });\n});"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Matcher\", \"O que verifica\"], [\"toBe\", \"Igualdade estrita (===), ideal para números, strings e booleanos\"], [\"toEqual\", \"Igualdade de conteúdo, campo a campo, ideal para objetos e arrays\"], [\"toBeTruthy\", \"Se o valor é truthy (qualquer coisa que não seja false, 0, string vazia, null ou undefined)\"], [\"toBeFalsy\", \"Se o valor é falsy (false, 0, string vazia, null ou undefined)\"], [\"toBeNull\", \"Se o valor é exatamente null\"], [\"toThrow\", \"Se a função, chamada dentro de uma arrow function, lança um erro ao executar\"], [\"toContain\", \"Se um array contém um item, ou se uma string contém um trecho\"]]"
                    },
                    {
                        "type": "code",
                        "value": "// src/auth/permissoes.ts\nexport function permissoesDoUsuario(tipo: \"comum\" | \"admin\"): string[] {\n  return tipo === \"admin\" ? [\"leitura\", \"escrita\", \"exclusao\"] : [\"leitura\"];\n}\n\n// src/auth/permissoes.test.ts\nimport { describe, it, expect } from \"vitest\";\nimport { permissoesDoUsuario } from \"./permissoes\";\n\ndescribe(\"permissoesDoUsuario\", () => {\n  it(\"usuario comum tem a permissao de leitura\", () => {\n    expect(permissoesDoUsuario(\"comum\")).toContain(\"leitura\");\n  });\n\n  it(\"usuario comum nao tem a permissao de exclusao\", () => {\n    // .not inverte qualquer matcher\n    expect(permissoesDoUsuario(\"comum\")).not.toContain(\"exclusao\");\n  });\n});"
                    },
                    {
                        "type": "quote",
                        "value": "toBe compara valor exato, toEqual compara conteúdo: escolher o matcher certo evita um teste que mente sobre o que realmente verificou."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual matcher você usa pra comparar dois números primitivos?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "toBe",
                                "isCorrect": true
                            },
                            {
                                "text": "toEqual",
                                "isCorrect": false
                            },
                            {
                                "text": "toContain",
                                "isCorrect": false
                            },
                            {
                                "text": "toThrow",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual matcher verifica se uma função lança um erro ao ser executada?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "toThrow",
                                "isCorrect": true
                            },
                            {
                                "text": "toBe",
                                "isCorrect": false
                            },
                            {
                                "text": "toBeNull",
                                "isCorrect": false
                            },
                            {
                                "text": "toContain",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O teste expect({ nome: \"Ana\" }).toBe({ nome: \"Ana\" }) falha, mesmo os dois objetos parecendo iguais. Por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "toBe compara referência, e são objetos diferentes na memória",
                                "isCorrect": true
                            },
                            {
                                "text": "toBe só aceita string, nunca compara objeto no Vitest",
                                "isCorrect": false
                            },
                            {
                                "text": "O objeto da direita precisa vir de um import externo",
                                "isCorrect": false
                            },
                            {
                                "text": "Faltou envolver os dois objetos com JSON.stringify antes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual troca resolve o teste do item anterior, mantendo a intenção de comparar o conteúdo do objeto?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Trocar toBe por toEqual, que compara o conteúdo do objeto",
                                "isCorrect": true
                            },
                            {
                                "text": "Trocar toBe por toBeTruthy, que aceita qualquer objeto",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o objeto esperado por uma string equivalente",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover o segundo objeto e comparar só o campo nome",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você precisa garantir que dividir(10, 0) lança um erro. Qual chamada testa isso corretamente no Vitest?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "expect(() => dividir(10, 0)).toThrow()",
                                "isCorrect": true
                            },
                            {
                                "text": "expect(dividir(10, 0)).toThrow()",
                                "isCorrect": false
                            },
                            {
                                "text": "expect(dividir(10, 0)).toBe(Error)",
                                "isCorrect": false
                            },
                            {
                                "text": "expect(() => dividir).toThrow(10, 0)",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O padrão AAA (Arrange, Act, Assert)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Arrange, Act, Assert\n\nO padrão AAA organiza qualquer teste em três blocos: **Arrange** (preparar os dados e o estado necessários), **Act** (executar a ação ou função sendo testada) e **Assert** (verificar se o resultado bateu com o esperado). Você já faz isso de forma intuitiva ao escrever código: separa o que é dado de entrada do que é processamento. O AAA só torna essa separação explícita dentro do teste."
                    },
                    {
                        "type": "code",
                        "value": "// src/utils/validacao.ts\nexport function validarSenha(senha: string): boolean {\n  const temTamanhoMinimo = senha.length >= 8;\n  const temNumero = /\\d/.test(senha);\n  return temTamanhoMinimo && temNumero;\n}\n\n// src/utils/validacao.test.ts\nimport { describe, it, expect } from \"vitest\";\nimport { validarSenha } from \"./validacao\";\n\ndescribe(\"validarSenha\", () => {\n  it(\"aceita senha com 8 ou mais caracteres e pelo menos um numero\", () => {\n    // Arrange\n    const senha = \"senha1234\";\n\n    // Act\n    const resultado = validarSenha(senha);\n\n    // Assert\n    expect(resultado).toBe(true);\n  });\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Por que a separação ajuda\n\nSem essa separação, é comum um teste crescer numa linha só, misturando preparo, execução e verificação, e ficar difícil de entender o que ele realmente testa. Com Arrange, Act e Assert bem marcados (por comentário ou só por uma linha em branco entre os blocos), qualquer pessoa lendo o teste seis meses depois reconhece de cara: aqui está o cenário, aqui está a ação, aqui está a checagem. Isso importa ainda mais em testes maiores, com vários dados de entrada."
                    },
                    {
                        "type": "code",
                        "value": "// src/utils/pedido.ts\ninterface ItemPedido {\n  preco: number;\n  quantidade: number;\n}\n\nexport function calcularTotalPedido(itens: ItemPedido[]): number {\n  return itens.reduce((total, item) => total + item.preco * item.quantidade, 0);\n}\n\n// src/utils/pedido.test.ts\nimport { describe, it, expect } from \"vitest\";\nimport { calcularTotalPedido } from \"./pedido\";\n\ndescribe(\"calcularTotalPedido\", () => {\n  it(\"soma o total de varios itens com quantidades diferentes\", () => {\n    // Arrange\n    const itens = [\n      { preco: 10, quantidade: 2 },\n      { preco: 5, quantidade: 3 },\n    ];\n\n    // Act\n    const total = calcularTotalPedido(itens);\n\n    // Assert\n    expect(total).toBe(35);\n  });\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Um foco por teste\n\nO AAA funciona melhor quando cada `it` testa uma única coisa. Dá pra ter mais de um `expect` dentro do mesmo teste, desde que todos verifiquem o mesmo comportamento (por exemplo, checar dois campos do mesmo resultado). Quando você percebe que precisa testar dois comportamentos diferentes, o sinal é claro: são dois `it` separados, cada um com seu próprio Arrange, Act e Assert."
                    },
                    {
                        "type": "quote",
                        "value": "Arrange, Act, Assert: separar preparo, execução e verificação deixa qualquer teste fácil de ler meses depois de escrito."
                    }
                ],
                "questions": [
                    {
                        "statement": "No padrão AAA, o que a etapa Arrange representa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A preparação dos dados e do estado antes da ação",
                                "isCorrect": true
                            },
                            {
                                "text": "A execução da função que está sendo testada agora",
                                "isCorrect": false
                            },
                            {
                                "text": "A verificação se o resultado bateu com o esperado",
                                "isCorrect": false
                            },
                            {
                                "text": "A limpeza do ambiente depois que o teste termina",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No padrão AAA, qual etapa contém a chamada da função sendo testada?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Act",
                                "isCorrect": true
                            },
                            {
                                "text": "Arrange",
                                "isCorrect": false
                            },
                            {
                                "text": "Assert",
                                "isCorrect": false
                            },
                            {
                                "text": "After",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um teste mistura preparo, execução e verificação numa linha só, tipo expect(somar(dado1(), dado2())).toBe(esperado()). Qual é o problema principal?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Fica difícil separar entrada, ação e verificação depois",
                                "isCorrect": true
                            },
                            {
                                "text": "O Vitest recusa expect com mais de uma função dentro",
                                "isCorrect": false
                            },
                            {
                                "text": "O teste fica mais rápido, mas perde cobertura de código",
                                "isCorrect": false
                            },
                            {
                                "text": "O JavaScript não permite chamar função dentro do expect",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que seguir Arrange, Act, Assert ajuda um teste a envelhecer bem, meses depois de escrito?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Quem lê reconhece de cara o dado, a ação e a checagem",
                                "isCorrect": true
                            },
                            {
                                "text": "O AAA gera relatório de cobertura de forma automática",
                                "isCorrect": false
                            },
                            {
                                "text": "O AAA elimina a necessidade de nomear os testes bem",
                                "isCorrect": false
                            },
                            {
                                "text": "O AAA impede que o teste dependa de biblioteca externa",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você está testando calcularTotalPedido com uma lista de itens. Qual ordem segue o padrão AAA da forma mais clara?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Montar a lista, chamar a função, comparar o total depois",
                                "isCorrect": true
                            },
                            {
                                "text": "Chamar a função antes de montar a lista usada por ela",
                                "isCorrect": false
                            },
                            {
                                "text": "Comparar o total esperado antes da função ser chamada",
                                "isCorrect": false
                            },
                            {
                                "text": "Montar a lista dentro do próprio expect, junto do assert",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Rodando, lendo a falha e testando bordas",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Rodando de verdade\n\nRodar `npx vitest` sem mais nada entra em **watch mode**: o Vitest fica de pé, observando os arquivos, e reroda automaticamente os testes afetados a cada vez que você salva. É o jeito mais comum de trabalhar enquanto escreve código. Já `npx vitest run` executa a suíte inteira uma única vez e termina, o formato usado em pipelines de CI (assunto que volta com força no Módulo 6)."
                    },
                    {
                        "type": "code",
                        "value": "$ npx vitest\n\n PASS  src/utils/validacao.test.ts (3 tests) 4ms\n PASS  src/utils/matematica.test.ts (2 tests) 2ms\n\n Test Files  2 passed (2)\n      Tests  5 passed (5)\n   Duration  287ms\n\n# esse processo fica aberto, esperando o proximo save\n# \"npx vitest run\" roda uma vez e encerra sozinho"
                    },
                    {
                        "type": "text",
                        "value": "## Lendo a saída, do verde ao vermelho\n\nCada teste que passa aparece marcado como PASS, com o nome do arquivo e quantos testes rodaram. Quando um teste falha, o Vitest mostra o caminho completo até ele (o `describe` e o `it` envolvidos) junto com um bloco `Expected` (o que o `expect` esperava) contra `Received` (o que a função realmente devolveu). É esse contraste que aponta se o bug está na função ou no próprio teste."
                    },
                    {
                        "type": "code",
                        "value": "$ npx vitest\n\n FAIL  src/utils/validacao.test.ts > ehValidoEmail > retorna true para um email valido\n\nAssertionError: expected false to be true\n\n- Expected\n+ Received\n\n- true\n+ false\n\n Test Files  1 failed (1)\n      Tests  1 failed | 1 passed (2)"
                    },
                    {
                        "type": "text",
                        "value": "## Testando as bordas\n\nUm teste que só cobre o caminho feliz (o email certinho, o número redondo) prova bem pouco. É nos casos de borda que os bugs de verdade aparecem: **string vazia**, **valor negativo**, **zero**, e os **limites exatos** de uma regra (como o oitavo caractere de uma senha que exige mínimo de 8). Um cadastro que nunca testou email vazio, por exemplo, só descobre o problema quando alguém manda o formulário em branco em produção."
                    },
                    {
                        "type": "code",
                        "value": "// src/utils/validacao.test.ts\nimport { describe, it, expect } from \"vitest\";\nimport { ehValidoEmail, validarSenha } from \"./validacao\";\n\ndescribe(\"ehValidoEmail: casos de borda\", () => {\n  it(\"retorna false para string vazia\", () => {\n    expect(ehValidoEmail(\"\")).toBe(false);\n  });\n\n  it(\"retorna false quando falta algo depois do ultimo ponto\", () => {\n    expect(ehValidoEmail(\"ana@exemplo.\")).toBe(false);\n  });\n});\n\ndescribe(\"validarSenha: casos de borda\", () => {\n  it(\"rejeita senha com exatamente 7 caracteres\", () => {\n    expect(validarSenha(\"abc123z\")).toBe(false);\n  });\n\n  it(\"aceita senha com exatamente 8 caracteres\", () => {\n    expect(validarSenha(\"abc123zz\")).toBe(true);\n  });\n});"
                    },
                    {
                        "type": "quote",
                        "value": "Teste que só cobre o caminho feliz não prova nada: é na borda (vazio, negativo, limite) que o bug mora."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual comando roda os testes uma única vez, sem entrar em watch mode?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "npx vitest run",
                                "isCorrect": true
                            },
                            {
                                "text": "npx vitest watch",
                                "isCorrect": false
                            },
                            {
                                "text": "npx vitest init",
                                "isCorrect": false
                            },
                            {
                                "text": "npx vitest build",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que significa um teste aparecer como FAIL na saída do Vitest?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Que algum expect do teste não bateu com o valor recebido",
                                "isCorrect": true
                            },
                            {
                                "text": "Que o arquivo de teste tem erro de sintaxe e não compilou",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o teste foi pulado de propósito com skip ou todo",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o Vitest não achou nenhum arquivo de teste no projeto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A saída de um teste que falhou mostra Expected: true e Received: false. O que essas duas linhas indicam?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O valor esperado pelo expect contra o valor recebido",
                                "isCorrect": true
                            },
                            {
                                "text": "O tempo esperado de execução contra o tempo real do teste",
                                "isCorrect": false
                            },
                            {
                                "text": "A versão esperada do Vitest contra a versão instalada",
                                "isCorrect": false
                            },
                            {
                                "text": "O número de testes esperados contra o número que rodou",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que testar casos de borda, como vazio, negativo e limite, além do caminho feliz?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque bugs comuns se escondem nesses valores fora do normal",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Vitest exige três casos de borda por função",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque casos de borda deixam a suíte visivelmente mais rápida",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque sem eles o toBe e o toEqual param de funcionar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você testou ehValidoEmail só com um email válido comum, e o teste passou. Em produção, um cadastro com email vazio quebrou o sistema. O que faltou na suíte?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um caso de borda cobrindo string vazia, fora do caminho feliz",
                                "isCorrect": true
                            },
                            {
                                "text": "Trocar o matcher toBe por toEqual na verificação do email",
                                "isCorrect": false
                            },
                            {
                                "text": "Envolver o teste existente com describe pra evitar o bug",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar o mesmo teste duas vezes seguidas antes do deploy",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - Mocks e dublês de teste",
        "aulas": [
            {
                "titulo": "Por que isolar: o problema das dependências",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Módulo 3 - Mocks e dublês de teste\n\nNo Módulo 2 você testou funções que viviam sozinhas: recebiam um valor, devolviam outro, sem depender de mais nada. Mas boa parte do código de um back-end de verdade não é assim. Lembra daquele CRUD que você fez, com Express e banco? Ou o middleware de auth que decodifica um token, ou o cache-aside que decide se busca no Redis ou no banco? Essas peças tomam decisões, mas também conversam com coisas de fora: banco de dados, APIs externas, envio de email, o relógio. Testar isso unitariamente exige uma ferramenta nova: o dublê de teste."
                    },
                    {
                        "type": "text",
                        "value": "## O problema: sua função não vive sozinha\n\nPegue um exemplo comum: um `UsuarioService` que cadastra um novo usuário. Ele precisa checar se o email já existe (bate no banco), salvar o usuário novo (bate no banco de novo) e mandar um email de boas-vindas (bate numa API externa de envio de email). A lógica de decisão em si (\"se já existe, recusa; senão, cria e avisa\") é simples. O problema é que ela está emaranhada com três chamadas pra fora, e um teste unitário não quer saber se o Postgres está de pé ou se o provedor de email está respondendo."
                    },
                    {
                        "type": "code",
                        "value": "// src/usuarios/usuario.service.ts\nimport { emailClient } from \"../email/email.client\";\n\ninterface Usuario {\n  id: number;\n  nome: string;\n  email: string;\n  criadoEm: Date;\n}\n\ninterface UsuarioRepository {\n  buscarPorEmail(email: string): Promise<Usuario | null>;\n  criar(dados: Omit<Usuario, \"id\">): Promise<Usuario>;\n}\n\nexport class UsuarioService {\n  constructor(private repository: UsuarioRepository) {}\n\n  async cadastrar(nome: string, email: string): Promise<Usuario> {\n    const existente = await this.repository.buscarPorEmail(email);\n    if (existente) {\n      throw new Error(\"Email ja cadastrado\");\n    }\n\n    const usuario = await this.repository.criar({ nome, email, criadoEm: new Date() });\n    await emailClient.enviarBoasVindas(email);\n\n    return usuario;\n  }\n}"
                    },
                    {
                        "type": "text",
                        "value": "## O que acontece se o teste usar as dependências de verdade\n\nSe o teste desse `cadastrar` gravar direto no banco de desenvolvimento, ele fica lento (uma consulta e uma escrita reais a cada teste) e sujo (o próximo teste encontra o usuário que o teste anterior deixou pra trás, e uma suíte que passa sozinha pode falhar quando roda junto com outras). Se ele chamar o `emailClient` de verdade, manda um email real toda vez que a suíte roda, sem nenhum controle sobre o resultado. E se a lógica usar `new Date()` sem nenhum controle, o valor de `criadoEm` muda a cada execução, o que complica até comparar o resultado num `expect`."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Dependência\", \"Por que atrapalha um teste unitário\"], [\"Banco de dados\", \"Lento pra subir, precisa de estado limpo entre execuções, os testes ficam acoplados uns aos outros\"], [\"API externa\", \"Depende de rede e de credenciais reais, pode falhar por um motivo alheio ao seu código\"], [\"Envio de email\", \"Manda email de verdade toda vez que a suíte roda, sem controle nenhum sobre o resultado\"], [\"Relógio (tempo)\", \"O valor muda a cada execução, o teste perde a previsibilidade\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## A saída: substituir a dependência por um dublê\n\nNo teste unitário, a solução não é evitar essas dependências, é trocá-las por uma versão controlada só durante o teste: um dublê de teste (do inglês *test double*, o mesmo termo usado no cinema pra quem substitui o ator numa cena arriscada). Com o dublê no lugar do banco, do email e do relógio, o teste passa a verificar só o que interessa: será que `cadastrar` toma a decisão certa? Na próxima aula, os quatro tipos de dublê que dá pra montar com o Vitest."
                    },
                    {
                        "type": "quote",
                        "value": "Testar uma função que depende de banco, API externa e relógio direto contra essas dependências reais deixa o teste lento e imprevisível: o dublê existe pra devolver o controle pra quem escreve o teste."
                    }
                ],
                "questions": [
                    {
                        "statement": "No Módulo 3, qual é o problema central que motiva o uso de dublês de teste?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A unidade testada depende de coisas externas, como banco e email",
                                "isCorrect": true
                            },
                            {
                                "text": "O Vitest não consegue reconhecer mais de um arquivo de teste",
                                "isCorrect": false
                            },
                            {
                                "text": "As funções puras do Módulo 2 pararam de funcionar no projeto",
                                "isCorrect": false
                            },
                            {
                                "text": "O JavaScript não permite declarar duas funções no mesmo arquivo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das dependências abaixo costuma exigir um dublê de teste, por ser externa à própria lógica?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma chamada de rede para uma API externa de terceiros",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma função pura que soma dois números recebidos",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma constante numérica declarada no topo do arquivo",
                                "isCorrect": false
                            },
                            {
                                "text": "Um objeto literal criado dentro do próprio teste",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O teste do UsuarioService.cadastrar está gravando no banco de desenvolvimento de verdade e mandando email real toda vez que roda. Qual é o problema disso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Fica lento, deixa estado sujo e depende de serviços externos reais",
                                "isCorrect": true
                            },
                            {
                                "text": "Fica mais confiável, porque usa exatamente os dados de produção",
                                "isCorrect": false
                            },
                            {
                                "text": "O Vitest recusa terminar a suíte quando detecta uma chamada de rede",
                                "isCorrect": false
                            },
                            {
                                "text": "Fica mais rápido, porque reaproveita a conexão aberta do banco real",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que new Date() dentro da lógica testada é considerado uma dependência arriscada num teste unitário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O valor muda a cada execução, tirando a previsibilidade do teste",
                                "isCorrect": true
                            },
                            {
                                "text": "new Date() lança erro sempre que chamado dentro de um arquivo .test",
                                "isCorrect": false
                            },
                            {
                                "text": "new Date() exige uma conexão de rede ativa pra funcionar direito",
                                "isCorrect": false
                            },
                            {
                                "text": "new Date() só pode ser usado dentro de funções assíncronas no Node",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "UsuarioService.cadastrar depende do repository, do emailClient e do relógio. Num teste unitário desse método, o que faz mais sentido isolar com dublês?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "As três dependências externas, mantendo real a lógica do próprio service",
                                "isCorrect": true
                            },
                            {
                                "text": "Só o repository, deixando emailClient e relógio rodarem de verdade",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma dependência, já que mockar qualquer uma delas falsifica o teste",
                                "isCorrect": false
                            },
                            {
                                "text": "A lógica de decisão do service, mantendo as três dependências reais",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Os dublês de teste: mock, stub, spy e fake",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Dublê de teste: o nome e a ideia\n\nO termo *test double* (dublê de teste) é do Martin Fowler, emprestado direto do cinema: assim como um dublê substitui o ator numa cena arriscada, um dublê de teste substitui uma dependência real numa situação em que você não quer (ou não pode) usar a coisa de verdade. Só que \"dublê\" não é uma coisa só: existem quatro variações comuns, cada uma respondendo uma pergunta diferente sobre o teste."
                    },
                    {
                        "type": "text",
                        "value": "## As quatro variações, de forma simples\n\n- **Stub**: devolve uma resposta fixa e pronta quando chamado, sem lógica nenhuma por trás. Serve pra fazer a dependência \"responder alguma coisa\" e deixar o fluxo seguir.\n- **Mock**: parece um stub (também devolve algo controlado), mas o foco dele é a interação: depois você verifica se foi chamado, quantas vezes e com quais argumentos.\n- **Spy**: observa uma função real sem trocar o comportamento dela. A função original continua rodando, o spy só fica registrando as chamadas por cima.\n- **Fake**: uma implementação alternativa e simplificada da dependência real, funcional mas mais simples (o exemplo clássico é um repositório em memória no lugar do banco)."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Dublê\", \"O que faz\"], [\"Stub\", \"Devolve uma resposta fixa e pronta, sem lógica real por trás\"], [\"Mock\", \"Devolve uma resposta controlada e registra as chamadas, pra depois verificar a interação\"], [\"Spy\", \"Observa uma função real sem trocar o comportamento dela, só registra as chamadas\"], [\"Fake\", \"Substitui a dependência por uma implementação simplificada, porém funcional (ex.: repositório em memória)\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Quando cada um se encaixa\n\nNa prática, ninguém para pra classificar cada dublê no meio do trabalho, e é comum ouvir \"mock\" sendo usado pra qualquer um dos quatro. Mas a distinção ajuda a escolher a ferramenta certa: use **stub** quando só precisa que a dependência devolva algo pra função seguir; use **mock** quando o próprio teste é sobre a interação (\"o service chamou o email certo?\"); use **spy** quando quer manter o comportamento real de algo e só confirmar que foi chamado (por exemplo, espiar um log de erro dentro do middleware de auth sem mudar o jeito como ele decide bloquear a requisição); use **fake** quando a dependência tem lógica de verdade que vale a pena simular, como um repositório que precisa buscar, salvar e checar duplicidade."
                    },
                    {
                        "type": "code",
                        "value": "// um fake: implementacao simplificada porem funcional, no lugar do banco\ninterface Usuario {\n  id: number;\n  nome: string;\n  email: string;\n}\n\nclass UsuarioRepositoryFake {\n  private usuarios: Usuario[] = [];\n\n  async buscarPorEmail(email: string): Promise<Usuario | null> {\n    return this.usuarios.find((u) => u.email === email) ?? null;\n  }\n\n  async criar(dados: Omit<Usuario, \"id\">): Promise<Usuario> {\n    const usuario = { id: this.usuarios.length + 1, ...dados };\n    this.usuarios.push(usuario);\n    return usuario;\n  }\n}"
                    },
                    {
                        "type": "text",
                        "value": "## Conectando com o UsuarioService\n\nNo `cadastrar` do Módulo 3, dá pra ver os quatro tipos disputando espaço: `buscarPorEmail` pode virar um **stub** (só precisa devolver `null` ou um usuário existente), `emailClient.enviarBoasVindas` vira um **mock** (o teste quer confirmar que foi chamado com o email certo) e o repository inteiro poderia virar um **fake** em memória, se valer a pena simular o comportamento de busca e criação juntos. Nas próximas duas aulas, isso sai do papel e vira código de verdade com `vi.fn()` e `vi.mock()`."
                    },
                    {
                        "type": "quote",
                        "value": "Stub devolve resposta pronta, mock verifica a interação, spy observa sem trocar nada, fake reimplementa de um jeito simples: dublês diferentes pra perguntas diferentes sobre o mesmo teste."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual dublê devolve uma resposta pronta e fixa pra quem chama, sem nenhuma lógica real por trás?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Stub",
                                "isCorrect": true
                            },
                            {
                                "text": "Mock",
                                "isCorrect": false
                            },
                            {
                                "text": "Spy",
                                "isCorrect": false
                            },
                            {
                                "text": "Fake",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual dublê observa as chamadas de uma função real sem substituir o comportamento dela?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Spy",
                                "isCorrect": true
                            },
                            {
                                "text": "Stub",
                                "isCorrect": false
                            },
                            {
                                "text": "Mock",
                                "isCorrect": false
                            },
                            {
                                "text": "Fake",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você precisa que o repositório de usuários se comporte de verdade durante o teste (buscar, salvar, checar duplicidade), sem tocar o banco real. Qual dublê encaixa melhor?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Fake, uma implementação simplificada porém funcional, tipo em memória",
                                "isCorrect": true
                            },
                            {
                                "text": "Stub, que devolve sempre a mesma resposta fixa pra qualquer chamada",
                                "isCorrect": false
                            },
                            {
                                "text": "Spy, que só observa chamadas numa função que já existe de verdade",
                                "isCorrect": false
                            },
                            {
                                "text": "Mock, que só registra quantas vezes uma função foi chamada",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a diferença principal entre mock e stub, dois dublês que costumam se confundir?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Mock verifica a interação depois, stub só devolve uma resposta fixa",
                                "isCorrect": true
                            },
                            {
                                "text": "Mock só funciona em teste de integração, stub só em teste unitário",
                                "isCorrect": false
                            },
                            {
                                "text": "Mock sempre precisa de um banco real, stub nunca depende de nada",
                                "isCorrect": false
                            },
                            {
                                "text": "Mock deixa o teste mais lento, porque grava tudo num disco real",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O teste do UsuarioService.cadastrar precisa garantir que emailClient.enviarBoasVindas foi chamado com o email certo. Qual dublê responde melhor essa pergunta?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Mock, porque o teste verifica a interação, não só um retorno",
                                "isCorrect": true
                            },
                            {
                                "text": "Stub, porque o teste só depende do valor que a função devolve",
                                "isCorrect": false
                            },
                            {
                                "text": "Fake, porque o teste precisa de uma implementação real de email",
                                "isCorrect": false
                            },
                            {
                                "text": "Spy, porque o teste não pode alterar o envio real do email",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "vi.fn e vi.mock na prática",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## vi.fn: criando uma função dublê do zero\n\n`vi.fn()` cria uma função mock: uma função de verdade, que pode ser passada pra qualquer lugar que espera uma função, mas que o Vitest instrumenta por dentro pra lembrar de cada chamada. Sozinha, sem nenhuma configuração, ela devolve `undefined` quando chamada. Encadeando `.mockReturnValue(valor)` você define o que ela devolve numa chamada síncrona; encadeando `.mockResolvedValue(valor)` você define o que ela devolve dentro de uma `Promise`, pro caso de dublar uma função assíncrona (o caso mais comum ao mockar um repositório ou um cliente de API)."
                    },
                    {
                        "type": "code",
                        "value": "import { vi, describe, it, expect } from \"vitest\";\n\ndescribe(\"vi.fn basico\", () => {\n  it(\"cria uma funcao mock com retorno controlado\", () => {\n    const buscarPorEmail = vi.fn();\n    buscarPorEmail.mockReturnValue(null);\n\n    expect(buscarPorEmail(\"ana@exemplo.com\")).toBe(null);\n  });\n\n  it(\"controla o retorno de uma funcao assincrona\", async () => {\n    const buscarPorEmail = vi.fn();\n    buscarPorEmail.mockResolvedValue({ id: 1, nome: \"Ana\" });\n\n    const resultado = await buscarPorEmail(\"ana@exemplo.com\");\n    expect(resultado).toEqual({ id: 1, nome: \"Ana\" });\n  });\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Trocando a dependência real por um objeto de vi.fn\n\nComo o `UsuarioService` recebe o `repository` pelo construtor, dublar essa dependência é só montar um objeto literal com um `vi.fn()` em cada método que a interface espera, e passar esse objeto no lugar do repositório real. Não precisa de nenhuma ferramenta especial do Vitest pra isso, é injeção de dependência de qualquer jeito: o service não sabe (nem precisa saber) se está recebendo o repositório real ou um dublê."
                    },
                    {
                        "type": "code",
                        "value": "// src/usuarios/usuario.service.test.ts\nimport { vi, describe, it, expect } from \"vitest\";\nimport { UsuarioService } from \"./usuario.service\";\n\ndescribe(\"UsuarioService.cadastrar\", () => {\n  it(\"cadastra um usuario novo quando o email ainda nao existe\", async () => {\n    const repositoryFalso = {\n      buscarPorEmail: vi.fn().mockResolvedValue(null),\n      criar: vi.fn().mockResolvedValue({ id: 1, nome: \"Ana\", email: \"ana@exemplo.com\" }),\n    };\n    const service = new UsuarioService(repositoryFalso);\n\n    const usuario = await service.cadastrar(\"Ana\", \"ana@exemplo.com\");\n\n    expect(usuario.id).toBe(1);\n  });\n});"
                    },
                    {
                        "type": "text",
                        "value": "## vi.mock: quando a dependência não é injetada\n\nO `emailClient` é diferente: ele é importado direto dentro de `usuario.service.ts`, não chega pelo construtor. Pra substituir um módulo inteiro assim, o Vitest tem o `vi.mock(caminho, factory)`: você aponta o caminho do módulo (igual ao do `import`) e devolve, na `factory`, a versão mockada de tudo que esse módulo exporta. (Quando você quer manter o comportamento real de uma função e só espiar as chamadas por cima, sem recriar o módulo inteiro, a ferramenta certa é o `vi.spyOn`, que volta com força lá na frente.)"
                    },
                    {
                        "type": "code",
                        "value": "// src/usuarios/usuario.service.test.ts\nimport { vi, describe, it, expect } from \"vitest\";\nimport { UsuarioService } from \"./usuario.service\";\nimport { emailClient } from \"../email/email.client\";\n\nvi.mock(\"../email/email.client\", () => ({\n  emailClient: {\n    enviarBoasVindas: vi.fn().mockResolvedValue(undefined),\n  },\n}));\n\ndescribe(\"UsuarioService.cadastrar: envio de email\", () => {\n  it(\"chama o emailClient depois de cadastrar\", async () => {\n    const repositoryFalso = {\n      buscarPorEmail: vi.fn().mockResolvedValue(null),\n      criar: vi.fn().mockResolvedValue({ id: 1, nome: \"Ana\", email: \"ana@exemplo.com\" }),\n    };\n    const service = new UsuarioService(repositoryFalso);\n\n    await service.cadastrar(\"Ana\", \"ana@exemplo.com\");\n\n    expect(emailClient.enviarBoasVindas).toHaveBeenCalled();\n  });\n});"
                    },
                    {
                        "type": "quote",
                        "value": "vi.fn cria a função dublê, mockReturnValue e mockResolvedValue controlam o que ela devolve, vi.mock troca o módulo inteiro quando a dependência é importada direto: três ferramentas, cada uma resolvendo um jeito diferente de dependência."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que vi.fn() cria, sozinho, sem nenhuma configuração extra?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma função mock que, por padrão, devolve undefined quando chamada",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma conexão real com o banco de dados configurado no projeto",
                                "isCorrect": false
                            },
                            {
                                "text": "Um servidor HTTP de teste escutando numa porta local livre",
                                "isCorrect": false
                            },
                            {
                                "text": "Um arquivo de configuração novo do Vitest dentro do projeto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "repository.buscarPorEmail é assíncrono e devolve uma Promise. Qual método controla o retorno dele num vi.fn()?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "mockResolvedValue, feito pra funções que devolvem uma Promise",
                                "isCorrect": true
                            },
                            {
                                "text": "mockReturnValue, que funciona igual pra funções síncronas e assíncronas",
                                "isCorrect": false
                            },
                            {
                                "text": "mockAsyncValue, o método padrão do Vitest pra qualquer Promise",
                                "isCorrect": false
                            },
                            {
                                "text": "mockImplementationSync, usado quando a função não é assíncrona",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O construtor do UsuarioService espera um objeto repository com buscarPorEmail e criar. Como montar um dublê desse repository direto no teste, sem usar vi.mock?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um objeto literal com métodos criados por vi.fn(), passado no construtor",
                                "isCorrect": true
                            },
                            {
                                "text": "Um vi.mock(\"./usuario.repository\") declarado dentro do próprio it",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma importação direta do repository real, o mesmo usado em produção",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma classe nova que estende UsuarioService e sobrescreve o construtor",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O emailClient é importado direto no arquivo do service, não recebido por parâmetro. Qual ferramenta troca esse módulo inteiro por uma versão mockada?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "vi.mock, apontando pro caminho do módulo importado",
                                "isCorrect": true
                            },
                            {
                                "text": "vi.fn, chamado direto dentro do próprio arquivo de produção",
                                "isCorrect": false
                            },
                            {
                                "text": "vi.spyOn, aplicado sobre a classe UsuarioService inteira",
                                "isCorrect": false
                            },
                            {
                                "text": "expect, configurado no topo do arquivo de teste",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de vi.mock(\"../email/email.client\", factory), o teste importa emailClient normalmente e chama service.cadastrar. O que essa combinação garante?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Que emailClient.enviarBoasVindas ali é a versão mockada pelo factory",
                                "isCorrect": true
                            },
                            {
                                "text": "Que o service passa a ignorar completamente a chamada ao emailClient",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o Vitest apaga o arquivo email.client.ts durante a execução",
                                "isCorrect": false
                            },
                            {
                                "text": "Que qualquer import de email em outro arquivo também é bloqueado",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Verificando chamadas com toHaveBeenCalledWith",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Não basta rodar sem quebrar: verificar a interação\n\nAté aqui, os dublês serviram pra controlar o que uma dependência devolve. Mas uma função criada com `vi.fn()` também lembra de cada chamada que recebeu: com quais argumentos, quantas vezes. Verificar essa interação é o que diferencia um mock de um simples stub, como visto na Aula 2, e é essencial quando o próprio comportamento que você quer garantir é \"o service chamou tal dependência do jeito certo\", não só \"o service devolveu tal valor\"."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Matcher\", \"O que verifica\"], [\"toHaveBeenCalled\", \"Se a função foi chamada ao menos uma vez, sem checar argumento nem quantidade\"], [\"toHaveBeenCalledWith\", \"Se a função foi chamada com exatamente aqueles argumentos\"], [\"toHaveBeenCalledTimes\", \"Se a função foi chamada exatamente um número N de vezes\"], [\"toHaveBeenCalledOnce\", \"Atalho para toHaveBeenCalledTimes(1), confirma exatamente uma chamada\"]]"
                    },
                    {
                        "type": "code",
                        "value": "import { vi, describe, it, expect } from \"vitest\";\n\ndescribe(\"verificando chamadas\", () => {\n  it(\"confirma que a funcao foi chamada\", () => {\n    const enviarBoasVindas = vi.fn();\n\n    enviarBoasVindas(\"ana@exemplo.com\");\n\n    expect(enviarBoasVindas).toHaveBeenCalled();\n  });\n\n  it(\"confirma com quais argumentos a funcao foi chamada\", () => {\n    const enviarBoasVindas = vi.fn();\n\n    enviarBoasVindas(\"ana@exemplo.com\");\n\n    expect(enviarBoasVindas).toHaveBeenCalledWith(\"ana@exemplo.com\");\n  });\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Voltando pro UsuarioService: quem foi chamado, e como\n\nNo `cadastrar`, faz sentido confirmar que `repository.criar` foi chamado com o nome e o email recebidos, e que `emailClient.enviarBoasVindas` foi chamado com o email certo. Só que o objeto que `criar` recebe também carrega `criadoEm: new Date()`, que muda a cada execução, então comparar com um objeto fixo e completo em `toHaveBeenCalledWith` vai falhar por um motivo bobo. Pra isso, o Vitest aceita `expect.objectContaining({...})` dentro do próprio `toHaveBeenCalledWith`, checando só os campos que importam pro teste."
                    },
                    {
                        "type": "code",
                        "value": "// src/usuarios/usuario.service.test.ts\nit(\"chama o repository.criar com o nome e o email recebidos\", async () => {\n  const repositoryFalso = {\n    buscarPorEmail: vi.fn().mockResolvedValue(null),\n    criar: vi.fn().mockResolvedValue({ id: 1, nome: \"Ana\", email: \"ana@exemplo.com\" }),\n  };\n  const service = new UsuarioService(repositoryFalso);\n\n  await service.cadastrar(\"Ana\", \"ana@exemplo.com\");\n\n  expect(repositoryFalso.criar).toHaveBeenCalledWith(\n    expect.objectContaining({ nome: \"Ana\", email: \"ana@exemplo.com\" })\n  );\n  expect(repositoryFalso.buscarPorEmail).toHaveBeenCalledTimes(1);\n});"
                    },
                    {
                        "type": "text",
                        "value": "## Quando toHaveBeenCalledTimes pega um bug de verdade\n\nImagine que uma alteração no `cadastrar` introduziu um bug bobo: por causa de uma condição mal colocada, `emailClient.enviarBoasVindas` passa a ser chamado duas vezes por cadastro. Um teste que só confere `toHaveBeenCalledWith(email)` continua verde, porque o email certo foi chamado, só que duas vezes. É o `toHaveBeenCalledTimes(1)` que pega esse tipo de bug, o que reforça por que checar a quantidade de chamadas importa tanto quanto checar os argumentos."
                    },
                    {
                        "type": "quote",
                        "value": "toHaveBeenCalled confirma que rolou, toHaveBeenCalledWith confirma com o quê, toHaveBeenCalledTimes confirma quantas vezes: sem as três, um mock só prova metade da história."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que expect(fn).toHaveBeenCalled() verifica sobre uma função mock?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Se a função foi chamada pelo menos uma vez durante o teste",
                                "isCorrect": true
                            },
                            {
                                "text": "Se a função devolveu exatamente o valor esperado pelo teste",
                                "isCorrect": false
                            },
                            {
                                "text": "Se a função foi declarada com a palavra reservada async",
                                "isCorrect": false
                            },
                            {
                                "text": "Se a função existe dentro do arquivo de produção testado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual matcher confirma não só que a função foi chamada, mas com quais argumentos exatos?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "toHaveBeenCalledWith",
                                "isCorrect": true
                            },
                            {
                                "text": "toHaveBeenCalled",
                                "isCorrect": false
                            },
                            {
                                "text": "toHaveBeenCalledTimes",
                                "isCorrect": false
                            },
                            {
                                "text": "toHaveReturnedWith",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "expect(repositoryFalso.criar).toHaveBeenCalledWith({ nome: \"Ana\", email: \"ana@exemplo.com\" }) falha, mesmo o cadastro funcionando certinho. Por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O objeto real também tem criadoEm, e a comparação exata não bate",
                                "isCorrect": true
                            },
                            {
                                "text": "toHaveBeenCalledWith não aceita objetos como argumento de busca",
                                "isCorrect": false
                            },
                            {
                                "text": "O repositoryFalso precisa ser declarado fora do describe pra contar",
                                "isCorrect": false
                            },
                            {
                                "text": "O método criar não pode ser assíncrono dentro de um dublê",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual troca resolve o teste do item anterior, aceitando um objeto parcial na comparação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "toHaveBeenCalledWith(expect.objectContaining({ nome, email }))",
                                "isCorrect": true
                            },
                            {
                                "text": "toHaveBeenCalledWith(expect.anything())",
                                "isCorrect": false
                            },
                            {
                                "text": "toHaveBeenCalledWith(JSON.stringify({ nome, email }))",
                                "isCorrect": false
                            },
                            {
                                "text": "toHaveBeenCalledTimes(expect.objectContaining({ nome, email }))",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de uma mudança no código, o teste com toHaveBeenCalledWith continua verde, mas em produção o email de boas vindas está sendo enviado duas vezes. Qual asserção pegaria esse bug?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "expect(emailClient.enviarBoasVindas).toHaveBeenCalledTimes(1)",
                                "isCorrect": true
                            },
                            {
                                "text": "expect(emailClient.enviarBoasVindas).toHaveBeenCalledWith(email)",
                                "isCorrect": false
                            },
                            {
                                "text": "expect(emailClient.enviarBoasVindas).toHaveBeenCalled()",
                                "isCorrect": false
                            },
                            {
                                "text": "expect(emailClient.enviarBoasVindas).toBeInstanceOf(Function)",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O perigo de mockar demais",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Quando o teste só testa o mock\n\nSe você mocka literalmente tudo, incluindo a própria lógica que deveria estar sob teste, o teste vira uma verificação circular: você configura o mock pra devolver X, e depois confere que devolveu X. Ele passa sempre, inclusive quando a lógica real está quebrada, porque a lógica real nunca chegou a rodar. Isso é o perigo de mockar demais, e é mais comum do que parece quando a pressão é só \"deixar o teste verde\"."
                    },
                    {
                        "type": "code",
                        "value": "// exemplo do que NAO fazer: mockar o proprio metodo que deveria ser testado\nimport { vi, describe, it, expect } from \"vitest\";\nimport { UsuarioService } from \"./usuario.service\";\n\ndescribe(\"cadastrar (mockado demais)\", () => {\n  it(\"nao prova que a logica de cadastro funciona\", async () => {\n    const service = new UsuarioService({} as any);\n    vi.spyOn(service, \"cadastrar\").mockResolvedValue({\n      id: 1,\n      nome: \"Ana\",\n      email: \"ana@exemplo.com\",\n      criadoEm: new Date(),\n    });\n\n    const usuario = await service.cadastrar(\"Ana\", \"ana@exemplo.com\");\n\n    expect(usuario.id).toBe(1);\n    // passa mesmo se a logica real de \"cadastrar\" estiver quebrada:\n    // \"cadastrar\" nunca rodou de verdade, foi ele mesmo que foi substituido\n  });\n});"
                    },
                    {
                        "type": "text",
                        "value": "## A régua: o que mockar e o que deixar real\n\nUma régua prática: mocka o que é **lento, externo ou não-determinístico** (banco de dados, API externa, envio de email, relógio). Deixa real o que é **a própria lógica que você quer provar**: as decisões, os cálculos, as validações, o \"miolo\" da unidade sob teste. Se você mocka justamente essa parte, sobra pouca coisa pra testar, porque o teste deixou de exercitar qualquer coisa que você escreveu."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Situação\", \"Mockar ou manter real\"], [\"Chamada ao banco de dados (repository)\", \"Mockar: é lenta e externa ao que você quer testar\"], [\"Chamada a uma API de terceiros\", \"Mockar: depende de rede e de fatores fora do seu controle\"], [\"O relógio (new Date, Date.now)\", \"Mockar: sem isso o resultado muda a cada execução\"], [\"A lógica de decisão dentro do próprio service\", \"Manter real: é exatamente isso que o teste precisa provar\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Mockando o tempo por cima\n\nO relógio é um caso à parte: não é uma dependência externa como um banco ou uma API, é uma função nativa da linguagem, mas ainda assim vale mockar, porque `new Date()` devolve um valor diferente a cada execução. O Vitest resolve isso com `vi.useFakeTimers()` e `vi.setSystemTime(data)`: você congela o \"agora\" no valor que quiser, testa o comportamento (por exemplo, se um convite expirou) e depois volta com `vi.useRealTimers()`, sem precisar esperar o tempo passar de verdade."
                    },
                    {
                        "type": "code",
                        "value": "// src/usuarios/convite.ts\nexport function conviteExpirado(criadoEm: Date, validadeEmDias: number): boolean {\n  const limite = new Date(criadoEm);\n  limite.setDate(limite.getDate() + validadeEmDias);\n  return new Date() > limite;\n}\n\n// src/usuarios/convite.test.ts\nimport { vi, describe, it, expect, beforeEach, afterEach } from \"vitest\";\nimport { conviteExpirado } from \"./convite\";\n\ndescribe(\"conviteExpirado\", () => {\n  beforeEach(() => {\n    vi.useFakeTimers();\n  });\n\n  afterEach(() => {\n    vi.useRealTimers();\n  });\n\n  it(\"considera expirado um convite de 7 dias apos 8 dias\", () => {\n    const criadoEm = new Date(\"2026-01-01T10:00:00\");\n    vi.setSystemTime(new Date(\"2026-01-09T10:00:00\"));\n\n    expect(conviteExpirado(criadoEm, 7)).toBe(true);\n  });\n\n  it(\"considera valido um convite de 7 dias apos apenas 2 dias\", () => {\n    const criadoEm = new Date(\"2026-01-01T10:00:00\");\n    vi.setSystemTime(new Date(\"2026-01-03T10:00:00\"));\n\n    expect(conviteExpirado(criadoEm, 7)).toBe(false);\n  });\n});"
                    },
                    {
                        "type": "quote",
                        "value": "Mockar o banco, a API externa e o relógio dá controle sobre o teste; mockar a própria lógica que você quer provar só finge que testou."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o risco principal de mockar praticamente tudo dentro de um teste unitário?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O teste passa a verificar o próprio mock, não o comportamento real",
                                "isCorrect": true
                            },
                            {
                                "text": "O teste fica mais lento, porque o Vitest recria cada mock do zero",
                                "isCorrect": false
                            },
                            {
                                "text": "O Vitest recusa rodar arquivos com mais de um vi.mock declarado",
                                "isCorrect": false
                            },
                            {
                                "text": "O teste deixa de aparecer no relatório de cobertura de código",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das opções abaixo é a candidata mais clara pra virar um dublê num teste unitário?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Uma chamada de rede pra uma API externa de terceiros",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma função que soma dois números recebidos por parâmetro",
                                "isCorrect": false
                            },
                            {
                                "text": "Um objeto de configuração criado dentro do próprio teste",
                                "isCorrect": false
                            },
                            {
                                "text": "A lógica de validação que o teste deveria estar provando",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um teste mocka o próprio método que está testando, com vi.spyOn(service, \"cadastrar\").mockResolvedValue(...), e confere só o retorno. O cadastrar real tem um bug. O teste pega esse bug?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não, porque a lógica real de cadastrar nunca chega a rodar",
                                "isCorrect": true
                            },
                            {
                                "text": "Sim, porque mockResolvedValue reexecuta a lógica original por baixo",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, porque o Vitest compara o mock com o código fonte sozinho",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, mas só quando o bug está no repository, nunca no service",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que o relógio (new Date, Date.now) costuma virar um dublê, mesmo sendo nativo da linguagem e não uma API de terceiros?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o valor muda a cada execução, tirando o determinismo do teste",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Vitest bloqueia por padrão qualquer uso direto de Date",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque new Date lança exceção quando chamada dentro de um it",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Node não permite importar Date dentro de um arquivo de teste",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois testes cobrem UsuarioService.cadastrar: um mocka só repository e emailClient, mantendo a lógica de decisão real; outro mocka o próprio método cadastrar inteiro. Os dois estão verdes. Qual prova de fato que o cadastro funciona?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Só o primeiro, porque nele a lógica real de cadastrar chega a rodar",
                                "isCorrect": true
                            },
                            {
                                "text": "Os dois, porque ambos usam vi.fn e por isso são igualmente válidos",
                                "isCorrect": false
                            },
                            {
                                "text": "Só o segundo, porque ele isola completamente qualquer dependência",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum dos dois, teste com mock nunca prova comportamento real",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Testes de integração",
        "aulas": [
            {
                "titulo": "O que integração testa (e o unitário não)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Módulo 4 - Testes de integração\n\nNos módulos anteriores você testou funções isoladas: um cálculo, uma validação, um service inteiro com o banco trocado por um mock. Esses testes são rápidos e focados, mas têm um ponto cego. Eles garantem que a peça funciona sozinha, do jeito que quem escreveu o mock imaginou. Não garantem que as peças encaixam quando o pedido chega de verdade, passando pela rota, pelo middleware e pelo banco.\n\nÉ aí que entra o teste de integração: testar várias partes do sistema juntas, do jeito que elas realmente rodam em produção."
                    },
                    {
                        "type": "text",
                        "value": "## O que é um teste de integração\n\nUm teste de integração exercita mais de uma camada ao mesmo tempo, sem trocar as peças por dublês. No CRUD de tarefas que você já construiu, por exemplo, isso quer dizer:\n\n- a rota Express de verdade, registrada com `app.post`\n- o middleware que roda antes dela (auth, validação, parsing de JSON)\n- o service com a regra de negócio\n- o banco de dados de verdade (um banco de teste, não mockado)\n\nNenhuma dessas peças é substituída. O teste faz uma requisição HTTP real contra a aplicação inteira e confere o que volta."
                    },
                    {
                        "type": "code",
                        "value": "// tarefas.service.test.js (teste unitário, do Módulo 3)\nimport { describe, it, expect, vi } from 'vitest'\nimport { pool } from '../db/pool.js'\nimport { criarTarefa } from '../services/tarefas.service.js'\n\nvi.mock('../db/pool.js', () => ({\n  pool: { query: vi.fn() }\n}))\n\ndescribe('criarTarefa (unitário)', () => {\n  it('retorna a tarefa criada', async () => {\n    pool.query.mockResolvedValue({\n      rows: [{ id: 1, titulo: 'Estudar SQL', concluida: false }]\n    })\n\n    const tarefa = await criarTarefa({ titulo: 'Estudar SQL' })\n\n    expect(tarefa).toEqual({ id: 1, titulo: 'Estudar SQL', concluida: false })\n  })\n})"
                    },
                    {
                        "type": "code",
                        "value": "// services/tarefas.service.js (com um bug real no SQL)\nexport async function criarTarefa({ titulo }) {\n  const { rows } = await pool.query(\n    `INSERT INTO tarefas (titulo, feita)\n     VALUES ($1, false)\n     RETURNING id, titulo, concluida`,\n    [titulo]\n  )\n  return rows[0]\n}\n\n// a coluna certa, na migration, é concluida (não feita)\n// o teste unitário acima passa do mesmo jeito: pool.query está mockado,\n// ninguém nunca manda esse SQL pro Postgres de verdade"
                    },
                    {
                        "type": "text",
                        "value": "## O que o unitário não pega\n\nO teste unitário passou porque `pool.query` nunca tocou um banco real. Um teste de integração, rodando contra um banco de teste de verdade, chamaria esse service e o Postgres devolveria um erro parecido com `column feita of relation tarefas does not exist`.\n\nÉ esse tipo de problema que a integração pega e o unitário não:\n\n- **SQL errado**: coluna, tabela ou tipo que não bate com o schema real.\n- **Serialização**: o JSON de resposta transforma datas, `null`, `undefined` de um jeito que o teste unitário, olhando o objeto JS puro, não percebe.\n- **Middleware fora de ordem**: o auth registrado depois da rota, o parser de JSON faltando.\n- **Integração entre camadas**: o controller espera `tarefa.concluida`, mas o service devolve `tarefa.done`.\n\nNenhum desses bugs aparece testando o service com um mock. Eles só aparecem quando a requisição passa pelo caminho inteiro."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Teste unitário\",\"Teste de integração\"],[\"Isola o quê\",\"Uma função ou módulo só\",\"Rota, middleware, service e banco juntos\"],[\"Dependências\",\"Trocadas por mock (vi.mock, vi.fn)\",\"Reais: app Express de verdade e banco de teste\"],[\"Velocidade\",\"Milissegundos\",\"Mais lento (I/O de banco real)\"],[\"O que pega\",\"Lógica de negócio, cálculo, condição\",\"SQL errado, serialização, ordem de middleware\"],[\"Posição na pirâmide\",\"Base (muitos testes)\",\"Meio (menos testes que unitário)\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Teste unitário garante que a peça funciona sozinha. Teste de integração garante que as peças, juntas, ainda funcionam."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que diferencia um teste de integração de um teste unitário?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ele testa várias peças reais juntas, como rota, middleware e banco",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele testa uma função isolada, com as dependências trocadas por mocks",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele testa só o HTML e o CSS da tela, sem passar pelo backend",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele testa apenas se a API responde dentro de um tempo limite",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No teste de integração do CRUD de tarefas, o que continua sendo real, sem virar mock?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A rota Express, o middleware e o banco de dados",
                                "isCorrect": true
                            },
                            {
                                "text": "Apenas a rota Express, o resto continua mockado",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas o banco de dados, a rota é simulada à parte",
                                "isCorrect": false
                            },
                            {
                                "text": "Nada: todas as camadas continuam trocadas por dublês",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um teste unitário do service `criarTarefa` (com `pool.query` mockado) passa, mas em produção o endpoint quebra com erro de coluna inexistente no Postgres. Por que o teste unitário não pegou isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque o mock nunca envia o SQL de verdade pro banco de dados",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Vitest ignora erros de SQL por padrão nos testes unitários",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Postgres só valida colunas quando roda em produção",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque testes unitários não conseguem usar `expect` para checar erros",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um teste unitário compara o objeto retornado pelo service e passa. Só que o JSON que a API realmente devolve no `res.body` está diferente do esperado. Que tipo de problema é esse?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "É um problema de serialização, resolvido só quando o teste confere o body HTTP real",
                                "isCorrect": true
                            },
                            {
                                "text": "É um problema de performance, resolvido só quando o teste mede o tempo de resposta",
                                "isCorrect": false
                            },
                            {
                                "text": "É um bug do Vitest, resolvido rodando os testes com a flag `--no-cache` ativada",
                                "isCorrect": false
                            },
                            {
                                "text": "É um problema de tipagem, resolvido automaticamente pelo compilador do TypeScript",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O controller da rota `GET /tarefas/:id` lê `tarefa.concluida`, mas o service, depois de um refactor, passou a devolver o campo `tarefa.feita`. Os testes unitários do service continuam passando. Qual teste vai expor essa quebra de contrato entre as camadas?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Um teste de integração, fazendo a requisição HTTP e conferindo o corpo",
                                "isCorrect": true
                            },
                            {
                                "text": "Um teste unitário adicional, testando o service com um mock diferente",
                                "isCorrect": false
                            },
                            {
                                "text": "Um teste de cobertura, rodando `vitest run --coverage` no service",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum teste pega isso, só um code review manual identificaria",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O banco de teste efêmero",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Por que não testar contra o banco de dev\n\nTodo teste de integração de verdade precisa de um banco de dados. A tentação é apontar o teste pro banco que você já tem rodando, o de desenvolvimento. Não faça isso.\n\nUm teste de integração de CRUD precisa deixar o banco num estado conhecido antes de cada teste, o que normalmente significa limpar as tabelas entre um teste e outro. Se esse `TRUNCATE` roda contra o banco de dev por engano, ele apaga os dados de dev de verdade. Não é uma hipótese: é exatamente o tipo de acidente que acontece quando a `DATABASE_URL` do teste aponta pro lugar errado."
                    },
                    {
                        "type": "text",
                        "value": "## A solução: um banco efêmero só para os testes\n\nA prática é ter um banco descartável, que existe só durante a rodada de testes:\n\n1. Sobe um Postgres novo (geralmente num container Docker), numa porta separada da do banco de dev.\n2. Aplica as migrations nele, do zero, com a ferramenta que você já usa (Knex, Prisma, Drizzle...).\n3. Roda os testes, limpando as tabelas entre cada um.\n4. Derruba o container no final. Na próxima rodada, tudo começa limpo de novo.\n\nIsso também resolve outro problema: o banco de teste tem exatamente o schema das migrations atuais, sem nenhum dado estranho que alguém deixou lá manualmente."
                    },
                    {
                        "type": "code",
                        "value": "#!/usr/bin/env bash\n# tests/run-integration.sh\nset -euo pipefail\n\nexport DATABASE_URL=postgres://test:test@localhost:55433/testdb\n\ndocker run -d --rm --name pg_test -e POSTGRES_USER=test -e POSTGRES_PASSWORD=test -e POSTGRES_DB=testdb -p 55433:5432 postgres:16-alpine\n\necho Aguardando o banco aceitar conexoes...\nuntil docker exec pg_test pg_isready -U test -d testdb; do sleep 1; done\n\nnpm run migrate\n\nnpx vitest run tests/integration\n\ndocker rm -f pg_test"
                    },
                    {
                        "type": "text",
                        "value": "## É assim que a própria plataforma faz\n\nO backend da plataforma tem um script só pra isso, separado do `npm test` do dia a dia. Ele sobe um Postgres efêmero em Docker, espera o banco aceitar conexão, aplica as migrations e só então roda os testes de integração. No final, derruba o container.\n\nRodar os testes de integração é um comando à parte (algo como `bash tests/run-integration.sh`), nunca o `npm test` comum. A separação existe justamente pra que a `DATABASE_URL` de teste nunca seja, por acidente, a de desenvolvimento."
                    },
                    {
                        "type": "code",
                        "value": "// tests/tarefas.integration.test.js\nimport { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'\nimport { pool } from '../db/pool.js'\nimport { rodarMigrations } from '../db/migrate.js'\n\nbeforeAll(async () => {\n  await rodarMigrations()\n})\n\nafterEach(async () => {\n  await pool.query('TRUNCATE TABLE tarefas RESTART IDENTITY CASCADE')\n})\n\nafterAll(async () => {\n  await pool.end()\n})\n\ndescribe('POST /tarefas', () => {\n  // os testes de integração vêm aqui (próxima aula)\n})"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Hook\",\"Quando roda\",\"Uso no teste de integração\"],[\"beforeAll\",\"Uma vez, antes de todos os testes do arquivo\",\"Subir e migrar o banco de teste\"],[\"afterEach\",\"Depois de cada teste\",\"Limpar (truncar) as tabelas usadas\"],[\"afterAll\",\"Uma vez, depois de todos os testes\",\"Fechar a conexão com o banco (pool.end())\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "O banco de teste existe pra morrer. Se ele sobreviver ao teste sem ser derrubado, alguma coisa saiu do script."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que os testes de integração não devem rodar contra o banco de desenvolvimento?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque a limpeza das tabelas entre testes apagaria dados de dev",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o driver do Postgres bloqueia conexões vindas do Vitest",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o comando `TRUNCATE` não existe na versão de dev do Postgres",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque os testes deixariam o banco de dev sem espaço em disco",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No fluxo com banco efêmero, o que acontece com o container do banco de teste depois que a suíte termina?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ele é derrubado, e a próxima rodada sobe um banco novo",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele continua rodando, guardando dados pra próxima rodada",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele passa a ser usado como banco de desenvolvimento",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele fica pausado até o Vitest retomar automaticamente",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um dev configura o script de teste de integração apontando `DATABASE_URL` para o banco de desenvolvimento por engano. O que tende a acontecer quando a suíte roda?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O `afterEach` limpa as tabelas e apaga dados reais do banco de dev",
                                "isCorrect": true
                            },
                            {
                                "text": "O Vitest detecta o erro e recusa a rodar os testes de integração",
                                "isCorrect": false
                            },
                            {
                                "text": "As migrations falham, porque o banco de dev já está migrado",
                                "isCorrect": false
                            },
                            {
                                "text": "Os testes ficam mais rápidos, pois o banco de dev já está aquecido",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa suíte de teste de integração, em qual hook faz mais sentido aplicar as migrations no banco de teste?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "No `beforeAll`, que roda uma única vez pro arquivo inteiro",
                                "isCorrect": true
                            },
                            {
                                "text": "No `afterEach`, para garantir que roda de novo a cada teste",
                                "isCorrect": false
                            },
                            {
                                "text": "No `afterAll`, depois que os testes já leram os dados",
                                "isCorrect": false
                            },
                            {
                                "text": "Dentro de cada `it`, pra isolar a migration por teste",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de rodar sozinho, um teste de integração passa. Rodado junto com o resto da suíte, ele falha porque encontra uma tarefa que outro teste criou e não devia estar lá. Qual é a causa mais provável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Falta limpar (truncar) as tabelas entre um teste e outro",
                                "isCorrect": true
                            },
                            {
                                "text": "O supertest reaproveita a mesma instância do app nos testes",
                                "isCorrect": false
                            },
                            {
                                "text": "O Vitest está rodando os arquivos de teste fora de ordem",
                                "isCorrect": false
                            },
                            {
                                "text": "O banco de teste efêmero não aceita mais de uma conexão",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Testando HTTP com supertest",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Testar HTTP sem subir servidor\n\nVocê já viu `app.listen(3000)` ligar o Express numa porta. Pra testar, você não precisa disso: o supertest recebe o próprio objeto `app` e conversa com ele diretamente, em memória, sem abrir porta nenhuma.\n\nIsso resolve um problema chato de teste de integração: se cada teste subisse um servidor numa porta, você teria testes disputando porta entre si, ou precisando escolher uma porta livre toda vez. Com supertest, isso não existe."
                    },
                    {
                        "type": "code",
                        "value": "// tests/tarefas.integration.test.js\nimport { describe, it, expect } from 'vitest'\nimport request from 'supertest'\nimport { app } from '../app.js' // o mesmo app do Express, sem app.listen()\n\ndescribe('GET /tarefas', () => {\n  it('responde 200 com a lista de tarefas', async () => {\n    const res = await request(app).get('/tarefas')\n\n    expect(res.status).toBe(200)\n    expect(Array.isArray(res.body)).toBe(true)\n  })\n})"
                    },
                    {
                        "type": "code",
                        "value": "describe('POST /tarefas', () => {\n  it('cria a tarefa e responde 201 com o corpo certo', async () => {\n    const res = await request(app)\n      .post('/tarefas')\n      .send({ titulo: 'Estudar supertest' })\n\n    expect(res.status).toBe(201)\n    expect(res.body).toMatchObject({ titulo: 'Estudar supertest', concluida: false })\n    expect(res.body.id).toBeDefined()\n  })\n})"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Supertest\",\"O que faz\"],[\"request(app)\",\"Aponta as próximas chamadas pro app Express, sem subir porta\"],[\".get(path) / .post(path) / .put(path) / .delete(path)\",\"Monta a requisição HTTP pro path informado\"],[\".send(objeto)\",\"Manda o objeto como corpo da requisição (JSON)\"],[\".set(header, valor)\",\"Adiciona um header, como Authorization\"],[\"res.status\",\"Código HTTP da resposta (200, 201, 404...)\"],[\"res.body\",\"Corpo da resposta já parseado como JSON\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Headers e o atalho .expect()\n\nPra testar uma rota atrás do middleware de auth que você já construiu, basta anexar o token com `.set('Authorization', ...)`, igual um cliente HTTP de verdade faria.\n\nO supertest também tem um atalho: `.expect(codigo)` encadeado na própria chamada já falha o teste se o status não bater. Os exemplos aqui usam `expect(res.status).toBe(...)` do Vitest, que dá uma mensagem melhor quando quebra, mas as duas formas fazem a mesma checagem."
                    },
                    {
                        "type": "code",
                        "value": "describe('DELETE /tarefas/:id (rota protegida pelo middleware de auth)', () => {\n  it('sem token, responde 401', async () => {\n    const res = await request(app).delete('/tarefas/1')\n\n    expect(res.status).toBe(401)\n  })\n\n  it('com token válido, remove e responde 204', async () => {\n    const res = await request(app)\n      .delete('/tarefas/1')\n      .set('Authorization', `Bearer ${tokenDeTeste}`)\n\n    expect(res.status).toBe(204)\n  })\n})"
                    },
                    {
                        "type": "quote",
                        "value": "supertest não é um navegador simulado. É o seu app Express de verdade, só que sem a porta."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o supertest recebe pra testar uma rota Express?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O próprio objeto `app`, sem precisar chamar `app.listen()`",
                                "isCorrect": true
                            },
                            {
                                "text": "A URL pública onde a API já está publicada em produção",
                                "isCorrect": false
                            },
                            {
                                "text": "Um arquivo de configuração com as rotas escritas em YAML",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome do arquivo de rotas, que ele importa sozinho",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de `const res = await request(app).get('/tarefas')`, onde fica o JSON de resposta já parseado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Em `res.body`, já como objeto ou array",
                                "isCorrect": true
                            },
                            {
                                "text": "Em `res.text`, como uma string crua",
                                "isCorrect": false
                            },
                            {
                                "text": "Em `res.data`, do mesmo jeito que no Axios",
                                "isCorrect": false
                            },
                            {
                                "text": "Em `res.json`, como uma função a chamar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um teste faz `request(app).post('/tarefas').send({ titulo: 'Ler' })` e a rota responde 400, mesmo com os dados certos. O controller lê `req.body.titulo` e recebe `undefined`. Qual configuração no `app.js` provavelmente está faltando?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O middleware `express.json()`, que faz o parsing do corpo",
                                "isCorrect": true
                            },
                            {
                                "text": "O `cors()`, que libera a origem de onde o teste chama a API",
                                "isCorrect": false
                            },
                            {
                                "text": "O `.set('Authorization', ...)` dentro do próprio teste",
                                "isCorrect": false
                            },
                            {
                                "text": "O `express.static()`, que serve os arquivos da pasta public",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um teste de integração quer conferir que a tarefa criada tem `titulo: 'Estudar supertest'` e `concluida: false`, sem se importar com o valor exato do `id` gerado pelo banco. Qual matcher do Vitest encaixa melhor?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "`toMatchObject`, que confere só as propriedades informadas",
                                "isCorrect": true
                            },
                            {
                                "text": "`toBe`, que compara o objeto inteiro por igualdade estrita",
                                "isCorrect": false
                            },
                            {
                                "text": "`toHaveBeenCalledWith`, que confere os argumentos de uma chamada",
                                "isCorrect": false
                            },
                            {
                                "text": "`toBeInstanceOf`, que confere a classe do objeto retornado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma suíte de testes de integração com supertest termina de rodar, mas o processo do Vitest não sai sozinho, ficando pendurado no terminal. O app é importado de `app.js`, que não chama `listen()`. O que mais provavelmente está prendendo o processo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Uma conexão aberta com o banco, sem `pool.end()` no `afterAll`",
                                "isCorrect": true
                            },
                            {
                                "text": "O próprio supertest, que mantém a porta aberta entre os testes",
                                "isCorrect": false
                            },
                            {
                                "text": "O `app.listen()`, que o supertest chama por baixo dos panos",
                                "isCorrect": false
                            },
                            {
                                "text": "O `express.json()`, que fica esperando corpo de requisição",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Um teste de endpoint de ponta a ponta",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Juntando as peças\n\nVocê já viu o banco de teste efêmero (aula 2) e como fazer requisições com supertest (aula 3). Agora é hora de juntar tudo num teste de integração completo, do jeito que ele existe de verdade: cria alguma coisa com um POST, confere a resposta, e confirma que aquilo realmente ficou salvo com um GET depois."
                    },
                    {
                        "type": "code",
                        "value": "// tests/tarefas.integration.test.js\nimport { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'\nimport request from 'supertest'\nimport { app } from '../app.js'\nimport { pool } from '../db/pool.js'\nimport { rodarMigrations } from '../db/migrate.js'\n\nbeforeAll(async () => {\n  await rodarMigrations()\n})\n\nafterEach(async () => {\n  await pool.query('TRUNCATE TABLE tarefas RESTART IDENTITY CASCADE')\n})\n\nafterAll(async () => {\n  await pool.end()\n})\n\ndescribe('POST /tarefas', () => {\n  it('cria a tarefa e responde 201 com o corpo certo', async () => {\n    const res = await request(app)\n      .post('/tarefas')\n      .send({ titulo: 'Estudar testes de integração' })\n\n    expect(res.status).toBe(201)\n    expect(res.body).toMatchObject({\n      titulo: 'Estudar testes de integração',\n      concluida: false\n    })\n    expect(res.body.id).toBeDefined()\n  })\n})"
                    },
                    {
                        "type": "text",
                        "value": "## O que esse teste já prova\n\nRodando contra o banco de teste de verdade, esse teste passa só se: a rota existe, o `express.json()` está lá pra ler o corpo, o service monta o INSERT certo, as colunas batem com a migration, e o controller devolve o JSON no formato esperado. É bem mais do que o teste unitário do service, sozinho, garante.\n\nMas ele só confere a resposta do POST. Ainda não prova que a tarefa ficou salva de um jeito que um outro pedido consegue encontrar."
                    },
                    {
                        "type": "code",
                        "value": "describe('fluxo criar e depois buscar', () => {\n  it('a tarefa criada aparece num GET /tarefas/:id depois', async () => {\n    const criada = await request(app)\n      .post('/tarefas')\n      .send({ titulo: 'Revisar PR' })\n\n    const id = criada.body.id\n\n    const busca = await request(app).get(`/tarefas/${id}`)\n\n    expect(busca.status).toBe(200)\n    expect(busca.body).toMatchObject({\n      id,\n      titulo: 'Revisar PR',\n      concluida: false\n    })\n  })\n})"
                    },
                    {
                        "type": "text",
                        "value": "## Por que o segundo request importa\n\nO primeiro teste prova que o POST responde certo. O segundo prova outra coisa: que o dado persistiu no banco de teste, e que uma requisição totalmente separada (um novo `GET`) consegue ler exatamente o que foi escrito. Isso pega bugs que nenhum dos dois sozinho pegaria, como uma tabela errada no `SELECT`, uma condição de busca que não bate com a coluna usada no `INSERT`, ou uma serialização diferente entre o que o `POST` devolve e o que o `GET` devolve pro mesmo registro.\n\nÉ o tipo de teste que teria pego o bug de coluna trocada (`feita` x `concluida`) que apareceu na aula 1."
                    },
                    {
                        "type": "code",
                        "value": "describe('GET /tarefas/:id inexistente', () => {\n  it('responde 404 quando o id não existe', async () => {\n    const res = await request(app).get('/tarefas/999999')\n\n    expect(res.status).toBe(404)\n    expect(res.body.erro).toBeDefined()\n  })\n})"
                    },
                    {
                        "type": "quote",
                        "value": "Um teste de integração bom não pergunta só o que a rota respondeu. Pergunta também o que ficou depois que a resposta voltou."
                    }
                ],
                "questions": [
                    {
                        "statement": "Num teste de integração de `POST /tarefas`, o que confirma que o endpoint respondeu do jeito esperado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Conferir `res.status` e `res.body` na resposta do POST",
                                "isCorrect": true
                            },
                            {
                                "text": "Conferir se o `console.log` do controller imprimiu a tarefa",
                                "isCorrect": false
                            },
                            {
                                "text": "Conferir o tempo, em milissegundos, que a requisição levou",
                                "isCorrect": false
                            },
                            {
                                "text": "Conferir se o arquivo de rotas foi importado sem erro",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No teste que cria uma tarefa com POST e depois busca com GET, de onde vem o `id` usado na segunda chamada?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Do `res.body.id` devolvido pela resposta do POST",
                                "isCorrect": true
                            },
                            {
                                "text": "De um valor fixo, escrito direto no código do teste",
                                "isCorrect": false
                            },
                            {
                                "text": "De uma consulta separada direto no banco de produção",
                                "isCorrect": false
                            },
                            {
                                "text": "Do header `Location` que o Express adiciona sozinho",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um teste confere só o `res.body` do POST /tarefas e passa. Seria possível esse teste passar mesmo se o SELECT usado no GET /tarefas/:id estivesse buscando na tabela errada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sim, porque o teste do POST não chega a exercitar o GET",
                                "isCorrect": true
                            },
                            {
                                "text": "Não, porque o supertest roda GET e POST sempre juntos",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque o Vitest recusa rodar o arquivo se o schema mudou",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, mas só se o banco de teste não tiver sido migrado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No teste de criação, `expect(res.body).toMatchObject({ titulo: 'Revisar PR', concluida: false })` passa, mas trocar para `toEqual({ titulo: 'Revisar PR', concluida: false })` faz o mesmo teste falhar. Por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque `toEqual` exige igualdade completa, e sobra o `id` gerado",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque `toEqual` só roda em testes unitários, nunca com supertest",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque `toMatchObject` ignora o campo `status` da resposta HTTP",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque `toEqual`, diferente de `toMatchObject`, não existe no Vitest",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma suíte de integração só tem testes do caminho feliz (POST cria, GET encontra). Um colega sugere adicionar um teste pra GET /tarefas/:id com um id que não existe. Qual é o principal ganho disso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Confere se a rota trata o caso de não encontrar, sem quebrar com 500",
                                "isCorrect": true
                            },
                            {
                                "text": "Deixa a suíte mais rápida, porque reduz consultas no banco de teste",
                                "isCorrect": false
                            },
                            {
                                "text": "Substitui a necessidade de testar o caminho feliz separadamente",
                                "isCorrect": false
                            },
                            {
                                "text": "Garante que o middleware de auth bloqueia usuários não autenticados",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Isolamento, velocidade e dados de teste",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Por que a integração fica no meio da pirâmide\n\nLembra da pirâmide, lá do Módulo 1? Unitário na base, muitos e rápidos. Integração no meio, menos e mais lentos. Um teste unitário roda em milissegundos, sem tocar disco nem rede. Um teste de integração abre conexão com um banco real e faz uma query de verdade, e isso custa tempo: um teste que levava 2ms como unitário pode levar 50ms ou mais como integração.\n\nIsso não é motivo pra abandonar a integração, mas é motivo pra não testar tudo nesse nível. Regra de negócio complexa, caso de borda de validação, cálculo: isso continua mais barato, e mais rápido de rodar centenas de vezes, como teste unitário. A integração entra pra garantir que as peças se encaixam, não pra repetir cada combinação de entrada que o unitário já cobre."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Nível\",\"Quantidade típica\",\"Velocidade\",\"Papel\"],[\"Unitário\",\"Muitos (centenas)\",\"Milissegundos\",\"Regra de negócio, cálculo, validação\"],[\"Integração\",\"Um bloco por endpoint ou fluxo\",\"Dezenas a centenas de ms\",\"Rota, banco e middleware juntos\"],[\"E2e\",\"Poucos, os fluxos críticos\",\"Segundos\",\"O sistema inteiro, como o usuário usa\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Isolamento: um teste não pode depender do outro\n\nUm teste de integração pode passar sozinho e falhar quando roda junto com a suíte inteira, se ele depender de dado deixado por outro teste (ou deixar dado pra trás). Os sintomas clássicos: um teste que espera a tabela vazia e encontra registros de sobra; um teste que conta com um `id` fixo que já foi usado por outro teste antes.\n\nA defesa é o que você já viu na aula 2: limpar o banco entre cada teste com `afterEach`, e nunca depender da ordem em que os testes rodam. Cada teste cria os dados que precisa e não assume nada que outro teste tenha deixado."
                    },
                    {
                        "type": "code",
                        "value": "// RUIM: o segundo teste depende do id criado pelo primeiro\nlet idCriado\n\nit('cria a tarefa', async () => {\n  const res = await request(app).post('/tarefas').send({ titulo: 'A' })\n  idCriado = res.body.id\n})\n\nit('busca a tarefa', async () => {\n  const res = await request(app).get(`/tarefas/${idCriado}`)\n  expect(res.status).toBe(200)\n  // se o primeiro teste for pulado ou rodar depois, este quebra\n})\n\n// BOM: cada teste cria o que precisa, sem depender de outro\nit('busca a tarefa criada', async () => {\n  const criada = await request(app).post('/tarefas').send({ titulo: 'A' })\n  const res = await request(app).get(`/tarefas/${criada.body.id}`)\n\n  expect(res.status).toBe(200)\n})"
                    },
                    {
                        "type": "text",
                        "value": "## Dados de teste: seeds e factories\n\nPreencher os dados de cada teste na mão funciona, mas repete muito código e fica frágil, com todo teste reescrevendo o mesmo objeto de tarefa. Duas saídas comuns:\n\n- **Seed**: uma função que insere um conjunto conhecido de dados antes de um teste ou grupo de testes, como um usuário já cadastrado pra testar login.\n- **Factory**: uma função que monta um objeto de teste com valores padrão, permitindo sobrescrever só o que importa pro teste atual.\n\nIsso reduz repetição e deixa claro, no teste, só o que é relevante pra aquele caso."
                    },
                    {
                        "type": "code",
                        "value": "// tests/factories/tarefa.js\nlet contador = 0\n\nexport function novaTarefa(overrides = {}) {\n  contador++\n  return {\n    titulo: `Tarefa de teste ${contador}`,\n    concluida: false,\n    ...overrides\n  }\n}\n\n// no teste:\nit('marca uma tarefa como concluída', async () => {\n  const criada = await request(app).post('/tarefas').send(novaTarefa())\n\n  const res = await request(app)\n    .patch(`/tarefas/${criada.body.id}`)\n    .send({ concluida: true })\n\n  expect(res.body.concluida).toBe(true)\n})"
                    },
                    {
                        "type": "quote",
                        "value": "Teste de integração rápido de escrever e lento de rodar é normal. Teste de integração que só passa numa ordem específica é um bug esperando pra acontecer."
                    }
                ],
                "questions": [
                    {
                        "statement": "Por que testes de integração costumam ser mais lentos que testes unitários?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque eles fazem I/O real, como consultas a um banco de dados",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Vitest roda testes de integração em modo debug por padrão",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque eles precisam ser escritos em TypeScript, não em JavaScript",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o supertest sempre espera 1 segundo entre cada requisição",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que caracteriza um teste isolado dos outros testes na mesma suíte?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ele não depende de dado de outro teste, nem deixa dado pra trás",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele roda numa thread separada, sem compartilhar memória com os outros",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele usa um `describe` próprio, diferente dos demais testes do arquivo",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele importa o `app` de um arquivo diferente dos outros testes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois testes: o primeiro cria uma tarefa e guarda o `id` numa variável fora do `it`; o segundo usa essa variável pra buscar a tarefa. Juntos, passam. Rodando só o segundo, ele falha. Qual é o problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O segundo teste depende do estado deixado pelo primeiro",
                                "isCorrect": true
                            },
                            {
                                "text": "O Vitest não suporta rodar um teste específico com a flag `-t`",
                                "isCorrect": false
                            },
                            {
                                "text": "O supertest perde a conexão quando só um teste roda por vez",
                                "isCorrect": false
                            },
                            {
                                "text": "O banco de teste efêmero exige que todos os testes rodem juntos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a vantagem de usar uma factory, como `novaTarefa()`, pra montar os dados de um teste de integração, em vez de escrever o objeto na mão em cada teste?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reduz repetição e deixa claro só o que importa pro teste",
                                "isCorrect": true
                            },
                            {
                                "text": "Faz o teste rodar em paralelo com os outros automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "Substitui a necessidade de limpar o banco entre os testes",
                                "isCorrect": false
                            },
                            {
                                "text": "Torna o teste unitário, já que não usa mais o banco real",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um endpoint de cálculo de desconto tem 15 regras de negócio diferentes (cupom, quantidade, cliente antigo...). Testar as 15 regras como teste de integração, batendo no banco a cada uma, deixaria a suíte bem mais lenta. Qual é a saída mais alinhada com a pirâmide de testes?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Testar as 15 regras como unitário, e só o fluxo geral como integração",
                                "isCorrect": true
                            },
                            {
                                "text": "Testar as 15 regras só como integração, é o nível mais confiável",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover os testes de integração desse endpoint, por serem lentos",
                                "isCorrect": false
                            },
                            {
                                "text": "Testar as 15 regras como e2e, abrindo navegador pra cada uma",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - TDD e código testável",
        "aulas": [
            {
                "titulo": "O ciclo do TDD (red, green, refactor)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O ciclo do TDD: red, green, refactor\n\nTDD (test-driven development) inverte a ordem que você provavelmente está acostumado a escrever código. Em vez de implementar a função e só depois criar um teste pra conferir se ela funciona, você escreve o teste primeiro, descrevendo um comportamento que ainda não existe. A implementação vem depois.\n\nEsse processo se repete em ciclos curtos, com três fases bem definidas: **red**, **green** e **refactor**. É esse ciclo que dá nome à técnica."
                    },
                    {
                        "type": "text",
                        "value": "## As três fases\n\n- **Red**: escreve um teste para um comportamento que ainda não existe no código. Ele falha ao rodar (às vezes nem compila, porque a função referenciada ainda não existe). Essa falha prova que o teste realmente testa alguma coisa.\n- **Green**: escreve o código mínimo necessário para o teste passar. Nessa fase não interessa se o código está bonito, só que fique verde.\n- **Refactor**: com o teste passando como rede de segurança, melhora a estrutura do código (nomes, duplicação, organização) sem mudar o comportamento observável. Roda os testes de novo pra confirmar que continuam verdes."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Fase\", \"O que você faz\", \"Como sabe que terminou\"], [\"Red\", \"Escreve um teste para um comportamento que ainda não existe\", \"O teste falha ao rodar\"], [\"Green\", \"Escreve o código mais simples possível para passar no teste\", \"O teste fica verde\"], [\"Refactor\", \"Melhora nomes, remove duplicação, reorganiza o código\", \"Os testes continuam verdes\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que escrever o teste antes muda o design\n\nQuando o teste vem primeiro, você é forçado a pensar em como a função vai ser chamada antes de pensar em como ela vai ser implementada por dentro. Isso muda a perspectiva: você projeta a partir de quem vai usar a função (o teste), não a partir da conveniência de quem está implementando.\n\nNa prática, isso tende a produzir funções menores, com dependências explícitas e fáceis de isolar, porque um teste difícil de escrever costuma ser sintoma de um design ruim. Se pra testar uma função pequena você precisa configurar meio sistema, o problema não é do teste, é do design."
                    },
                    {
                        "type": "code",
                        "value": "// FASE RED: o teste existe, a funcao ainda nao\nimport { describe, it, expect } from 'vitest'\nimport { formatarNomeExibicao } from './usuario'\n\ndescribe('formatarNomeExibicao', () => {\n  it('deixa a primeira letra maiuscula quando nao ha sobrenome', () => {\n    expect(formatarNomeExibicao('joao')).toBe('Joao')\n  })\n})\n\n// npx vitest --run\n// FAIL: 'formatarNomeExibicao' is not defined\n\n// FASE GREEN: implementacao minima pra ficar verde\nexport function formatarNomeExibicao(nome) {\n  return nome.charAt(0).toUpperCase() + nome.slice(1)\n}\n\n// npx vitest --run\n// PASS  1 passed (1)\n\n// FASE REFACTOR: o teste continua passando, entao da pra limpar\nexport function formatarNomeExibicao(nome) {\n  const [primeiraLetra, ...resto] = nome\n  return primeiraLetra.toUpperCase() + resto.join('')\n}\n\n// npx vitest --run\n// PASS  1 passed (1) -> comportamento igual, estrutura melhor"
                    },
                    {
                        "type": "quote",
                        "value": "TDD não é sobre escrever mais testes, é sobre deixar o teste guiar o design: primeiro você decide como a função deveria ser usada, só depois se preocupa em como ela vai funcionar por dentro."
                    }
                ],
                "questions": [
                    {
                        "statement": "No ciclo do TDD, o que caracteriza a fase red?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O teste é escrito antes do código e falha ao rodar",
                                "isCorrect": true
                            },
                            {
                                "text": "O código é escrito antes do teste e passa de primeira",
                                "isCorrect": false
                            },
                            {
                                "text": "O teste é reescrito depois que o código já está pronto",
                                "isCorrect": false
                            },
                            {
                                "text": "O código antigo é apagado para começar tudo de novo",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois que o teste fica verde, qual é o objetivo da fase refactor?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Melhorar o código mantendo os testes passando",
                                "isCorrect": true
                            },
                            {
                                "text": "Escrever testes novos para aumentar a cobertura total",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o teste por uma versão mais simples de validar",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover os comentários deixados durante a fase green",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Você escreve um teste para uma função que ainda não existe e roda a suíte. O terminal mostra um erro dizendo que a função não está definida, e não uma falha de asserção comum. O que isso significa dentro do ciclo TDD?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ainda é a fase red, esse erro também conta como o teste falhando",
                                "isCorrect": true
                            },
                            {
                                "text": "O teste foi escrito errado e precisa ser reescrito do zero",
                                "isCorrect": false
                            },
                            {
                                "text": "Já é hora de partir para a fase refactor, pois o erro apareceu",
                                "isCorrect": false
                            },
                            {
                                "text": "Existe um problema de configuração do runner de testes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a principal vantagem de escrever o teste antes da implementação, segundo a proposta do TDD?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O design nasce pensado em como a função será usada",
                                "isCorrect": true
                            },
                            {
                                "text": "O código fica automaticamente mais rápido em produção",
                                "isCorrect": false
                            },
                            {
                                "text": "Deixa de ser necessário revisar o código depois",
                                "isCorrect": false
                            },
                            {
                                "text": "A cobertura de testes chega a 100% sem esforço",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Durante a fase refactor, depois de renomear uma variável interna da função, o teste que antes passava começa a falhar. O que isso indica?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O comportamento da função mudou, não só a estrutura interna",
                                "isCorrect": true
                            },
                            {
                                "text": "O teste estava malformado desde a fase red e precisa mudar",
                                "isCorrect": false
                            },
                            {
                                "text": "É esperado, pois todo refactor deve falhar o teste uma vez",
                                "isCorrect": false
                            },
                            {
                                "text": "O runner de testes perdeu o cache e precisa reiniciar",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "TDD na prática, passo a passo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Partindo de um requisito pequeno\n\nVamos aplicar o ciclo na prática com um requisito bem pequeno, do tipo que aparece o tempo todo num sistema de cursos: **um cupom de desconto**. A regra inicial é simples: quando o cupom for `ALUNO10`, aplica 10% de desconto sobre o valor original.\n\nEm vez de sair implementando tudo de uma vez, o TDD pede pra começar pelo menor caso possível e ir andando em passos curtos."
                    },
                    {
                        "type": "code",
                        "value": "// RED: o primeiro teste, para o caso mais simples\nimport { describe, it, expect } from 'vitest'\nimport { aplicarDesconto } from './cupom'\n\ndescribe('aplicarDesconto', () => {\n  it('aplica 10% de desconto quando o cupom e ALUNO10', () => {\n    expect(aplicarDesconto('ALUNO10', 100)).toBe(90)\n  })\n})\n\n// npx vitest --run\n// FAIL: Cannot find module './cupom' (o arquivo nem existe ainda)"
                    },
                    {
                        "type": "code",
                        "value": "// GREEN: o minimo possivel para o teste passar\nexport function aplicarDesconto(cupom, valorOriginal) {\n  return 90\n}\n\n// npx vitest --run\n// PASS  1 passed (1)\n// verde, mas so porque existe um unico teste: essa implementacao\n// obviamente nao serve pra qualquer cupom ou valor"
                    },
                    {
                        "type": "text",
                        "value": "## Um teste força a generalização\n\nDevolver `90` direto é, de propósito, uma trapaça: o único teste que existe até aqui não é suficiente pra provar que a função realmente calcula desconto. É exatamente pra isso que serve o próximo requisito: **um cupom inválido não aplica desconto nenhum**.\n\nEsse segundo teste é quem vai forçar a implementação a virar código de verdade."
                    },
                    {
                        "type": "code",
                        "value": "// RED: um segundo teste, dentro do mesmo describe('aplicarDesconto', ...)\nit('nao aplica desconto quando o cupom e invalido', () => {\n  expect(aplicarDesconto('QUALQUERCOISA', 100)).toBe(100)\n})\n\n// npx vitest --run\n// FAIL: expected 100, recebido 90 (o retorno fixo nao serve mais)\n\n// GREEN: agora precisa de logica de verdade pra passar as duas\nexport function aplicarDesconto(cupom, valorOriginal) {\n  if (cupom === 'ALUNO10') {\n    return valorOriginal * 0.9\n  }\n  return valorOriginal\n}\n\n// npx vitest --run\n// PASS  2 passed (2)"
                    },
                    {
                        "type": "code",
                        "value": "// REFACTOR: os dois testes continuam verdes, entao da pra melhorar\n// a estrutura sem medo (aqui, preparando pra outros cupons no futuro)\nexport const CUPONS = {\n  ALUNO10: 0.1,\n}\n\nexport function aplicarDesconto(cupom, valorOriginal) {\n  const percentual = CUPONS[cupom] ?? 0\n  return valorOriginal * (1 - percentual)\n}\n\n// npx vitest --run\n// PASS  2 passed (2) -> comportamento igual, mais facil de estender"
                    },
                    {
                        "type": "quote",
                        "value": "Cada teste novo empurra a implementação um passo além do que ela sabia fazer antes: o primeiro tira do zero, o segundo tira da trapaça. É assim, em passos pequenos, que o design vai se formando."
                    }
                ],
                "questions": [
                    {
                        "statement": "No passo a passo do TDD, qual é a atitude recomendada diante de um requisito novo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Escrever um teste do comportamento esperado e ver ele falhar",
                                "isCorrect": true
                            },
                            {
                                "text": "Escrever a implementação inteira e só depois criar os testes",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar a documentação da função antes de qualquer código",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar a suíte inteira pra conferir o que já existe no projeto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No exemplo da função aplicarDesconto, por que devolver sempre 90 era aceitável na primeira fase green?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque só existia um teste, e o objetivo era ficar verde",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque 90 é o valor correto para qualquer cupom recebido",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a fase green não exige rodar os testes de verdade",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o refactor sempre vem antes do segundo teste",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de adicionar o teste do cupom inválido, a suíte mostrou uma falha: esperado 100, recebido 90. O que essa falha revela sobre a implementação anterior?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ela era simples demais e não cobria o novo caso",
                                "isCorrect": true
                            },
                            {
                                "text": "O teste novo foi escrito com o valor errado por engano",
                                "isCorrect": false
                            },
                            {
                                "text": "O ambiente de testes não foi reiniciado entre as execuções",
                                "isCorrect": false
                            },
                            {
                                "text": "A função aplicarDesconto tinha um efeito colateral escondido",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois dos dois testes ficarem verdes, o código passou a usar um objeto CUPONS pra guardar os percentuais. Por que essa mudança conta como refactor, e não como um novo ciclo red-green?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque nenhum teste mudou ou foi criado, só a estrutura interna",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque os testes antigos foram apagados e reescritos do zero",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a cobertura de testes aumentou depois da mudança",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o comportamento mudou para os cupons já existentes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num ciclo onde a primeira implementação devolve um valor fixo só pra passar no primeiro teste, o que garante que essa simplificação não fique escondida na versão final do código?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Adicionar novos testes que forcem a generalização da regra",
                                "isCorrect": true
                            },
                            {
                                "text": "Marcar a função com um comentário TODO e seguir em frente",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o tempo de timeout do teste até ele passar com folga",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar o mesmo teste várias vezes pra confirmar que é estável",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Código testável (injeção de dependência, funções puras)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Por que código acoplado é difícil de testar\n\nUma função fica difícil de testar quando ela decide sozinha, por dentro, de onde vêm os dados que usa: abre a própria conexão com o banco, chama `fetch` direto, lê `Date.now()`, ou importa um módulo concreto e usa sem nenhuma indireção. Isso é acoplamento.\n\nLembra do cache-aside que você implementou lá atrás? Se a função que decide \"veio do cache ou do banco\" estiver misturada com o código que fala direto com Redis e Postgres, fica impossível testar só a decisão sem subir os dois serviços de verdade."
                    },
                    {
                        "type": "code",
                        "value": "// ANTES: a regra de negocio e o acesso ao banco vivem juntos\nexport async function podeEmitirCertificado(usuarioId) {\n  const resultado = await db.query(\n    'SELECT aulas_concluidas, aulas_total FROM progresso WHERE usuario_id = $1',\n    [usuarioId]\n  )\n  const { aulas_concluidas, aulas_total } = resultado.rows[0]\n  return aulas_concluidas / aulas_total >= 0.8\n}\n\n// pra testar isso, ou sobe um banco de verdade, ou faz mock\n// do modulo inteiro de banco: nao da pra testar so a regra dos 80%"
                    },
                    {
                        "type": "code",
                        "value": "import { describe, it, expect, vi } from 'vitest'\n\n// DEPOIS: a regra pura separada do acesso a dado\nexport function calcularElegibilidadeCertificado(aulasConcluidas, aulasTotal) {\n  return aulasConcluidas / aulasTotal >= 0.8\n}\n\n// o I/O fica isolado, e a dependencia entra por fora (injecao)\nexport async function podeEmitirCertificado(usuarioId, buscarProgresso = db.buscarProgresso) {\n  const { aulasConcluidas, aulasTotal } = await buscarProgresso(usuarioId)\n  return calcularElegibilidadeCertificado(aulasConcluidas, aulasTotal)\n}\n\n// teste da regra pura: nenhum banco envolvido\ndescribe('calcularElegibilidadeCertificado', () => {\n  it('libera com 80% ou mais de conclusao', () => {\n    expect(calcularElegibilidadeCertificado(8, 10)).toBe(true)\n  })\n\n  it('nao libera com menos de 80%', () => {\n    expect(calcularElegibilidadeCertificado(7, 10)).toBe(false)\n  })\n})\n\n// teste da parte com I/O, usando um dublê no lugar do banco\nit('busca o progresso usando a dependencia informada', async () => {\n  const buscarProgressoFalso = vi.fn().mockResolvedValue({ aulasConcluidas: 9, aulasTotal: 10 })\n  const resultado = await podeEmitirCertificado('user-1', buscarProgressoFalso)\n  expect(resultado).toBe(true)\n  expect(buscarProgressoFalso).toHaveBeenCalledWith('user-1')\n})"
                    },
                    {
                        "type": "text",
                        "value": "## Funções puras: as mais fáceis de testar\n\n`calcularElegibilidadeCertificado` do exemplo acima é uma **função pura**: pra mesma entrada, sempre devolve a mesma saída, e não toca em nada fora dela (não grava, não loga, não chama rede). Isso faz dela a coisa mais barata de testar que existe: você só passa valores e confere o retorno.\n\nO oposto seria uma função que usa `Math.random()`, `new Date()` ou mexe num parâmetro recebido por referência. Nesses casos, rodar a função duas vezes com a mesma entrada pode dar respostas diferentes, e o teste vira uma aposta."
                    },
                    {
                        "type": "text",
                        "value": "## Separar lógica de I/O\n\nA estratégia por trás dos dois exemplos acima tem nome: empurrar banco, rede, relógio e arquivo pra borda do código, e manter o miolo (as decisões) como funções puras. Isso vale pro middleware de auth também: a parte que decide se um token é válido pode ser uma função pura que recebe o token e a chave secreta, separada da parte que lê o header da requisição e chama `next()`.\n\nQuanto mais regra de negócio estiver em funções puras, menos você precisa de banco, servidor ou rede rodando só pra escrever um teste."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Característica\", \"Código difícil de testar\", \"Código fácil de testar\"], [\"Dependências\", \"Cria a própria conexão com banco ou API dentro da função\", \"Recebe as dependências de fora, por parâmetro\"], [\"Efeitos colaterais\", \"Lê relógio, gera valor aleatório ou grava arquivo no meio da lógica\", \"Só calcula e devolve um valor, sem tocar no mundo externo\"], [\"Acoplamento\", \"Importa um módulo concreto e usa direto, sem indireção\", \"Depende de uma função passada como parâmetro\"], [\"Determinismo\", \"A mesma entrada pode gerar saídas diferentes entre execuções\", \"A mesma entrada sempre gera a mesma saída\"], [\"Responsabilidade\", \"Mistura decisão de negócio com acesso a banco no mesmo bloco\", \"Separa o que decide do que busca ou salva dado\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Função pura é o jeito mais barato de testar alguma coisa. Injeção de dependência é o que sobra pra quando o código realmente precisa tocar o mundo de fora: banco, rede, relógio."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza uma função pura?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Mesma entrada sempre produz a mesma saída, sem efeito colateral",
                                "isCorrect": true
                            },
                            {
                                "text": "Sempre devolve um valor booleano, verdadeiro ou falso",
                                "isCorrect": false
                            },
                            {
                                "text": "Nunca recebe nenhum parâmetro na sua assinatura de chamada",
                                "isCorrect": false
                            },
                            {
                                "text": "Sempre acessa o banco de dados pra gerar o resultado final",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que uma função que abre a própria conexão com o banco dentro do corpo é difícil de testar isoladamente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque testá-la exige um banco real ou mock do módulo inteiro",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque funções que usam banco nunca podem ter teste automatizado",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o runner de testes não permite importar módulo de banco",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque toda função com banco é considerada lenta demais pra testar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma função calcula se um usuário pode emitir certificado e, no mesmo corpo, consulta o progresso direto no banco. O time quer testar só a regra dos 80% sem subir banco nenhum. Qual mudança resolve isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Extrair a regra para uma função pura, sem acesso a banco",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o timeout do teste pra esperar a resposta do banco",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o banco de dados de teste por um banco mais rápido",
                                "isCorrect": false
                            },
                            {
                                "text": "Envolver a consulta ao banco num bloco try/catch",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No exemplo com podeEmitirCertificado(usuarioId, buscarProgresso = db.buscarProgresso), qual é o papel do segundo parâmetro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Permitir trocar a busca real por um dublê durante o teste",
                                "isCorrect": true
                            },
                            {
                                "text": "Definir o número mínimo de aulas concluídas exigido",
                                "isCorrect": false
                            },
                            {
                                "text": "Guardar o resultado da função em cache entre chamadas",
                                "isCorrect": false
                            },
                            {
                                "text": "Validar se o usuarioId tem o formato esperado",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma função de validação de cupom usa new Date() internamente pra checar se ele ainda está no prazo de validade. Por que isso torna a função mais difícil de testar do que uma função pura equivalente?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o resultado muda de acordo com o momento em que o teste roda",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o runner de testes não consegue importar a classe Date",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque toda validação de data precisa necessariamente de banco",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque funções com Date sempre lançam exceção em ambiente de teste",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Anatomia de um bom teste",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que faz um teste ser bom\n\nUma suíte de testes só vale alguma coisa se você confia nela. Um teste mal escrito pode passar ou falhar pelo motivo errado, ou ser tão confuso que, quando quebra, ninguém entende o que realmente aconteceu. Quatro características separam um bom teste de um teste qualquer:\n\n- Tem um **nome que descreve o comportamento**\n- Tem **um foco só**\n- É **independente** dos outros testes\n- Testa **comportamento**, não detalhe de implementação"
                    },
                    {
                        "type": "text",
                        "value": "## Nomes que descrevem comportamento\n\nO nome do teste deveria contar a história sozinho: se ele falhar no CI às três da manhã, quem ler o nome no relatório precisa entender o que quebrou sem abrir o arquivo. Compare `'teste 1'` com `'devolve 401 quando o token e invalido'`, lembra do middleware de auth do módulo anterior.\n\nUma convenção simples que funciona bem: descrever o cenário e o resultado esperado, tipo \"faz X quando Y\" ou \"devolve Z quando W\"."
                    },
                    {
                        "type": "code",
                        "value": "import { describe, it } from 'vitest'\n\n// nomes que nao dizem nada quando alguem le o relatorio de falha\ndescribe('auth', () => {\n  it('teste 1', () => { /* ... */ })\n  it('funciona', () => { /* ... */ })\n  it('caso invalido', () => { /* ... */ })\n})\n\n// nomes que descrevem o comportamento esperado\ndescribe('middleware de autenticacao', () => {\n  it('devolve 401 quando o token nao vem no header', () => { /* ... */ })\n  it('devolve 401 quando o token esta expirado', () => { /* ... */ })\n  it('chama next() quando o token e valido', () => { /* ... */ })\n})"
                    },
                    {
                        "type": "text",
                        "value": "## Um foco por teste, testes independentes\n\nCada teste deveria verificar um comportamento só. Não significa ter um `expect` por `it` (várias asserções sobre o mesmo comportamento tudo bem), mas sim não misturar coisas sem relação, tipo validar formato de e-mail e checar se o registro foi salvo no banco dentro do mesmo teste. Quando um teste assim falha, o relatório não diz qual das duas coisas quebrou.\n\nAlém disso, um teste não deveria depender do que outro deixou pra trás, tipo uma variável global com token salvo, ou uma linha inserida por outro teste e nunca limpa. Lembra do `beforeEach`/`afterEach` que zera o banco de teste entre execuções (módulo anterior): é exatamente pra garantir essa independência."
                    },
                    {
                        "type": "text",
                        "value": "## Testar comportamento, não implementação\n\nUm bom teste verifica o que a função promete pra fora: dado tal entrada, tal saída; dada tal requisição, tal status e tal corpo de resposta. Ele não deveria se importar com detalhe de como isso é feito por dentro, tipo se o código usa `for` ou `reduce`, ou quantas vezes uma função auxiliar interna foi chamada.\n\nA prova dos nove: se você refatorar o miolo de uma função sem mudar o que ela promete, os testes deveriam continuar passando sem precisar tocar neles. Se quebram, é sinal de que estavam presos a implementação, não a comportamento."
                    },
                    {
                        "type": "code",
                        "value": "import { it, expect, vi } from 'vitest'\n\n// ruim: preso a um detalhe interno que pode mudar sem afetar o resultado\nit('usa um for loop pra somar os itens', () => {\n  const espiao = vi.spyOn(internals, 'somarComForLoop')\n  calcularTotal([{ preco: 10 }, { preco: 20 }])\n  expect(espiao).toHaveBeenCalled()\n})\n\n// bom: verifica o resultado que a funcao promete pra fora\nit('soma o preco de todos os itens do carrinho', () => {\n  const total = calcularTotal([{ preco: 10 }, { preco: 20 }])\n  expect(total).toBe(30)\n})\n// se calcularTotal trocar o for por reduce amanha, esse teste nem percebe"
                    },
                    {
                        "type": "quote",
                        "value": "Um teste bom se lê como uma frase e se comporta como uma caixa preta: você olha o nome e entende o comportamento, olha o corpo e só vê entrada e saída, nunca o miolo de como ela chegou lá."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que torna um nome de teste bom, dentro da ideia de nome que descreve comportamento?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Dá pra entender o que quebrou só de ler o nome",
                                "isCorrect": true
                            },
                            {
                                "text": "Segue a mesma numeração usada nos arquivos do projeto",
                                "isCorrect": false
                            },
                            {
                                "text": "É curto o bastante pra caber numa linha do terminal",
                                "isCorrect": false
                            },
                            {
                                "text": "Usa exatamente o mesmo verbo em todos os testes",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que testes independentes, em que a ordem não importa, são importantes?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque um teste não deveria depender do estado deixado por outro",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o runner exige que os arquivos sigam ordem alfabética",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque testes independentes sempre rodam mais rápido que os outros",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque cada arquivo de teste só pode ter um describe",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um teste de criação de curso só passa quando roda depois do teste de login, porque reaproveita um token salvo numa variável global do arquivo. O que esse cenário indica?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Os testes estão acoplados por ordem, o que quebra a independência",
                                "isCorrect": true
                            },
                            {
                                "text": "O teste de criação de curso está testando o comportamento errado",
                                "isCorrect": false
                            },
                            {
                                "text": "O token JWT foi gerado com uma chave secreta inválida",
                                "isCorrect": false
                            },
                            {
                                "text": "O runner está rodando os testes em paralelo por engano",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um teste verifica quantas vezes uma função interna privada foi chamada durante o cálculo do total do carrinho, em vez de verificar o valor total devolvido. Qual problema isso traz?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O teste quebra mesmo sem mudança no resultado da função",
                                "isCorrect": true
                            },
                            {
                                "text": "O teste fica mais rápido porque não precisa calcular o total",
                                "isCorrect": false
                            },
                            {
                                "text": "O teste passa a cobrir mais linhas de código do arquivo",
                                "isCorrect": false
                            },
                            {
                                "text": "O teste deixa de precisar do describe pra funcionar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um único it() reúne vários expect checando validação de e-mail, validação de senha e criação do registro no banco, tudo em sequência. Quando ele falha, o relatório aponta só a primeira asserção quebrada. Qual é a desvantagem principal dessa estrutura?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Fica difícil saber, só pelo relatório, o que realmente quebrou",
                                "isCorrect": true
                            },
                            {
                                "text": "O runner não permite mais de um expect dentro do mesmo it",
                                "isCorrect": false
                            },
                            {
                                "text": "O teste passa a rodar numa ordem diferente a cada execução",
                                "isCorrect": false
                            },
                            {
                                "text": "O tempo de execução do teste cresce de forma exponencial",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Os princípios FIRST",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Os princípios FIRST\n\nExiste um pequeno checklist, resumido no acrônimo **FIRST**, que ajuda a avaliar se um teste está saudável ou se vai virar dor de cabeça com o tempo: **F**ast, **I**solated (ou Independent), **R**epeatable, **S**elf-validating, **T**imely. Ele resume boa parte do que já apareceu nas aulas anteriores, agora com nome pra cada ideia."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Princípio\", \"O que significa\", \"Na prática\"], [\"Fast\", \"A suíte roda em segundos, não minutos\", \"Testes unitários sem banco ou rede real, dublês no lugar de I/O lento\"], [\"Isolated / Independent\", \"Um teste não depende de outro nem da ordem de execução\", \"Cada teste cria seus próprios dados, sem reaproveitar estado global\"], [\"Repeatable\", \"O mesmo teste dá o mesmo resultado sempre, em qualquer máquina\", \"Sem depender de hora do dia, rede externa ou dado de produção\"], [\"Self-validating\", \"O teste decide sozinho se passou ou falhou, sem checagem manual\", \"Usa expect, não imprime algo no terminal pra alguém ler\"], [\"Timely\", \"O teste é escrito perto da hora de escrever o código\", \"No TDD, antes do código; no mínimo, junto, nunca meses depois\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Fast e Repeatable\n\nSe a suíte demora minutos pra rodar, o time para de rodar ela a toda hora, e o feedback rápido que é a maior vantagem de testar automatizado se perde. Isso costuma acontecer quando teste unitário depende de banco, rede ou de outro serviço de verdade em vez de um dublê.\n\nRepeatable anda junto: um teste que depende do relógio da máquina, da ordem de execução ou de um serviço externo instável pode passar hoje e falhar amanhã sem que o código tenha mudado nada. Isso é o começo do que o módulo seguinte chama de teste flaky."
                    },
                    {
                        "type": "text",
                        "value": "## Isolated, Self-validating e Timely\n\nIsolated retoma a independência entre testes vista na aula anterior: nenhum teste deveria precisar que outro rode antes. Self-validating quer dizer que o próprio `expect` decide o resultado, sem alguém lendo `console.log` pra julgar se passou. E Timely é sobre o momento: escrever o teste junto com o código (ou antes dele, como no TDD) é o que mantém o design guiado pelo teste; escrever semanas depois, quando o código já está fixado em produção, perde boa parte desse benefício."
                    },
                    {
                        "type": "code",
                        "value": "import { describe, it, expect } from 'vitest'\nimport { calcularElegibilidadeCertificado } from './certificado'\n\ndescribe('calcularElegibilidadeCertificado', () => {\n  // Fast: nao acessa banco nem rede, roda em milissegundos\n  // Isolated: nao depende de nenhum outro teste do arquivo\n  // Repeatable: mesma entrada, mesma saida, sempre\n  it('libera certificado com 80% ou mais de conclusao', () => {\n    expect(calcularElegibilidadeCertificado(8, 10)).toBe(true)\n  })\n\n  // Self-validating: o proprio expect decide, ninguem le nada no console\n  it('nao libera certificado com menos de 80%', () => {\n    expect(calcularElegibilidadeCertificado(7, 10)).toBe(false)\n  })\n})\n\n// Timely: estes testes foram escritos junto com a funcao, nao depois"
                    },
                    {
                        "type": "text",
                        "value": "## Fechando o módulo\n\nO ciclo red-green-refactor, código testável (função pura e injeção de dependência) e os princípios FIRST são três jeitos de olhar pro mesmo problema: como escrever teste que continua útil daqui a um ano, em vez de virar peso morto que o time ignora ou apaga. No próximo módulo entra cobertura, testes end-to-end e o problema dos testes flaky, incluindo como isso tudo roda dentro do CI."
                    },
                    {
                        "type": "quote",
                        "value": "FIRST não é regra pra decorar, é um diagnóstico: toda vez que um teste vira dor de cabeça, dá pra apontar qual dessas cinco letras ele está quebrando."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o F de FIRST representa?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Fast, a suíte de testes deve rodar rápido",
                                "isCorrect": true
                            },
                            {
                                "text": "Fixed, os testes não podem ser alterados depois",
                                "isCorrect": false
                            },
                            {
                                "text": "Final, os testes devem ser os últimos arquivos do projeto",
                                "isCorrect": false
                            },
                            {
                                "text": "Full, os testes devem cobrir cem por cento do código",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que significa um teste ser self-validating?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ele mesmo decide se passou ou falhou, sem checagem manual",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele valida sozinho os dados enviados pelo usuário",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele se corrige automaticamente quando encontra um erro",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele gera sozinho sua própria massa de dados de teste",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma suíte de testes unitários leva 12 minutos pra rodar porque cada teste abre uma conexão real com o banco de dados. Qual princípio do FIRST está sendo violado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Fast, já que testes unitários deveriam rodar em segundos",
                                "isCorrect": true
                            },
                            {
                                "text": "Timely, já que os testes deveriam ter sido escritos antes",
                                "isCorrect": false
                            },
                            {
                                "text": "Self-validating, já que o banco real invalida o resultado",
                                "isCorrect": false
                            },
                            {
                                "text": "Isolated, já que conexões de banco não podem ser paralelas",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois testes só falham quando rodam num pipeline com fuso horário diferente do notebook do desenvolvedor, porque a função usa new Date() sem nenhum controle. Isso quebra qual princípio do FIRST?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Repeatable, o mesmo teste deveria dar o mesmo resultado sempre",
                                "isCorrect": true
                            },
                            {
                                "text": "Fast, testes que usam data costumam ser mais lentos",
                                "isCorrect": false
                            },
                            {
                                "text": "Timely, testes que envolvem data precisam ser escritos por último",
                                "isCorrect": false
                            },
                            {
                                "text": "Isolated, cada fuso horário deveria ter sua própria suíte",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time só escreve os testes de uma funcionalidade semanas depois dela estar em produção, quando já apareceram bugs. Além do risco óbvio de regressão não pega antes do deploy, por que isso também enfraquece o valor do design que o TDD promete?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o teste deixa de influenciar o design, já que o código já está fixado",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque testes escritos depois do deploy não podem usar o runner normalmente",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a cobertura de código passa a ser contada de forma incorreta",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque testes tardios são sempre mais lentos que testes escritos antes",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - Cobertura, e2e e flaky tests",
        "aulas": [
            {
                "titulo": "Cobertura de código e a armadilha do 100%",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Cobertura de código e a armadilha do 100%\n\nNo módulo passado você viu TDD e o que torna um código testável: injeção de dependência, funções puras, lógica separada de I/O. Só que escrever testes bons não responde sozinho a uma pergunta que cedo ou tarde aparece: quanto do meu código está, de fato, sendo testado? É pra responder isso que existe a cobertura de código (code coverage), um relatório que mostra exatamente quais linhas, ramos e funções os seus testes chegam a executar, e quais ficam de fora.\n\nCobertura é uma ferramenta poderosa para achar buracos na sua suíte. Só que, usada do jeito errado (como meta cega, perseguindo 100%), ela pode te dar uma falsa sensação de segurança. Esse é o assunto desta aula."
                    },
                    {
                        "type": "text",
                        "value": "## O que a cobertura mede\n\nQuando você roda a suíte com cobertura ativada, a ferramenta instrumenta o código (acrescenta um contador invisível em cada trecho) e observa o que realmente é executado enquanto os testes rodam. No fim, ela cruza isso com o código-fonte e calcula quatro métricas:\n\n- **Statements (instruções)**: quantas instruções do código (uma atribuição, uma chamada de função, um return) chegaram a rodar pelo menos uma vez.\n- **Branches (ramos)**: quantos caminhos de decisão (o if e o else, cada case de um switch, os dois lados de um ternário) foram exercitados. Rodar só o if e nunca o else conta como metade da cobertura de branch daquele trecho.\n- **Functions (funções)**: quantas funções do arquivo foram chamadas ao menos uma vez pelos testes.\n- **Lines (linhas)**: quantas linhas de código foram executadas, parecido com statements, mas contado por linha do arquivo em vez de por instrução.\n\nNenhuma dessas métricas diz se o teste checou o resultado certo. Elas só dizem se aquele trecho rodou durante os testes. Guarda essa distinção, porque ela é o centro da armadilha que vem mais adiante."
                    },
                    {
                        "type": "code",
                        "value": "// instalar o provider de cobertura do Vitest (uma vez só no projeto)\nnpm install -D @vitest/coverage-v8\n\n// o Jest (equivalente classico do Vitest) tambem tem um --coverage embutido,\n// a ideia de instrumentar o codigo e ler um relatorio depois e a mesma\n\n// rodar a suite inteira com relatorio de cobertura\nnpx vitest run --coverage\n\n// vitest.config.ts: configurando o relatorio\nimport { defineConfig } from 'vitest/config';\n\nexport default defineConfig({\n  test: {\n    coverage: {\n      provider: 'v8',\n      reporter: ['text', 'html'],\n      exclude: ['**/*.config.js', 'src/db.js'],\n    },\n  },\n});\n\n// saida no terminal depois de rodar\n// -----------------|---------|----------|---------|---------|-------------------\n// File              | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s\n// -----------------|---------|----------|---------|---------|-------------------\n// All files         |   84.61 |    66.66 |     100 |   84.61 |\n//  frete.js         |   84.61 |    66.66 |     100 |   84.61 | 7\n// -----------------|---------|----------|---------|---------|-------------------"
                    },
                    {
                        "type": "text",
                        "value": "## Como ler o relatório\n\nA tabela que aparece no terminal (o reporter `text`) resume, por arquivo e para o projeto inteiro, as quatro métricas que você acabou de ver. A coluna `Uncovered Line #s` é a mais prática no dia a dia: ela aponta exatamente quais números de linha nenhum teste chegou a executar, então é o primeiro lugar a olhar quando a cobertura de um arquivo está baixa.\n\nO reporter `html` gera uma pasta `coverage/` com um relatório navegável: abra `coverage/index.html` no navegador e clique em qualquer arquivo para ver o código-fonte pintado linha a linha (verde para o que os testes exercitaram, vermelho para o que ficou de fora, amarelo para um branch parcialmente coberto). É bem mais rápido de vasculhar do que ler número no terminal, principalmente num arquivo grande."
                    },
                    {
                        "type": "text",
                        "value": "## A armadilha do 100%\n\nAqui mora o perigo: cobertura mede execução, não verificação. Um teste pode passar pela linha inteira, entrar em todos os branches, chamar todas as funções, e mesmo assim não checar se o resultado é o certo. Nesse caso a ferramenta de cobertura mostra 100%, tudo tranquilo, só que se alguém quebrar a lógica amanhã, o teste continua passando, porque ele nunca conferiu o valor de verdade.\n\nPerseguir 100% como meta, sozinho, incentiva exatamente esse tipo de teste: escrito só para 'passar pela linha', sem pensar no comportamento esperado. O número sobe, a confiança real na suíte não."
                    },
                    {
                        "type": "code",
                        "value": "// desconto.js\nexport function calcularDesconto(valor, cupom) {\n  if (cupom === 'PROMO10') {\n    return valor * 0.9;\n  }\n  return valor;\n}\n\n// desconto.test.js (ANTES: bate 100% de cobertura, mas nao garante nada)\nimport { describe, it, expect } from 'vitest';\nimport { calcularDesconto } from './desconto';\n\ndescribe('calcularDesconto', () => {\n  it('funciona com cupom', () => {\n    const resultado = calcularDesconto(100, 'PROMO10');\n    expect(resultado).toBeDefined(); // passa mesmo se o calculo estiver errado\n  });\n\n  it('funciona sem cupom', () => {\n    const resultado = calcularDesconto(100, 'OUTRO');\n    expect(resultado).toBeDefined();\n  });\n});\n\n// desconto.test.js (DEPOIS: mesma cobertura, agora testando o valor certo)\ndescribe('calcularDesconto', () => {\n  it('aplica 10% de desconto quando o cupom e PROMO10', () => {\n    expect(calcularDesconto(100, 'PROMO10')).toBe(90);\n  });\n\n  it('nao aplica desconto quando o cupom nao e reconhecido', () => {\n    expect(calcularDesconto(100, 'OUTRO')).toBe(100);\n  });\n});\n\n// se alguem trocar 0.9 por 0.5 sem querer, a versao ANTES continua verde,\n// a versao DEPOIS quebra na hora, que e o que se espera de um teste de verdade"
                    },
                    {
                        "type": "quote",
                        "value": "Cobertura alta é dado sobre execução, não sobre confiança nos testes. Use o relatório para achar linha esquecida, nunca como troféu para caçar até 100%."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que a métrica de cobertura de branches mede?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Quantos caminhos de decisão, como um if e seu else, os testes exercitaram",
                                "isCorrect": true
                            },
                            {
                                "text": "Quantas funções distintas do arquivo os testes chegaram a chamar uma vez",
                                "isCorrect": false
                            },
                            {
                                "text": "Quantas linhas do arquivo os testes chegaram a executar em algum momento",
                                "isCorrect": false
                            },
                            {
                                "text": "Quanto tempo, em média, os testes levam para rodar cada arquivo do projeto",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual comando roda a suíte do Vitest já com o relatório de cobertura?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "npx vitest coverage --run-once",
                                "isCorrect": false
                            },
                            {
                                "text": "npx vitest run --coverage",
                                "isCorrect": true
                            },
                            {
                                "text": "npx vitest --report=coverage",
                                "isCorrect": false
                            },
                            {
                                "text": "npx vitest run --check-lines",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um arquivo mostra 100% em todas as colunas do relatório de cobertura, mas um bug no cálculo de desconto passou para produção sem nenhum teste acusar o problema. O que provavelmente aconteceu?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O bug foi introduzido depois da última vez que a suíte rodou com a cobertura ativada",
                                "isCorrect": false
                            },
                            {
                                "text": "100% de cobertura é matematicamente impossível, então o relatório mostrado estava errado",
                                "isCorrect": false
                            },
                            {
                                "text": "Os testes exercitaram o código, mas usaram uma asserção fraca que não conferia o valor certo",
                                "isCorrect": true
                            },
                            {
                                "text": "O relatório de cobertura do Vitest está com um erro de cálculo e não deveria ser confiável",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao abrir o relatório HTML de cobertura, uma linha aparece destacada em amarelo. O que isso costuma indicar?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aquela linha tem uma vulnerabilidade de segurança identificada automaticamente",
                                "isCorrect": false
                            },
                            {
                                "text": "Aquela linha foi modificada recentemente e ainda não foi revisada por ninguém",
                                "isCorrect": false
                            },
                            {
                                "text": "O Vitest não conseguiu instrumentar aquela linha específica para medir cobertura",
                                "isCorrect": false
                            },
                            {
                                "text": "Um branch, como um if com else, foi só parcialmente exercitado pelos testes",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um time define uma meta: nenhum PR pode ser aceito se a cobertura cair abaixo de 100%. Depois de alguns meses, a suíte tem 100% de cobertura, mas bugs continuam chegando em produção com a mesma frequência de antes. Qual explicação é mais consistente com a armadilha do 100% vista nesta aula?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A meta incentivou testes que exercitam o código sem checar o comportamento certo",
                                "isCorrect": true
                            },
                            {
                                "text": "100% de cobertura é impossível de sustentar por mais de um mês em qualquer projeto",
                                "isCorrect": false
                            },
                            {
                                "text": "A meta de cobertura não tem nenhuma relação com a frequência de bugs em produção",
                                "isCorrect": false
                            },
                            {
                                "text": "O time provavelmente parou de rodar a suíte de testes antes de cada deploy",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Testes end-to-end",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Testes end-to-end\n\nAté aqui a pirâmide te levou do unitário (uma função isolada) até a integração (rota, service e banco trabalhando juntos, testados com supertest direto pela API). Falta o topo: o teste end-to-end (e2e), que não entra pela API, entra pela porta da frente. Ele abre a aplicação do jeito que um usuário abriria, clica onde um usuário clicaria, e confere se o que aparece na tela, e o que fica gravado no banco, é o esperado.\n\nÉ o teste mais parecido com a experiência real. E, como você vai ver, é justamente por isso que ele custa mais caro."
                    },
                    {
                        "type": "text",
                        "value": "## O fluxo inteiro, de ponta a ponta\n\nUm teste e2e não chama uma função nem faz uma requisição HTTP direto contra o Express: ele controla um navegador de verdade (ou uma simulação bem próxima disso), aberto contra a aplicação rodando de verdade, front e back juntos. Um cenário típico: abrir a tela de login, digitar e-mail e senha, clicar em 'Entrar', esperar a navegação para a tela de tarefas, clicar em 'Nova tarefa', preencher o formulário, confirmar, e checar que a tarefa aparece na lista, inclusive depois de recarregar a página (prova de que ela foi realmente gravada no banco, não só numa variável em memória no navegador).\n\nRepare a diferença de camada: o teste de integração do módulo anterior falava HTTP diretamente com as rotas do Express. O e2e vai uma camada acima, fala com a interface, e deixa a própria aplicação decidir como transformar aquele clique numa chamada HTTP."
                    },
                    {
                        "type": "code",
                        "value": "// exemplo com Playwright: cadastro de tarefa, do login ate a lista\nimport { test, expect } from '@playwright/test';\n\ntest('usuario loga e cadastra uma nova tarefa', async ({ page }) => {\n  await page.goto('http://localhost:3000/login');\n\n  await page.getByLabel('E-mail').fill('aluno@ensina.dev');\n  await page.getByLabel('Senha').fill('senha123');\n  await page.getByRole('button', { name: 'Entrar' }).click();\n\n  await expect(page).toHaveURL('http://localhost:3000/tarefas');\n\n  await page.getByRole('button', { name: 'Nova tarefa' }).click();\n  await page.getByLabel('Titulo').fill('Estudar testes e2e');\n  await page.getByRole('button', { name: 'Salvar' }).click();\n\n  await expect(page.getByText('Estudar testes e2e')).toBeVisible();\n\n  await page.reload();\n  await expect(page.getByText('Estudar testes e2e')).toBeVisible(); // confirma que gravou no banco\n});\n\n// o Cypress resolve o mesmo problema com uma API propria (cy.visit, cy.get, cy.click),\n// mas a ideia por tras e a mesma: controlar um navegador de verdade contra a aplicacao de verdade"
                    },
                    {
                        "type": "table",
                        "value": "[[\"\",\"Teste de integração (supertest)\",\"Teste e2e (Playwright/Cypress)\"],[\"O que ele fala com\",\"As rotas do Express, direto por HTTP\",\"A interface, como um usuário faria\"],[\"O que ele exercita\",\"Rota, service e banco\",\"Front, rota, service, banco e a navegação inteira\"],[\"Velocidade\",\"Rápido, roda em memória ou contra um banco de teste local\",\"Lento, sobe navegador, front e back de verdade\"],[\"Fragilidade\",\"Quebra só se a API mudar\",\"Quebra também se um botão ou texto da tela mudar\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que existem poucos testes e2e\n\nTrês motivos empurram o e2e para o topo da pirâmide, com poucos testes:\n\n- **Lentos**: cada teste precisa subir o front, o back e o banco de verdade, abrir um navegador, esperar a página carregar, esperar animações e requisições terminarem. Um teste que levaria milissegundos como unitário pode levar vários segundos como e2e.\n- **Frágeis**: o teste depende de detalhes da interface (o texto de um botão, a estrutura de um formulário, o tempo que uma tela leva para carregar). Um redesenho que não muda nenhuma regra de negócio pode quebrar dezenas de testes e2e.\n- **Caros**: além do tempo de execução, alguém precisa escrever, manter e depurar esses testes, e a infraestrutura para rodar navegador em CI custa mais do que só rodar um processo Node.\n\nPor isso a pirâmide pede poucos e2e: só onde o custo compensa."
                    },
                    {
                        "type": "text",
                        "value": "## Onde o e2e compensa\n\nA resposta não é 'nunca fazer e2e', é 'fazer pouco e onde mais importa'. Os candidatos naturais são os fluxos críticos do negócio, aqueles que, se quebrarem, derrubam a aplicação inteira do ponto de vista do usuário: login, cadastro, checkout de um pedido, o fluxo de pagamento. Não vale a pena escrever um e2e para cada variação de validação de formulário (isso já está coberto, e mais barato, pelos testes unitários e de integração). Vale a pena para o caminho principal que, se parar de funcionar, ninguém mais consegue usar o sistema."
                    },
                    {
                        "type": "quote",
                        "value": "e2e testa a promessa que você faz para o usuário: que o botão realmente faz o que ele diz que faz. Vale ouro nos fluxos certos, e custa caro demais para testar tudo."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que diferencia um teste e2e de um teste de integração feito com supertest?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O e2e só verifica o backend; o de integração verifica o backend e o frontend juntos",
                                "isCorrect": false
                            },
                            {
                                "text": "O e2e passa pela interface como um usuário faria; o de integração fala direto com a rota",
                                "isCorrect": true
                            },
                            {
                                "text": "O e2e não usa nenhum framework de teste; o de integração sempre depende do Vitest",
                                "isCorrect": false
                            },
                            {
                                "text": "O e2e roda mais rápido, porque não precisa esperar resposta nenhuma do banco de dados",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que os testes e2e ficam no topo da pirâmide, em menor quantidade?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque testes e2e não conseguem checar se um dado foi realmente gravado no banco",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque escrever um e2e exige uma linguagem de programação diferente do resto",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque são lentos, frágeis a mudanças de interface e caros de escrever e manter",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a maioria das ferramentas de e2e, como o Playwright, ainda é instável",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time redesenha a tela de login, trocando o texto do botão de 'Entrar' para 'Acessar', sem mudar nenhuma regra de negócio. Vários testes e2e passam a falhar, enquanto os unitários e de integração continuam passando. O que isso ilustra?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um bug real introduzido no redesenho, que os outros níveis de teste não pegaram",
                                "isCorrect": false
                            },
                            {
                                "text": "Que os testes de integração desse projeto estão desatualizados e devem ser reescritos",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o Playwright não é compatível com mudanças de texto em botões de formulário",
                                "isCorrect": false
                            },
                            {
                                "text": "A fragilidade do e2e: ele depende de detalhes de interface que mudam sem alterar a lógica",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe decide escrever um teste e2e para cada uma das 40 validações de campo do formulário de cadastro de tarefa. Por que essa não costuma ser uma boa estratégia?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque validações de campo são mais baratas e rápidas de cobrir com testes unitários",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o Playwright tem um limite técnico de dez testes por arquivo de teste",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque testes e2e não são capazes de preencher formulários com múltiplos campos",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque validações de campo não devem ser testadas em nenhum nível da pirâmide",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um teste e2e cadastra uma tarefa, recarrega a página e confere que ela continua na lista. Que garantia adicional esse teste dá, que um teste de integração com supertest (que também confere o POST e o retorno 201) não dá sozinho?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Confirma que o banco usado em produção está configurado com backup automático",
                                "isCorrect": false
                            },
                            {
                                "text": "Confirma que a interface dispara a chamada certa e reflete o dado persistido na tela",
                                "isCorrect": true
                            },
                            {
                                "text": "Confirma que a query SQL usada para inserir a tarefa está livre de vulnerabilidades",
                                "isCorrect": false
                            },
                            {
                                "text": "Confirma que a rota aceita o mesmo payload em qualquer ordem dos campos enviados",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Testes flaky: causas e como evitar",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Testes flaky: causas e como evitar\n\nTem um tipo de teste que é pior do que um teste que falha: é o teste que falha às vezes. Você roda a suíte, vermelho. Roda de novo, sem mudar uma linha de código, verde. Roda de novo, vermelho outra vez. Esse comportamento tem nome: teste flaky (instável), e ele é um dos problemas mais corrosivos que uma suíte de testes pode ter.\n\nNesta aula você vai ver as causas mais comuns de flakiness e, mais importante, como escrever testes que não caem nessa armadilha."
                    },
                    {
                        "type": "text",
                        "value": "## As causas mais comuns\n\nQuase todo teste flaky cai em uma dessas categorias:\n\n- **Dependência de tempo**: o teste espera um `setTimeout`, compara `Date.now()`, ou assume que uma operação assíncrona termina dentro de um prazo fixo. Numa máquina mais lenta (como o runner do CI, sob carga), o prazo estoura e o teste falha.\n- **Ordem dos testes**: um teste depende do que outro deixou para trás (uma variável, uma linha no banco, um contador global). Ele passa quando roda depois do teste certo, e falha quando roda sozinho ou em outra ordem.\n- **Estado compartilhado não limpo**: dois testes usam o mesmo dado (o mesmo e-mail de usuário, a mesma linha no banco de teste) e um interfere no outro, sem que o código de nenhum dos dois tenha um bug de verdade.\n- **Chamada de rede real**: o teste bate numa API externa de verdade. Se a rede cai, a API está fora do ar ou responde mais devagar naquele instante, o teste falha por um motivo que não tem nada a ver com o código sendo testado.\n- **Aleatoriedade**: o teste usa `Math.random()`, um identificador gerado na hora, ou depende da ordem em que o banco devolve linhas sem um `ORDER BY` explícito. Às vezes o valor sorteado cai num caso que o teste não previu."
                    },
                    {
                        "type": "code",
                        "value": "// flaky: depende de tempo real e de uma janela de espera apertada demais\nimport { describe, it, expect } from 'vitest';\nimport { debounce } from './debounce';\n\ndescribe('debounce', () => {\n  it('so chama a funcao uma vez apos 100ms de silencio', async () => {\n    let chamadas = 0;\n    const fn = debounce(() => chamadas++, 100);\n\n    fn();\n    fn();\n    fn();\n\n    await new Promise((resolve) => setTimeout(resolve, 105)); // margem apertada\n\n    expect(chamadas).toBe(1);\n    // no CI, sob carga, esses 5ms de folga somem e o teste falha do nada\n  });\n});"
                    },
                    {
                        "type": "code",
                        "value": "// corrigido: controla o tempo em vez de esperar o tempo real passar\nimport { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';\nimport { debounce } from './debounce';\n\ndescribe('debounce', () => {\n  beforeEach(() => {\n    vi.useFakeTimers();\n  });\n\n  afterEach(() => {\n    vi.useRealTimers();\n  });\n\n  it('so chama a funcao uma vez apos 100ms de silencio', () => {\n    let chamadas = 0;\n    const fn = debounce(() => chamadas++, 100);\n\n    fn();\n    fn();\n    fn();\n\n    vi.advanceTimersByTime(100); // avanca o relogio na hora, sem esperar de verdade\n\n    expect(chamadas).toBe(1);\n    // deterministico: sempre os mesmos 100ms, nao importa a velocidade da maquina\n  });\n});"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Causa\",\"Como evitar\"],[\"Dependência de tempo real\",\"Controlar o tempo com timers falsos (vi.useFakeTimers, vi.advanceTimersByTime) em vez de esperar de verdade\"],[\"Ordem dos testes\",\"Cada teste cria os próprios dados e não depende do que outro teste deixou para trás\"],[\"Estado compartilhado não limpo\",\"Isolar com beforeEach/afterEach: recriar ou truncar o estado antes ou depois de cada teste\"],[\"Chamada de rede real\",\"Mockar a chamada externa (vi.mock, vi.fn) em vez de bater numa API de verdade\"],[\"Aleatoriedade\",\"Fixar a semente do gerador ou injetar um gerador determinístico no teste\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que flaky é mais perigoso do que parece\n\nUm teste que falha sempre é fácil de lidar com: ele aponta um problema, alguém corrige, ele volta a passar. O teste flaky corrói de um jeito diferente: na primeira vez que ele falha sem motivo aparente, alguém roda de novo e ele passa. Na segunda vez, mais alguém faz o mesmo. Depois de algumas semanas, o reflexo do time inteiro vira 'roda de novo que deve ser só flakiness', inclusive quando a falha é real.\n\nEsse é o efeito mais caro: o time para de confiar na suíte. E o valor inteiro de ter testes automatizados (o sinal claro de que algo quebrou) desaparece justamente na hora em que mais precisava dele. Um teste flaky não corrigido tende a esconder, cedo ou tarde, uma regressão de verdade."
                    },
                    {
                        "type": "quote",
                        "value": "Um teste que falha sempre te dá informação. Um teste flaky te ensina a ignorar a informação. É por isso que ele é pior do que não ter teste nenhum."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que caracteriza um teste flaky?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ele demora muito mais tempo que os demais testes da suíte para terminar de rodar",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele aponta, na mensagem de erro, o número exato da linha onde está o problema",
                                "isCorrect": false
                            },
                            {
                                "text": "Ele passa em algumas execuções e falha em outras, sem nenhuma mudança no código",
                                "isCorrect": true
                            },
                            {
                                "text": "Ele sempre falha, mesmo depois de o bug que ele apontava já ter sido corrigido",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das opções abaixo é uma causa comum de teste flaky?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O teste usa describe e it para organizar os casos dentro do mesmo arquivo",
                                "isCorrect": false
                            },
                            {
                                "text": "O teste importa a função sendo testada de um arquivo separado do teste",
                                "isCorrect": false
                            },
                            {
                                "text": "O teste usa expect para comparar o resultado retornado com o valor esperado",
                                "isCorrect": false
                            },
                            {
                                "text": "O teste espera um tempo fixo, como 100ms, para uma operação assíncrona terminar",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "A suíte tem 50 testes. Isolados, todos passam. Rodados juntos, dois deles falham, mas só quando um roda logo depois do outro. O que provavelmente está acontecendo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um teste está deixando estado (dado no banco, variável) que interfere no seguinte",
                                "isCorrect": true
                            },
                            {
                                "text": "O Vitest tem um limite de testes simultâneos e descarta alguns deles ao acaso",
                                "isCorrect": false
                            },
                            {
                                "text": "Os dois testes estão testando exatamente a mesma função, o que nunca é permitido",
                                "isCorrect": false
                            },
                            {
                                "text": "A suíte está usando Math.random() dentro do próprio runner de testes do Vitest",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um teste de integração bate direto numa API de pagamentos de terceiro de verdade (não mockada) para conferir se o pedido é aprovado. Esse teste falha de vez em quando, mesmo sem mudança no código. Qual é o ajuste mais direto para resolver isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Rodar esse teste sozinho, fora da suíte principal, sempre antes de todos os outros",
                                "isCorrect": false
                            },
                            {
                                "text": "Mockar a chamada à API externa, controlando a resposta que o teste espera",
                                "isCorrect": true
                            },
                            {
                                "text": "Trocar o Vitest por outro test runner mais tolerante a chamadas de rede reais",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o tempo de timeout do teste até a API de pagamentos nunca mais falhar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois testes independentes usam o mesmo e-mail fixo para criar um usuário de teste ('teste@exemplo.com'). Rodados em sequência no CI, o segundo falha com erro de e-mail duplicado; rodados sozinhos, cada um passa. Qual mudança resolve a causa raiz, e não só o sintoma?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Marcar os dois testes com it.skip sempre que forem rodados na mesma suíte de CI",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar a ordem de execução dos arquivos de teste no arquivo de configuração",
                                "isCorrect": false
                            },
                            {
                                "text": "Gerar um e-mail único por teste e limpar os dados criados entre um teste e outro",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o timeout do segundo teste para dar tempo do primeiro liberar o e-mail",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Testes no CI",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Testes no CI\n\nUma suíte de testes que só roda quando alguém lembra de rodar localmente vale bem menos do que parece. Cedo ou tarde alguém esquece, ou roda só parte dela, ou ignora um teste vermelho porque 'já é tarde, deve ser só flaky' (viu na aula passada como isso é perigoso). A solução é tirar essa decisão da mão de qualquer pessoa: rodar a suíte inteira, automaticamente, toda vez que alguém sobe código. Isso é integração contínua, ou CI (continuous integration), e é o assunto desta aula."
                    },
                    {
                        "type": "text",
                        "value": "## Rodar a cada push e a cada pull request\n\nNum pipeline de CI configurado, a suíte de testes roda sozinha em dois momentos: a cada push (cada vez que alguém envia commits para o repositório remoto) e a cada pull request (antes de qualquer mudança ser aceita na branch principal). O servidor de CI sobe um ambiente limpo do zero, do jeito que você viu no Módulo 4 para o banco de teste efêmero (sobe, migra, roda os testes), só que dessa vez sem depender da máquina de ninguém.\n\nO ganho principal é o bloqueio de merge: a maioria das plataformas (GitHub incluído) permite marcar a execução dos testes como uma verificação obrigatória (required status check) numa pull request. Se a suíte falhar, o botão de mesclar fica bloqueado, e ninguém precisa lembrar de rodar nada manualmente antes de aprovar o código."
                    },
                    {
                        "type": "code",
                        "value": "# .github/workflows/testes.yml\nname: Testes\n\non:\n  push:\n  pull_request:\n\njobs:\n  testes:\n    runs-on: ubuntu-latest\n\n    services:\n      postgres:\n        image: postgres:16\n        env:\n          POSTGRES_PASSWORD: teste\n          POSTGRES_DB: app_teste\n        ports:\n          - 5432:5432\n\n    steps:\n      - uses: actions/checkout@v4\n\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n\n      - run: npm ci\n\n      - run: npm run migrate\n        env:\n          DATABASE_URL: postgres://postgres:teste@localhost:5432/app_teste\n\n      - run: npx vitest run --coverage\n        env:\n          DATABASE_URL: postgres://postgres:teste@localhost:5432/app_teste"
                    },
                    {
                        "type": "text",
                        "value": "## Cuidado com o modo watch, e por que rapidez importa\n\nRepare que o workflow roda `vitest run`, com o `run` explícito, e não só `vitest`. Sem isso, o Vitest entra no modo watch por padrão (o mesmo modo interativo que você usa no dia a dia, reobservando arquivos e esperando você digitar algo no terminal), e ele nunca termina sozinho. Num pipeline de CI isso trava o job para sempre, até estourar o tempo limite.\n\nVelocidade também importa pelo motivo oposto: cada minuto que a suíte leva para rodar é um minuto que a pull request fica esperando, e um minuto de máquina de CI custando. É aqui que a pirâmide de testes paga a conta: uma suíte com muitos unitários rápidos, alguns de integração e pouquíssimos e2e roda em segundos ou poucos minutos. Uma suíte pesada em e2e pode levar dezenas de minutos só para dar o primeiro sinal verde."
                    },
                    {
                        "type": "code",
                        "value": "// package.json (trecho)\n{\n  \"scripts\": {\n    \"test\": \"vitest run\",\n    \"test:watch\": \"vitest\",\n    \"test:coverage\": \"vitest run --coverage\"\n  }\n}\n\n// localmente, no dia a dia: npm run test:watch (fica observando e re-rodando)\n// no CI: npm test (roda uma vez, mostra o resultado e encerra sozinho)"
                    },
                    {
                        "type": "text",
                        "value": "## O que vem depois: CI/CD\n\nRodar os testes automaticamente é só a primeira metade de um pipeline de CI/CD completo. A outra metade (build da aplicação, empacotar, publicar uma imagem, fazer o deploy em produção) é assunto para mais adiante, quando você vir Docker e containers. Por enquanto, o que importa fixar é o papel dos testes dentro desse pipeline: eles são o portão de qualidade que decide se o código está bom o suficiente para seguir adiante. Sem uma suíte confiável (sem flaky, rápida, cobrindo o que importa), esse portão não vale nada, é só uma etapa que todo mundo aprende a ignorar."
                    },
                    {
                        "type": "quote",
                        "value": "CI não substitui escrever bons testes, só garante que ninguém esqueça de rodá-los a cada mudança."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa, na prática, 'rodar os testes no CI'?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Cada desenvolvedor precisa rodar a suíte manualmente antes de cada commit local",
                                "isCorrect": false
                            },
                            {
                                "text": "Os testes passam a rodar apenas uma vez por semana, num horário fixo agendado",
                                "isCorrect": false
                            },
                            {
                                "text": "Os testes de integração são substituídos por testes e2e no ambiente de CI",
                                "isCorrect": false
                            },
                            {
                                "text": "A suíte roda automaticamente a cada push ou pull request, sem depender de ninguém",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Por que marcar a execução dos testes como 'required status check' numa pull request é importante?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Porque bloqueia o botão de merge automaticamente enquanto a suíte não passar",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque faz os testes rodarem com uma cobertura de código maior que localmente",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque transforma automaticamente cada teste falho em uma issue no repositório",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque reduz o tempo total que a suíte de testes leva para terminar de rodar",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um workflow de CI roda apenas `vitest`, sem o `run`, no job de testes. O job nunca termina, até o runner estourar o tempo limite e falhar. Qual é a causa mais provável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A suíte tem testes flaky demais, e o Vitest entra num laço tentando repeti-los",
                                "isCorrect": false
                            },
                            {
                                "text": "Sem run, o Vitest sobe no modo watch, que espera mudanças e nunca encerra sozinho",
                                "isCorrect": true
                            },
                            {
                                "text": "O banco de dados de teste não foi migrado antes da suíte começar a rodar",
                                "isCorrect": false
                            },
                            {
                                "text": "O workflow tentou rodar testes e2e sem ter instalado o navegador necessário",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que uma suíte pesada em testes e2e tende a atrasar mais o pipeline de CI do que uma suíte com muitos unitários e poucos e2e, testando a mesma aplicação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque testes e2e só podem rodar em runners com placa de vídeo dedicada",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque testes unitários não podem ser paralelizados dentro do mesmo pipeline",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque cada e2e sobe navegador, front e back de verdade, o que leva bem mais tempo",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o CI cobra por teste executado, e testes e2e custam mais caro por padrão",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe nota que sua pull request demora, em média, 25 minutos para receber o sinal verde do CI, o que está atrasando os merges do time. A suíte tem 400 testes unitários, 30 de integração e 45 testes e2e. Qual mudança tende a atacar melhor a causa raiz do atraso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Reescrever os 400 testes unitários usando um framework diferente do Vitest",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover a etapa de instalação de dependências do workflow para ganhar segundos",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o tempo limite do job de CI para dar mais folga para a suíte inteira",
                                "isCorrect": false
                            },
                            {
                                "text": "Revisar os 45 e2e, mantendo só os fluxos críticos, e mover o resto para outro nível",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Quando usar cada nível de teste",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Quando usar cada nível de teste\n\nLá no Módulo 1 você conheceu a pirâmide de testes: unitário na base, integração no meio, e2e no topo. Agora, depois de ver como cada nível funciona na prática (incluindo o que os torna caros, lentos ou frágeis), dá para responder a pergunta que fecha esta trilha: diante de uma funcionalidade nova, qual nível de teste vale a pena escrever, e quanto de cada?\n\nA resposta curta é a proporção da própria pirâmide: muitos testes unitários, alguns de integração, poucos e2e. A resposta longa explica o porquê de cada 'quanto'."
                    },
                    {
                        "type": "text",
                        "value": "## Muitos testes unitários: a base barata\n\nTestes unitários testam uma função ou uma unidade pequena isolada (com mocks no lugar das dependências, como você viu no Módulo 3), sem subir banco, sem rede, sem navegador. Isso os torna baratos em três frentes: rápidos de rodar (uma suíte inteira de unitários roda em segundos), fáceis de escrever, e fáceis de manter (um teste isolado quebra por um motivo só: a unidade que ele testa mudou de comportamento).\n\nSão o lugar certo para cobrir regras de negócio, cálculos, validações e casos de borda: toda vez que existe uma lógica com mais de um caminho possível (um desconto que muda por faixa, uma validação com várias regras), vale a pena um teste unitário para cada caminho relevante. É aqui que a proporção da pirâmide pesa mais: a maioria dos testes da sua suíte deveria ser deste tipo."
                    },
                    {
                        "type": "text",
                        "value": "## Alguns testes de integração: as junções que importam\n\nTestes de integração (Módulo 4) custam mais que unitários (sobem um banco de teste, esperam I/O de verdade), então não faz sentido testar toda combinação possível nesse nível. O critério é outro: testar as junções importantes, os pontos onde as peças se encaixam e onde um teste unitário, sozinho, não seria capaz de pegar o problema.\n\nExemplos de junção que vale a pena testar com integração: uma rota que depende de uma query específica no banco (o teste unitário mockaria o banco e nunca pegaria uma query errada), um middleware de autenticação protegendo de fato uma rota (o teste unitário da função que valida o token não prova que o middleware está registrado na rota certa), um fluxo que grava em mais de uma tabela dentro da mesma transação. A régua é: se o unitário já prova isso com mock, não precisa de integração; se só prova rodando as peças juntas, precisa."
                    },
                    {
                        "type": "text",
                        "value": "## Poucos testes e2e: só os fluxos críticos\n\ne2e é o nível mais caro dos três, como você viu na aula sobre testes end-to-end deste módulo, então ele fica reservado para os fluxos que, se pararem de funcionar, tiram a aplicação do ar do ponto de vista de quem usa: login, cadastro, o checkout de um pedido, o fluxo de pagamento. Não é preciso (nem desejável) um e2e para cada tela ou cada variação de formulário, isso já está coberto, mais barato e mais rápido, pelos níveis de baixo.\n\nUma forma prática de decidir se um fluxo merece um e2e: pergunte o que acontece se ele quebrar em produção sem ninguém perceber. Se a resposta é 'a empresa para de vender' ou 'ninguém mais consegue entrar no sistema', é candidato a e2e. Se a resposta é 'um campo de formulário aceita um valor que não devia', isso é trabalho para um teste unitário."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\",\"Unitário\",\"Integração\",\"e2e\"],[\"Quantidade na suíte\",\"Muitos\",\"Alguns\",\"Poucos\"],[\"O que testa\",\"Uma função ou unidade isolada, com mocks\",\"Rota, service e banco trabalhando juntos\",\"O fluxo inteiro, pela interface\"],[\"Velocidade\",\"Muito rápido (segundos para a suíte inteira)\",\"Médio (sobe banco de teste)\",\"Lento (sobe front, back e navegador)\"],[\"Quando escrever\",\"Regras de negócio, cálculos, validações, casos de borda\",\"Junções importantes: rota + banco, middleware protegendo rota\",\"Fluxos críticos: login, cadastro, checkout, pagamento\"],[\"Custo de manutenção\",\"Baixo\",\"Médio\",\"Alto\"]]"
                    },
                    {
                        "type": "code",
                        "value": "// como a mesma funcionalidade (cadastro de tarefa) aparece nos tres niveis\n\n// 1) unitario: valida a regra, isolado, sem banco\n// tarefas.service.test.js\nit('rejeita tarefa sem titulo', () => {\n  expect(() => validarTarefa({ titulo: '' })).toThrow('titulo e obrigatorio');\n});\n\n// 2) integracao: sobe a rota de verdade contra um banco de teste\n// tarefas.routes.integration.test.js\nit('POST /tarefas grava no banco e devolve 201', async () => {\n  const resposta = await request(app)\n    .post('/tarefas')\n    .set('Authorization', `Bearer ${token}`)\n    .send({ titulo: 'Estudar piramide de testes' });\n\n  expect(resposta.status).toBe(201);\n\n  const linha = await db.query('SELECT * FROM tarefas WHERE id = $1', [resposta.body.id]);\n  expect(linha.rows[0].titulo).toBe('Estudar piramide de testes');\n});\n\n// 3) e2e: so existe para o fluxo critico (aqui, o cadastro completo), nao para cada regra\n// cadastro-tarefa.e2e.test.js\ntest('usuario loga e cadastra uma tarefa pela tela', async ({ page }) => {\n  // mesma ideia do exemplo de e2e visto antes neste modulo\n});"
                    },
                    {
                        "type": "quote",
                        "value": "Pirâmide de testes é economia: muitos unitários porque são baratos, alguns de integração nas junções que importam, poucos e2e só nos fluxos críticos demais para confiar em outra coisa."
                    }
                ],
                "questions": [
                    {
                        "statement": "Segundo a pirâmide de testes, qual é a proporção esperada entre os três níveis?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Muitos testes unitários, alguns de integração, poucos e2e",
                                "isCorrect": true
                            },
                            {
                                "text": "A mesma quantidade de testes unitários, de integração e e2e",
                                "isCorrect": false
                            },
                            {
                                "text": "Muitos testes e2e, alguns de integração, poucos unitários",
                                "isCorrect": false
                            },
                            {
                                "text": "Só testes de integração, já que cobrem unitário e e2e juntos",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual critério ajuda a decidir se um fluxo merece um teste e2e?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Perguntar se o fluxo usa alguma biblioteca externa instalada via npm",
                                "isCorrect": false
                            },
                            {
                                "text": "Perguntar se a aplicação fica inutilizável para o usuário caso o fluxo quebre",
                                "isCorrect": true
                            },
                            {
                                "text": "Perguntar se aquele fluxo já tem algum teste unitário cobrindo a mesma regra",
                                "isCorrect": false
                            },
                            {
                                "text": "Perguntar quantas linhas de código a funcionalidade ocupa no projeto inteiro",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um middleware de autenticação tem um teste unitário que confere se a função de validar o token rejeita um token inválido. Mesmo assim, uma rota que deveria estar protegida continua respondendo normalmente sem token nenhum. O que esse cenário sugere sobre os níveis de teste usados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Faltava um teste e2e, já que só ele seria capaz de pegar esse tipo de problema",
                                "isCorrect": false
                            },
                            {
                                "text": "O Vitest não suporta testar middlewares de autenticação em nenhum nível da pirâmide",
                                "isCorrect": false
                            },
                            {
                                "text": "Faltou um teste de integração para confirmar que o middleware está registrado na rota",
                                "isCorrect": true
                            },
                            {
                                "text": "O teste unitário da função de validar token está incorreto e precisa ser reescrito",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que testar cada uma das variações de validação de um formulário (campo vazio, campo muito longo, formato inválido) costuma ser trabalho para testes unitários, e não para e2e?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque testes e2e não conseguem preencher campos de formulário de forma alguma",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque validações de campo, por padrão, não entram no escopo de nenhum teste",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o Playwright e o Cypress não são compatíveis com formulários HTML",
                                "isCorrect": false
                            },
                            {
                                "text": "São muitos casos de borda, e o unitário cobre cada um rápido e sem depender de UI",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma aplicação tem 300 testes unitários, 20 de integração e 2 e2e (login e checkout). Um novo desenvolvedor sugere adicionar testes e2e para cada uma das 15 páginas do sistema, argumentando que isso 'garante que tudo funciona'. Qual é o risco principal dessa proposta, considerando o que a pirâmide de testes ensina?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A suíte ficaria lenta e frágil, sem necessariamente cobrir melhor os casos de borda",
                                "isCorrect": true
                            },
                            {
                                "text": "Testes e2e não são capazes de detectar nenhum tipo de regressão numa aplicação real",
                                "isCorrect": false
                            },
                            {
                                "text": "O número de e2e nunca pode ultrapassar o número de testes de integração existentes",
                                "isCorrect": false
                            },
                            {
                                "text": "A cobertura de código do projeto cairia, já que e2e não entra no relatório de cobertura",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - Qualidade além dos testes",
        "aulas": [
            {
                "titulo": "Linter (ESLint)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Qualidade além dos testes\n\nVocê chegou ao último módulo da trilha. Nos módulos anteriores você aprendeu a testar: unitário, mocks, integração, TDD, cobertura, e2e. Testes automatizados garantem uma coisa específica, que o comportamento do código está correto pros casos que alguém pensou em escrever. Mas existe uma classe inteira de problema que teste nenhum pega, porque o código \"funciona\" mesmo estando malfeito: uma variável que sobrou de uma refatoração e nunca mais é usada, um == onde devia ser ===, um detalhe de estilo que muda de arquivo pra arquivo.\n\nEsse módulo fecha a trilha com as ferramentas que cuidam da qualidade antes mesmo do teste rodar: linter, formatador, tipos e revisão humana. No fim, tudo isso se junta num fluxo só, rodando local, no pre-commit e no CI."
                    },
                    {
                        "type": "text",
                        "value": "## O que o ESLint pega\n\nESLint é um analisador estático: lê o código sem executar nada, procurando padrões que o motor JavaScript aceita de boa, mas que quase sempre são bug ou descuido. Algumas regras \"core\" (sem plugin nenhum) já pegam:\n\n- Variável declarada e nunca usada (`no-unused-vars`), sobra de refatoração.\n- Comparação solta com `==` em vez de `===` (`eqeqeq`), que compara tipos diferentes com coerção implícita.\n- `switch` com `case` sem `break`, caindo pro próximo por acidente (`no-fallthrough`).\n- Usar `var` onde devia ser `const` ou `let` (`no-var`, `prefer-const`).\n\nTem também aquele clássico do `await` esquecido numa chamada assíncrona: a função segue em frente antes da Promise resolver, e o erro só aparece bem depois, com dado incompleto salvo no banco. Pegar isso de verdade exige informação de tipo, é a regra `@typescript-eslint/no-floating-promises`, que só existe quando o projeto usa TypeScript. Você vai entender por quê daqui a duas aulas, quando o assunto for tipo como forma de teste."
                    },
                    {
                        "type": "code",
                        "value": "// pedidos.js\nfunction calcularTotal(pedido) {\n    const taxa = 0.1\n    let desconto = 0\n    let logPrefixo = \"[pedidos]\"\n\n    if (pedido.cupom == \"PROMO10\") {\n        desconto = pedido.subtotal * 0.1\n    }\n\n    return pedido.subtotal + pedido.subtotal * taxa - desconto\n}\n\nmodule.exports = { calcularTotal }\n\n// rodando o linter nesse arquivo:\n\n$ npx eslint pedidos.js\n\npedidos.js\n  5:9   warning  'logPrefixo' is assigned a value but never used  no-unused-vars\n  7:18  error    Expected '===' and instead saw '=='              eqeqeq\n\n1 error, 1 warning"
                    },
                    {
                        "type": "code",
                        "value": "// eslint.config.js\nimport js from \"@eslint/js\";\n\nexport default [\n  js.configs.recommended,\n  {\n    languageOptions: {\n      ecmaVersion: \"latest\",\n      sourceType: \"module\",\n    },\n    rules: {\n      eqeqeq: \"error\",\n      \"no-unused-vars\": \"warn\",\n      \"no-var\": \"error\",\n      \"prefer-const\": \"error\",\n    },\n  },\n];"
                    },
                    {
                        "type": "code",
                        "value": "# rodar o linter no projeto inteiro\nnpx eslint .\n\n# rodar só numa pasta\nnpx eslint src/\n\n# aplicar as correções automáticas (o que dá pra corrigir sozinho, tipo trocar var por const)\nnpx eslint . --fix\n\n# script no package.json\n# \"scripts\": { \"lint\": \"eslint .\" }\nnpm run lint"
                    },
                    {
                        "type": "text",
                        "value": "## Direto no editor, direto no time\n\nRodar `npx eslint .` manualmente funciona, mas o ganho de verdade é ver o erro sublinhado enquanto você digita. A extensão ESLint do VS Code (ou equivalente noutro editor) lê o mesmo `eslint.config.js` do projeto e marca o problema na hora, antes até de salvar o arquivo.\n\nNum time, o `eslint.config.js` fica versionado no repositório: todo mundo roda exatamente as mesmas regras, então \"código bagunçado\" deixa de ser opinião de quem está revisando e vira erro objetivo, com linha e coluna. Isso tira uma fonte inteira de atrito do code review (assunto da aula 4) e barra, cedo, bugs que só apareceriam em produção, tipo aquele == que compara tipos diferentes sem avisar."
                    },
                    {
                        "type": "quote",
                        "value": "O linter não sabe se o seu código faz a coisa certa. Ele sabe que um monte de jeito de fazer errado deixa pista no próprio código, antes de qualquer teste rodar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Rodando `npx eslint .` no projeto, o terminal aponta um erro na regra `eqeqeq`. O que essa regra está cobrando?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Trocar uma comparação `==` por `===`, evitando coerção de tipo implícita.",
                                "isCorrect": true
                            },
                            {
                                "text": "Trocar uma variável `var` por `let` ou `const` no trecho apontado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Adicionar um `await` que ficou faltando antes de uma chamada assíncrona.",
                                "isCorrect": false
                            },
                            {
                                "text": "Remover uma variável que foi declarada e nunca foi usada no arquivo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é o objetivo principal de um linter como o ESLint?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Analisar o código sem executar ele, apontando padrões arriscados ou problemáticos.",
                                "isCorrect": true
                            },
                            {
                                "text": "Executar os testes automatizados do projeto e informar quais passaram ou falharam.",
                                "isCorrect": false
                            },
                            {
                                "text": "Compilar o código TypeScript e checar se os tipos declarados batem entre si.",
                                "isCorrect": false
                            },
                            {
                                "text": "Formatar o código automaticamente, ajustando aspas, espaços e indentação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time decide versionar o arquivo `eslint.config.js` no repositório em vez de deixar cada dev configurar o próprio editor sozinho. Qual é a principal razão prática?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Garante que todo mundo do time roda exatamente as mesmas regras sobre o mesmo código.",
                                "isCorrect": true
                            },
                            {
                                "text": "Garante que o código vai rodar mais rápido em produção, sem quase nenhuma diferença.",
                                "isCorrect": false
                            },
                            {
                                "text": "Garante que os testes de integração vão poder rodar sem precisar de banco de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Garante que o TypeScript vai aceitar qualquer tipo `any` sem apontar erro nenhum.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de rodar `npx eslint . --fix`, ainda sobra um erro de `no-unused-vars` num dos arquivos. Por que o `--fix` não resolveu esse caso sozinho?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Corrigir sozinho exigiria decidir se a variável deve ser removida ou usada de verdade.",
                                "isCorrect": true
                            },
                            {
                                "text": "O `--fix` só se aplica a regras de formatação, nunca a regras sobre variáveis.",
                                "isCorrect": false
                            },
                            {
                                "text": "Esse erro só desaparece depois que os testes do arquivo passarem a rodar verdes.",
                                "isCorrect": false
                            },
                            {
                                "text": "É preciso adicionar a flag `--force` junto de `--fix` pra aplicar em variáveis não usadas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um projeto Node.js (sem TypeScript) usa só ESLint com as regras recomendadas. Um dev esquece um `await` antes de chamar `salvarNoBanco()`, uma função assíncrona. Por que essa falha específica tende a passar batido pelo ESLint puro?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Sem informação de tipo, o ESLint não consegue saber se aquela chamada devolve uma Promise.",
                                "isCorrect": true
                            },
                            {
                                "text": "A regra `eqeqeq` cobre chamadas assíncronas, mas só quando o projeto usa `async/await` puro.",
                                "isCorrect": false
                            },
                            {
                                "text": "O ESLint ignora por padrão qualquer código dentro de uma função declarada como `async`.",
                                "isCorrect": false
                            },
                            {
                                "text": "Faltou instalar o plugin `eslint-plugin-vitest` pra habilitar checagem de código assíncrono.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Formatador (Prettier) e a diferença pro linter",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Prettier: fim da discussão de estilo\n\nNa aula passada, o ESLint separou os problemas de comportamento (o == que compara tipos diferentes, a variável esquecida) do resto. Mas sobrou uma categoria inteira que o ESLint nem tenta resolver sozinho: aspas simples ou duplas? Vírgula depois do último item de um array? Quantos espaços de indentação? Onde quebrar uma linha grande?\n\nNenhuma dessas escolhas muda o comportamento do código. E é exatamente por isso que elas rendem as discussões mais longas (e mais inúteis) de code review. O Prettier existe pra acabar com essa conversa: ele formata o código automaticamente, sempre do mesmo jeito, sem perguntar sua opinião."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\",\"ESLint (linter)\",\"Prettier (formatter)\"],[\"O que resolve\",\"Problema real: bug potencial, código morto, padrão perigoso\",\"Estilo visual: aspas, espaçamento, quebra de linha\"],[\"Exemplo de regra\",\"eqeqeq, no-unused-vars, no-fallthrough\",\"aspas duplas, 2 espaços, vírgula final\"],[\"Corrige sozinho\",\"Só o que é seguro corrigir (--fix)\",\"Sempre, é o trabalho inteiro dele\"],[\"Se ignorar o aviso\",\"Pode virar bug em produção\",\"Só fica inconsistente com o resto do time\"],[\"Roda em\",\"Editor, terminal, pre-commit, CI\",\"Editor, terminal, pre-commit, CI\"]]"
                    },
                    {
                        "type": "code",
                        "value": "// antes do prettier\nconst usuario = {nome:'Ana',   idade: 30,\n    ativo:true}\n\nfunction saudacao(nome) {\nreturn \"Olá, \" + nome + '!'\n}\n\n// depois de: npx prettier --write arquivo.js\n\nconst usuario = { nome: \"Ana\", idade: 30, ativo: true };\n\nfunction saudacao(nome) {\n  return \"Olá, \" + nome + \"!\";\n}"
                    },
                    {
                        "type": "code",
                        "value": "// .prettierrc\n{\n  \"semi\": true,\n  \"singleQuote\": false,\n  \"trailingComma\": \"all\",\n  \"tabWidth\": 2,\n  \"printWidth\": 100\n}"
                    },
                    {
                        "type": "text",
                        "value": "## ESLint e Prettier na mesma casa\n\nRodar os dois juntos pode gerar conflito: uma regra de estilo do ESLint (tipo `quotes` ou `indent`) discordando do que o Prettier decide. A solução não é fazer os dois brigarem, é tirar do ESLint a responsabilidade de estilo e deixar isso só com o Prettier. O pacote `eslint-config-prettier` desliga, no ESLint, todas as regras que tratam de formatação, sobrando só as regras que pegam problema de verdade.\n\nNo code review, isso muda a conversa. Ninguém mais comenta \"troca essa aspa\" ou \"falta vírgula aqui\", porque o Prettier já rodou antes do PR existir. Sobra tempo pra revisar o que importa: a lógica está certa, o teste cobre o caso de borda, o nome da função diz o que ela faz (assunto da aula 4)."
                    },
                    {
                        "type": "code",
                        "value": "# formata tudo e sobrescreve os arquivos\nnpx prettier --write .\n\n# só verifica, sem alterar (usado no CI: falha se algo não está formatado)\nnpx prettier --check .\n\n# scripts no package.json\n# \"scripts\": {\n#   \"format\": \"prettier --write .\",\n#   \"format:check\": \"prettier --check .\"\n# }\nnpm run format:check"
                    },
                    {
                        "type": "quote",
                        "value": "Estilo de código não é sobre gosto pessoal, é sobre não gastar energia de time discutindo o que uma ferramenta resolve em menos de um segundo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a diferença principal entre o que o ESLint faz e o que o Prettier faz?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "ESLint aponta problema no código, Prettier só ajusta a formatação visual dele.",
                                "isCorrect": true
                            },
                            {
                                "text": "ESLint ajusta a formatação visual, Prettier aponta problema de comportamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "ESLint roda no CI, Prettier só funciona rodando manualmente dentro do editor.",
                                "isCorrect": false
                            },
                            {
                                "text": "ESLint testa o comportamento do código, Prettier testa se os tipos estão certos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que o comando `npx prettier --check .` faz, diferente de `npx prettier --write .`?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Só informa se algum arquivo está fora do padrão, sem alterar nada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Corrige os arquivos fora do padrão, mas sem sobrescrever o original.",
                                "isCorrect": false
                            },
                            {
                                "text": "Roda apenas nos arquivos que foram alterados no último commit.",
                                "isCorrect": false
                            },
                            {
                                "text": "Verifica se os testes continuam passando depois da formatação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de configurar o Prettier, o time começa a brigar porque uma regra do ESLint (`quotes`) diverge da formatação que o Prettier aplica. Qual é a solução recomendada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Usar o `eslint-config-prettier` pra desligar, no ESLint, as regras de estilo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Desinstalar o Prettier e deixar toda a formatação só por conta do ESLint.",
                                "isCorrect": false
                            },
                            {
                                "text": "Configurar o `.prettierrc` pra copiar exatamente as regras do ESLint.",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar o ESLint antes do Prettier sempre, nunca o contrário, pra evitar conflito.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um PR abre com o comentário de review \"troca aspa simples por aspa dupla nessa linha\". Com Prettier e `--check` já rodando no CI, o que deveria ter acontecido antes desse comentário existir?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O CI já deveria ter barrado o PR por formatação, antes de qualquer humano revisar.",
                                "isCorrect": true
                            },
                            {
                                "text": "O revisor deveria ter aberto uma exceção, já que aspas não afetam o comportamento.",
                                "isCorrect": false
                            },
                            {
                                "text": "O time deveria ter configurado o ESLint pra ignorar esse tipo de comentário.",
                                "isCorrect": false
                            },
                            {
                                "text": "O autor do PR deveria ter pedido pro Prettier ignorar esse arquivo específico.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um projeto tem `prettier --check .` passando no CI, mas dois devs ainda reclamam de diffs enormes de formatação toda vez que um mexe no código do outro. O que mais provavelmente está errado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Os dois usam versões diferentes do Prettier (ou config diferente), gerando saída distinta.",
                                "isCorrect": true
                            },
                            {
                                "text": "O `--check` do CI não é suficiente, era preciso trocar para o comando `--write` no pipeline.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Prettier não deveria rodar em conjunto com o ESLint dentro do mesmo repositório.",
                                "isCorrect": false
                            },
                            {
                                "text": "Falta configurar o `tsconfig.json` do projeto pra alinhar a formatação entre os dois.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O TypeScript como teste",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Tipos são uma forma de teste\n\nUm teste unitário prova que, pra uma entrada específica, a função devolve o resultado certo. Um sistema de tipos prova outra coisa: que pra toda entrada daquele formato, uma classe inteira de erro não acontece. Passar uma string onde a função espera um number. Acessar pedido.desconto num objeto que nunca teve esse campo. Chamar uma função com um argumento a menos.\n\nSão exatamente os erros mais bobos e mais comuns em JavaScript puro, porque nada barra eles até o código rodar (e às vezes nem quando roda, se o caminho específico não for exercitado por nenhum teste). O TypeScript pega isso antes da primeira linha ser executada, com o compilador lendo o código estaticamente, do jeito que o ESLint lê, só que entendendo a forma dos dados."
                    },
                    {
                        "type": "code",
                        "value": "// pedido.ts\ninterface Pedido {\n  id: string;\n  subtotal: number;\n  cupom?: string;\n}\n\nfunction calcularTotal(pedido: Pedido): number {\n  const taxa = 0.1;\n  return pedido.subtotal + pedido.subtotal * taxa;\n}\n\ncalcularTotal({ id: \"1\", subtotal: \"150\" });\n// error TS2322: Type 'string' is not assignable to type 'number'.\n\ncalcularTotal({ id: \"1\", subtotal: 150, desconto: 20 });\n// error TS2353: Object literal may only specify known properties,\n// and 'desconto' does not exist in type 'Pedido'."
                    },
                    {
                        "type": "text",
                        "value": "## tsc --noEmit como teste no pipeline\n\nO comando tsc normalmente compila TypeScript pra JavaScript. Com a flag --noEmit, ele faz só a parte que interessa aqui: verifica os tipos do projeto inteiro e não gera nenhum arquivo de saída. O resultado é binário, exit code 0 se não achou erro de tipo, diferente de 0 se achou, do mesmo jeito que npx vitest run volta verde ou vermelho.\n\nQuem liga isso tudo é a opção strict no tsconfig.json. Ela ativa, entre outras, noImplicitAny (proíbe uma variável sem tipo definido nem inferido, que hoje vira só any e o compilador para de checar) e strictNullChecks (null e undefined passam a ser erro de tipo quando não esperados, em vez de estourar em produção). Sem strict, o TypeScript deixa passar boa parte dos erros que ele existe pra pegar."
                    },
                    {
                        "type": "code",
                        "value": "// tsconfig.json\n{\n  \"compilerOptions\": {\n    \"strict\": true,\n    \"target\": \"ES2022\",\n    \"module\": \"NodeNext\",\n    \"noEmit\": true\n  },\n  \"include\": [\"src/**/*.ts\"]\n}\n\n$ npx tsc --noEmit\n\nsrc/pedido.ts:12:24 - error TS2322: Type 'string' is not assignable to type 'number'.\n\nFound 1 error."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Situação\",\"Teste unitário pega?\",\"Tipo (TypeScript) pega?\"],[\"Passar string onde é number\",\"Só se existir um teste pra esse caso\",\"Sempre, em todo lugar que chamar a função\"],[\"Campo que não existe no objeto\",\"Só se o teste checar esse campo\",\"Sempre, na hora de escrever o código\"],[\"Cálculo de desconto errado\",\"Sim, se o teste cobrir esse cenário\",\"Não, o tipo number está correto do mesmo jeito\"],[\"Esquecer um caso de borda da regra\",\"Sim, se alguém pensou nesse caso ao escrever o teste\",\"Não, isso é comportamento, não formato de dado\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Tipo não substitui teste\n\nOs tipos são fortes exatamente onde os testes são fracos: cobrem todo lugar que usa aquele dado, de uma vez, sem precisar que alguém escreva um caso pra cada chamada. Mas eles não sabem nada sobre a regra de negócio. Uma função calcularTotal(pedido: Pedido): number que devolve o total errado continua compilando sem erro nenhum, porque devolveu um number, só que o number errado.\n\nPor isso os dois ficam no pipeline, não um no lugar do outro: o tipo prova que a forma dos dados está certa em todo o código, o teste prova que o comportamento está certo nos casos que importam."
                    },
                    {
                        "type": "quote",
                        "value": "Um teste prova que uma entrada específica funciona. Um tipo prova que uma classe inteira de erro nunca vai acontecer, em nenhuma chamada, em lugar nenhum do código."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual erro o TypeScript pega antes mesmo do código rodar?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Passar um valor do tipo errado pra uma função que espera outro tipo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma função que devolve o cálculo de desconto errado pro cliente final.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um teste que ficou passando mesmo cobrindo pouco do comportamento real.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma query no banco que demora mais do que o esperado pra responder.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que o comando `tsc --noEmit` faz?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Verifica os tipos do projeto inteiro e não gera nenhum arquivo JavaScript de saída.",
                                "isCorrect": true
                            },
                            {
                                "text": "Compila o projeto TypeScript inteiro e gera os arquivos JavaScript de produção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Roda os testes automatizados do projeto sem gerar relatório de cobertura.",
                                "isCorrect": false
                            },
                            {
                                "text": "Formata os arquivos `.ts` do projeto de acordo com as regras do `tsconfig.json`.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma interface `Pedido` tem só os campos `id` e `subtotal`. Ao criar um objeto literal `{ id: '1', subtotal: 10, desconto: 5 }` passado direto pra uma função que espera `Pedido`, o TypeScript acusa erro. Por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Objeto literal passado direto é checado contra propriedades que a interface não declara.",
                                "isCorrect": true
                            },
                            {
                                "text": "O campo `desconto` deveria ter sido declarado como `string`, não como `number`, na chamada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Interfaces do TypeScript aceitam no máximo dois campos por padrão, sem configuração extra.",
                                "isCorrect": false
                            },
                            {
                                "text": "A função só aceita objetos criados com `new Pedido()`, nunca um objeto literal direto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um projeto ativa `strict: true` no `tsconfig.json`. Uma variável que antes não tinha tipo nenhum declarado passa a dar erro de compilação. Qual opção dentro do `strict` provavelmente causou isso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "`noImplicitAny`, que proíbe uma variável ficar sem tipo definido nem inferido.",
                                "isCorrect": true
                            },
                            {
                                "text": "`strictNullChecks`, que proíbe uma variável aceitar `null` ou `undefined`.",
                                "isCorrect": false
                            },
                            {
                                "text": "`noEmit`, que impede o compilador de gerar arquivo de saída no projeto.",
                                "isCorrect": false
                            },
                            {
                                "text": "`esModuleInterop`, que ajusta como os `imports` de módulos são resolvidos.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A função `calcularTotal(pedido: Pedido): number` está com o tipo certinho e o `tsc --noEmit` passa sem erro. Mesmo assim, ela devolve o total errado pra pedidos com cupom aplicado. Por que o TypeScript não pegou esse problema?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Tipo garante a forma do dado, não garante que a lógica de cálculo implementada está certa.",
                                "isCorrect": true
                            },
                            {
                                "text": "O `strict` mode provavelmente estava desligado quando esse trecho foi escrito e testado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Faltou declarar o campo `cupom` como obrigatório na interface `Pedido` do projeto.",
                                "isCorrect": false
                            },
                            {
                                "text": "O erro só existe porque a função não foi escrita como `async`, mesmo lidando com desconto.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Revisão de código",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## O que a máquina não vê\n\nLinter, formatter e checagem de tipo rodam em segundos e pegam uma quantidade enorme de problema, sem cansar, sem ficar de mau humor, sem deixar passar por estar com pressa. Mas nenhuma dessas ferramentas sabe se o código faz a coisa certa. Elas não sabem se a regra de negócio implementada é a regra combinada, se o nome da função engana quem lê, se falta tratar o caso em que o carrinho está vazio, ou se aquele endpoint novo esqueceu de passar pelo mesmo middleware de autenticação que protege os outros.\n\nIsso quem pega é outra pessoa lendo o código antes dele entrar na branch principal. É a última camada de qualidade da trilha, e é a única que não roda com npx."
                    },
                    {
                        "type": "table",
                        "value": "[[\"O que olhar\",\"Pergunta pra fazer\"],[\"Corretude\",\"O código faz o que o PR diz que faz, no caminho feliz e nos outros?\"],[\"Testes\",\"Os testes cobrem o comportamento novo, ou só passam porque testam pouco?\"],[\"Legibilidade\",\"Alguém sem contexto nenhum entende essa função só de ler?\"],[\"Casos de borda\",\"Lista vazia, campo nulo, erro de rede: o que acontece?\"],[\"Segurança\",\"Esse endpoint novo passa pelo mesmo middleware de auth dos outros?\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Como dar um feedback que ajuda\n\nComentário de review vira ruído quando é vago (\"não gostei\") ou quando soa como ordem sem explicação. Um comentário bom diz o quê, por quê, e dá espaço pra quem escreveu discordar com argumento:\n\n- Separe bloqueante de sugestão. \"Isso quebra se pedido.itens vier vazio, precisa tratar\" é diferente de \"nit: eu tiraria essa variável intermediária, mas não é bloqueante\".\n- Pergunte em vez de mandar. \"Por que validar o CPF aqui em vez de no middleware?\" abre conversa, \"muda isso pra cá\" fecha.\n- Comente o código, não a pessoa. \"Essa função ficou fazendo duas coisas\" em vez de \"você não separou as responsabilidades\".\n- Aprove com comentários quando nada for bloqueante. Travar um PR bom por causa de nomenclatura atrasa o time sem ganho real."
                    },
                    {
                        "type": "code",
                        "value": "// PR #482: adiciona rota de cancelamento de pedido\n\n  router.post('/pedidos/:id/cancelar', async (req, res) => {\n+   const pedido = await db.pedidos.findById(req.params.id);\n+   pedido.status = 'cancelado';\n+   await db.pedidos.save(pedido);\n+   res.json(pedido);\n  });\n\n// comentários da revisão:\n\n// [bloqueante] Falta o authMiddleware nessa rota, todas as outras\n// de /pedidos passam por ele antes do handler.\n\n// [bloqueante] E se pedido vier undefined (id que não existe)?\n// Hoje isso derruba o processo com um erro não tratado.\n\n// [sugestão, não bloqueante] dá pra extrair a troca de status\n// pra um método pedido.cancelar() e reaproveitar isso em outro lugar depois."
                    },
                    {
                        "type": "text",
                        "value": "## PR pequeno revisa melhor\n\nA qualidade de uma revisão despenca depois de poucas centenas de linhas de diff. Ninguém segura atenção em oitocentas linhas mudadas: o revisor cansa, começa a passar o olho, e o \"aprovado\" vira formalidade em vez de revisão de verdade. PRs pequenos (uma rota, uma função, uma migration) mantêm o revisor de fato lendo, e ainda trazem outros ganhos: revisão sai mais rápido, o merge não fica represado, e se algo quebrar em produção, reverter um PR pequeno é trivial, reverter um PR gigante que mexeu em dez arquivos é um problema à parte.\n\nLint, formatação e tipo já garantiram que o PR pequeno não tem erro bobo. Sobra pro revisor humano o que só humano pega: era essa mesmo a solução certa pro problema?"
                    },
                    {
                        "type": "quote",
                        "value": "O linter pega o erro de sintaxe, o tipo pega o erro de forma, o teste pega o erro de comportamento. O review pega a pergunta que nenhuma ferramenta sabe fazer: era isso mesmo que devia ser construído?"
                    }
                ],
                "questions": [
                    {
                        "statement": "Segundo a aula, qual dessas é uma preocupação tipicamente do code review, e não do lint, formatter ou type-check?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Se o nome da função comunica direito o que ela realmente faz.",
                                "isCorrect": true
                            },
                            {
                                "text": "Se existe alguma variável declarada no arquivo e nunca usada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Se a indentação do arquivo segue o padrão combinado pelo time.",
                                "isCorrect": false
                            },
                            {
                                "text": "Se um valor do tipo errado foi passado pra dentro de uma função.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um review comenta apenas \"não gostei dessa parte\", sem mais detalhes. Qual é o principal problema desse comentário?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Não diz o quê está errado nem por quê, então quem escreveu não sabe o que mudar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Comentário de review deveria vir sempre por mensagem direta, nunca dentro do PR.",
                                "isCorrect": false
                            },
                            {
                                "text": "Esse tipo de comentário só é válido quando vem de quem é dono do repositório.",
                                "isCorrect": false
                            },
                            {
                                "text": "Falta rodar o linter antes de comentar qualquer coisa sobre o código do PR.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Durante um review, o revisor escreve: \"[bloqueante] essa rota não passa pelo authMiddleware que as outras de /pedidos usam.\" Que tipo de problema esse comentário está pegando?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um problema de segurança que ferramenta automática nenhuma detectaria sozinha.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um problema de formatação que o Prettier deveria ter corrigido antes do PR abrir.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um problema de tipo que o `tsc --noEmit` deveria ter apontado durante o CI.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um problema de cobertura de teste que o relatório do Vitest já deveria mostrar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que PRs pequenos tendem a receber revisão de melhor qualidade do que PRs enormes?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A atenção do revisor cai depois de muitas linhas, e o \"aprovado\" vira formalidade.",
                                "isCorrect": true
                            },
                            {
                                "text": "PRs pequenos são os únicos que conseguem passar pelo pipeline de CI configurado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ferramentas como ESLint e Prettier só analisam PRs abaixo de um certo tamanho.",
                                "isCorrect": false
                            },
                            {
                                "text": "PRs grandes não podem ser revertidos caso algum problema apareça em produção.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dois PRs chegam pro mesmo revisor: um de 15 linhas mudando a regra de desconto, outro de 900 linhas misturando refatoração, rota nova e ajuste de dependência. Só dá tempo de revisar um com atenção hoje. Qual é o argumento mais forte pra revisar o pequeno primeiro?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Diff pequeno e focado permite revisão de verdade, o grande tende a virar aprovação rasa.",
                                "isCorrect": true
                            },
                            {
                                "text": "PR pequeno nunca precisa de teste novo, então a revisão é sempre mais rápida de concluir.",
                                "isCorrect": false
                            },
                            {
                                "text": "PR grande automaticamente reprova no CI por ultrapassar o limite de linhas do pipeline.",
                                "isCorrect": false
                            },
                            {
                                "text": "Revisor só pode aprovar um PR por dia, então o menor libera o merge mais cedo sempre.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O fluxo de qualidade completo e o próximo passo (Docker)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "## Tudo junto: o fluxo de qualidade\n\nCada peça desse módulo resolve um problema diferente: o ESLint pega código arriscado, o Prettier resolve estilo, o TypeScript prova a forma dos dados, o teste prova o comportamento, e o code review pega o que sobra pra um humano decidir. Sozinha, cada camada segura uma fatia do problema. Juntas, formam um fluxo com quatro momentos:\n\n- No editor: lint e formatação rodando ao salvar, feedback imediato.\n- No pre-commit: um gate rápido, local, antes do código sair da sua máquina.\n- No CI: a mesma bateria (lint, formatação, tipo, teste) rodando de novo, sem depender de ninguém ter lembrado de rodar local.\n- No code review: a camada humana, depois que a máquina já aprovou o básico.\n\nNenhuma camada substitui a outra. O pre-commit não roda a suíte de integração inteira (seria lento demais pra cada commit), o CI não lê se o nome da função faz sentido, e o review não vai reler as duzentas asserções de teste que já rodaram verde."
                    },
                    {
                        "type": "code",
                        "value": "// package.json\n{\n  \"scripts\": {\n    \"lint\": \"eslint .\",\n    \"format:check\": \"prettier --check .\",\n    \"typecheck\": \"tsc --noEmit\",\n    \"test\": \"vitest run\",\n    \"test:coverage\": \"vitest run --coverage\",\n    \"verify\": \"npm run lint && npm run format:check && npm run typecheck && npm run test\"\n  }\n}\n\n$ npm run verify\n\n> lint\nsem problemas\n\n> format:check\ntodos os arquivos formatados\n\n> typecheck\nsem erro de tipo\n\n> test\n47 passed (47)"
                    },
                    {
                        "type": "code",
                        "value": "// package.json (trecho)\n{\n  \"lint-staged\": {\n    \"*.{js,ts}\": [\"eslint --fix\", \"prettier --write\"]\n  }\n}\n\n// .husky/pre-commit\nnpx lint-staged\n\n$ git commit -m \"feat: cancelamento de pedido\"\nRodando lint-staged...\neslint --fix em 3 arquivo(s)\nprettier --write em 3 arquivo(s)\n[feature/cancelar-pedido a1b2c3d] feat: cancelamento de pedido"
                    },
                    {
                        "type": "code",
                        "value": "# .github/workflows/ci.yml\nname: CI\n\non:\n  pull_request:\n    branches: [main]\n\njobs:\n  verify:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n      - run: npm ci\n      - run: npm run lint\n      - run: npm run format:check\n      - run: npm run typecheck\n      - run: npm run test:coverage"
                    },
                    {
                        "type": "text",
                        "value": "## Fechando a trilha\n\nSete módulos atrás, a pergunta era simples: como ter confiança pra mudar código que já funciona? A resposta virou uma trilha inteira:\n\n- Por que testar: teste automatizado é confiança pra mudar e documentação viva, não burocracia.\n- Primeiro teste unitário: describe, it, expect, o padrão AAA, rodando com Vitest.\n- Mocks e dublês: isolar a unidade do banco, da API externa, do tempo, sem exagerar e mockar até a própria lógica que devia estar sendo testada.\n- Testes de integração: rota, service e banco juntos, testados de verdade com supertest e um banco efêmero.\n- TDD e código testável: red, green, refactor, e por que injeção de dependência e função pura tornam tudo mais fácil de testar.\n- Cobertura, e2e e flaky tests: número de cobertura como bússola (não meta), o topo da pirâmide, e como não deixar o CI instável.\n- Qualidade além do teste: lint, formatação, tipo e review, a rede de segurança que cuida do que o teste não cobre.\n\nCada módulo resolveu uma lacuna que o anterior deixava aberta. Não existe uma ferramenta única que garante qualidade, existe esse conjunto todo rodando junto."
                    },
                    {
                        "type": "text",
                        "value": "## O próximo estágio: Docker & containers\n\nSeu código agora está testado, coberto, tipado, formatado e revisado. Mas ele ainda depende de rodar numa máquina com a versão certa do Node, as variáveis de ambiente certas, o Postgres certo na porta certa. \"Na minha máquina funciona\" é o problema que sobra depois que todo o resto desse módulo já foi resolvido.\n\nO próximo estágio do roadmap de Back-end é Docker & containers: empacotar a aplicação (código, dependências, runtime) numa imagem que roda exatamente igual na sua máquina, na do colega, no CI que acabou de rodar npm run verify, e no servidor de produção. É o passo que fecha o ciclo entre \"código testado e aprovado\" e \"código rodando de verdade\", em qualquer lugar."
                    },
                    {
                        "type": "quote",
                        "value": "Teste prova que o código funciona. Lint, tipo e review provam que ele é confiável de mexer de novo amanhã. Container garante que, funcionando aqui, funciona em qualquer lugar. É pra lá que essa trilha te leva agora."
                    }
                ],
                "questions": [
                    {
                        "statement": "No fluxo de qualidade da aula, o que roda tipicamente no pre-commit, antes do código sair da máquina do dev?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um gate rápido e local, tipo lint e formatação nos arquivos alterados.",
                                "isCorrect": true
                            },
                            {
                                "text": "A suíte inteira de testes de integração, incluindo o banco de dados efêmero.",
                                "isCorrect": false
                            },
                            {
                                "text": "O deploy automático da aplicação pro ambiente de produção da empresa.",
                                "isCorrect": false
                            },
                            {
                                "text": "A revisão de código feita por outro humano do time antes do merge.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual ferramenta, das citadas na trilha, é usada pra empacotar a aplicação e fazer ela rodar do mesmo jeito em qualquer máquina, sendo o próximo passo depois dessa trilha?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Docker",
                                "isCorrect": true
                            },
                            {
                                "text": "Vitest",
                                "isCorrect": false
                            },
                            {
                                "text": "ESLint",
                                "isCorrect": false
                            },
                            {
                                "text": "Prettier",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O CI do projeto roda, nessa ordem: `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm run test:coverage`. Um PR falha no segundo passo. O que precisa ser corrigido?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Existe arquivo fora do padrão, é só rodar `prettier --write` e commitar de novo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Existe erro de tipo que o `tsc` encontrou num arquivo alterado nesse PR específico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Existe algum teste que quebrou depois da última mudança feita nesse pull request.",
                                "isCorrect": false
                            },
                            {
                                "text": "Existe uma variável declarada e nunca usada em algum arquivo alterado no PR.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de configurar husky + lint-staged, um `git commit` roda automaticamente `eslint --fix` e `prettier --write`, mas só nos arquivos staged, não no projeto inteiro. Qual é a vantagem prática disso, comparado a rodar em tudo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O commit continua rápido, porque só o que realmente vai ser commitado é processado.",
                                "isCorrect": true
                            },
                            {
                                "text": "O ESLint só sabe corrigir arquivos que já foram commitados alguma vez antes.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Prettier não consegue formatar arquivos que ainda não existem no repositório remoto.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Git bloqueia qualquer hook que tente alterar arquivos fora da área de stage.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A trilha termina dizendo que o próximo estágio do roadmap é Docker & containers. Qual problema específico, que sobra mesmo depois de lint, formatação, tipo, teste e review, o Docker resolve?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "A aplicação depender da versão certa de linguagem e dependências de cada máquina.",
                                "isCorrect": true
                            },
                            {
                                "text": "A falta de testes automatizados cobrindo os principais fluxos de negócio da aplicação.",
                                "isCorrect": false
                            },
                            {
                                "text": "A ausência de um linter configurado corretamente no ambiente de produção da empresa.",
                                "isCorrect": false
                            },
                            {
                                "text": "A dificuldade de revisar código quando o time inteiro trabalha de forma remota.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    }
];

async function seed() {
    let [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        [trilha] = await db
            .insert(trails)
            .values({ name: NOME, trailLevel: LEVEL, description: DESCRICAO })
            .returning();
        console.log("Trilha criada: " + trilha.name);
    }

    const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
    if (existentes.length > 0) {
        console.log("Trilha " + NOME + " ja tem " + existentes.length + " aulas. Nada a fazer.");
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
    console.log("Seed concluido: " + MODULOS.length + " modulos, " + totalAulas + " aulas, " + totalQuestoes + " questoes.");
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
