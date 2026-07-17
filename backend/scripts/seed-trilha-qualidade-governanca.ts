// Seed da trilha Qualidade e Governanca de Dados (roadmap de Engenharia de Dados, capstone).
// Idempotente e nao destrutivo: se a trilha ja tiver aulas, nao faz nada.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-qualidade-governanca.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";

const NOME = "Qualidade e Governança de Dados";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "avancado";
const DESCRICAO =
    "Trilha final do roadmap de Engenharia de Dados: tornar uma plataforma de dados confiavel, governada e sustentavel. As dimensoes de qualidade de dados, testar e validar dados, observabilidade de dados (freshness, volume, schema, distribuicao, lineage), data lineage e catalogo, governanca (ownership, stewardship, classificacao), privacidade e a LGPD (anonimizacao, mascaramento, direitos do titular), e o controle de acesso e o custo (FinOps de dados). O capstone, com foco em decisoes e cenarios.";

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
        "titulo": "Módulo 1 - Qualidade de dados: as dimensões",
        "aulas": [
            {
                "titulo": "Por que qualidade de dados importa",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Por que qualidade de dados importa\n\nAté aqui, o foco do roadmap foi fazer o dado se mover: extrair, transformar, carregar, orquestrar, processar em escala, servir em um lakehouse ou em tempo real. Mas um pipeline que roda sem erro todo dia não é garantia de nada além de que ele roda sem erro. Ele pode estar movendo, com perfeita confiabilidade técnica, um dado que está simplesmente errado.\n\nQualidade de dados é a disciplina que fecha essa lacuna: garantir que o dado que chega ao consumidor final (um dashboard, um modelo de machine learning, uma decisão de negócio) reflete a realidade que ele deveria representar."
                    },
                    {
                        "type": "text",
                        "value": "## Garbage in, garbage out\n\nO princípio é antigo e não é exclusivo de dados: se a entrada de um processo é ruim, a saída também será, não importa quão bem construído seja o processo no meio do caminho. Um pipeline com orquestração impecável, testado, versionado e monitorado ainda assim entrega lixo se o dado que entra nele já está errado.\n\nA diferença entre um pipeline ingênuo e um pipeline maduro não está só na engenharia de movimentação de dados: está na capacidade de detectar, antes de entregar, que algo na entrada (ou em alguma transformação no meio do caminho) fugiu do esperado."
                    },
                    {
                        "type": "quote",
                        "value": "Um pipeline pode estar 100% no ar e 100% errado ao mesmo tempo: disponibilidade e corretude são propriedades diferentes, e só a segunda garante que o dado é confiável."
                    },
                    {
                        "type": "text",
                        "value": "## O custo do dado ruim\n\nDado ruim não é um problema abstrato, tem custo concreto em três frentes:\n\n- **Decisão errada**: um gestor corta o orçamento de uma campanha porque o dashboard mostra queda de conversão, quando na verdade um evento de tracking parou de disparar. A decisão de negócio herda o erro do dado.\n- **Retrabalho**: quando o erro é descoberto, alguém precisa investigar a causa raiz, corrigir a fonte, reprocessar o histórico afetado e, muitas vezes, refazer análises que já tinham sido entregues.\n- **Perda de confiança**: depois de ser pega de surpresa algumas vezes, a área de negócio para de confiar no dashboard e volta a pedir números por planilha, direto de quem opera o sistema. Reconquistar essa confiança demora muito mais do que perdê-la."
                    },
                    {
                        "type": "code",
                        "value": "Cadastro (CPF sem validação)\n        |\n        v\n[origem] tabela clientes: 3% dos CPFs inválidos\n        |\n        v  (ingestão copia o dado como está)\n[bronze] clientes_raw: os mesmos 3% inválidos\n        |\n        v  (join usa CPF como chave)\n[silver] pedidos_clientes: registros com CPF inválido\n         não casam no join e somem da tabela\n        |\n        v  (agregação soma por cliente)\n[gold]  receita_por_cliente: total subestimado,\n         sem qualquer erro ou alerta visível\n        |\n        v\n[consumo] dashboard de receita: número errado,\n           reportado como se fosse definitivo"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Onde o erro é percebido\",\"Custo típico de corrigir\",\"Exemplo\"],[\"Na origem, antes de entrar no pipeline\",\"Baixo: um cadastro é corrigido na hora\",\"Validação de CPF barra o registro no formulário\"],[\"Na ingestão ou na camada bruta\",\"Moderado: exige ajustar a fonte e reingerir\",\"Teste de schema barra a carga e aponta a tabela de origem\"],[\"Em uma tabela de mart, já usada por relatórios\",\"Alto: exige reprocessar o histórico e avisar consumidores\",\"Métrica errada fica exposta por dias até alguém desconfiar\"],[\"Depois de uma decisão de negócio tomada sobre o número\",\"Altíssimo: a decisão já foi tomada e pode ser irreversível\",\"Orçamento cortado com base em uma métrica que estava errada\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Qualidade não é um luxo\n\nInvestir em qualidade de dados não é perseguir um pipeline perfeito, sem nenhum erro. Erros vão acontecer: uma fonte muda, um evento para de disparar, alguém digita um CPF errado. A diferença está em pegar esse erro o mais cedo possível, antes que ele se propague e vire uma decisão. As próximas aulas deste módulo tratam das dimensões que definem, de forma concreta, o que significa 'dado bom'."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um pipeline de dados roda todos os dias sem falhas, com orquestração monitorada e testada. Ainda assim, um dashboard de receita mostra números errados porque a tabela de origem tem um erro de digitação sistemático em um campo monetário. Esse cenário ilustra qual princípio?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Lei de Conway: a estrutura dos relatórios tende a copiar a estrutura organizacional de quem os constrói.",
                                "isCorrect": false
                            },
                            {
                                "text": "Garbage in, garbage out: um pipeline confiável não corrige um dado que já nasceu errado na origem.",
                                "isCorrect": true
                            },
                            {
                                "text": "Teorema CAP: um sistema distribuído não consegue manter consistência e disponibilidade ao mesmo tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Princípio DRY: repetir a mesma lógica de transformação em várias camadas aumenta a chance de erro.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma validação no formulário de cadastro passa a rejeitar CPFs inválidos antes de gravar qualquer registro. Comparando com descobrir o mesmo tipo de erro só depois que uma decisão de orçamento foi tomada com base nele, corrigir nesse ponto do fluxo tende a ser:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Mais caro, porque a validação no cadastro exige reprocessar todo o histórico de clientes já salvos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Equivalente, porque o custo de corrigir um erro independe do estágio em que ele é percebido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Mais arriscado, porque bloquear o cadastro na origem pode derrubar a disponibilidade do sistema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Mais barato, porque o erro é barrado antes de se propagar para outras tabelas e relatórios.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Depois de descobrir que um evento de tracking parou de disparar havia duas semanas, o time de dados precisa identificar a causa raiz, corrigir a instrumentação, reprocessar o histórico afetado e refazer análises já entregues à diretoria. Esse esforço extra é um exemplo direto de qual custo do dado ruim?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Retrabalho: tempo gasto corrigindo e refazendo algo que já deveria ter saído certo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Latência: o tempo entre o evento acontecer no sistema de origem e ele chegar ao data warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Downtime: o período em que o pipeline inteiro ficou parado, sem processar nenhum dado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Escopo: o aumento no volume de tabelas que o time de dados precisa manter no dia a dia.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de ser surpreendida por números errados em um dashboard duas vezes no mesmo trimestre, a área de negócio passa a pedir os números direto por planilha, ignorando o dashboard oficial da plataforma de dados. Isso ilustra principalmente qual consequência do dado ruim?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Perda de performance: o dashboard ficou lento demais para ser usado no dia a dia da área de negócio.",
                                "isCorrect": false
                            },
                            {
                                "text": "Perda de escopo: a plataforma de dados deixou de cobrir as métricas que a área de negócio precisa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Perda de confiança: uma vez queimada, a área de negócio volta a preferir uma fonte que ela controla.",
                                "isCorrect": true
                            },
                            {
                                "text": "Perda de acesso: a área de negócio não tem mais permissão para consultar o dashboard oficial.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe de dados tem tempo limitado neste trimestre e precisa escolher entre validar o formulário de cadastro na origem ou construir um dashboard de monitoramento sobre uma tabela de mart com histórico de erros. Considerando que o custo de corrigir um erro cresce a cada camada que ele atravessa, qual é a decisão mais defensável?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Priorizar o dashboard de monitoramento, pois ele detecta qualquer erro, independente de onde se origina.",
                                "isCorrect": false
                            },
                            {
                                "text": "Priorizar a validação na origem, pois barrar o erro cedo evita que ele se espalhe pelas camadas seguintes.",
                                "isCorrect": true
                            },
                            {
                                "text": "Dividir o tempo igualmente entre as duas frentes, pois origem e mart têm sempre o mesmo peso no custo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Adiar as duas frentes por este trimestre, pois validar a origem só faz sentido com o mart já estável.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Completude, unicidade e validade",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Completude, unicidade e validade\n\nA aula anterior mostrou por que qualidade de dados importa. Esta aula começa a responder a pergunta seguinte: o que, exatamente, significa um dado ser 'de qualidade'? A resposta não é uma nota única, é um conjunto de dimensões independentes, cada uma respondendo a uma pergunta diferente sobre o mesmo dado. As três primeiras: completude, unicidade e validade."
                    },
                    {
                        "type": "text",
                        "value": "## Completude: faltam valores?\n\nCompletude mede o quanto do dado esperado está de fato presente. Ela aparece em dois níveis:\n\n- **No campo**: uma coluna obrigatória (email, data de nascimento, valor do pedido) vem nula ou vazia em parte dos registros.\n- **No conjunto**: registros inteiros faltando, como um dia em que a carga deveria trazer milhares de pedidos e trouxe zero, sem nenhum erro visível no pipeline.\n\nO segundo caso é o mais perigoso: um pipeline que roda com sucesso técnico, mas silenciosamente traz menos dado do que deveria, é o tipo de falha que só um teste de volume (tema do módulo de observabilidade) costuma pegar."
                    },
                    {
                        "type": "text",
                        "value": "## Unicidade: há duplicatas?\n\nUnicidade mede se cada entidade do mundo real está representada uma única vez, na granularidade esperada. Duas causas comuns:\n\n- **Reprocessamento sem idempotência**: rodar a mesma carga duas vezes insere o mesmo pedido duplicado (a idempotência de tasks foi tema da trilha de Orquestração).\n- **Cadastro duplicado**: o mesmo cliente cria duas contas com emails diferentes, ou dois sistemas de origem enviam o mesmo evento por caminhos distintos.\n\nDuplicata nem sempre é visível: um `COUNT(*)` correto, sozinho, não garante unicidade, é preciso conferir se a chave que deveria ser única (um `id_pedido`, um `cpf`) realmente é."
                    },
                    {
                        "type": "text",
                        "value": "## Validade: está no formato ou domínio certo?\n\nValidade mede se o valor respeita o formato, o tipo e o domínio esperados, independente de refletir a realidade ou não (essa é a acurácia, tema da próxima aula). Exemplos:\n\n- **Formato**: um email sem `@`, um CPF com letras, uma data fora do padrão `AAAA-MM-DD`.\n- **Domínio**: um campo `status_pedido` que só deveria aceitar `pendente`, `pago` ou `cancelado`, mas recebe `pago ` com espaço, ou `PAGO`, em maiúsculo.\n- **Tipo**: um campo de valor monetário armazenado como texto, aceitando qualquer caractere em vez de um número.\n\nUm dado pode ser 100% válido (bem formatado, dentro do domínio certo) e ainda assim estar errado, se não corresponder ao fato real."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Dimensão\",\"Pergunta que ela responde\",\"Exemplo de violação\"],[\"Completude\",\"Falta algum valor esperado?\",\"Campo email vazio em 8% dos cadastros\"],[\"Unicidade\",\"A mesma entidade aparece mais de uma vez?\",\"Pedido inserido duas vezes por reprocessamento sem idempotência\"],[\"Validade\",\"O valor respeita formato, tipo e domínio?\",\"Campo status_pedido recebe o valor PAGO fora do domínio esperado\"]]"
                    },
                    {
                        "type": "code",
                        "value": "-- completude: proporção de nulos em um campo obrigatório\nSELECT\n  COUNT(*) FILTER (WHERE email IS NULL) * 1.0 / COUNT(*) AS taxa_nulos\nFROM clientes;\n\n-- unicidade: chave que deveria ser única, mas não é\nSELECT id_pedido, COUNT(*)\nFROM pedidos\nGROUP BY id_pedido\nHAVING COUNT(*) > 1;\n\n-- validade: domínio aceito para o status do pedido\nSELECT COUNT(*)\nFROM pedidos\nWHERE status_pedido NOT IN ('pendente', 'pago', 'cancelado');"
                    },
                    {
                        "type": "quote",
                        "value": "Um dado pode estar perfeitamente preenchido, único e no formato certo, e ainda assim estar errado. Validade garante a forma. Acurácia, tema da próxima aula, garante o conteúdo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma tabela de cadastros tem o campo email preenchido em 100% dos registros, mas em 12% deles o valor não contém o caractere @. Qual dimensão de qualidade de dados está sendo violada?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Completude, porque o campo email deveria estar vazio nesses registros e não está.",
                                "isCorrect": false
                            },
                            {
                                "text": "Unicidade, porque o mesmo endereço de email aparece associado a mais de um cliente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Consistência, porque o valor do campo diverge entre dois sistemas diferentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Validade, porque o valor está presente, mas não respeita o formato esperado de email.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline roda sem nenhum erro, mas a tabela de pedidos do dia recebeu zero registros, quando o volume diário normal é de milhares de linhas. Esse cenário é um problema de qual dimensão de qualidade?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Completude, porque faltam registros inteiros que deveriam ter sido carregados naquele dia.",
                                "isCorrect": true
                            },
                            {
                                "text": "Validade, porque os poucos registros carregados estão fora do formato esperado pela tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Unicidade, porque os registros daquele dia foram carregados mais de uma vez por engano.",
                                "isCorrect": false
                            },
                            {
                                "text": "Acurácia, porque os valores carregados não refletem o que aconteceu no sistema de origem.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de uma falha de rede, uma task de carga é reexecutada automaticamente e insere os mesmos 500 pedidos pela segunda vez, numa tabela sem nenhuma restrição de chave. O total de linhas bate com a soma das duas cargas, mas o número de pedidos distintos não. Que dimensão de qualidade foi comprometida?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Completude, porque parte dos pedidos originais deixou de ser carregada na segunda tentativa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Validade, porque os pedidos reinseridos não respeitam o formato esperado pela tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Unicidade, porque os mesmos pedidos passaram a existir duplicados na tabela de destino.",
                                "isCorrect": true
                            },
                            {
                                "text": "Atualidade, porque a segunda carga demorou mais tempo do que o esperado para terminar.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O campo status_pedido de uma tabela aceita qualquer texto, sem restrição no banco. Uma transformação com bug grava o valor emviado (com erro de digitação) em vez de enviado em 3% das linhas. Do ponto de vista das dimensões de qualidade de dados, esse valor é:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Incompleto, porque o campo ficou sem nenhum valor atribuído durante a transformação com bug.",
                                "isCorrect": false
                            },
                            {
                                "text": "Inválido, porque não pertence ao domínio de valores que o campo status_pedido deveria aceitar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Duplicado, porque o mesmo pedido passou a ter dois valores diferentes de status ao mesmo tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Desatualizado, porque o valor gravado não reflete o status mais recente do pedido na origem.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe quer criar testes automatizados que cubram, ao mesmo tempo, completude, unicidade e validade em uma tabela de pedidos. Qual abordagem cobre efetivamente as três dimensões?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Combinar testes de nulos, de chave única e de valores fora do domínio esperado, um teste por dimensão.",
                                "isCorrect": true
                            },
                            {
                                "text": "Combinar testes de latência, de custo de storage e de volume de linhas, um teste por dimensão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Combinar testes de schema, de particionamento e de tempo de execução da query, um teste por dimensão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Combinar testes de lineage, de ownership e de classificação de sensibilidade, um teste por dimensão.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Consistência, atualidade e acurácia",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Consistência, atualidade e acurácia\n\nA aula anterior cobriu completude, unicidade e validade, três dimensões que se checam olhando para uma tabela isolada. As três desta aula exigem mais contexto: comparar o dado com outro sistema, com o relógio, ou com o fato real que ele deveria representar. São elas: consistência, atualidade e acurácia."
                    },
                    {
                        "type": "text",
                        "value": "## Consistência: o dado bate entre sistemas?\n\nConsistência mede se a mesma informação, representada em lugares diferentes, conta a mesma história. Dois exemplos comuns:\n\n- O total de pedidos do dia no sistema transacional não bate com o total na tabela do data warehouse, porque uma carga incremental perdeu uma janela de tempo.\n- O mesmo cliente tem um endereço cadastrado no sistema de vendas e um endereço diferente no sistema de entrega, sem ficar claro qual dos dois está correto.\n\nInconsistência não aponta, sozinha, qual dos dois lados está errado. Ela só avisa que há uma divergência que precisa ser investigada e resolvida na origem."
                    },
                    {
                        "type": "text",
                        "value": "## Atualidade (timeliness): o dado chegou a tempo?\n\nAtualidade mede se o dado está disponível dentro do prazo em que ainda é útil para quem vai consumi-lo. Um dado pode ser completo, único, válido e até acurado, e ainda assim ser inútil se chegar tarde demais:\n\n- Um dashboard usado para decidir o estoque do dia mostra vendas de ontem, porque a carga que deveria terminar às 6h só terminou às 11h.\n- Um modelo de detecção de fraude que decide em tempo real depende de dados com poucos segundos de atraso; um atraso de minutos torna a detecção inútil.\n\nO limite aceitável de atraso é o SLA de frescor (freshness), definido de acordo com o uso do dado, não com o que a engenharia acha razoável."
                    },
                    {
                        "type": "text",
                        "value": "## Acurácia: o dado reflete a realidade?\n\nAcurácia mede se o valor corresponde ao fato real, e é a dimensão mais difícil de checar automaticamente, porque exige uma fonte de verdade externa ao próprio dado. A diferença entre validade e acurácia costuma confundir:\n\n- Um endereço 'Rua das Flores, 123' é **válido**: está no formato certo, com os campos esperados preenchidos. Mas se o cliente se mudou há um ano e esse não é mais o endereço dele, o dado é válido e **inacurado** ao mesmo tempo.\n- Um CPF com dígito verificador correto é **válido** matematicamente, mas se pertence a outra pessoa, digitado por engano, é **inacurado**.\n\nValidade é uma checagem interna, contra regras. Acurácia é uma checagem externa, contra o mundo real."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Dimensão\",\"Pergunta\",\"Pode ser válido e falhar aqui?\"],[\"Validade\",\"O valor respeita o formato e o domínio esperados?\",\"É a própria checagem de formato\"],[\"Acurácia\",\"O valor corresponde ao fato real?\",\"Sim: um endereço bem formatado pode estar desatualizado\"],[\"Consistência\",\"O valor bate com outras fontes do mesmo fato?\",\"Sim: um valor válido pode divergir entre dois sistemas\"]]"
                    },
                    {
                        "type": "code",
                        "value": "-- atualidade: há quanto tempo a tabela foi atualizada pela última vez\nSELECT\n  MAX(atualizado_em) AS ultima_carga,\n  NOW() - MAX(atualizado_em) AS atraso\nFROM pedidos;\n\n-- consistência: reconciliação entre sistema de origem e warehouse\nSELECT\n  (SELECT COUNT(*) FROM origem.pedidos WHERE data = CURRENT_DATE) AS total_origem,\n  (SELECT COUNT(*) FROM warehouse.pedidos WHERE data = CURRENT_DATE) AS total_warehouse;"
                    },
                    {
                        "type": "quote",
                        "value": "Validade pergunta se o dado segue as regras. Acurácia pergunta se o dado ainda é verdade. Um endereço pode passar na primeira pergunta e falhar na segunda."
                    }
                ],
                "questions": [
                    {
                        "statement": "O total de pedidos do dia no sistema transacional é 5.230, mas a tabela correspondente no data warehouse mostra 4.980 pedidos para o mesmo dia. Qual dimensão de qualidade essa divergência evidencia?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Validade: os pedidos do warehouse não respeitam o formato esperado pela tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Completude: o campo valor do pedido está vazio em parte dos registros do warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Acurácia: os pedidos do warehouse não correspondem a nenhum cliente real cadastrado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Consistência: o mesmo fato está representado de forma diferente em dois sistemas.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um dashboard usado toda manhã para decidir reposição de estoque deveria refletir as vendas do dia anterior até às 6h, mas a carga vem terminando por volta das 11h. Tecnicamente o dado está completo, único, válido e acurado quando chega. Ainda assim, o dashboard perdeu valor para a decisão. Que dimensão falhou?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Unicidade: o dashboard passou a contar os mesmos pedidos mais de uma vez por engano.",
                                "isCorrect": false
                            },
                            {
                                "text": "Validade: os valores de venda pararam de respeitar o formato esperado pela tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Atualidade: o dado chegou depois do prazo em que ainda seria útil para a decisão.",
                                "isCorrect": true
                            },
                            {
                                "text": "Completude: parte das vendas do dia anterior deixou de aparecer na carga da manhã.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O endereço de entrega de um cliente está gravado como 'Av. Central, 900, São Paulo - SP', num formato perfeitamente válido e com todos os campos preenchidos. O cliente, porém, se mudou há oito meses e esse não é mais o endereço de entrega dele. Esse é um caso clássico de:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Dado inválido, porém acurado: reflete a realidade atual, mas quebra as regras de formato esperadas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dado válido, porém inacurado: passa nas regras de formato, mas não reflete a realidade atual.",
                                "isCorrect": true
                            },
                            {
                                "text": "Dado incompleto, porém consistente: falta parte do endereço, mas bate com outros sistemas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dado duplicado, porém atualizado: o endereço aparece repetido, mas com a informação mais recente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe descobre que o campo telefone de um cliente é idêntico no CRM e no data warehouse, ou seja, os dois sistemas concordam entre si. Só que o número pertence a um telefone antigo que o cliente já trocou há um ano. Esse cenário mostra que:",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Consistência entre sistemas não garante acurácia: os dois podem concordar e, ainda assim, estarem errados.",
                                "isCorrect": true
                            },
                            {
                                "text": "Acurácia entre sistemas não garante consistência: os dois podem estar certos e, ainda assim, discordarem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Validade entre sistemas não garante completude: os dois podem ter o formato certo e faltar valores.",
                                "isCorrect": false
                            },
                            {
                                "text": "Completude entre sistemas não garante unicidade: os dois podem estar preenchidos e ter duplicatas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela de pedidos já tem teste de nulos em campos obrigatórios, teste de chave única e teste de domínio para o campo status. Mesmo assim, um pedido com valor total de R$ 45.000, dez vezes acima do ticket médio da loja, passou por todos os testes sem disparar alerta, e depois se revelou um erro de digitação. Qual dimensão de qualidade essa lacuna expõe?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Unicidade: nenhum dos testes existentes checa se o pedido foi inserido mais de uma vez.",
                                "isCorrect": false
                            },
                            {
                                "text": "Completude: nenhum dos testes existentes checa se algum campo obrigatório ficou vazio.",
                                "isCorrect": false
                            },
                            {
                                "text": "Validade: nenhum dos testes existentes checa se o campo valor tem o tipo numérico certo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Acurácia: nenhum dos testes existentes checa se o valor corresponde a um pedido plausível.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Definir regras de qualidade mensuráveis",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Definir regras de qualidade mensuráveis\n\n'O dado tem que ser bom' não é uma meta, é um desejo. Ninguém consegue testar, automatizar ou cobrar 'bom'. As quatro aulas anteriores deram o vocabulário (completude, unicidade, validade, consistência, atualidade, acurácia); esta aula mostra como transformar esse vocabulário em regras concretas, testáveis e com dono."
                    },
                    {
                        "type": "text",
                        "value": "## Anatomia de uma regra mensurável\n\nUma regra de qualidade útil tem quatro partes:\n\n- **Dimensão**: qual das seis está sendo checada (ex.: completude).\n- **Alvo**: em qual tabela e campo, ou em qual relação entre tabelas.\n- **Condição**: o teste exato, capaz de retornar verdadeiro ou falso (ex.: `cpf IS NOT NULL`).\n- **Limite aceitável**: o quanto de violação a regra tolera antes de ser considerada quebrada.\n\n'O cadastro de clientes deve ter boa qualidade' vira, depois desse exercício, algo como: 'o campo cpf da tabela clientes deve ter zero valores nulos, e o campo email deve corresponder a um formato válido em pelo menos 99% das linhas'."
                    },
                    {
                        "type": "text",
                        "value": "## Threshold: nem toda regra exige 100%\n\nAlgumas regras exigem tolerância zero: uma chave primária duplicada, ou um CPF nulo num sistema que depende dele para faturar, geralmente não aceitam exceção. Outras regras convivem com uma margem:\n\n- Um campo de telefone secundário, opcional no cadastro, pode ter 15% de nulos sem que isso seja um problema real.\n- Um campo de UTM de campanha, preenchido só quando o clique veio de um anúncio, é naturalmente nulo na maior parte das linhas.\n\nDefinir o threshold certo exige conversa com quem usa o dado, não só a opinião de quem constrói o pipeline. Um threshold alto demais deixa passar problema real; um threshold baixo demais gera alerta toda hora, e o time aprende a ignorar."
                    },
                    {
                        "type": "text",
                        "value": "## O SLA de qualidade\n\nDa mesma forma que uma API tem um SLA de disponibilidade, uma tabela importante pode ter um SLA de qualidade: um compromisso explícito, com dono, sobre o que o consumidor pode esperar. Um SLA de qualidade tipicamente declara:\n\n- **O que é garantido**: por exemplo, completude acima de 98% no campo valor_pedido e atualização até às 7h.\n- **Quem é o responsável**: o time ou pessoa que responde quando a regra quebra.\n- **O que acontece na quebra**: um alerta, um bloqueio de carga, uma tabela marcada como degradada (esse fluxo de resposta é aprofundado na aula sobre o que fazer quando um teste falha, no próximo módulo)."
                    },
                    {
                        "type": "code",
                        "value": "# regras de qualidade da tabela clientes\ntabela: clientes\nregras:\n  - dimensao: completude\n    campo: cpf\n    condicao: nao nulo\n    limite: 100%\n  - dimensao: unicidade\n    campo: cpf\n    condicao: sem duplicatas\n    limite: 100%\n  - dimensao: validade\n    campo: email\n    condicao: corresponde ao formato de email\n    limite: minimo de 99%\n  - dimensao: completude\n    campo: telefone_secundario\n    condicao: nao nulo\n    limite: minimo de 80%"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Regra\",\"Dimensão\",\"Limite aceitável\",\"Ação se quebrar\"],[\"cpf não nulo\",\"Completude\",\"100%\",\"Bloquear a carga da tabela\"],[\"cpf sem duplicatas\",\"Unicidade\",\"100%\",\"Bloquear a carga da tabela\"],[\"email em formato válido\",\"Validade\",\"Mínimo 99%\",\"Alertar o time responsável\"],[\"telefone_secundario não nulo\",\"Completude\",\"Mínimo 80%\",\"Registrar no relatório semanal\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Uma regra que ninguém consegue testar automaticamente não é uma regra de qualidade, é uma intenção. O threshold é o que separa uma intenção de um contrato."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma equipe escreve a seguinte regra de qualidade: 'o campo email deve ser válido'. Qual elemento, entre os que compõem uma regra mensurável, essa frase já deixa claro?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O limite aceitável de violação, que nesse caso fica implícito em zero por cento.",
                                "isCorrect": false
                            },
                            {
                                "text": "A condição exata do teste, que nesse caso já especifica o formato esperado do email.",
                                "isCorrect": false
                            },
                            {
                                "text": "A dimensão de qualidade envolvida, que nesse caso é a validade do campo.",
                                "isCorrect": true
                            },
                            {
                                "text": "O dono responsável pela regra, que nesse caso é o time que mantém a tabela de clientes.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um campo telefone_secundario é opcional no formulário de cadastro e fica nulo por padrão quando o cliente não informa um segundo contato. Qual é a decisão de threshold mais adequada para a regra de completude desse campo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Definir tolerância zero para nulos, igual à regra aplicada ao campo cpf da mesma tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir um limite aceitável de nulos bem mais alto do que zero, compatível com o uso real do campo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Remover a regra de completude desse campo e aplicar, no lugar dela, uma regra de unicidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Bloquear a carga inteira da tabela sempre que esse campo específico aparecer vazio numa linha.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela pedidos tem um SLA de qualidade que promete completude acima de 98% e atualização até às 7h da manhã, sob responsabilidade do time de vendas. Às 9h, a tabela ainda não foi atualizada. O que esse SLA define que deveria acontecer a partir daqui?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma ação de resposta previamente combinada, como alertar o time de vendas, dono da regra quebrada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma redução automática no limite de completude exigido, até a tabela voltar a ser atualizada em dia.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma troca automática do time responsável pela tabela, transferindo a posse para o time de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um aumento automático no horário prometido de atualização, para não quebrar o SLA de novo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual das opções abaixo é uma regra de qualidade mensurável, no sentido de poder ser transformada diretamente em um teste automatizado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O campo cpf da tabela clientes precisa estar sempre correto, sem exceções que comprometam o cadastro.",
                                "isCorrect": false
                            },
                            {
                                "text": "O campo cpf da tabela clientes deve ser tratado com cuidado durante todo o processo de carga.",
                                "isCorrect": false
                            },
                            {
                                "text": "O campo cpf da tabela clientes é importante e merece atenção redobrada da equipe de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "O campo cpf da tabela clientes não pode ter valores nulos, com tolerância de zero por cento.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um time define o threshold de validade do campo email em mínimo de 80%, bem abaixo da taxa histórica de 99,5%. Duas semanas depois, uma mudança no formulário de cadastro passa a aceitar emails sem domínio, derrubando a taxa real para 85%, e nenhum alerta dispara. Qual foi o erro na definição dessa regra?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O threshold ficou alto demais, gerando alertas com tanta frequência que o time passou a ignorá-los.",
                                "isCorrect": false
                            },
                            {
                                "text": "A dimensão escolhida foi a errada, o campo email deveria ser testado por completude, não por validade.",
                                "isCorrect": false
                            },
                            {
                                "text": "O threshold ficou baixo demais, dentro de uma margem que deveria ter disparado alerta bem antes de 85%.",
                                "isCorrect": true
                            },
                            {
                                "text": "O campo monitorado foi o errado, a regra deveria ter sido aplicada ao campo telefone, não ao email.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Perfilar dados (data profiling)",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Perfilar dados (data profiling)\n\nA aula anterior mostrou como escrever uma regra de qualidade mensurável, do tipo 'o campo cpf não pode ter nulos'. Mas como saber, antes de escrever qualquer regra, que o campo cpf é mesmo o campo crítico, ou que threshold faz sentido para o campo telefone_secundario? A resposta começa por conhecer o dado antes de confiar nele, ou de testá-lo. Esse reconhecimento inicial é o data profiling."
                    },
                    {
                        "type": "text",
                        "value": "## O que o profiling mede\n\nPerfilar uma tabela é calcular, para cada coluna, um conjunto de estatísticas descritivas que revelam a cara real do dado:\n\n- **Nulos**: quantos valores estão ausentes, em número absoluto e em percentual.\n- **Mínimo e máximo**: os valores extremos de um campo numérico ou de data, úteis para achar outliers e datas impossíveis.\n- **Cardinalidade**: quantos valores distintos existem numa coluna, o que indica se ela é uma chave, uma categoria ou um campo livre.\n- **Distribuição**: quais valores aparecem com mais frequência, e se essa frequência bate com o que se espera do negócio.\n- **Tipo inferido**: o tipo de dado que os valores sugerem, comparado ao tipo declarado na tabela."
                    },
                    {
                        "type": "text",
                        "value": "## Profiling como primeiro passo, não como extra\n\nAo receber uma tabela nova (um dataset de um parceiro, uma fonte que o time nunca tinha acessado), o instinto de quem já sabe SQL é escrever direto a query de negócio. O profiling inverte essa ordem: antes de qualquer análise, rodar um raio-x da tabela.\n\nEsse raio-x costuma revelar, em minutos, coisas que moldam toda regra de qualidade escrita depois: um campo id_cliente com cardinalidade menor do que o número de linhas (ou seja, não é único, ao contrário do que o nome sugere); um campo data_pedido com valores no ano 2099; um campo país com 40 grafias diferentes para 'Brasil'. Sem esse passo, a equipe só descobre esses problemas quando um relatório já quebrado chega em alguém de negócio."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Métrica de profiling\",\"Pergunta que responde\",\"Exemplo de achado\"],[\"Percentual de nulos\",\"Quanto do campo está vazio?\",\"35% da coluna telefone está nula\"],[\"Mínimo e máximo\",\"Quais os valores extremos?\",\"Uma data de pedido registrada em 2099\"],[\"Cardinalidade\",\"Quantos valores distintos existem?\",\"Coluna id_cliente com menos valores distintos que linhas\"],[\"Distribuição / top valores\",\"Quais valores dominam a coluna?\",\"Coluna país com 40 grafias diferentes para Brasil\"]]"
                    },
                    {
                        "type": "code",
                        "value": "-- profiling básico de uma coluna numérica\nSELECT\n  COUNT(*) AS total_linhas,\n  COUNT(*) FILTER (WHERE valor_pedido IS NULL) AS nulos,\n  MIN(valor_pedido) AS minimo,\n  MAX(valor_pedido) AS maximo,\n  COUNT(DISTINCT id_cliente) AS clientes_distintos\nFROM pedidos;\n\n-- top 5 valores mais frequentes de uma coluna categórica\nSELECT pais, COUNT(*) AS ocorrencias\nFROM pedidos\nGROUP BY pais\nORDER BY ocorrencias DESC\nLIMIT 5;"
                    },
                    {
                        "type": "quote",
                        "value": "Escrever uma regra de qualidade para um dado que ninguém perfilou é apostar no threshold certo. Profiling troca a aposta por um número visto de verdade."
                    },
                    {
                        "type": "text",
                        "value": "## Fechando o módulo\n\nEste módulo definiu o vocabulário da qualidade de dados: as seis dimensões (completude, unicidade, validade, consistência, atualidade e acurácia), como transformar cada uma em uma regra mensurável com threshold e dono, e o profiling como o passo que informa qual regra escrever primeiro. O próximo módulo usa esse vocabulário na prática: testar dados de forma automatizada, do jeito que já se testa código, com Great Expectations e dbt tests."
                    }
                ],
                "questions": [
                    {
                        "statement": "Antes de escrever qualquer regra de qualidade para uma tabela recém-recebida de um parceiro externo, um engenheiro de dados calcula, para cada coluna, o percentual de nulos, os valores mínimo e máximo, e o número de valores distintos. Essa atividade é conhecida como:",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Data profiling: um levantamento inicial de estatísticas descritivas sobre a tabela.",
                                "isCorrect": true
                            },
                            {
                                "text": "Data lineage: um mapeamento de origem e destino de cada coluna ao longo do pipeline.",
                                "isCorrect": false
                            },
                            {
                                "text": "Data masking: uma técnica de ofuscar valores sensíveis antes de qualquer análise.",
                                "isCorrect": false
                            },
                            {
                                "text": "Data partitioning: uma estratégia de dividir a tabela em partições menores por data.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao perfilar uma tabela nova, um engenheiro percebe que a coluna id_cliente, que deveria identificar um cliente único por linha, tem cardinalidade menor do que o número total de linhas da tabela. O que essa descoberta indica?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A tabela tem menos clientes ativos do que o esperado pelo time de vendas naquele período.",
                                "isCorrect": false
                            },
                            {
                                "text": "Há linhas repetindo o mesmo id_cliente, o que contraria a expectativa de uma chave única.",
                                "isCorrect": true
                            },
                            {
                                "text": "O campo id_cliente está armazenado com um tipo de dado incompatível com o restante da tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "A carga da tabela ainda está incompleta e novas linhas devem chegar nas próximas horas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O profiling de uma coluna país revela 40 grafias diferentes para o mesmo país ('Brasil', 'BRASIL', 'brasil ', 'Brazil'), todas se referindo ao mesmo valor real. Qual estatística de profiling foi responsável por revelar esse problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O percentual de nulos da coluna, que expõe quantas linhas estão sem nenhum país preenchido.",
                                "isCorrect": false
                            },
                            {
                                "text": "Os valores mínimo e máximo da coluna, que expõem os limites alfabéticos dos valores cadastrados.",
                                "isCorrect": false
                            },
                            {
                                "text": "A contagem total de linhas da tabela, que expõe quantos registros existem para cada país informado.",
                                "isCorrect": false
                            },
                            {
                                "text": "A distribuição de valores mais frequentes da coluna, que revela grafias diferentes do mesmo país.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Depois de perfilar uma tabela pela primeira vez, um time descobre que o campo telefone_secundario está nulo em 78% das linhas, um percentual estável ao longo dos últimos seis meses de histórico. Como esse achado do profiling deveria influenciar a regra de completude desse campo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O threshold de completude deveria ser fixado em zero por cento, para forçar o preenchimento do campo.",
                                "isCorrect": false
                            },
                            {
                                "text": "A regra de completude deveria ser substituída por uma regra de unicidade para esse mesmo campo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O threshold de completude deveria ser calibrado perto dos 78% de nulos já observados como normais.",
                                "isCorrect": true
                            },
                            {
                                "text": "O campo deveria ser removido da tabela, já que a maior parte das linhas não traz nenhum valor.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma coluna valor_pedido está declarada como texto na tabela, não como número. O profiling mostra que 97% dos valores são numéricos válidos, mas 3% contêm texto como 'a combinar' ou 'pendente'. Qual é a ação mais adequada a partir desse achado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Tratar os 3% como um caso à parte antes de converter o campo para um tipo numérico de fato.",
                                "isCorrect": true
                            },
                            {
                                "text": "Converter o campo para numérico imediatamente, já que a grande maioria dos valores é compatível.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ignorar o achado, porque um campo declarado como texto nunca deveria ser tratado como número.",
                                "isCorrect": false
                            },
                            {
                                "text": "Excluir da tabela todas as linhas em que o campo valor_pedido não for um número válido.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 2 - Testar e validar dados",
        "aulas": [
            {
                "titulo": "Testes de dados x testes de software",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Testes de dados x testes de software\n\nNo módulo anterior desta trilha, você viu como transformar uma suposição sobre o dado (um campo que não pode ser nulo, uma chave que não pode se repetir) numa regra de qualidade mensurável. Testar dados é automatizar a verificação dessas regras a cada carga, não só uma vez, na primeira vez que alguém lembrou de checar. Mas testar dado não é a mesma coisa que testar código, e essa diferença muda como o teste precisa ser operado no dia a dia."
                    },
                    {
                        "type": "text",
                        "value": "## O alvo se move\n\nUm teste de software roda contra um código que só muda quando alguém edita uma linha e comita essa mudança. Rodar o mesmo teste hoje, amanhã e daqui a um mês, sem nenhum commit no meio do caminho, tende a dar sempre o mesmo resultado.\n\nUm teste de dado roda contra uma tabela recarregada todo dia, às vezes várias vezes por dia. O código do teste pode continuar exatamente igual, e mesmo assim o resultado vira de passou para falhou de uma execução para outra, porque o que mudou não foi o teste, foi o dado por baixo dele. Testar dado é testar um alvo que se move sozinho, mesmo quando ninguém mexe em nenhuma linha de código."
                    },
                    {
                        "type": "code",
                        "value": "-- segunda-feira: mesmo teste, mesmo codigo, nenhum commit novo no projeto\nselect count(*) from stg_pedidos\nwhere status not in ('pendente', 'pago', 'cancelado');\n-- resultado: 0 linhas, o teste passa\n\n-- quinta-feira: a mesma consulta, ainda sem nenhuma mudanca no codigo\nselect count(*) from stg_pedidos\nwhere status not in ('pendente', 'pago', 'cancelado');\n-- resultado: 47 linhas, o teste falha\n-- a origem passou a enviar o status devolvido, que ninguem tinha mapeado"
                    },
                    {
                        "type": "text",
                        "value": "## Por que o CI não basta\n\nVocê já viu, na trilha Modern Data Stack, o CI de um projeto dbt: a cada pull request, ele roda os modelos e os testes contra um ambiente isolado, comparando com o estado de produção. Isso protege contra um problema específico, uma mudança de código que quebra alguma coisa, e pega essa regressão antes do merge.\n\nO detalhe é que o CI só dispara quando o código muda. Um modelo pode passar no CI, ser promovido para produção, e ficar semanas rodando sem nenhum commit novo. Se a fonte de dados mudar nesse meio tempo, como um status novo ou um campo que passa a vir nulo, nenhum CI vai notar, porque não existe código novo para disparar essa checagem. Por isso teste de dado precisa de um segundo gatilho, independente do código: rodar de novo a cada carga, dentro do próprio pipeline agendado."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\",\"Teste de software\",\"Teste de dado\"],[\"O que muda entre execuções\",\"Só o código, quando alguém edita\",\"O dado, a cada nova carga\"],[\"Quando precisa rodar\",\"A cada mudança de código, no CI\",\"A cada carga, o código tendo mudado ou não\"],[\"O que uma falha costuma indicar\",\"Uma regressão introduzida no código\",\"Uma suposição sobre o dado que deixou de valer\"],[\"Determinismo\",\"Mesma entrada gera sempre a mesma saída\",\"A mesma consulta pode passar hoje e falhar amanhã\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Um teste de dado que só roda no CI protege contra o código quebrar o pipeline. Não protege contra o dado quebrar sozinho, em silêncio, enquanto o código continua exatamente igual."
                    }
                ],
                "questions": [
                    {
                        "statement": "Sem nenhuma mudança de código, um teste de software tende a repetir sempre o mesmo resultado em execuções diferentes. Um teste de dado, também sem nenhuma mudança de código, pode passar hoje e falhar amanhã. Qual é a explicação mais direta para essa diferença?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O warehouse aplica otimizações de consulta que alteram o resultado retornado a cada execução.",
                                "isCorrect": false
                            },
                            {
                                "text": "Testes de dado usam uma linguagem de asserção menos confiável do que testes de software.",
                                "isCorrect": false
                            },
                            {
                                "text": "O dado avaliado pelo teste muda a cada carga, então o teste está mirando um alvo que se move.",
                                "isCorrect": true
                            },
                            {
                                "text": "O agendador do pipeline reordena aleatoriamente a sequência de testes a cada nova execução.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo dbt passa no CI de um pull request, com todos os testes genéricos e singulares corretos. Duas semanas depois, sem nenhum commit novo no repositório, o mesmo teste unique falha na execução agendada em produção. O que essa situação demonstra?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Que o CI protege contra regressão de código, mas não contra o dado mudar depois do merge.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que o teste unique estava mal escrito e deveria ter sido um teste singular desde o início.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o ambiente de CI usa uma versão do dbt diferente da usada na execução agendada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que a suíte de testes precisa ser reescrita a cada duas semanas para continuar válida.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que faz sentido dizer que o código de um pipeline é determinístico, mas o dado que passa por ele não é?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque funções de data e hora dentro do código tornam sua execução aleatória entre uma carga e outra.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o warehouse reorganiza os dados internamente antes de aplicar qualquer transformação declarada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque testes de dado, ao contrário de testes de software, não seguem uma ordem fixa de execução.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o mesmo código processa sempre do mesmo jeito, mas a entrada que ele recebe a cada carga muda.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe roda os testes dbt (unique, not_null, accepted_values) somente no pipeline de CI, a cada pull request, e nunca como parte da carga agendada em produção. Três semanas depois, a origem passa a enviar um novo valor de status, não mapeado, e ninguém percebe até o time de negócio reclamar de um número errado no dashboard. Qual mudança evita esse tipo de incidente?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Reescrever os testes genéricos como testes singulares, mais sensíveis a mudanças na origem.",
                                "isCorrect": false
                            },
                            {
                                "text": "Rodar os mesmos testes também dentro da carga agendada em produção, não só no CI dos pull requests.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar a frequência de pull requests, para o CI rodar com mais regularidade ao longo da semana.",
                                "isCorrect": false
                            },
                            {
                                "text": "Substituir o teste accepted_values por um teste not_null aplicado à mesma coluna de status.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No contexto de testes de dado, o que quer dizer a ideia de que o teste está mirando um alvo móvel?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Que o mesmo teste precisa ser reescrito toda vez que uma nova tabela é criada no warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que os testes de dado, diferente dos de software, precisam rodar em paralelo uns aos outros.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o resultado de um teste pode mudar de um dia para o outro, porque o dado muda a cada carga.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que um teste de dado só é válido durante a mesma sessão em que a tabela foi consultada.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Onde testar no pipeline",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Onde testar no pipeline\n\nUm pipeline de dados não é uma etapa só, e testar dado não é uma decisão de tudo ou nada, feita num único lugar. Da fonte até o consumo, cada trecho do caminho testa uma pergunta diferente. Você já viu, na trilha de ETL, a validação de dados na entrada de uma ingestão, e, na trilha Modern Data Stack, os testes genéricos aplicados aos modelos dbt de staging e de marts. Esta aula junta essas peças num mapa único: onde cada tipo de teste faz mais sentido, e por quê."
                    },
                    {
                        "type": "text",
                        "value": "## Três perguntas, três lugares\n\n- **Na ingestão**: a fonte entregou o que prometeu? Schema, tipos e contagem mínima de linhas, validados antes de o dado sequer entrar no projeto de transformação.\n- **No staging**: as suposições sobre a origem continuam valendo? Unicidade de chave, domínio de valores, campos obrigatórios preenchidos.\n- **No mart**: o número final está certo? Regras de negócio, como um total que precisa bater com a soma das suas partes.\n\nCada pergunta pega um tipo de problema que as outras duas não pegam."
                    },
                    {
                        "type": "code",
                        "value": "fonte externa (API, banco transacional, arquivo)\n     |\n     |  pergunta: a fonte entregou o que prometeu?\n     |  tipico: validacao de ingestao, Great Expectations\n     v\nstaging (1:1 com a fonte, so limpeza)\n     |\n     |  pergunta: as suposicoes sobre a origem continuam validas?\n     |  tipico: testes genericos do dbt (unique, not_null...)\n     v\nmart (modelo pronto para o negocio)\n     |\n     |  pergunta: o numero final bate com a regra de negocio?\n     |  tipico: teste singular do dbt, metrica conferida\n     v\nconsumo (BI, API, modelo de ML)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Camada\",\"Se o teste falha aqui, o problema costuma ser\",\"Exemplo\"],[\"Ingestão\",\"Da fonte externa, fora do controle direto do time de dados\",\"A API para de enviar o campo cpf_cliente sem avisar\"],[\"Staging\",\"Uma suposição da equipe sobre a origem que deixou de valer\",\"Um id que era único passa a se repetir na fonte\"],[\"Mart\",\"Um cálculo ou regra de negócio do modelo final\",\"O total do pedido não bate com a soma dos seus itens\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Por que não escolher só um lugar\n\nPode parecer redundante testar a mesma unicidade de chave tanto na ingestão quanto no staging, mas cada camada protege contra uma falha diferente. O teste na ingestão pega a fonte quebrando a própria promessa, antes de qualquer transformação. O mesmo teste no staging pega, por exemplo, um bug introduzido pela própria etapa de carga da ingestão. As camadas de teste não competem entre si, se complementam.\n\nComo você já viu na trilha Modern Data Stack, quanto mais cedo no caminho um problema é pego, mais barato costuma ser corrigi-lo: uma linha de log no início custa muito menos que uma investigação de dias depois de o número já ter chegado a um dashboard executivo."
                    },
                    {
                        "type": "quote",
                        "value": "Testar só no mart é como conferir a carga depois que o caminhão já descarregou. Testar cedo é a única forma de decidir antes de o problema chegar em quem consome o dado."
                    },
                    {
                        "type": "text",
                        "value": "## Ligando os pontos\n\nValidação de ingestão, testes de staging e testes de mart não são três ferramentas concorrentes, são três momentos complementares da mesma estratégia. A pergunta certa não é qual camada testar, é o que testar em cada uma: a promessa da fonte na ingestão, as suposições da equipe no staging, a regra de negócio no mart."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma API externa promete sempre enviar o campo cpf_cliente em cada registro de cliente. Em qual etapa do pipeline faz mais sentido checar se esse campo realmente veio preenchido, antes mesmo de o dado entrar no projeto de transformação?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Na ingestão, validando a fonte externa assim que o dado chega ao pipeline.",
                                "isCorrect": true
                            },
                            {
                                "text": "No staging, com um teste genérico not_null aplicado ao modelo já transformado.",
                                "isCorrect": false
                            },
                            {
                                "text": "No mart, junto da regra de negócio que consome esse campo específico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Em nenhuma etapa automatizada, isso depende sempre de revisão manual do time.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um teste unique na coluna pedido_id, declarado na camada de staging, passa a falhar depois que a equipe de integração passou a extrair pedidos de um novo sistema de origem. O que essa falha, especificamente nessa camada, indica com mais precisão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Que a API do novo sistema de origem está fora do ar no momento da extração.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o teste deveria ter sido movido da camada de staging para a camada de mart.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que o modelo de mart que consome pedido_id calculou uma métrica errada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que uma suposição sobre a unicidade da origem, válida até então, deixou de valer.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma regra de negócio determina que a margem_bruta de um pedido, calculada como receita menos custo, nunca pode ser negativa. Essa regra depende de um cálculo feito a partir de duas colunas do modelo final. Em qual camada esse teste faz mais sentido?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Na ingestão, porque toda regra de negócio precisa ser validada antes de qualquer transformação.",
                                "isCorrect": false
                            },
                            {
                                "text": "No mart, porque é ali que o cálculo de negócio final, a margem, é de fato produzido.",
                                "isCorrect": true
                            },
                            {
                                "text": "Fora do dbt, num script separado, já que cálculos entre colunas não podem ser testados.",
                                "isCorrect": false
                            },
                            {
                                "text": "No staging, porque é a camada mais próxima da fonte bruta dos dados de pedido.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A mesma checagem de unicidade da chave pedido_id é aplicada tanto na validação de ingestão, antes da carga em staging, quanto no teste genérico unique da camada de staging. Um colega sugere remover a checagem da ingestão, já que o staging cobre o mesmo caso. Qual é o principal risco dessa remoção?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O teste unique do staging deixaria de funcionar sem uma checagem equivalente antes dele.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Great Expectations e o dbt passariam a usar algoritmos de unicidade incompatíveis entre si.",
                                "isCorrect": false
                            },
                            {
                                "text": "A fonte poderia chegar quebrada, e o pipeline só descobriria isso depois de já processar o staging.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um teste de ingestão sempre torna redundante desativar o teste equivalente na camada de staging.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time decide concentrar toda a validação de dados apenas na camada de mart, argumentando que é ali que o negócio de fato consome o dado. Qual é a consequência mais provável dessa decisão, comparada a também testar em staging?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Problemas de origem só seriam detectados após já terem se propagado pelas transformações.",
                                "isCorrect": true
                            },
                            {
                                "text": "Os testes de mart passariam a rodar automaticamente também sobre os modelos de staging.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Great Expectations deixaria de conseguir validar qualquer dado do projeto inteiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "A equipe de negócio passaria a ter acesso direto ao código dos testes, hoje restrito.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Great Expectations e as expectations",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Great Expectations e as expectations\n\nGreat Expectations é uma ferramenta open source de validação de dados em Python, uma das mais adotadas do mercado para esse fim. Você já viu exemplos de expectations na trilha de ETL, ao validar a entrada de uma ingestão. Aqui o foco é entender os três conceitos que organizam a ferramenta como um todo: a expectation, a suite e o data doc."
                    },
                    {
                        "type": "text",
                        "value": "## A expectation: uma regra declarativa\n\nUma expectation é uma afirmação única, específica e verificável sobre um dado, como `expect_column_values_to_not_be_null` numa coluna. Declarativa quer dizer que você descreve o que deve ser verdade, sem escrever o código de como checar isso: o motor da ferramenta cuida do como. O resultado de rodar uma expectation contra um dado real é sempre um veredito objetivo: passou ou falhou, com o detalhe de quantas linhas quebraram a regra."
                    },
                    {
                        "type": "code",
                        "value": "# expectations sobre a tabela stg_clientes\nexpect_table_row_count_to_be_between(min_value=1000)\nexpect_column_values_to_not_be_null('cpf_cliente')\nexpect_column_values_to_match_regex('email', regex_email)\n\n# resultado da validacao (resumo de uma expectation)\n# expectation: expect_column_values_to_not_be_null\n# sucesso: false\n# linhas avaliadas: 50000\n# linhas com falha: 214"
                    },
                    {
                        "type": "text",
                        "value": "## A suite: expectations agrupadas\n\nUma expectation sozinha verifica uma coisa só. Uma tabela real costuma exigir várias verificações ao mesmo tempo: chave única, campos obrigatórios, um intervalo plausível de valores. Uma expectation suite agrupa todas as expectations relevantes para um mesmo dado, versionada como qualquer outro artefato do projeto, e roda como uma unidade só: uma validação, um resultado consolidado, com o detalhe de qual expectation específica passou ou falhou dentro dela."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Conceito\",\"O que é\",\"Equivalente aproximado no dbt\"],[\"Expectation\",\"Uma regra única e testável sobre uma coluna ou tabela\",\"Um teste genérico, como unique ou not_null\"],[\"Suite\",\"Um conjunto de expectations que define o que é válido para um dado\",\"O schema.yml inteiro de um modelo\"],[\"Data doc\",\"Um relatório navegável, gerado automaticamente, com os resultados\",\"O dbt docs, mas focado em resultado de validação\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O data doc: o resultado vira documentação\n\nO data doc é um site em HTML, gerado automaticamente a partir de uma suite e do seu histórico de execuções: quais expectations existem, se passaram na última validação, e como o resultado variou ao longo do tempo. O valor prático está em quem consegue ler isso. Um analista de negócio, sem acesso a nenhuma linha de código Python, abre o data doc e enxerga, em texto simples, que a tabela de clientes garante cpf sempre preenchido, sem precisar perguntar para ninguém do time de dados."
                    },
                    {
                        "type": "quote",
                        "value": "Uma suite de expectations não é só uma lista de testes, é a definição explícita, e publicamente visível, do que dado bom significa para aquela tabela."
                    }
                ],
                "questions": [
                    {
                        "statement": "No Great Expectations, o que é uma expectation?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Um relatório em HTML, gerado automaticamente ao fim de cada execução de validação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma regra declarativa e testável sobre um dado, como uma coluna nunca vir nula.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um agendamento que define a frequência com que uma tabela deve ser recarregada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um script de transformação que corrige automaticamente os valores inválidos encontrados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que diferencia uma expectation suite de uma expectation isolada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A suite só pode conter expectations sobre colunas numéricas, nunca sobre texto.",
                                "isCorrect": false
                            },
                            {
                                "text": "A suite roda uma única vez, na criação da tabela, e nunca mais é reavaliada depois.",
                                "isCorrect": false
                            },
                            {
                                "text": "A suite agrupa expectations relacionadas a um dado, avaliadas juntas numa unidade só.",
                                "isCorrect": true
                            },
                            {
                                "text": "A suite substitui totalmente a necessidade de declarar qualquer expectation individual.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista de negócio, sem acesso ao código do pipeline, precisa saber quais garantias existem sobre a tabela de clientes e se elas se confirmaram na última carga. Qual recurso do Great Expectations atende essa necessidade sem exigir leitura de código?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O data doc, um relatório navegável, gerado a partir da suite e dos resultados.",
                                "isCorrect": true
                            },
                            {
                                "text": "O arquivo de configuração técnica da suite, já escrito originalmente em linguagem natural.",
                                "isCorrect": false
                            },
                            {
                                "text": "O log de execução do pipeline, disponível apenas para quem acessa o orquestrador.",
                                "isCorrect": false
                            },
                            {
                                "text": "O schema da tabela direto no banco de dados, consultável por uma query SQL comum.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Duas expectations, expect_column_values_to_not_be_null aplicada a telefone e expect_column_values_to_be_unique aplicada a pedido_id, são declaradas sobre a mesma tabela. O que essas duas expectations têm em comum, do ponto de vista conceitual?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "As duas exigem que a coluna avaliada seja sempre do tipo texto, nunca numérica.",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas só podem ser avaliadas depois que um teste unique do dbt já tiver rodado antes.",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas corrigem automaticamente o valor da coluna quando encontram um problema.",
                                "isCorrect": false
                            },
                            {
                                "text": "As duas declaram o que deve ser verdade sobre o dado, sem dizer como se checa isso.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma suite de expectations sobre a tabela stg_pedidos e o schema.yml de testes genéricos do dbt sobre o mesmo modelo cobrem, em boa parte, o mesmo tipo de regra: unicidade, não nulo, domínio de valores. O que diferencia principalmente as duas abordagens, nesse ponto em comum?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O dbt permite só um teste por coluna, enquanto o Great Expectations permite vários por coluna.",
                                "isCorrect": false
                            },
                            {
                                "text": "O Great Expectations pode validar dados fora do warehouse, como um arquivo bruto na ingestão.",
                                "isCorrect": true
                            },
                            {
                                "text": "O Great Expectations não gera nenhum tipo de relatório, diferente do dbt e seu dbt docs.",
                                "isCorrect": false
                            },
                            {
                                "text": "O dbt exige licença paga para os testes genéricos, e o Great Expectations é sempre gratuito.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "dbt tests e testes customizados",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# dbt tests e testes customizados\n\nVocê já conhece, da trilha Modern Data Stack, os quatro testes genéricos embutidos no dbt (unique, not_null, accepted_values, relationships) e o teste singular, um SELECT escrito à mão para uma regra específica. Esses dois cobrem a maior parte do dia a dia. Esta aula fecha a lacuna que sobra entre os dois: o que fazer quando uma regra se repete em várias colunas, mas nenhum dos quatro testes embutidos dá conta dela."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de teste\",\"Exemplo\",\"Reuso entre colunas\"],[\"Genérico embutido\",\"unique, not_null, accepted_values, relationships\",\"Alto, já vem pronto no dbt Core\"],[\"Singular\",\"Um SELECT customizado num arquivo .sql em tests/\",\"Nenhum, vale só para aquele caso específico\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O meio-termo: teste genérico customizado\n\nUm teste genérico customizado é a sua própria regra, escrita uma única vez como um bloco especial de macro (`{% test %}`), e depois aplicável a qualquer coluna, de qualquer modelo, exatamente como unique ou not_null são aplicados hoje. Ele preenche o espaço entre o que o dbt já traz pronto e o caso único demais para valer a pena reaproveitar."
                    },
                    {
                        "type": "code",
                        "value": "-- macros/testes_genericos/positivo.sql\n{% test positivo(model, column_name) %}\n    select *\n    from {{ model }}\n    where {{ column_name }} <= 0\n{% endtest %}\n\n# schema.yml: usando o teste customizado como unique ou not_null\nmodels:\n  - name: fct_pedidos\n    columns:\n      - name: valor_total\n        tests:\n          - positivo\n      - name: quantidade_itens\n        tests:\n          - positivo"
                    },
                    {
                        "type": "text",
                        "value": "## Pacotes trazem testes prontos\n\nNem sempre vale a pena escrever o teste customizado do zero. Assim como o dbt_utils traz macros de transformação prontas, ele também traz testes genéricos prontos, como `unique_combination_of_columns`, para checar a unicidade de uma chave composta por mais de uma coluna, algo que o teste unique embutido, sozinho, não cobre. Existe até um pacote dedicado, o dbt-expectations, que traz para dentro do schema.yml do dbt uma sintaxe inspirada diretamente nas expectations do Great Expectations, vistas na aula anterior."
                    },
                    {
                        "type": "code",
                        "value": "# schema.yml: unicidade de uma chave composta, via dbt_utils\nmodels:\n  - name: fct_itens_pedido\n    tests:\n      - dbt_utils.unique_combination_of_columns:\n          combination_of_columns:\n            - pedido_id\n            - item_id"
                    },
                    {
                        "type": "quote",
                        "value": "O teste genérico embutido resolve o caso comum. O singular resolve o caso único. O teste customizado resolve o caso que se repete, mas que o dbt não trouxe pronto de fábrica."
                    }
                ],
                "questions": [
                    {
                        "statement": "Quais são os quatro testes genéricos que já vêm prontos no dbt Core?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "unique, not_null, primary_key e foreign_key",
                                "isCorrect": false
                            },
                            {
                                "text": "not_null, accepted_values, positivo e relationships",
                                "isCorrect": false
                            },
                            {
                                "text": "unique, accepted_range, not_constant e relationships",
                                "isCorrect": false
                            },
                            {
                                "text": "unique, not_null, accepted_values e relationships",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "A chave da tabela fct_itens_pedido é composta por pedido_id e item_id juntos, mas nenhuma das duas colunas isoladamente é única. O teste unique do dbt, aplicado a uma única coluna, não cobre esse caso. Qual caminho resolve isso sem escrever um teste do zero?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Usar um teste de pacote, como unique_combination_of_columns do dbt_utils, feito para chave composta.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aplicar o teste unique separadamente em pedido_id e depois em item_id, o que cobre o mesmo caso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o teste unique por not_null nas duas colunas, já que chave composta se valida por não nulo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar duas relationships, uma para cada coluna, apontando cada uma para a outra.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que diferencia um teste genérico customizado, escrito como um bloco {% test %}, de um teste singular?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O customizado só pode ser escrito em Python, enquanto o singular é sempre em SQL puro.",
                                "isCorrect": false
                            },
                            {
                                "text": "O customizado roda a cada commit automaticamente, e o singular exige execução manual.",
                                "isCorrect": false
                            },
                            {
                                "text": "O customizado é reutilizável e parametrizado por coluna, o singular vale só para um caso.",
                                "isCorrect": true
                            },
                            {
                                "text": "O customizado substitui totalmente a necessidade de testes genéricos embutidos no projeto.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time já usa o Great Expectations para validar dados na ingestão e quer aplicar uma lógica parecida, como checar se um valor cai dentro de um intervalo, também dentro do próprio dbt, sem reescrever a checagem do zero em SQL puro. Qual caminho é o mais direto?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Rodar o Great Expectations dentro do dbt run, já que as duas ferramentas compartilham o mesmo motor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Instalar um pacote como o dbt-expectations, que traz para o dbt testes inspirados nas expectations.",
                                "isCorrect": true
                            },
                            {
                                "text": "Reescrever cada expectation como teste singular, já que o dbt não aceita testes vindos de pacotes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar o projeto inteiro do dbt para o Great Expectations, já que as ferramentas não coexistem.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O campo desconto_percentual de uma tabela de pedidos nunca pode ser negativo, e essa mesma checagem de intervalo simples vai se repetir em outras quatro colunas parecidas, agora e no futuro do projeto. Qual tipo de teste é o mais adequado para essa necessidade recorrente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O teste embutido not_null, já que um valor negativo também conta como valor ausente para o dbt.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um teste singular, escrito uma vez para cada uma das cinco colunas, sem nenhum parâmetro.",
                                "isCorrect": false
                            },
                            {
                                "text": "O teste embutido accepted_values, listando manualmente cada percentual de desconto possível.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um teste genérico customizado, reutilizável e parametrizado por coluna, como positivo já visto.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O que fazer quando um teste falha",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que fazer quando um teste falha\n\nAté aqui o foco foi detectar: o Great Expectations e os testes do dbt apontam quando um dado quebra uma regra. Detectar sozinho não decide nada. Um teste vermelho, por si só, não bloqueia, não avisa e não conserta nada: alguém, ou alguma política definida com antecedência, precisa decidir o que acontece a seguir."
                    },
                    {
                        "type": "text",
                        "value": "## As três respostas possíveis\n\n- **Bloquear (circuit breaker)**: interrompe a carga inteira, nada segue adiante até o problema ser investigado.\n- **Alertar sem bloquear (warn)**: registra o problema e notifica o time, mas deixa o pipeline seguir normalmente. Você já viu essa ideia na configuração de severidade (severity: warn) de um teste dbt.\n- **Quarentena**: isola só as linhas problemáticas numa área separada, e segue carregando o restante do lote. Você já viu essa ideia na trilha de ETL, tratando erros de ingestão.\n\nAs três já eram conhecidas em partes soltas. O que falta é o critério para escolher entre elas."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Resposta\",\"Efeito no pipeline\",\"Quando costuma fazer sentido\"],[\"Bloquear\",\"A carga para, nada novo é publicado até corrigir\",\"Falha em regra crítica, alto risco de decisão errada\"],[\"Alertar (warn)\",\"O pipeline segue, o time recebe um aviso\",\"Campo não crítico, falha ocasional já conhecida\"],[\"Quarentena\",\"As linhas ruins são isoladas, o resto segue\",\"Falha localizada, o restante do lote é confiável\"]]"
                    },
                    {
                        "type": "code",
                        "value": "# schema.yml: severidade configurada conforme a criticidade da coluna\nmodels:\n  - name: fct_pedidos\n    columns:\n      - name: pedido_id\n        tests:\n          - unique:\n              config:\n                severity: error\n          # chave do fato financeiro: bloqueia a carga se falhar\n      - name: telefone_contato\n        tests:\n          - not_null:\n              config:\n                severity: warn\n          # campo secundario: alerta mas nao bloqueia a carga"
                    },
                    {
                        "type": "text",
                        "value": "## O critério é criticidade, não preferência\n\nA escolha entre as três respostas não é uma questão de gosto do time, é uma questão de impacto: o que acontece se esse dado ruim chegar até quem consome? Uma chave duplicada num fato financeiro, se publicada, dobra silenciosamente uma métrica de receita, então vale bloquear, mesmo que isso atrase a carga. Um telefone nulo num cadastro antigo não muda nenhuma decisão de negócio, então bloquear a carga inteira por causa dele é desproporcional, alertar já basta. Quarentena entra quando as linhas ruins podem ser isoladas com segurança, sem contaminar o restante do lote."
                    },
                    {
                        "type": "quote",
                        "value": "Bloquear demais transforma o pipeline num alarme que ninguém mais escuta. Bloquear de menos transforma o teste numa formalidade que ninguém corrige. A criticidade do dado é o que separa as duas coisas."
                    },
                    {
                        "type": "text",
                        "value": "## Fechando o módulo\n\nDetectar sem decidir o que fazer com a falha é só metade do trabalho: a resposta certa protege quem consome o dado sem travar o pipeline à toa por qualquer motivo. O próximo módulo muda de assunto: quando nada testado com antecedência pega o problema, entra a observabilidade, para detectar o que ninguém pensou em testar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Num pipeline de dados, qual é o efeito da resposta chamada de bloquear, ou circuit breaker, quando um teste falha?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A carga é interrompida, e nada segue adiante até o problema ser investigado.",
                                "isCorrect": true
                            },
                            {
                                "text": "As linhas problemáticas são isoladas numa área separada, e o resto segue normalmente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O time é notificado, mas o pipeline continua rodando sem nenhuma interrupção.",
                                "isCorrect": false
                            },
                            {
                                "text": "O teste é desabilitado automaticamente até a próxima revisão geral do pipeline.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O teste unique na chave pedido_id de uma tabela fato de faturamento falha: uma falha na extração da origem duplicou a totalidade dos pedidos do dia na carga atual, inflando a receita reportada em praticamente o dobro caso a carga siga em frente. Qual resposta é mais adequada a essa falha?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Colocar os pedidos duplicados em quarentena e seguir carregando o restante do lote normalmente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Alertar sem bloquear, já que o time pode corrigir a duplicidade depois, sem nenhuma pressa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o limite de tolerância do teste unique para aceitar duplicatas pontuais como essa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Bloquear a carga, porque deixar passar compromete diretamente uma métrica financeira crítica.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "O teste not_null no campo telefone_secundario de uma tabela de clientes falha para 40 linhas, todas de cadastros antigos que nunca tiveram esse campo preenchido, um comportamento já conhecido e sem nenhum impacto identificado em relatórios. Qual resposta equilibra continuidade do pipeline com visibilidade do problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Bloquear a carga até que todos os 40 cadastros antigos sejam corrigidos manualmente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Alertar sem bloquear, registrando o problema sem interromper a carga em andamento.",
                                "isCorrect": true
                            },
                            {
                                "text": "Remover o teste not_null desse campo, já que ele nunca vai passar para esses cadastros.",
                                "isCorrect": false
                            },
                            {
                                "text": "Colocar a tabela inteira de clientes em quarentena até a carga seguinte ser validada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma ingestão diária recebe pedidos de um parceiro comercial. Historicamente, uma fração pequena e estável de linhas chega com campos obrigatórios ausentes, um problema pontual e conhecido da integração, sem afetar a validade dos demais pedidos do lote. Qual resposta lida com esse padrão sem descartar dado bom nem propagar dado ruim?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Alertar sem bloquear, deixando as linhas com campos ausentes seguirem para as tabelas finais.",
                                "isCorrect": false
                            },
                            {
                                "text": "Bloquear a carga inteira sempre que qualquer linha chegar com campo obrigatório ausente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Colocar as linhas com campos ausentes em quarentena, seguindo a carga com o restante do lote.",
                                "isCorrect": true
                            },
                            {
                                "text": "Desativar a validação desse campo, já que o problema é conhecido e se repete sempre.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O que deveria determinar principalmente a escolha entre bloquear, alertar sem bloquear ou colocar em quarentena, diante da falha de um teste de dado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O impacto de o dado ruim chegar a quem consome, e se as linhas ruins podem ser isoladas com segurança.",
                                "isCorrect": true
                            },
                            {
                                "text": "A preferência pessoal de quem escreveu o teste, já que a resposta é uma escolha de estilo do time.",
                                "isCorrect": false
                            },
                            {
                                "text": "O tipo de ferramenta usada para declarar o teste, já que cada uma permite só uma dessas respostas.",
                                "isCorrect": false
                            },
                            {
                                "text": "O horário em que o teste roda, já que testes noturnos bloqueiam e testes diurnos apenas alertam.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 3 - Observabilidade de dados",
        "aulas": [
            {
                "titulo": "O que é observabilidade de dados",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é observabilidade de dados\n\nNo módulo anterior, você viu testes de dados: expectations do Great Expectations, testes genéricos e customizados do dbt. Um teste verifica uma hipótese específica, escrita por alguém que já sabia o que podia dar errado (\"essa coluna não pode ter nulo\", \"esse ID é único\"). Observabilidade de dados resolve outro problema: o que fazer quando o defeito é um que ninguém pensou em testar."
                    },
                    {
                        "type": "text",
                        "value": "## O problema do \"unknown unknown\"\n\nImagine um pipeline com dezenas de testes passando em verde todos os dias. Um dia, o time de marketing percebe que o dashboard de conversão está zerado desde terça-feira. Ninguém tinha escrito um teste para \"a API do parceiro parar de mandar dados sem avisar\". Esse é o cenário clássico que a observabilidade ataca:\n\n- Um job que roda com sucesso, mas processa 5% do volume normal, porque uma fonte upstream falhou parcialmente.\n- Uma coluna que, sem aviso, passa a vir sempre `null`, porque um campo foi removido silenciosamente na origem.\n- Uma tabela que devia atualizar toda madrugada e não atualiza há três dias, sem nenhum alerta disparado.\n\nNenhum desses casos quebra um teste, porque ninguém escreveu um teste para eles. **Teste verifica o que você já sabia que podia dar errado; observabilidade existe para o que você nunca cogitou.**"
                    },
                    {
                        "type": "quote",
                        "value": "Teste de dados responde: esse dado está do jeito que eu esperava? Observabilidade de dados responde: esse dado está diferente de como ele normalmente é, mesmo que eu nunca tenha previsto esse caso?"
                    },
                    {
                        "type": "text",
                        "value": "## A analogia com observabilidade de aplicações\n\nA ideia não é nova: vem da observabilidade de sistemas, que você já viu em outra trilha. Lá, os pilares clássicos são métricas (números ao longo do tempo, como latência e taxa de erro), logs (registros detalhados de eventos) e traces (o caminho de uma requisição por vários serviços). Observabilidade de dados aplica a mesma lógica ao dado em si, não ao código que o processa:\n\n- Em vez de monitorar CPU e latência de um serviço, você monitora volume, freshness e distribuição de uma tabela.\n- Em vez de um trace seguindo uma requisição por microsserviços, a **lineage** segue um dado por transformações, da origem até o consumo.\n- Em vez de um log de erro de aplicação, um **monitor** de dados registra quando uma métrica do dado saiu do padrão."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Observabilidade de aplicações\", \"Equivalente em observabilidade de dados\"], [\"Métricas (latência, taxa de erro, CPU)\", \"Freshness, volume e distribuição dos dados\"], [\"Logs de execução do serviço\", \"Logs de execução do pipeline (jobs, linhas processadas)\"], [\"Traces (caminho de uma requisição pelos serviços)\", \"Lineage (caminho de um dado pelas transformações)\"], [\"Alerta de SLO estourado\", \"Alerta de anomalia disparado por um monitor de dados\"]]"
                    },
                    {
                        "type": "code",
                        "value": "Pipeline \"verde\" nos logs, mas o dado chegando errado\n\n  API do parceiro          job de ingestao           tabela no warehouse\n  para de mandar      -->  roda com sucesso,    -->   pedidos_diarios\n  90% dos pedidos          sem erro no log            (volume 90% abaixo\n                                                       do normal)\n                                                            |\n                                                            v\n                                                 nenhum teste foi escrito\n                                                 para \"volume caiu\";\n                                                 dashboard de vendas so\n                                                 mostra a queda 3 dias\n                                                 depois\n\n  observabilidade monitora o VOLUME continuamente e alertaria\n  no mesmo dia, mesmo sem ninguem ter previsto essa falha especifica"
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a principal diferença entre um teste de dados e a observabilidade de dados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Teste verifica uma hipótese específica já prevista; observabilidade monitora a saúde do dado continuamente.",
                                "isCorrect": true
                            },
                            {
                                "text": "Teste roda apenas em ambiente de desenvolvimento; observabilidade roda somente depois que os dados chegam à produção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Teste analisa somente a estrutura de uma tabela; observabilidade analisa somente o código do pipeline que a alimenta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Teste é usado em dados batch; observabilidade é usada exclusivamente em pipelines de streaming.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela tem 12 testes do dbt configurados e todos passam todos os dias. Ainda assim, um parceiro para de enviar 90% dos pedidos, sem nenhum aviso, e ninguém percebe por três dias. O que esse cenário ilustra sobre os limites dos testes de dados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Que os testes do dbt não funcionam corretamente em tabelas alimentadas por parceiros externos à empresa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que testes só cobrem hipóteses já previstas; um problema não antecipado passa despercebido até alguém notar.",
                                "isCorrect": true
                            },
                            {
                                "text": "Que o time deveria ter usado o Great Expectations no lugar do dbt, já que ele cobre queda de volume automaticamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Que 12 testes é um número insuficiente, e o problema seria evitado com pelo menos 30 testes na mesma tabela.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Na observabilidade de aplicações, o trace mostra o caminho de uma requisição por vários microsserviços. Qual é o equivalente mais direto disso na observabilidade de dados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O monitor de volume, que mostra quantas linhas passaram por cada etapa do pipeline.",
                                "isCorrect": false
                            },
                            {
                                "text": "O log de execução do job, que registra cada etapa processada durante a carga.",
                                "isCorrect": false
                            },
                            {
                                "text": "A lineage, que mostra o caminho de um dado por transformações, da origem até o consumo.",
                                "isCorrect": true
                            },
                            {
                                "text": "O schema da tabela final, que mostra todas as colunas herdadas das tabelas de origem.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time já monitora CPU, memória e taxa de erro dos jobs Spark que alimentam o warehouse, usando a mesma ferramenta de observabilidade de aplicações da empresa. Mesmo assim, um job termina com status de sucesso enquanto grava uma tabela com metade das colunas nulas por um bug de join. Por que a observabilidade de aplicações, sozinha, não pega esse problema?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque ferramentas de observabilidade de aplicações não conseguem monitorar jobs escritos em Spark, apenas serviços web.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o job precisaria estar configurado como um microsserviço para que suas métricas fossem coletadas corretamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque observabilidade de aplicações só funciona em ambientes de streaming, e esse job roda em lote.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque ela monitora a saúde do processo que roda o job (CPU, memória, erro), não o conteúdo do dado produzido.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Qual das opções abaixo é um exemplo de problema que a observabilidade de dados foi criada para detectar, mesmo sem nenhum teste específico ter sido escrito para esse caso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Uma tabela que historicamente recebe entre 40 e 60 mil linhas por dia e, num único dia, recebe apenas 500 linhas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Uma coluna que não pode ser nula, validada por um teste do Great Expectations em todo pipeline de carga.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um valor de status que só pode ser 'ativo', 'inativo' ou 'pendente', verificado por uma regra customizada do dbt.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma chave primária que deve ser única, garantida por uma expectation configurada explicitamente no pipeline.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Os cinco pilares",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Os cinco pilares\n\nA empresa Monte Carlo, pioneira em observabilidade de dados, popularizou um framework de cinco pilares que virou referência de mercado para descrever a saúde de um dado. Cada pilar responde a uma pergunta diferente sobre a mesma tabela ou dataset."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Pilar\", \"Pergunta que responde\", \"Sinal de problema\"], [\"Freshness\", \"O dado chegou ou foi atualizado no horário esperado?\", \"Tabela que atualiza toda madrugada não atualiza há 14 horas\"], [\"Volume\", \"A quantidade de linhas está dentro do esperado?\", \"Tabela que recebe cerca de 50 mil linhas por dia recebe 800\"], [\"Schema\", \"A estrutura dos dados mudou?\", \"Uma coluna some ou um tipo muda de inteiro para texto sem aviso\"], [\"Distribuição\", \"Os valores estão dentro do padrão histórico?\", \"Um campo de percentual passa a trazer valores negativos\"], [\"Lineage\", \"De onde o dado vem e quem depende dele?\", \"Uma tabela de origem muda e ninguém sabe quais dashboards quebram\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Freshness e volume: os primeiros sinais de vida\n\nSão, em geral, os pilares mais baratos de monitorar: dá para calculá-los a partir de metadados da carga (hora da última atualização, contagem de linhas), sem examinar o conteúdo de cada valor.\n\n- **Freshness** cobre atraso: um job que deveria terminar às 6h e só termina às 14h, ou uma tabela que simplesmente para de atualizar.\n- **Volume** cobre quantidade: uma carga que normalmente traz dezenas de milhares de linhas e, num dia qualquer, traz uma fração disso (ou um múltiplo muito maior)."
                    },
                    {
                        "type": "text",
                        "value": "## Schema e distribuição: a forma e o conteúdo\n\nJá esses dois pilares custam mais para monitorar, porque exigem olhar para dentro dos dados, não só para a carga:\n\n- **Schema** cobre a estrutura: colunas adicionadas, removidas ou com tipo alterado sem aviso prévio de quem mantém a fonte.\n- **Distribuição** cobre o conteúdo: a proporção de nulos numa coluna, a faixa de valores numéricos, a cardinalidade de uma categoria, tudo comparado ao padrão histórico daquela tabela."
                    },
                    {
                        "type": "text",
                        "value": "## Lineage: o pilar que liga todos os outros\n\nLineage não é uma métrica que dispara alerta sozinha: é o que transforma um alerta solto em diagnóstico. Quando um monitor de volume dispara numa tabela de origem, é a lineage que responde \"quais tabelas, modelos e dashboards dependem dela\", direcionando a investigação antes que o problema apareça, sem contexto nenhum, num relatório de negócio. As próximas aulas do roadmap aprofundam lineage em nível de tabela e de coluna."
                    },
                    {
                        "type": "code",
                        "value": "                 FRESHNESS                VOLUME\n                 chegou na hora?           quantidade esperada?\n                        \\                      /\n                         \\                    /\n                      +---------------------------+\n                      |      tabela / dataset      |\n                      +---------------------------+\n                         /                    \\\n                        /                      \\\n                 SCHEMA                   DISTRIBUICAO\n                 estrutura mudou?         valores dentro do padrao?\n\n                              LINEAGE\n                    de onde vem, quem depende\n                 (liga os outros 4 pilares a causa\n                    raiz e ao impacto no negocio)"
                    },
                    {
                        "type": "quote",
                        "value": "Os cinco pilares não substituem teste nenhum: eles cobrem a superfície inteira da tabela, continuamente, para que um problema não previsto apareça antes de virar um dashboard quebrado na mesa de alguém do negócio."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual dos cinco pilares de observabilidade de dados responde diretamente à pergunta: os dados chegaram ou foram atualizados dentro do horário esperado?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Volume, o pilar que mede se a quantidade de linhas carregadas está dentro do padrão histórico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Freshness, o pilar que mede se o dado chegou ou foi atualizado dentro do prazo esperado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Schema, o pilar que mede se a estrutura da tabela mudou sem aviso prévio.",
                                "isCorrect": false
                            },
                            {
                                "text": "Distribuição, o pilar que mede se os valores dos dados seguem o padrão histórico.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela de pedidos recebe, em média, 40 mil linhas por dia. Numa segunda-feira, o job de carga roda sem erros e sem atraso, mas a tabela recebe apenas 2 mil linhas. Qual pilar de observabilidade captura esse problema mais diretamente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Freshness, porque o atraso na chegada dos dados costuma ser a causa mais provável de uma queda desse tamanho.",
                                "isCorrect": false
                            },
                            {
                                "text": "Schema, porque a estrutura da tabela provavelmente mudou de forma incompatível com o pipeline de carga.",
                                "isCorrect": false
                            },
                            {
                                "text": "Volume, porque a quantidade de linhas carregadas está muito abaixo do padrão histórico da tabela.",
                                "isCorrect": true
                            },
                            {
                                "text": "Lineage, porque esse pilar identificaria automaticamente qual sistema de origem parou de enviar dados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline de ingestão lê um arquivo enviado por um parceiro. Sem aviso prévio, o parceiro muda o campo valor_frete de número para texto na origem. Qual pilar existe especificamente para detectar esse tipo de mudança na estrutura dos dados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Distribuição, porque esse pilar monitora se os valores numéricos de um campo estão dentro da faixa histórica esperada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Freshness, porque esse pilar monitora se os arquivos do parceiro chegam com o atraso esperado em relação à rotina de ingestão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Volume, porque esse pilar monitora se a quantidade de linhas do arquivo recebido está dentro do padrão histórico.",
                                "isCorrect": false
                            },
                            {
                                "text": "Schema, porque esse pilar monitora justamente mudanças na estrutura dos dados, como um campo que troca de tipo sem aviso.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um monitor de volume dispara um alerta: a tabela fct_pedidos recebeu 60% menos linhas do que o normal hoje. Para descobrir rapidamente quais dashboards e modelos dependem dela e serão impactados, qual pilar é o mais útil nesse momento?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Lineage, porque esse pilar mapeia as dependências entre tabelas, modelos e dashboards a partir da tabela afetada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Volume, porque o mesmo monitor que detectou a queda também lista automaticamente todos os dashboards afetados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Schema, porque uma mudança de estrutura na tabela de origem costuma ser a única causa possível de queda de volume.",
                                "isCorrect": false
                            },
                            {
                                "text": "Distribuição, porque comparar a distribuição de valores antes e depois do alerta revela diretamente quais dashboards usam a tabela.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Dos cinco pilares, freshness e volume costumam ser os mais baratos de monitorar continuamente, em comparação com schema e distribuição. Por quê?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque dependem apenas do schema declarado da tabela, sem nenhuma consulta ao conteúdo do warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque dá para calculá-los a partir de metadados da carga, sem examinar cada valor da tabela.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque são os dois únicos pilares que dispensam completamente qualquer consulta ao warehouse onde os dados estão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque usam sempre limites fixos, enquanto os outros pilares recalculam um baseline estatístico a cada execução.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Detecção de anomalias em dados",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Detecção de anomalias em dados\n\nCada um dos cinco pilares só vira útil na prática quando alguém, ou alguma ferramenta, sabe dizer \"isso está fora do normal para essa tabela\". Essa é a tarefa da detecção de anomalias: comparar o valor atual de uma métrica (volume, freshness, taxa de nulos) contra o que seria esperado."
                    },
                    {
                        "type": "text",
                        "value": "## Baseline: o que é \"normal\" para esse dado\n\nBaseline é o padrão histórico de uma métrica: quantas linhas essa tabela costuma receber às segundas-feiras, qual a taxa de nulos usual de uma coluna, em que horário a carga costuma terminar. Uma anomalia é um desvio desse baseline grande o suficiente para merecer atenção. Sem baseline, todo monitor vira um palpite: alguém escolhe um número \"redondo\" sem saber se ele reflete a realidade da tabela."
                    },
                    {
                        "type": "text",
                        "value": "## Threshold fixo x threshold aprendido\n\nExistem duas formas de decidir quando um desvio vira alerta:\n\n- **Threshold fixo**: uma regra definida manualmente, como \"alertar se o volume cair abaixo de 10 mil linhas\". Simples e previsível, mas exige ajuste manual conforme a tabela cresce ou muda de padrão.\n- **Threshold aprendido**: calculado a partir do histórico, como um desvio em relação à média móvel dos últimos dias. Se adapta sozinho ao crescimento da tabela, mas depende de ter histórico suficiente para ser confiável."
                    },
                    {
                        "type": "table",
                        "value": "[[\"\", \"Threshold fixo\", \"Threshold aprendido (baseline estatístico)\"], [\"Como funciona\", \"Regra definida manualmente, ex.: volume abaixo de 10 mil linhas\", \"Calculado a partir do histórico, ex.: desvio da média móvel\"], [\"Se adapta ao crescimento\", \"Não, exige ajuste manual periódico\", \"Sim, o baseline se atualiza com o tempo\"], [\"Depende de histórico\", \"Não, funciona desde o primeiro dia\", \"Sim, poucos dias de histórico enfraquecem o baseline\"], [\"Facilidade de explicar\", \"Fácil: a regra é literal\", \"Mais difícil: depende do cálculo estatístico\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Sazonalidade: o \"normal\" muda com o calendário\n\nUm e-commerce vende muito mais na Black Friday e muito menos no feriado de fim de ano. Um baseline ingênuo, que só compara \"hoje\" com \"ontem\", dispara alerta falso nesses dois extremos. Um baseline que leva sazonalidade em conta compara segunda-feira com as últimas segundas-feiras, e a própria Black Friday com a Black Friday do ano anterior, em vez de comparar cada dia só com o dia imediatamente anterior."
                    },
                    {
                        "type": "text",
                        "value": "## Alert fatigue: alertar demais é o mesmo que não alertar\n\nUm monitor sensível demais, ou um baseline mal calibrado, gera alertas o tempo todo, inclusive para variações normais. O time aprende a ignorar o canal de alertas, e quando um problema real aparece, ele se perde no meio do ruído. Duas práticas ajudam:\n\n- Correlacionar alertas de monitores diferentes que apontam para o mesmo incidente numa única notificação.\n- Rotear só o que é acionável para quem está de plantão, deixando o resto disponível para consulta, sem interromper ninguém."
                    },
                    {
                        "type": "quote",
                        "value": "Um sistema de observabilidade que dispara 200 alertas por semana tem, na prática, o mesmo efeito de não ter observabilidade nenhuma: ninguém lê."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que é o baseline, no contexto de detecção de anomalias em dados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O valor mínimo aceitável definido manualmente numa expectation do Great Expectations.",
                                "isCorrect": false
                            },
                            {
                                "text": "A primeira execução de um pipeline novo, usada como modelo fixo para todas as cargas futuras.",
                                "isCorrect": false
                            },
                            {
                                "text": "O padrão histórico normal de uma métrica, usado como referência para identificar desvios.",
                                "isCorrect": true
                            },
                            {
                                "text": "O conjunto de regras de acesso que define quem pode consultar uma tabela no warehouse.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma loja online tem um monitor de volume com threshold fixo: alertar se o volume diário cair mais de 30% em relação ao dia anterior. Na sexta-feira de Black Friday o volume sobe 400%; no sábado seguinte, volta ao normal, o que o sistema lê como queda de mais de 30% e dispara um alerta falso. Qual ajuste resolve esse tipo de falso positivo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aumentar o threshold fixo de 30% para 90%, reduzindo a sensibilidade do monitor em todos os dias do ano.",
                                "isCorrect": false
                            },
                            {
                                "text": "Desativar o monitor de volume aos sábados, já que picos sazonais só acontecem em dias de semana.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o monitor de volume por um monitor de schema, que não é afetado por variações sazonais de tráfego.",
                                "isCorrect": false
                            },
                            {
                                "text": "Comparar o volume com o mesmo dia em semanas anteriores, em vez de compará-lo só com o dia anterior.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela recém-criada tem apenas 5 dias de histórico de carga. O time quer um monitor de volume confiável já na primeira semana. Qual é a limitação de usar, desde já, um threshold aprendido para essa tabela?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Com tão pouco histórico, o baseline ainda não é confiável; um threshold fixo funciona melhor por enquanto.",
                                "isCorrect": true
                            },
                            {
                                "text": "Threshold aprendido só funciona em tabelas particionadas por data, o que não se aplica a tabelas recém-criadas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Threshold aprendido exige que a tabela já tenha testes do Great Expectations configurados antes de ser ativado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Threshold aprendido só detecta anomalias de schema, não de volume, então não serviria para esse monitor.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time recebe, em média, 15 alertas por dia de uma ferramenta de observabilidade, a maioria disparada pela mesma tabela crítica sob monitores diferentes (freshness, volume e distribuição, acionados juntos pelo mesmo incidente). O time começa a ignorar o canal de alertas. Qual mudança ataca a causa desse alert fatigue, sem reduzir a cobertura de monitoramento?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Reduzir o número de monitores ativos na tabela crítica, deixando só o monitor de freshness ligado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Agrupar alertas de monitores diferentes que apontam para o mesmo incidente numa única notificação correlacionada.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar a frequência de checagem de cada monitor, para que o alerta chegue mais rápido ao time.",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar os alertas do canal de mensagens para e-mail, já que e-mail tem menor taxa de notificações ignoradas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que um threshold fixo tende a exigir manutenção manual recorrente numa tabela que cresce organicamente mês a mês?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque threshold fixo só pode ser configurado por meio de código, exigindo um deploy a cada alteração de qualquer monitor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque threshold fixo recalcula o baseline automaticamente, o que exige validação manual de cada novo cálculo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o limite foi calibrado para um volume de um momento específico, e não acompanha o crescimento da tabela.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque threshold fixo se aplica apenas ao pilar de schema, e schema muda com frequência em tabelas que crescem.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Data downtime e o incidente de dados",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Data downtime e o incidente de dados\n\nEm observabilidade de sistemas, uptime e downtime medem quanto tempo um serviço ficou disponível. A observabilidade de dados usa uma métrica equivalente: **data downtime**, os períodos em que os dados de uma tabela ou pipeline estão ausentes, incorretos ou incompletos, mesmo que o pipeline em si esteja \"no ar\"."
                    },
                    {
                        "type": "text",
                        "value": "## Como medir data downtime\n\nData downtime não é só \"o incidente aconteceu\": é quanto tempo o dado ficou não confiável, do início do problema até a correção. Duas durações compõem essa conta:\n\n- **Tempo até detectar (TTD)**: quanto tempo passa entre o dado começar a ficar errado e alguém, ou algum monitor, perceber.\n- **Tempo até resolver (TTR)**: quanto tempo passa entre perceber o problema e corrigir a causa, com os dados já reprocessados."
                    },
                    {
                        "type": "code",
                        "value": "Data downtime (aproximado) = numero de incidentes x (TTD + TTR)\n\nExemplo, em um mes:\n  3 incidentes na tabela fct_pedidos\n  tempo medio ate detectar (TTD): 6 horas\n  tempo medio ate resolver (TTR): 4 horas\n\n  data downtime do mes = 3 x (6h + 4h) = 30 horas de dado nao confiavel\n\n  reduzir TTD (monitores melhores) e reduzir TTR (causa raiz mais\n  rapida via lineage) sao as duas alavancas para baixar esse numero"
                    },
                    {
                        "type": "text",
                        "value": "## O ciclo do incidente de dados\n\n- **Detecção**: um monitor dispara, ou alguém do negócio percebe e reporta um número estranho.\n- **Comunicação**: avisar quem consome aquela tabela que ela está sob suspeita, antes que decisões sejam tomadas em cima do dado errado.\n- **Causa raiz**: usar a lineage para navegar upstream, tabela por tabela, até achar onde o problema começou.\n- **Resolução**: corrigir a origem e reprocessar os dados afetados a partir dali.\n- **Prevenção**: registrar um novo teste ou monitor para que esse caso específico não pegue ninguém de surpresa de novo."
                    },
                    {
                        "type": "code",
                        "value": "deteccao --> comunicacao --> causa raiz (lineage) --> resolucao --> prevencao\n    ^                                                                     |\n    |                                                                     |\n    +------------------- volta ao monitoramento continuo ------------------+"
                    },
                    {
                        "type": "text",
                        "value": "## O custo do data downtime\n\nO custo mais visível é o técnico: horas de engenharia apagando incêndio em vez de construir. Mas o mais caro costuma ser outro:\n\n- Decisões erradas tomadas em cima do dado errado antes de alguém perceber, como uma compra de estoque baseada num relatório que já estava incorreto.\n- Perda de confiança: quando um time de negócio deixa de acreditar num dashboard, ele passa a manter planilhas paralelas \"por garantia\", o que é muito mais difícil de reverter do que corrigir uma tabela."
                    },
                    {
                        "type": "quote",
                        "value": "O dado errado que ninguém percebe custa mais caro do que o pipeline que quebra e avisa: o primeiro vira decisão errada antes de virar incidente."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o termo data downtime descreve?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O tempo total que um pipeline de ETL leva para processar e carregar uma nova base de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "O período entre duas execuções agendadas de um mesmo job de ingestão de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Períodos em que o servidor do banco de dados está fisicamente fora do ar, sem aceitar conexões.",
                                "isCorrect": false
                            },
                            {
                                "text": "Períodos em que os dados de uma tabela ou pipeline estão ausentes, incorretos ou incompletos.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Em um mês, uma tabela crítica teve 2 incidentes. No primeiro, o time levou 8 horas para perceber o problema e mais 2 horas para corrigir. No segundo, percebeu em 1 hora e corrigiu em 1 hora. Em qual desses incidentes o dado ficou mais tempo não confiável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "No primeiro, porque data downtime soma tempo até detectar mais tempo até resolver: 10 horas contra 2 horas no segundo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nos dois igualmente, porque o cálculo de data downtime considera apenas o número de incidentes, não a duração de cada um.",
                                "isCorrect": false
                            },
                            {
                                "text": "No segundo, porque ele exigiu duas etapas de correção separadas, o que conta em dobro no cálculo de downtime.",
                                "isCorrect": false
                            },
                            {
                                "text": "No primeiro, mas só por causa do tempo de resolução; o tempo até detectar não entra nesse cálculo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista percebe que o dashboard de receita está 20% abaixo do esperado. Investigando, descobre que fct_receita está correta, mas depende de dim_produtos, que por sua vez depende de uma tabela de origem que teve uma carga incompleta de madrugada. O que permitiu ao analista navegar do sintoma até essa causa raiz?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Um threshold fixo de volume configurado em fct_receita, que aponta diretamente a tabela de origem com defeito.",
                                "isCorrect": false
                            },
                            {
                                "text": "A lineage entre fct_receita, dim_produtos e a tabela de origem, mostrando as dependências entre elas.",
                                "isCorrect": true
                            },
                            {
                                "text": "O catálogo de dados, que lista o responsável por cada tabela envolvida no incidente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um teste do Great Expectations rodado manualmente em cada tabela, até achar a que estava falhando.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Depois de incidentes de dados não detectados a tempo, o time de vendas passa a manter uma planilha paralela, atualizada à mão, porque não confia mais no dashboard oficial. Qual é o principal problema que esse cenário ilustra sobre o custo do data downtime?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O aumento do tempo de resolução do próximo incidente, já que a planilha paralela ficará desatualizada.",
                                "isCorrect": false
                            },
                            {
                                "text": "O custo de armazenamento da planilha paralela, que passa a ocupar espaço adicional no ambiente da empresa.",
                                "isCorrect": false
                            },
                            {
                                "text": "A perda de confiança dos times de negócio nos dados, que passam a manter fontes paralelas por conta própria.",
                                "isCorrect": true
                            },
                            {
                                "text": "A violação direta dos princípios de minimização de dados previstos na LGPD pela nova planilha.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No ciclo do incidente de dados, qual etapa costuma vir logo depois de encontrar a causa raiz via lineage?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A detecção, quando um monitor dispara pela primeira vez indicando que algo está fora do padrão.",
                                "isCorrect": false
                            },
                            {
                                "text": "A prevenção: adicionar um novo teste, sem antes corrigir os dados que já estão errados no warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "A comunicação inicial, avisando os consumidores da tabela de que um problema pode existir.",
                                "isCorrect": false
                            },
                            {
                                "text": "A resolução: corrigir a origem do problema e reprocessar os dados afetados a partir dali.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Ferramentas de observabilidade",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Ferramentas de observabilidade\n\nImplementar os cinco pilares à mão, tabela por tabela (escrever cada monitor, calibrar cada baseline, desenhar o grafo de lineage, correlacionar alertas) não escala para um warehouse com centenas de tabelas. É esse o espaço que as plataformas de observabilidade de dados ocupam."
                    },
                    {
                        "type": "text",
                        "value": "## O que essas plataformas automatizam\n\n- Conexão, geralmente somente leitura, a warehouses e bancos (via metadata e logs de query, muitas vezes sem tocar diretamente no dado).\n- Monitores automáticos para os cinco pilares em toda tabela conectada, sem escrever uma regra manual por tabela.\n- Detecção de anomalia com baseline estatístico pronto, com fallback para regras mais simples enquanto o histórico ainda é curto.\n- Grafo de lineage construído automaticamente a partir do parsing de SQL ou da metadata do próprio warehouse.\n- Correlação de alertas relacionados num único incidente, com um fluxo para investigar e encerrar cada caso."
                    },
                    {
                        "type": "code",
                        "value": "monitor:\n  nome: freshness_pedidos\n  tabela: analytics.fct_pedidos\n  pilar: freshness\n  regra: alertar se atraso maior que 2h\n  baseline: aprendido, ultimos 30 dias\n  notificar: canal-dados-criticos\n\nlineage:\n  origem: parsing automatico do historico de queries SQL\n  atualizacao: continua, sem configuracao manual por tabela"
                    },
                    {
                        "type": "table",
                        "value": "[[\"\", \"Construir (in-house)\", \"Comprar (plataforma)\"], [\"Esforço inicial\", \"Alto: escrever monitor, baseline e lineage do zero\", \"Baixo: conectar o warehouse e configurar\"], [\"Cobertura\", \"Cresce devagar, tabela por tabela\", \"Ampla desde o início, em toda tabela conectada\"], [\"Customização\", \"Total, qualquer regra específica do negócio\", \"Limitada ao que a ferramenta permite configurar\"], [\"Custo recorrente\", \"Tempo de engenharia mantendo o sistema\", \"Licença da ferramenta, em geral por tabela ou uso\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "A plataforma não substitui teste nenhum: ela cobre a superfície que nenhum time teria tempo de escrever teste para, tabela por tabela."
                    },
                    {
                        "type": "text",
                        "value": "## Quando faz sentido cada caminho\n\nConstruir internamente faz sentido quando a regra é muito específica do negócio e já existe capacidade de engenharia dedicada, o que costuma se sobrepor ao que já foi visto com testes do dbt e do Great Expectations no módulo anterior. Comprar tende a vencer quando o objetivo é cobertura ampla, rápida, dos cinco pilares em muitas tabelas de uma vez, exatamente o tipo de trabalho repetitivo que não compensa reconstruir do zero. Na prática, a maioria dos times combina os dois: testes para as regras de negócio conhecidas, plataforma de observabilidade para o que ninguém previu."
                    },
                    {
                        "type": "text",
                        "value": "## Fechamento do módulo\n\nEste módulo saiu do teste (o que você já esperava) para a observabilidade (o que você não previu): os cinco pilares, detecção de anomalias, o incidente de dados e as plataformas que automatizam essa cobertura. O próximo módulo aprofunda um desses pilares, lineage, e apresenta o catálogo de dados: como descobrir, entender e confiar nos dados de uma plataforma inteira."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que uma plataforma de observabilidade de dados tipicamente automatiza, ao ser conectada a um warehouse?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Monitores para os cinco pilares, detecção de anomalia com baseline estatístico e a construção do grafo de lineage.",
                                "isCorrect": true
                            },
                            {
                                "text": "A criação automática de políticas de acesso (RBAC) para cada usuário que consulta uma tabela monitorada.",
                                "isCorrect": false
                            },
                            {
                                "text": "A migração automática de dados de um banco transacional para o warehouse, substituindo o pipeline de ingestão.",
                                "isCorrect": false
                            },
                            {
                                "text": "A escrita automática das regras de negócio específicas de cada tabela, no lugar dos testes do dbt.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa com 40 tabelas no warehouse, um time de dados de 2 pessoas e centenas de dashboards de negócio quer cobertura ampla de freshness e volume o mais rápido possível, sem meses de engenharia dedicados a um sistema de monitoramento próprio. Qual caminho tende a fazer mais sentido nesse cenário?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Construir um sistema interno, já que com apenas 40 tabelas o esforço de desenvolver monitores do zero é sempre menor do que licenciar uma ferramenta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Comprar uma plataforma de observabilidade, que já chega com monitores automáticos e baseline estatístico prontos para conectar ao warehouse.",
                                "isCorrect": true
                            },
                            {
                                "text": "Escrever testes do Great Expectations para as 40 tabelas, já que testes cobrem o mesmo escopo que uma plataforma de observabilidade cobriria.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não investir em nenhuma das duas abordagens, já que um time de 2 pessoas não consegue operar uma ferramenta de observabilidade.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Como a maioria das plataformas de observabilidade de dados constrói o grafo de lineage, sem que alguém precise desenhar manualmente as dependências entre tabelas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Pedindo para cada dono de tabela preencher, num formulário, quais outras tabelas dependem da sua.",
                                "isCorrect": false
                            },
                            {
                                "text": "Copiando a estrutura de pastas do repositório de código do pipeline, que já reflete a ordem exata das dependências.",
                                "isCorrect": false
                            },
                            {
                                "text": "Analisando o histórico de queries SQL executadas e a metadata do warehouse, para inferir as dependências.",
                                "isCorrect": true
                            },
                            {
                                "text": "Executando testes de qualidade em cada tabela e inferindo dependência sempre que dois testes falham no mesmo dia.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Mesmo depois de adotar uma plataforma de observabilidade que cobre os cinco pilares em todas as tabelas, um time continua mantendo um teste do dbt que garante que o status de um pedido só pode ser um entre 6 valores definidos pelo negócio. Por que isso continua fazendo sentido?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque plataformas de observabilidade não conseguem monitorar tabelas que também têm testes configurados no dbt.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a plataforma de observabilidade só funciona em tabelas de staging, e esse teste roda numa tabela de mart.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque testes do dbt são sempre mais baratos de rodar do que qualquer monitor de uma plataforma de observabilidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque é uma regra de negócio conhecida e específica, que a plataforma de observabilidade não adivinha sozinha.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Qual das opções abaixo descreve corretamente uma limitação típica de comprar uma plataforma de observabilidade de dados, em vez de construir algo internamente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A customização fica limitada ao que a ferramenta permite configurar, o que pode não cobrir toda regra muito específica do negócio.",
                                "isCorrect": true
                            },
                            {
                                "text": "A cobertura inicial costuma ser muito mais lenta do que construir um sistema interno, levando meses até monitorar a primeira tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ferramentas compradas não aplicam detecção de anomalia com baseline estatístico, apenas thresholds fixos configurados à mão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Plataformas compradas não conseguem se conectar a mais de um warehouse ao mesmo tempo, exigindo uma licença por banco.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 4 - Data lineage e catálogo",
        "aulas": [
            {
                "titulo": "Data lineage: de onde veio, para onde vai",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Data lineage: de onde veio, para onde vai\n\nLineage é o mapa do caminho que um dado percorre: de qual sistema ele nasceu, por quais transformações passou, e em quais tabelas, dashboards ou modelos ele termina sendo usado. No módulo anterior, lineage apareceu como um dos cinco pilares da observabilidade, e o dbt já gera um grafo de dependências entre modelos (o DAG que `dbt docs generate` mostra). Esta aula amplia essa ideia: lineage como uma capacidade de governança que cobre a plataforma inteira, do sistema de origem ao consumo final, não só o que acontece dentro de um projeto dbt."
                    },
                    {
                        "type": "text",
                        "value": "## Duas perguntas que só lineage responde\n\nNuma plataforma com dezenas de fontes e centenas de tabelas, ninguém guarda o desenho completo do pipeline na cabeça. Lineage existe para responder duas perguntas que aparecem o tempo todo:\n\n- **Análise de impacto** (olhando para frente, rio abaixo): vou remover essa coluna, renomear essa tabela, ou desligar essa fonte, quem quebra?\n- **Análise de causa raiz** (olhando para trás, rio acima): esse número saiu errado no dashboard, de onde ele veio, e em que etapa o erro entrou?\n\nA direção do rastreio muda conforme a pergunta: impacto anda rio abaixo, a partir da origem; causa raiz anda rio acima, a partir do sintoma."
                    },
                    {
                        "type": "code",
                        "value": "Origem                Transformação                      Consumo\n\n[Postgres OLTP]  -->  [Extração/ingestão]  -->  [stg_pedidos]\n  tabela pedidos                                     |\n                                                      v\n                                            [fct_pedidos (dbt)]\n                                                      |\n                                                      v\n                                        [mart_receita_diaria]\n                                           /                  \\\n                                          v                    v\n                          [Dashboard: Receita Diária]   [Modelo de ML: previsão de churn]\n\n# análise de impacto: anda da esquerda para a direita (origem -> consumo)\n# análise de causa raiz: anda da direita para a esquerda (consumo -> origem)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Análise de impacto\", \"Análise de causa raiz\"], [\"Ponto de partida\", \"A origem ou a transformação que vai mudar\", \"O sintoma: um número errado, um dashboard estranho\"], [\"Direção do rastreio\", \"Rio abaixo, até o consumo final\", \"Rio acima, até a origem ou a etapa que falhou\"], [\"Pergunta típica\", \"Se eu mudar isso, o que quebra?\", \"De onde veio esse valor errado?\"], [\"Quem costuma usar\", \"Engenheiro antes de uma mudança de schema\", \"Analista investigando um número que não bate\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Lineage automático x lineage manual\n\nDocumentar lineage à mão (um diagrama num wiki, uma planilha) desatualiza rápido: a cada novo pipeline ou mudança de schema, alguém precisaria lembrar de atualizar o desenho, e isso raramente acontece de forma consistente. Por isso a maioria das plataformas de dados busca lineage **automático**, capturado de uma destas formas:\n\n- **Parsing de SQL**: uma ferramenta lê as queries e os modelos (do dbt, de views, de jobs) e infere as dependências a partir do próprio código.\n- **Leitura de logs de execução**: o motor de consulta registra quais tabelas cada query leu e escreveu, e a ferramenta reconstrói o grafo a partir desses logs.\n- **Eventos emitidos pelas próprias ferramentas**: orquestrador, dbt e motores de processamento publicam eventos de lineage em tempo de execução (o `OpenLineage` é um padrão aberto usado dessa forma).\n\nNenhuma fonte única enxerga o pipeline inteiro: o lineage de ponta a ponta normalmente combina o que a ingestão emite, o que o dbt gera e o que a ferramenta de BI relata sobre o que consome."
                    },
                    {
                        "type": "quote",
                        "value": "Lineage não é um diagrama bonito para reunião: é a resposta rápida para duas perguntas urgentes, o que quebra se eu mudar isso agora, e de onde veio esse número que saiu errado."
                    }
                ],
                "questions": [
                    {
                        "statement": "O dashboard de receita diária mostra um valor claramente errado nesta manhã. Para descobrir em qual etapa do pipeline o erro foi introduzido, o analista precisa rastrear o lineage em qual direção?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Rio acima, do dashboard até a origem, para localizar a etapa que gerou o valor errado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Rio abaixo, da origem até o dashboard, para prever quais relatórios seriam afetados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Lateralmente, comparando o dashboard com outros relatórios que usam a mesma fonte.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reprocessando o pipeline inteiro do zero, sem precisar consultar nenhum lineage.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Antes de descontinuar uma coluna numa tabela de origem, um engenheiro quer saber quais dashboards e modelos dependem dela direta ou indiretamente. Qual prática resolve isso da forma mais direta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Perguntar em cada time se alguém usa a coluna, por mensagem ou reunião.",
                                "isCorrect": false
                            },
                            {
                                "text": "Consultar o lineage da coluna, seguindo o grafo até os consumidores finais.",
                                "isCorrect": true
                            },
                            {
                                "text": "Remover a coluna numa branch de teste e observar quais pipelines falham.",
                                "isCorrect": false
                            },
                            {
                                "text": "Consultar os logs de erro do banco de origem dos últimos 30 dias.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe mantém o mapa de lineage da plataforma como um diagrama manual, atualizado sempre que alguém lembra. Depois de alguns meses, o diagrama já não bate com os pipelines reais. Qual é a causa raiz desse problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Diagramas de lineage feitos à mão têm um limite técnico de tabelas que conseguem representar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ferramentas de desenho de diagramas não conseguem representar dependência entre tabelas.",
                                "isCorrect": false
                            },
                            {
                                "text": "O lineage documentado à mão depende de alguém lembrar de atualizá-lo a cada mudança.",
                                "isCorrect": true
                            },
                            {
                                "text": "O lineage manual só funciona para pipelines batch, nunca para pipelines de streaming.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma plataforma de dados usa um orquestrador, o dbt e uma ferramenta de BI, cada um emitindo ou expondo suas próprias informações de lineage. Para montar o lineage de ponta a ponta, da fonte até o dashboard, o que a organização precisa fazer?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Escolher apenas o lineage do dbt, porque ele já cobre a origem e o consumo final sozinho.",
                                "isCorrect": false
                            },
                            {
                                "text": "Descartar o lineage de cada ferramenta e documentar o pipeline inteiro manualmente do zero.",
                                "isCorrect": false
                            },
                            {
                                "text": "Usar somente os logs do banco de dados de origem, que já registram todo o consumo posterior.",
                                "isCorrect": false
                            },
                            {
                                "text": "Combinar o lineage de cada ferramenta, já que nenhuma delas sozinha enxerga o pipeline inteiro.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um engenheiro consulta o lineage de uma tabela antes de alterar seu schema e confirma que nenhum modelo dbt declarado depende dela. Mesmo assim, um dashboard construído com uma query SQL solta, fora do dbt, direto sobre essa tabela, quebra depois da mudança. O que esse incidente expõe sobre o lineage consultado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O lineage cobria só as dependências que a ferramenta usada era capaz de capturar, nada além.",
                                "isCorrect": true
                            },
                            {
                                "text": "O lineage estava correto; o dashboard quebrou por um motivo sem relação com a mudança de schema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Lineage nunca detecta dependências entre tabelas, apenas entre colunas individuais.",
                                "isCorrect": false
                            },
                            {
                                "text": "O dashboard deveria ter sido migrado para dentro do projeto dbt antes de qualquer consulta.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Lineage de tabela x de coluna",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Lineage de tabela x de coluna\n\nO lineage visto na aula anterior pode ser capturado em duas granularidades bem diferentes: no nível da **tabela** (que tabelas alimentam quais) ou no nível da **coluna** (que coluna específica vira qual coluna específica, depois de qual transformação). As duas respondem à mesma pergunta de fundo, origem e destino do dado, mas com precisão e custo muito diferentes."
                    },
                    {
                        "type": "text",
                        "value": "## Lineage de tabela: a visão de conjunto\n\nLineage de tabela mostra dependências entre tabelas (ou modelos, ou jobs) sem entrar no detalhe de quais colunas participam. É a granularidade mais barata de obter: em geral basta ler as dependências declaradas nos jobs, no grafo do dbt ou nos logs de execução, sem precisar entender o que cada instrução SQL faz por dentro. É também a mais fácil de visualizar: um mapa com centenas de tabelas já é denso; um mapa com milhares de colunas cruzando entre si fica ilegível."
                    },
                    {
                        "type": "code",
                        "value": "Lineage de TABELA (visão de conjunto):\n\n[pedidos_raw] --> [stg_pedidos] --> [fct_pedidos] --> [mart_receita]\n\n# responde: fct_pedidos depende de stg_pedidos? depende.\n# não responde: qual coluna de mart_receita vem de qual coluna de pedidos_raw?"
                    },
                    {
                        "type": "text",
                        "value": "## Lineage de coluna: a visão precisa\n\nLineage de coluna rastreia uma coluna específica através de cada transformação, mostrando exatamente qual expressão gerou qual campo de saída. Para isso, a ferramenta precisa entender o que cada instrução faz, não só que existe uma dependência entre duas tabelas: interpretar o SELECT, saber que `valor_bruto * taxa_cambio` virou `valor_usd`, que um `CASE WHEN` gerou uma coluna derivada, que um JOIN combinou campos de duas origens diferentes. Isso custa mais caro (parsing do SQL real, não só metadado de dependência) e quebra com mais facilidade diante de SQL dinâmico, UDFs ou lógica muito aninhada."
                    },
                    {
                        "type": "code",
                        "value": "Lineage de COLUNA (zoom numa única aresta):\n\npedidos_raw.valor_bruto  --[valor_bruto * taxa_cambio]-->  stg_pedidos.valor_usd\npedidos_raw.moeda        --[usada só na transformação acima, não vira coluna de saída]\n\nstg_pedidos.valor_usd    --[SUM(valor_usd) agrupado por dia]-->  fct_pedidos.receita_dia\nfct_pedidos.receita_dia  --[copia direta]-->  mart_receita.total_receita\n\n# responde: mart_receita.total_receita vem, no fim, de pedidos_raw.valor_bruto e pedidos_raw.moeda"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Lineage de tabela\", \"Lineage de coluna\"], [\"O que mostra\", \"Quais tabelas alimentam quais\", \"Qual coluna de origem vira qual coluna de destino\"], [\"Custo de obter\", \"Baixo: dependências declaradas ou nos logs\", \"Alto: exige entender a lógica de cada transformação\"], [\"Robustez\", \"Resiste bem a SQL complexo e UDFs\", \"Pode falhar com SQL dinâmico, UDFs ou lógica muito aninhada\"], [\"Uso típico\", \"Visão geral, onboarding, saber se um pipeline depende de uma fonte\", \"Impacto preciso de uma mudança, rastrear um dado sensível ponta a ponta\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Lineage de tabela diz que duas tabelas se relacionam; lineage de coluna diz exatamente qual pedaço de uma virou qual pedaço da outra. A segunda pergunta só vale a pena quando a resposta grosseira da primeira não é suficiente."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um analista recém-chegado ao time quer entender, de forma geral, quais das 40 tabelas do data warehouse alimentam o pipeline de vendas, sem precisar ainda saber o destino de cada coluna individual. Qual granularidade de lineage atende essa necessidade com o menor custo?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Lineage de coluna, porque só ela consegue mostrar dependências entre tabelas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Lineage de tabela, que já mostra as dependências entre as tabelas do pipeline.",
                                "isCorrect": true
                            },
                            {
                                "text": "Um mapa de arquitetura de sistemas, mantido pelo time de infraestrutura.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um perfil de dados (data profiling), que lista as colunas de cada tabela isoladamente.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma engenheira vai remover a coluna `desconto_percentual` de uma tabela de origem. Ela já sabe, pelo lineage de tabela, que cinco tabelas downstream dependem dessa tabela de origem, mas não sabe se alguma delas realmente usa essa coluna específica. O que o lineage de coluna acrescenta que o lineage de tabela não mostra?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Se as cinco tabelas downstream dependem, no total, da tabela de origem, sem detalhar colunas.",
                                "isCorrect": false
                            },
                            {
                                "text": "O nome de todas as colunas que existem hoje nas cinco tabelas downstream, sem exceção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Se e onde a coluna `desconto_percentual` chega a alimentar colunas das tabelas downstream.",
                                "isCorrect": true
                            },
                            {
                                "text": "Quantas linhas de cada tabela downstream seriam afetadas pela remoção da coluna.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe ativa lineage de coluna para o data warehouse inteiro. Meses depois, percebe que vários trechos do grafo ficam incompletos exatamente nos modelos que usam SQL dinâmico e funções customizadas (UDFs). Por que isso acontece com mais frequência no lineage de coluna do que no de tabela?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Lineage de coluna só funciona em bancos de dados que não suportam funções customizadas.",
                                "isCorrect": false
                            },
                            {
                                "text": "SQL dinâmico e UDFs impedem qualquer tipo de lineage, inclusive o de tabela, de funcionar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O grafo ficou incompleto porque a equipe esqueceu de renomear as colunas antes de ativar o recurso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Lineage de coluna depende de interpretar a lógica de cada transformação, algo que UDFs dificultam.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um pedido de auditoria pergunta por todos os lugares do data warehouse onde o CPF de um cliente, capturado originalmente numa única tabela de cadastro, acaba aparecendo, direta ou indiretamente, depois de todas as transformações. Qual granularidade de lineage responde essa pergunta com precisão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Lineage de coluna, seguindo especificamente o campo de CPF através de cada transformação.",
                                "isCorrect": true
                            },
                            {
                                "text": "Lineage de tabela, já que basta saber quais tabelas dependem da tabela de cadastro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma forma de lineage rastreia colunas de identificação pessoal, apenas colunas numéricas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um dicionário de dados estático, atualizado manualmente uma vez por trimestre.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O grafo de lineage de tabela do dbt mostra que `mart_receita` depende só de `fct_pedidos`. Um lineage de coluna, que interpreta o SQL compilado de fato, revela uma aresta adicional: `mart_receita.moeda_padrao` também vem de `dim_taxa_cambio`. Investigando, a equipe descobre que o modelo consulta `dim_taxa_cambio` direto pelo nome da tabela no SQL, sem passar por `{{ ref() }}`. O que essa diferença revela sobre lineage baseado só em `ref()` comparado a um lineage que interpreta o SQL de fato?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O dbt sempre detecta qualquer dependência entre tabelas, independente de usar `ref()` ou o nome direto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Lineage baseado só em `ref()` perde dependências reais que não foram declaradas dessa forma.",
                                "isCorrect": true
                            },
                            {
                                "text": "`ref()` serve apenas para formatar o SQL, sem nenhuma relação com o grafo de lineage do dbt.",
                                "isCorrect": false
                            },
                            {
                                "text": "Lineage de coluna e lineage baseado em `ref()` sempre chegam ao mesmo resultado, sem exceção.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O catálogo de dados",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O catálogo de dados\n\nNuma plataforma madura, é comum existirem centenas de tabelas, dezenas de dashboards e vários modelos de machine learning, espalhados entre o data warehouse, o lake e ferramentas de BI. Sem um lugar central para procurar, a pergunta mais básica, se esse dado existe e onde, vira uma série de mensagens em canais de chat até alguém lembrar. O **catálogo de dados** é o inventário central desses ativos: o que existe, o que significa, quem é o dono, e se dá para confiar."
                    },
                    {
                        "type": "text",
                        "value": "## Descobrir, entender, confiar\n\nUm catálogo de dados existe para responder três perguntas, nessa ordem:\n\n- **Descobrir**: esse dado existe? Em qual tabela, de qual sistema?\n- **Entender**: o que cada campo significa, quem é o dono, quando foi atualizado pela última vez?\n- **Confiar**: esse dado é bom o suficiente para eu usar agora, com testes passando e lineage rastreável até a origem?\n\nSem a primeira pergunta respondida, as outras duas nem chegam a ser feitas: é comum um time recriar uma tabela que já existe, só porque não sabia que ela estava lá."
                    },
                    {
                        "type": "text",
                        "value": "## Metadados técnicos e metadados de negócio\n\nO catálogo reúne dois tipos de metadado sobre o mesmo ativo. **Metadados técnicos** vêm do próprio sistema: schema, tipos de coluna, particionamento, contagem de linhas, data da última atualização, o lineage técnico das aulas anteriores. Em geral são coletados automaticamente, por conectores que leem o warehouse, o dbt ou o motor de processamento. **Metadados de negócio** vêm de pessoas: uma descrição em linguagem simples do que a tabela representa, quem é o dono ou o steward responsável, tags de classificação, termos do glossário associados (próxima aula). Um catálogo completo precisa dos dois: metadado técnico sem contexto de negócio ainda deixa sem resposta a pergunta se dá para confiar no dado."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de metadado\", \"Exemplos\", \"Como costuma chegar ao catálogo\"], [\"Técnico\", \"Schema, tipos, partições, linhas, última atualização, lineage\", \"Coletado automaticamente por conectores\"], [\"De negócio\", \"Descrição, dono/steward, tags, termos do glossário\", \"Curado por pessoas, às vezes sugerido automaticamente\"]]"
                    },
                    {
                        "type": "code",
                        "value": "Busca no catálogo: \"pedidos\"\n\n> mart_receita.pedidos_diarios                          [verificado]\n  Tabela  |  Dono: time de Dados  |  Atualizado: há 2h\n  Descrição: total de pedidos e receita, agregado por dia\n  Qualidade: 14/14 testes passando  |  Lineage: 3 fontes upstream\n  Usada por: 8 dashboards, 2 modelos de ML\n\n> stg_pedidos_raw                                       [não verificado]\n  Tabela  |  Dono: não definido  |  Atualizado: há 3 dias\n  Descrição: (sem descrição)\n  Qualidade: sem testes configurados"
                    },
                    {
                        "type": "text",
                        "value": "## Por que o catálogo do warehouse (`information_schema`) não basta\n\nTodo data warehouse já tem seu próprio catálogo técnico embutido, consultável via `information_schema` ou equivalente: schemas, tabelas, colunas, tipos. Isso não substitui um catálogo de dados por dois motivos. Primeiro, escopo: `information_schema` só enxerga aquele warehouse, enquanto a plataforma real também tem um lake, uma ferramenta de BI e talvez outro warehouse. Segundo, contexto: `information_schema` não sabe quem é o dono de uma tabela, o que ela significa para o negócio, nem se algum teste de qualidade está passando. Um catálogo de dados agrega metadado técnico de várias fontes e adiciona a camada de negócio que nenhum sistema, sozinho, tem motivo para guardar."
                    },
                    {
                        "type": "quote",
                        "value": "Um catálogo de dados é o Google dos dados internos: não é só uma lista de tabelas, é a resposta rápida para descobrir que o dado existe, entender o que ele significa e confiar que ele está certo antes de usar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um analista passa dois dias construindo uma tabela agregada de vendas por região, sem saber que um colega de outro time já havia criado exatamente essa tabela três meses antes. Qual capacidade do catálogo de dados evita esse retrabalho?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Entender: ler a documentação técnica completa da tabela que ainda seria criada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Confiar: verificar se os testes de qualidade da nova tabela passariam antes de criá-la.",
                                "isCorrect": false
                            },
                            {
                                "text": "Descobrir: buscar no catálogo antes de construir, e encontrar que o dado já existe.",
                                "isCorrect": true
                            },
                            {
                                "text": "Classificação de dados: marcar a tabela como confidencial antes mesmo de criá-la.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao cadastrar uma tabela no catálogo, a equipe registra o schema com os tipos de cada coluna (automaticamente, via conector) e, à parte, uma descrição em linguagem simples do que a tabela representa e quem é o dono. A segunda parte corresponde a qual tipo de metadado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Metadado técnico, porque toda informação registrada no catálogo é, por definição, técnica.",
                                "isCorrect": false
                            },
                            {
                                "text": "Metadado de lineage, porque descrição e dono fazem parte do rastreio de origem da tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Metadado de qualidade, porque descrição e dono são usados para calcular testes de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Metadado de negócio, curado por pessoas, complementando o que o conector já capturou sozinho.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa tem dados espalhados entre um data warehouse, um data lake e uma ferramenta de BI. Alguém sugere que consultar o `information_schema` do warehouse já seria suficiente como catálogo de dados da empresa. Qual é o problema direto dessa sugestão?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O `information_schema` só enxerga o warehouse, deixando de fora o lake e a ferramenta de BI.",
                                "isCorrect": true
                            },
                            {
                                "text": "O `information_schema` não existe na maioria dos data warehouses modernos usados hoje.",
                                "isCorrect": false
                            },
                            {
                                "text": "Consultar o `information_schema` exige permissões que nenhum analista jamais recebe.",
                                "isCorrect": false
                            },
                            {
                                "text": "O `information_schema` só mostra tabelas vazias, sem nenhum dado real armazenado nelas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "No catálogo, um analista encontra duas tabelas candidatas para um relatório: uma marcada como verificada, com dono definido e testes de qualidade passando, e outra sem dono, sem descrição e sem nenhum teste configurado. Sem outra informação, qual sinal do catálogo deveria pesar mais na escolha?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nenhum sinal deveria pesar, já que as duas tabelas certamente têm os mesmos dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "O selo de verificação, o dono definido e os testes passando, indicando maior confiabilidade.",
                                "isCorrect": true
                            },
                            {
                                "text": "O nome da tabela, escolhendo sempre a que aparece primeiro na ordem alfabética da busca.",
                                "isCorrect": false
                            },
                            {
                                "text": "O tamanho da tabela, escolhendo sempre a que tem mais linhas armazenadas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe já instrumentou lineage de coluna para todo o warehouse e diz que isso torna desnecessário adotar um catálogo de dados separado. Qual lacuna essa visão deixa de considerar?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Lineage de coluna já inclui, por definição, descrição de negócio e dono de cada tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um catálogo de dados serve apenas para armazenar o mesmo grafo que o lineage já mostra.",
                                "isCorrect": false
                            },
                            {
                                "text": "Lineage mostra de onde o dado veio, mas não a busca, a descrição e o dono que um catálogo reúne.",
                                "isCorrect": true
                            },
                            {
                                "text": "Lineage e catálogo são exatamente a mesma capacidade, com nomes diferentes por convenção de mercado.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Glossário de negócio",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Glossário de negócio\n\nCliente ativo parece um termo simples, até duas áreas calcularem números diferentes para ele no mesmo trimestre. Marketing conta quem fez login nos últimos 30 dias; financeiro conta quem tem fatura paga nos últimos 90 dias. As duas apresentam um número chamado clientes ativos numa reunião, os números não batem, e a discussão vira sobre qual time está errado, quando o problema real é que nunca existiu uma única definição acordada."
                    },
                    {
                        "type": "code",
                        "value": "Marketing:                                    Financeiro:\n\nSELECT COUNT(*)                               SELECT COUNT(*)\nFROM usuarios                                 FROM clientes\nWHERE ultimo_login >= hoje - 30                WHERE tem_fatura_paga_em(hoje - 90)\n\nresultado: 12.450 clientes ativos             resultado: 9.870 clientes ativos\n\n# mesmo nome, mesma reunião, duas definições diferentes de \"ativo\"\n# sem glossário, nenhuma das duas está errada: só nunca foram combinadas"
                    },
                    {
                        "type": "text",
                        "value": "## O que entra num termo do glossário\n\nUm glossário de negócio é a lista central de termos, cada um com uma única definição acordada entre as áreas que o usam. Um bom termo de glossário registra:\n\n- **Nome** do termo, como as pessoas realmente falam no dia a dia.\n- **Definição** em linguagem simples, sem depender de SQL para ser entendida.\n- **Dono/steward**: quem tem autoridade para aprovar mudanças nessa definição.\n- **Termos relacionados e sinônimos**, para quem busca com outra palavra.\n- **Link para o dado físico**: qual tabela, coluna ou métrica implementa essa definição de fato.\n\nO último ponto é o que separa um glossário útil de um documento esquecido num wiki."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Termo\", \"Definição\", \"Dono\", \"Implementação\"], [\"Cliente ativo\", \"Fez login ou teve uma transação nos últimos 60 dias\", \"Time de Growth\", \"mart_clientes.flag_ativo\"], [\"Receita reconhecida\", \"Valor de pedidos entregues e não cancelados no período\", \"Financeiro\", \"fct_receita.valor_reconhecido\"], [\"Churn\", \"Cliente ativo que deixou de logar ou transacionar há mais de 60 dias\", \"Time de Growth\", \"mart_clientes.flag_churn\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Ligar o termo ao dado físico\n\nUm termo de glossário sem link para uma tabela ou métrica concreta é só um parágrafo bonito: continua deixando cada time livre para implementar a própria versão em SQL, exatamente o problema que gerou o conflito do início da aula. Ligar o termo ao dado físico, apontando para a coluna, tabela ou métrica que efetivamente calcula aquela definição, é o que fecha o ciclo: qualquer dashboard que usar cliente ativo aponta para a mesma implementação, e mudar a definição significa mudar num lugar só."
                    },
                    {
                        "type": "quote",
                        "value": "Um glossário sem link para o dado físico é documentação; um glossário ligado à implementação é a garantia de que dois times, ao dizerem cliente ativo, estão falando exatamente do mesmo número."
                    },
                    {
                        "type": "text",
                        "value": "## Quem mantém o glossário\n\nCriar ou mudar a definição de um termo não é livre: costuma passar por um dono ou steward do domínio de negócio daquele termo (financeiro aprova receita reconhecida, growth aprova cliente ativo), com histórico de versões para quem quiser ver como a definição mudou ao longo do tempo. Esse processo de decisão é parte de um tema maior, governança de dados, tratado no próximo módulo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Marketing e financeiro apresentam números diferentes de clientes ativos na mesma reunião, cada um usando sua própria definição em SQL. Qual prática de governança ataca diretamente a causa desse conflito?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Pedir para os dois times pararem de calcular a métrica até um deles desistir.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar a frequência de atualização das duas tabelas usadas em cada cálculo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar as duas consultas para rodar no mesmo motor de banco de dados usado hoje.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criar um termo de glossário com definição única de cliente ativo entre os times.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "O termo receita reconhecida está documentado no glossário com uma definição clara, mas sem nenhum link para a tabela ou coluna que a implementa. Seis meses depois, três dashboards diferentes calculam receita reconhecida de formas ligeiramente diferentes entre si. O que a ausência do link explica sobre esse resultado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sem apontar para uma implementação única, nada impede que cada dashboard implemente do seu jeito.",
                                "isCorrect": true
                            },
                            {
                                "text": "O glossário em si já garante consistência entre dashboards, independente de haver um link ou não.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dashboards diferentes sempre calculam métricas de forma diferente, com ou sem glossário.",
                                "isCorrect": false
                            },
                            {
                                "text": "A definição escrita estava incorreta, e por isso cada dashboard corrigiu por conta própria.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um novo integrante do time confunde o glossário de negócio com o catálogo de dados, achando que são a mesma coisa com nomes diferentes. Qual explicação separa corretamente os dois?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "São mesmo a mesma coisa: todo catálogo de dados é, por definição, um glossário de negócio.",
                                "isCorrect": false
                            },
                            {
                                "text": "O glossário define termos de negócio; o catálogo é o inventário de tabelas, dashboards e outros ativos.",
                                "isCorrect": true
                            },
                            {
                                "text": "O glossário lista tabelas técnicas; o catálogo lista apenas definições de métricas de negócio.",
                                "isCorrect": false
                            },
                            {
                                "text": "A diferença é só de nome: ferramentas comerciais chamam de catálogo, internas chamam de glossário.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um analista de marketing quer mudar sozinho, direto na documentação, a definição de cliente ativo no glossário, porque discorda do critério atual. Qual é o problema dessa mudança, do ponto de vista de governança de termos?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não existe problema: qualquer pessoa que discorde de uma definição pode alterá-la livremente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O problema é técnico: só o time de engenharia de dados tem permissão de editar texto no glossário.",
                                "isCorrect": false
                            },
                            {
                                "text": "A mudança ignora o dono/steward do termo, que deveria aprovar qualquer alteração na definição acordada.",
                                "isCorrect": true
                            },
                            {
                                "text": "O problema é que definições de glossário, uma vez escritas, nunca podem ser alteradas depois.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O termo cliente ativo no glossário aponta para a coluna `mart_clientes.flag_ativo`. Um engenheiro cria um segundo modelo dbt que recalcula esse mesmo conceito com uma lógica ligeiramente diferente, numa coluna nova, sem atualizar o glossário nem reaproveitar a coluna existente. Qual risco esse cenário reintroduz, mesmo com o glossário já existindo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Nenhum risco: a existência prévia do glossário impede, por si só, qualquer nova implementação divergente.",
                                "isCorrect": false
                            },
                            {
                                "text": "O risco de o dbt rejeitar a criação do segundo modelo, por já existir um termo de glossário aprovado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O risco de a coluna original `flag_ativo` ser apagada automaticamente diante da nova implementação.",
                                "isCorrect": false
                            },
                            {
                                "text": "O risco de duas implementações passarem a calcular cliente ativo de formas diferentes entre si.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Ferramentas de catálogo",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Ferramentas de catálogo\n\nTudo que as três aulas anteriores descreveram, inventário pesquisável, lineage de tabela e de coluna, glossário de negócio, precisa de um sistema por trás que colete, armazene e sirva esses metadados. Esta aula olha, em conceito e sem se prender a uma única ferramenta, para o que soluções como DataHub, OpenMetadata e Unity Catalog resolvem e como cada uma tende a se encaixar."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Ferramenta\", \"Origem\", \"Modelo de ingestão predominante\", \"Onde tende a se encaixar melhor\"], [\"DataHub\", \"Código aberto, criado no LinkedIn\", \"Eventos (push), com conectores também\", \"Stacks heterogêneas que priorizam metadado quase em tempo real\"], [\"OpenMetadata\", \"Código aberto, projeto independente\", \"Conectores agendados (pull)\", \"Stacks heterogêneas priorizando simplicidade de operar\"], [\"Unity Catalog\", \"Databricks, integrado ao lakehouse\", \"Nativo: é o próprio catálogo do lakehouse\", \"Ambientes já centrados em Databricks\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Pull x push na ingestão de metadados\n\nUm catálogo precisa manter seus metadados atualizados conforme a plataforma muda, e existem dois jeitos de fazer isso chegar até ele. No modelo **pull**, um conector agendado se conecta periodicamente a cada fonte (o warehouse, o dbt, a ferramenta de BI) e varre os metadados atuais, de tempos em tempos. É simples de configurar e não exige mudar nada nas fontes, mas os metadados ficam tão frescos quanto a última varredura. No modelo **push**, cada ferramenta da stack emite um evento de metadado assim que algo acontece (uma tabela foi criada, um job rodou, um schema mudou), e o catálogo apenas escuta. Fica mais fresco, mas exige que as fontes estejam instrumentadas para emitir esses eventos."
                    },
                    {
                        "type": "code",
                        "value": "Modelo PULL (conectores agendados):\n\n[Catálogo]  --a cada 6h-->  [Warehouse]\n    |       --a cada 6h-->  [dbt manifest]\n    |       --a cada 6h-->  [Ferramenta de BI]\n    v\nmetadados tão frescos quanto a última varredura\n\nModelo PUSH (eventos emitidos pelas fontes):\n\n[Warehouse] --evento: tabela criada-->      [Catálogo]\n[dbt]       --evento: job rodou-->          [Catálogo]\n[BI]        --evento: dashboard publicado-->[Catálogo]\n\nmetadados atualizados no momento em que o evento acontece"
                    },
                    {
                        "type": "text",
                        "value": "## Metadados como cidadão de primeira classe\n\nNas três ferramentas, a ideia central é a mesma: metadado deixa de ser um efeito colateral (uma descrição esquecida num README) e passa a ser um dado tratado com a mesma seriedade dos dados que ele descreve. Isso aparece em detalhes concretos: metadado tem API própria (outros sistemas podem ler e escrever nele, não só visualizar numa tela), tem histórico de mudanças, dispara notificações quando algo relevante muda (um schema, uma definição de glossário), e é ele mesmo testável e observável, com dono e ciclo de vida definidos, do mesmo jeito que uma tabela de produção."
                    },
                    {
                        "type": "text",
                        "value": "## O que as três têm em comum\n\nApesar das diferenças de origem e modelo de ingestão, DataHub, OpenMetadata e Unity Catalog cobrem o mesmo conjunto central de capacidades vistas nas aulas anteriores: catálogo pesquisável, lineage (em geral de tabela, com suporte crescente a coluna), glossário de negócio, e busca. Unity Catalog vai além desse conjunto porque, sendo o catálogo nativo do lakehouse, também é o ponto onde o controle de acesso é aplicado de fato, não só documentado, um tema do próximo módulo."
                    },
                    {
                        "type": "quote",
                        "value": "A ferramenta certa não é a mais nova nem a mais completa numa lista de recursos: é a que se encaixa no quanto a stack já é centrada num único fornecedor e no quão fresco o metadado precisa estar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Uma empresa opera um lakehouse inteiramente em Databricks, sem outros warehouses ou motores de processamento na stack. Qual ferramenta de catálogo tende a se encaixar com menos atrito nesse cenário?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Unity Catalog, por já ser o catálogo nativo do lakehouse Databricks.",
                                "isCorrect": true
                            },
                            {
                                "text": "DataHub, por ser a única das três com suporte a ambientes Databricks.",
                                "isCorrect": false
                            },
                            {
                                "text": "OpenMetadata, por exigir menos conectores quando a stack é de um único fornecedor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma das três, já que ambientes Databricks não usam catálogo de dados externo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe precisa que o catálogo reflita uma mudança de schema em minutos, não em horas, assim que ela acontece no warehouse. Qual modelo de ingestão de metadados atende melhor essa exigência?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Pull, porque conectores agendados sempre rodam a cada poucos segundos, por padrão.",
                                "isCorrect": false
                            },
                            {
                                "text": "Push, porque a fonte emite um evento assim que a mudança ocorre, sem esperar varredura.",
                                "isCorrect": true
                            },
                            {
                                "text": "Pull, porque esse modelo não depende de nenhum agendamento para atualizar o catálogo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum dos dois modelos consegue refletir mudanças de schema em menos de um dia.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um arquiteto descreve o princípio de metadado como cidadão de primeira classe, adotado por ferramentas de catálogo modernas. Qual prática melhor ilustra esse princípio?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Guardar a descrição de cada tabela num README separado, fora de qualquer sistema consultável.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tratar metadado como algo opcional, preenchido só quando alguém tem tempo disponível.",
                                "isCorrect": false
                            },
                            {
                                "text": "Expor o metadado por API própria, com histórico de mudanças e dono definido, como um dado real.",
                                "isCorrect": true
                            },
                            {
                                "text": "Gerar o metadado uma única vez, na criação da tabela, sem nenhuma atualização posterior.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe avalia DataHub, OpenMetadata e Unity Catalog e quer saber qual conjunto de capacidades as três ferramentas compartilham, independente da origem ou do modelo de ingestão de cada uma. Qual alternativa descreve corretamente esse núcleo comum?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nenhuma capacidade em comum: as três resolvem problemas completamente diferentes entre si.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas orquestração de pipelines, já que catálogo é uma função secundária nas três ferramentas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Apenas controle de acesso, que é a função central e exclusiva de qualquer catálogo de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Catálogo pesquisável, lineage, glossário de negócio e busca, presentes nas três ferramentas.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um time migra de um ambiente heterogêneo (vários warehouses e um lake) para um lakehouse centrado em Databricks, e decide adotar Unity Catalog no lugar do DataHub que usava antes. Além de catálogo, lineage e glossário, o que passa a existir de diferente, que o DataHub, sozinho, não fazia?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "O controle de acesso passa a ser aplicado de fato pelo próprio catálogo, não só documentado nele.",
                                "isCorrect": true
                            },
                            {
                                "text": "O lineage de coluna passa a existir pela primeira vez, já que o DataHub nunca ofereceu esse recurso.",
                                "isCorrect": false
                            },
                            {
                                "text": "A busca por tabelas deixa de existir, já que o Unity Catalog não indexa nomes de tabelas.",
                                "isCorrect": false
                            },
                            {
                                "text": "O glossário de negócio deixa de ser necessário, substituído inteiramente pelo controle de acesso.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 5 - Governança de dados",
        "aulas": [
            {
                "titulo": "O que é governança de dados",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O que é governança de dados\n\nNos módulos anteriores desta trilha você viu como medir qualidade (as dimensões, os testes), como detectar o que quebra sem avisar (observabilidade) e como saber de onde um dado vem e o que ele significa (linhagem e catálogo). São capacidades técnicas: rodam em uma ferramenta, produzem um número ou um grafo. Governança de dados é a camada que decide como essas capacidades são usadas: quem pode mudar a definição de cliente ativo, quem é avisado quando uma tabela crítica atrasa, quem autoriza o acesso a uma coluna com CPF. Sem essa camada, um catálogo bem povoado e testes verdes convivem tranquilamente com dado que ninguém confia."
                    },
                    {
                        "type": "text",
                        "value": "## Não é ferramenta, é organização\n\nÉ comum um time comprar uma ferramenta de catálogo ou de observabilidade e tratar isso como governança implantada. A ferramenta ajuda, mas não cria sozinha o que governança realmente exige: alguém responsável por cada domínio de dados, um processo para decidir o que fazer quando duas áreas discordam sobre uma métrica, e uma política que vale para a empresa inteira, não só para quem lembrou de segui-la. Governança de dados é o conjunto de pessoas, processos e políticas que garante que o dado seja confiável, seguro e bem usado. A tecnologia registra e automatiza essas decisões, mas quem decide continua sendo gente."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Pilar\", \"Pergunta que ele responde\", \"Exemplo\"], [\"Pessoas\", \"Quem é responsável pelo dado?\", \"O data owner do domínio Vendas, o data steward de Clientes\"], [\"Processo\", \"Como uma decisão sobre o dado é tomada?\", \"O fluxo de aprovação para publicar uma métrica como oficial\"], [\"Política\", \"Qual regra vale para todo mundo, sempre?\", \"Toda tabela com CPF é classificada como restrita\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Tecnologia documenta o dado que existe; governança decide quem tem autoridade para dizer o que ele significa e quem pode usá-lo."
                    },
                    {
                        "type": "code",
                        "value": "Estrutura típica de governança de dados\n\nConselho de governança (dados, negócio, jurídico, segurança)\n        |\n        define políticas gerais: acesso, retenção, classificação\n        v\nData owner (domínio Vendas)          Data owner (domínio Clientes)\n        |                                      |\n        v                                      v\nData steward (qualidade e definição)   Data steward (qualidade e definição)\n        |                                      |\n        v                                      v\nTimes consumidores: analytics, produto, financeiro, suporte"
                    },
                    {
                        "type": "text",
                        "value": "## O custo de não ter governança\n\nO sintoma mais comum de falta de governança não é um incidente espetacular, é um desgaste silencioso: duas áreas apresentam números diferentes para a mesma métrica na reunião de diretoria, ninguém sabe quem aprova acesso a uma tabela nova, um relatório crítico fica órfão porque a pessoa que o mantinha saiu da empresa. Nada disso aparece em um teste de qualidade ou em um alerta de observabilidade, porque o dado em si pode estar tecnicamente correto. O problema é a ausência de alguém com autoridade para decidir o significado, o acesso e a prioridade daquele dado."
                    },
                    {
                        "type": "text",
                        "value": "## O que vem a seguir\n\nGovernança começa a virar prática quando existe um nome ao lado de cada domínio de dados, alguém que responde quando o dado quebra e alguém que cuida da qualidade no dia a dia. É o que as próximas aulas deste módulo detalham: ownership e stewardship, um jeito diferente de organizar esses papéis (data mesh), como classificar dados por sensibilidade e como transformar tudo isso em política, padrão e cultura."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual alternativa descreve melhor o que é governança de dados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O conjunto de pessoas, processos e políticas que torna o dado confiável, seguro e bem usado.",
                                "isCorrect": true
                            },
                            {
                                "text": "A ferramenta de catálogo que documenta as tabelas, colunas e donos de cada conjunto de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "O conjunto de testes automatizados que confirma se cada tabela está com a qualidade esperada.",
                                "isCorrect": false
                            },
                            {
                                "text": "O mapeamento da origem e do destino de cada dado ao longo dos pipelines da empresa.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Vendas e Financeiro apresentam números diferentes de clientes ativos na mesma reunião de diretoria, porque cada área usa uma definição própria do que é cliente ativo. Isso é sobretudo sintoma de falta de que?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Observabilidade: o pilar de schema não detectou a divergência entre as duas consultas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Governança: nenhuma definição de cliente ativo foi acordada como oficial entre as áreas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Teste de dados: nenhuma expectation valida o valor da coluna de status do cliente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Linhagem: nenhuma das áreas sabe de qual tabela de origem os números vieram.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time comprou uma ferramenta de catálogo e um pipeline de observabilidade, mas seis meses depois as tabelas continuam sem dono definido e ninguém sabe de quem cobrar quando o dado atrasa. O que falta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Mais testes automatizados de qualidade, cobrindo completude e unicidade das tabelas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Linhagem em nível de coluna, mostrando de onde cada campo realmente vem.",
                                "isCorrect": false
                            },
                            {
                                "text": "A camada de governança: papéis, donos e um processo que faça alguém responder pelo dado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Mais observabilidade de volume e distribuição, para detectar o atraso mais cedo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual alternativa descreve melhor o papel da tecnologia, como catálogo e observabilidade, dentro da governança de dados?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ela é o pilar mais importante: sem uma ferramenta de catálogo não existe governança de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela substitui a necessidade de donos de dados, porque o catálogo já registra a origem de tudo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela é irrelevante para a governança, que depende só de comitês e políticas escritas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ela viabiliza e escala a governança, mas não substitui donos de dados nem processos definidos.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Por que instalar uma ferramenta de catálogo de dados não é, sozinho, o mesmo que ter governança de dados implantada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque a ferramenta organiza e documenta, mas não garante donos, processos e políticas seguidos de fato.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque catálogo é sinônimo de segurança da informação, e governança trata só da qualidade dos dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque toda ferramenta de catálogo cobre apenas metadados técnicos, nunca tabelas usadas pelo negócio.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque catálogo e governança são exatamente a mesma capacidade, só que com nomes diferentes.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Ownership e data stewardship",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Ownership e data stewardship\n\nGovernança de dados só sai do papel quando existe gente com nome e sobrenome ao lado de cada domínio. Duas funções fazem esse trabalho de formas diferentes e complementares: o data owner, que responde pelo dado de um domínio, e o data steward, que cuida da qualidade e da definição desse dado no dia a dia. Confundir as duas é um dos erros mais comuns ao montar uma estrutura de governança, porque elas respondem a perguntas diferentes: o owner decide o que pode e o que não pode; o steward garante que, na prática, o dado continue correto e bem definido."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Papel\", \"Quem costuma exercer\", \"Responsabilidade principal\"], [\"Data owner\", \"Líder de negócio do domínio (ex.: head de Vendas)\", \"Responde pelo domínio, aprova acesso e prioridade\"], [\"Data steward\", \"Especialista de dados do domínio (analista, engenheiro)\", \"Cuida da qualidade, definição e documentação no dia a dia\"], [\"Data engineer\", \"Time de engenharia de dados\", \"Constrói e opera o pipeline que move e transforma o dado\"], [\"Consumidor\", \"Analista, cientista de dados, outro time\", \"Usa o dado para decisão, relatório ou modelo\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## Responsável x aprovador\n\nUma forma simples de separar os dois papéis: o steward é quem executa o trabalho do dia a dia, o owner é quem responde pelo resultado perante a empresa. Um domínio pode ter vários stewards cuidando de partes diferentes, mas costuma ter um único owner, porque autoridade dividida demais vira autoridade nenhuma: se três pessoas podem aprovar acesso a uma tabela restrita, na prática ninguém se sente dono da decisão."
                    },
                    {
                        "type": "quote",
                        "value": "Data owner responde pelo dado; data steward cuida do dado. Um decide, o outro garante que a decisão seja seguida todo santo dia."
                    },
                    {
                        "type": "code",
                        "value": "Fluxo típico quando um dashboard mostra número errado\n\nDashboard de churn mostra número errado\n        |\n        v\nConsumidor avisa no canal do domínio (ou abre um chamado)\n        |\n        v\nData steward investiga: é dado ruim ou é uso errado da tabela?\n        |\n        +-- ambiguidade de definição --> aciona o data owner\n        |                                 (decide o significado oficial)\n        |\n        +-- falha técnica no pipeline  --> aciona o data engineer\n                                            (corrige a origem ou o job)"
                    },
                    {
                        "type": "text",
                        "value": "## Dois jeitos de dar errado\n\nO problema mais comum é o ownership vazio: ninguém foi formalmente designado dono de um domínio, e quando o dado quebra, o time de plataforma acaba resolvendo por eliminação, mesmo sem contexto de negócio. O segundo é o ownership nominal: existe um nome no documento de governança, mas essa pessoa nunca participa de decisão nenhuma sobre o domínio. Nos dois casos o sintoma é igual: o dado vira órfão, e resolver um problema simples demora porque ninguém sabe a quem perguntar."
                    },
                    {
                        "type": "text",
                        "value": "## Escalando os papéis\n\nEm empresas pequenas, é comum a mesma pessoa acumular owner e steward de um domínio inteiro. Conforme a empresa cresce e os domínios se multiplicam, isso deixa de escalar, um único steward não dá conta de vários domínios com qualidade. A próxima aula mostra um modelo de organização pensado exatamente para esse crescimento: o data mesh, que distribui ownership por domínio de forma estrutural, em vez de depender de boa vontade."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual alternativa descreve corretamente a diferença entre data owner e data steward?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O owner escreve o código do pipeline de dados; o steward aprova o orçamento de armazenamento do domínio.",
                                "isCorrect": false
                            },
                            {
                                "text": "O owner responde pelo domínio e decide políticas; o steward cuida da qualidade e definição no dia a dia.",
                                "isCorrect": true
                            },
                            {
                                "text": "O owner e o steward exercem a mesma função; só muda o nome conforme a cultura da empresa.",
                                "isCorrect": false
                            },
                            {
                                "text": "O owner cuida da qualidade no dia a dia; o steward decide as políticas de acesso do domínio.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um relatório de faturamento passa a mostrar valores duplicados depois que a origem mudou um campo sem avisar, e um analista percebe o problema primeiro. Qual é o caminho mais adequado, segundo o modelo de ownership e stewardship?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O analista corrige direto a query do relatório, sem avisar o steward nem o owner do domínio.",
                                "isCorrect": false
                            },
                            {
                                "text": "O analista aciona o data owner primeiro, que corrige o pipeline sozinho antes de envolver o steward.",
                                "isCorrect": false
                            },
                            {
                                "text": "O analista aciona o data steward, que investiga e escala ao data owner se for preciso decidir política.",
                                "isCorrect": true
                            },
                            {
                                "text": "O analista abre um chamado direto para o time de plataforma, que assume a responsabilidade pelo domínio.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que, em geral, o data owner de um domínio é alguém do lado do negócio, e não um engenheiro de dados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque engenheiros de dados não têm, por padrão, acesso técnico às tabelas de produção do domínio.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a função de owner é apenas simbólica, sem nenhuma decisão real sobre o domínio.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque owner e engenheiro de dados exercem exatamente a mesma responsabilidade dentro do domínio.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o owner precisa de autoridade para decidir prioridade, acesso e o significado do domínio.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um domínio de dados tem um data owner nomeado formalmente no documento de governança, mas ele nunca participa de decisões, não responde chamados e não sabe quais tabelas existem no domínio. Isso é um exemplo de que problema?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ownership nominal: existe no papel, mas não exerce responsabilidade de fato sobre o domínio.",
                                "isCorrect": true
                            },
                            {
                                "text": "Data mesh mal aplicado: o domínio deveria ter sido centralizado em vez de descentralizado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Falta de um data steward: bastaria nomear um steward no lugar do owner para resolver.",
                                "isCorrect": false
                            },
                            {
                                "text": "Excesso de classificação: o domínio provavelmente tem dados classificados como restritos demais.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um data steward percebe que a definição de uma métrica precisa mudar para a empresa toda, não só para o seu domínio. Qual atitude está mais alinhada com o modelo de governança?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Alterar a definição direto no dashboard mais usado, já que o steward é quem mais entende do dado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Levar a proposta ao data owner e, por ser uma definição entre domínios, ao fórum de governança.",
                                "isCorrect": true
                            },
                            {
                                "text": "Esperar a próxima auditoria de segurança revisar a definição antes de qualquer mudança.",
                                "isCorrect": false
                            },
                            {
                                "text": "Abrir um chamado técnico para o time de engenharia decidir a nova definição de negócio.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Data mesh e o dado como produto",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Data mesh e o dado como produto\n\nCentralizar todo o dado da empresa em um único time costuma funcionar bem no começo e virar gargalo conforme a empresa cresce: cada domínio novo pede um relatório, uma tabela, uma integração, e tudo passa pela mesma fila. O time central não tem contexto de negócio de cada área e vira dependência para tudo. Data mesh é uma forma de organizar dados e equipes que ataca justamente esse problema: em vez de um time central dono de tudo, cada domínio de negócio passa a ser dono e a servir seus próprios dados, como se fossem produtos."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Princípio\", \"Ideia central\"], [\"Ownership por domínio\", \"Quem gera o dado é quem o mantém e o serve, não um time central\"], [\"Dado como produto\", \"Cada conjunto publicado tem dono, qualidade, documentação e é fácil de achar\"], [\"Plataforma self-service\", \"Uma infraestrutura comum para os domínios publicarem dados sem reinventar tudo\"], [\"Governança federada\", \"Políticas globais aplicadas de forma automática, com autonomia de cada domínio\"]]"
                    },
                    {
                        "type": "code",
                        "value": "Arquitetura centralizada (o gargalo)\n\nDomínio A --\\\nDomínio B ---> time central de dados --> um data lake --> consumidores\nDomínio C --/            (fila única para tudo)\n\nData mesh (dado como produto por domínio)\n\nDomínio A --> produto de dados A --> consumidores de A\nDomínio B --> produto de dados B --> consumidores de B\nDomínio C --> produto de dados C --> consumidores de C\n\n        todos publicados sobre a mesma plataforma self-service\n        e sob as mesmas políticas globais de governança federada"
                    },
                    {
                        "type": "quote",
                        "value": "Um conjunto de dados publicado sem dono, sem qualidade garantida e sem documentação não é um produto de dados, é só uma tabela que alguém lembrou de exportar."
                    },
                    {
                        "type": "text",
                        "value": "## O que faz um dado ser tratado como produto\n\nDado como produto significa aplicar ao dataset o mesmo cuidado que um time de produto aplica a uma funcionalidade: ele tem um dono responsável por ele, um nível de qualidade e atualização com que os consumidores podem contar, documentação que explica o que cada campo significa, e é fácil de descobrir no catálogo sem precisar perguntar no chat de alguém. A diferença para uma tabela comum não está no formato do arquivo, está no compromisso de quem publica com quem consome."
                    },
                    {
                        "type": "text",
                        "value": "## Data mesh não é de graça\n\nDescentralizar ownership resolve o gargalo, mas troca um problema por outro: cada domínio agora precisa de gente capaz de tratar dado como produto, o que exige uma plataforma self-service madura para não virar vários times reinventando pipeline do zero. Para uma empresa pequena, com poucos domínios e um time de dados só, um data lake bem organizado e um dono claro por domínio costuma resolver sem a complexidade extra do mesh. E sem a governança federada do quarto princípio, um data mesh mal aplicado vira várias data swamps, uma por domínio, cada uma com sua própria regra."
                    },
                    {
                        "type": "text",
                        "value": "## Uma decisão de organização, não de ferramenta\n\nData mesh é, antes de tudo, uma forma de distribuir responsabilidade, não um produto que se instala. As próximas aulas seguem no mesmo território de governança: como classificar a sensibilidade de um dado, não importa em qual domínio ele nasça, e como transformar tudo isso em política e cultura no dia a dia."
                    }
                ],
                "questions": [
                    {
                        "statement": "No data mesh, o que significa tratar o dado como um produto?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O conjunto de dados é vendido para outras empresas como um produto comercial da companhia.",
                                "isCorrect": false
                            },
                            {
                                "text": "O conjunto de dados fica disponível só para o time que o criou, como um produto interno fechado.",
                                "isCorrect": false
                            },
                            {
                                "text": "O conjunto de dados publicado tem dono, qualidade garantida, documentação e é fácil de descobrir.",
                                "isCorrect": true
                            },
                            {
                                "text": "O conjunto de dados é guardado num formato proprietário para facilitar uma venda futura.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa cresceu e o time central de dados virou gargalo: qualquer pedido de um domínio novo demora meses na fila. Qual mudança de arquitetura o data mesh propõe para esse problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Aumentar o time central de dados, contratando mais gente para dar conta da fila de pedidos.",
                                "isCorrect": false
                            },
                            {
                                "text": "Migrar todo o data lake central para um data warehouse mais rápido, sem mudar quem é dono do quê.",
                                "isCorrect": false
                            },
                            {
                                "text": "Terceirizar a equipe de dados para uma consultoria especializada em relatórios sob demanda.",
                                "isCorrect": false
                            },
                            {
                                "text": "Descentralizar a responsabilidade pelos dados para os times de domínio, que passam a servi-los.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Qual das alternativas corresponde a um dos princípios centrais do data mesh?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Governança federada: políticas globais aplicadas de forma automática, com autonomia de cada domínio.",
                                "isCorrect": true
                            },
                            {
                                "text": "Centralização computacional: todo processamento de dado deve ocorrer em um único cluster corporativo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Padronização total: todos os domínios devem usar exatamente a mesma modelagem de tabelas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Propriedade única: um time central deve ser o dono de todos os conjuntos de dados publicados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma empresa pequena, com um único time de dados e poucos domínios, avalia adotar data mesh. Qual é a consideração mais importante antes dessa decisão?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Se a empresa já usa um table format aberto específico, porque o data mesh exige essa tecnologia.",
                                "isCorrect": false
                            },
                            {
                                "text": "Se a empresa tem maturidade e escala para manter uma plataforma self-service entre os domínios.",
                                "isCorrect": true
                            },
                            {
                                "text": "Se a empresa já tem um catálogo de dados instalado, porque sem catálogo o data mesh não existe.",
                                "isCorrect": false
                            },
                            {
                                "text": "Se a empresa prefere guardar dados em nuvem pública em vez de um data center próprio.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em um data mesh bem aplicado, cada domínio publica seus próprios dados com autonomia. O que garante que, mesmo assim, a empresa toda siga a mesma regra para classificar dados sensíveis?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Nada garante isso: cada domínio define suas próprias regras de sensibilidade, sem nenhum padrão comum.",
                                "isCorrect": false
                            },
                            {
                                "text": "O time de engenharia central revisa manualmente cada tabela publicada antes da liberação.",
                                "isCorrect": false
                            },
                            {
                                "text": "A governança federada: políticas globais, como classificação, valem para todos os domínios.",
                                "isCorrect": true
                            },
                            {
                                "text": "A ferramenta de catálogo aplica a classificação sozinha, sem nenhuma política definida por pessoas.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Classificação de dados",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Classificação de dados\n\nCom domínios organizados e donos definidos, falta responder a uma pergunta que aparece todo dia: quem pode ver este dado aqui? Classificação de dados é o rótulo de sensibilidade que responde a isso de forma consistente, em vez de decidir caso a caso. Em vez de cada pessoa julgar na hora se pode compartilhar uma planilha, a classificação já vem definida junto com o dado, geralmente como um dos quatro níveis: público, interno, confidencial e restrito."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Nível\", \"Definição\", \"Exemplo típico\"], [\"Público\", \"Pode ser divulgado livremente, dentro ou fora da empresa\", \"Relatório anual publicado no site da empresa\"], [\"Interno\", \"Uso interno, sem risco relevante se circular na empresa\", \"Organograma e ramal dos times\"], [\"Confidencial\", \"Impacto relevante se exposto, uso restrito a quem precisa\", \"Contratos comerciais, salário médio por cargo\"], [\"Restrito\", \"Dado pessoal sensível ou crítico, vazamento gera dano sério\", \"CPF, dado de saúde, senha, número de cartão\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Classificar um dado é decidir, antes de qualquer incidente, quem pode vê-lo e por quanto tempo ele deve continuar existindo."
                    },
                    {
                        "type": "code",
                        "value": "Exemplo de metadados de classificação no catálogo\n\ntabela: clientes.cadastro\ncolunas:\n  - nome: cpf\n    classificacao: restrito\n    retencao_dias: 1825\n  - nome: email\n    classificacao: confidencial\n    retencao_dias: 1825\n  - nome: cidade\n    classificacao: interno\n    retencao_dias: null\n\nregra de acesso associada:\n  restrito      -> exige aprovação do data owner, acesso expira em 90 dias\n  confidencial  -> liberado para o domínio, expira em 180 dias\n  interno       -> liberado para toda a empresa\n  público       -> liberado sem restrição"
                    },
                    {
                        "type": "text",
                        "value": "## Classificação também é insumo de retenção\n\nO nível de sensibilidade não define só quem acessa, define também por quanto tempo faz sentido guardar o dado. Um dado restrito costuma ter um prazo de retenção mais curto e um processo de expiração de acesso mais rígido, porque o custo de mantê-lo exposto por mais tempo do que o necessário só cresce. Um dado público pode ficar guardado indefinidamente sem o mesmo risco. Retenção e acesso são políticas diferentes, mas as duas partem do mesmo rótulo de classificação."
                    },
                    {
                        "type": "text",
                        "value": "## Quem classifica e onde isso vive\n\nClassificar é trabalho do data steward, que conhece o conteúdo real das colunas, com aprovação do data owner do domínio, que tem autoridade para essa decisão. O rótulo deve viver como metadado no catálogo, ao lado da tabela e da coluna, não numa planilha separada que ninguém mais consulta. Como o conteúdo de uma tabela muda com o tempo, novas colunas podem alterar a sensibilidade de algo que antes era inofensivo, então reclassificar faz parte do trabalho contínuo do steward, não é uma tarefa que se faz uma vez só."
                    },
                    {
                        "type": "text",
                        "value": "## O que a falta de classificação custa\n\nUma planilha com CPF e telefone de clientes compartilhada por um link aberto na internet quase sempre tem a mesma origem: ninguém parou para classificar aquele dado antes de publicar. Com a classificação certa, restrito, o próprio processo de compartilhamento já exigiria um controle de acesso, não um link aberto. Classificação sozinha não impede vazamento, mas é a base sobre a qual toda regra de acesso e toda política de privacidade, tema do próximo módulo, consegue se apoiar."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é o objetivo principal de classificar um dado por sensibilidade (público, interno, confidencial, restrito)?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Definir em qual banco de dados físico aquele dado deve ficar armazenado dentro da empresa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir qual time de engenharia é responsável por construir o pipeline daquele dado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir qual formato de arquivo, como CSV ou Parquet, deve ser usado para aquele dado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir, de forma consistente, quem acessa aquele dado e por quanto tempo ele deve ser retido.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma planilha com CPF e telefone de clientes foi compartilhada por um link aberto, acessível a qualquer pessoa da internet, porque ninguém definiu isso antes de publicar. Qual prática, aplicada antes, teria evitado esse incidente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Classificar a planilha como restrita antes de publicar, exigindo controle de acesso adequado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Rodar um teste de unicidade na coluna de CPF antes de publicar a planilha.",
                                "isCorrect": false
                            },
                            {
                                "text": "Adicionar a planilha ao catálogo de dados, mesmo sem nenhuma classificação de sensibilidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplicar uma regra de linhagem para rastrear de onde vieram o CPF e o telefone.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A área de RH mantém uma tabela com o salário médio por cargo, sem nenhuma coluna que identifique pessoas, mas cuja divulgação indevida prejudicaria negociações internas e a competitividade da empresa. Como essa tabela deve ser classificada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Restrito: qualquer tabela que mencione a palavra salário é tratada como dado pessoal sensível.",
                                "isCorrect": false
                            },
                            {
                                "text": "Confidencial: tem impacto relevante se exposta, mas não é um dado pessoal sensível de um indivíduo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Pública: dado agregado por cargo pode sempre ser divulgado livremente, já que ninguém é identificado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Interna: o mesmo nível de sensibilidade de um organograma ou lista de ramais da empresa.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela foi classificada como interna quando criada, porque continha só metadados operacionais. Meses depois, um novo pipeline passou a enriquecê-la com e-mail e telefone dos clientes. O que deveria acontecer com a classificação?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Nada muda: a classificação é definida uma única vez, na criação da tabela, e não é revista depois.",
                                "isCorrect": false
                            },
                            {
                                "text": "A classificação da tabela deve seguir a do pipeline que a alimenta, não o conteúdo das colunas.",
                                "isCorrect": false
                            },
                            {
                                "text": "A tabela deve ser reclassificada para um nível mais sensível, pelo dado pessoal que passou a conter.",
                                "isCorrect": true
                            },
                            {
                                "text": "Só o time de segurança da informação pode decidir isso, sem envolver o owner ou o steward do domínio.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual afirmação descreve melhor a relação entre classificação de dados e as políticas de acesso e retenção de uma empresa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Classificação, acesso e retenção são políticas independentes, sem nenhuma relação entre si na prática.",
                                "isCorrect": false
                            },
                            {
                                "text": "A retenção define a classificação: quanto mais tempo um dado é guardado, mais sensível ele se torna.",
                                "isCorrect": false
                            },
                            {
                                "text": "O controle de acesso define a classificação: dados com muitos acessos se tornam públicos automaticamente.",
                                "isCorrect": false
                            },
                            {
                                "text": "A classificação é a base: o nível de sensibilidade orienta a retenção e o acesso a cada dado.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Políticas, padrões e cultura",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Políticas, padrões e cultura\n\nAs aulas anteriores deste módulo definiram governança, os papéis que respondem pelo dado, um jeito de organizar isso por domínio e o rótulo que diz o quão sensível cada dado é. Falta a última peça: transformar tudo isso em regras que as pessoas seguem no dia a dia sem precisar reler um documento toda vez, e numa cultura em que cuidar do dado não é tarefa exclusiva de quem trabalha com dado."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Tipo de política\", \"O que define\", \"Exemplo de regra\"], [\"Retenção\", \"Por quanto tempo um dado existe antes de ser arquivado ou apagado\", \"Log de acesso é mantido por 180 dias, depois é descartado\"], [\"Acesso\", \"Quem pode ler, alterar ou exportar cada nível de classificação\", \"Dado restrito exige aprovação do owner e expira em 90 dias\"], [\"Qualidade\", \"Qual padrão mínimo um dado precisa atingir para ser confiável\", \"Toda tabela do data mart passa nos testes antes de liberar\"], [\"Nomenclatura\", \"Como nomear tabelas, colunas e conjuntos de dados\", \"Tabela segue o padrão domínio_entidade_grão\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Uma política de dados só existe de verdade quando alguém segue ela sem precisar ser lembrado, até lá é só um documento."
                    },
                    {
                        "type": "code",
                        "value": "Padrão de nomenclatura de tabelas\n\n  <domínio>_<entidade>_<grão>\n\n  exemplos:\n  vendas_pedidos_dia        (um pedido por linha, granularidade diária)\n  vendas_pedidos_item_dia   (um item de pedido por linha)\n  suporte_chamados_hora     (um chamado por linha, granularidade horária)\n\nPadrão de metadados de governança no catálogo\n\n  owner: <email do data owner do domínio>\n  classification: publico | interno | confidencial | restrito\n  retention_days: <número de dias ou nulo>"
                    },
                    {
                        "type": "text",
                        "value": "## Governança que habilita, não só bloqueia\n\nUma política mal desenhada trata todo acesso como igualmente perigoso: exige aprovação manual até para um dado público, e o time aprende a contornar o processo em vez de segui-lo. Uma política bem desenhada varia o rigor conforme a classificação, dado público e interno liberado por padrão, confidencial e restrito com aprovação e prazo de expiração. O objetivo de uma política de dados é dar segurança para o time andar mais rápido com confiança, não adicionar um pedágio em cada etapa."
                    },
                    {
                        "type": "text",
                        "value": "## Cultura de dados\n\nPolítica escrita não muda comportamento sozinha. Uma cultura de dados madura aparece quando um analista de marketing corrige a definição errada de uma métrica antes de apresentar um número, quando um time de produto documenta uma tabela nova sem alguém de dados pedir, quando a resposta padrão para uma dúvida sobre o significado de uma coluna é consultar o catálogo, não perguntar no chat. Isso se constrói com uma rede de stewards espalhada pelos domínios, onboarding que ensina o glossário da empresa, e tornando a qualidade de cada domínio visível para todo mundo."
                    },
                    {
                        "type": "text",
                        "value": "## O fechamento do módulo\n\nGovernança de dados é a organização por trás de toda a técnica vista nos módulos anteriores: pessoas com nome e responsabilidade sobre cada domínio, um jeito de distribuir isso conforme a empresa cresce, um rótulo de sensibilidade consistente e políticas que o time segue porque fazem sentido, não porque são obrigadas. O próximo módulo constrói em cima da classificação vista aqui e entra na camada legal de proteção de dados pessoais, com a LGPD."
                    }
                ],
                "questions": [
                    {
                        "statement": "No contexto de governança de dados, o que é uma política de retenção?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A regra que define por quanto tempo um dado é mantido antes de ser arquivado ou eliminado.",
                                "isCorrect": true
                            },
                            {
                                "text": "A regra que define quais colunas de uma tabela podem aparecer em relatórios públicos.",
                                "isCorrect": false
                            },
                            {
                                "text": "A regra que define o nome padrão que toda tabela nova deve seguir no catálogo.",
                                "isCorrect": false
                            },
                            {
                                "text": "A regra que define quantas vezes por dia um pipeline de dados deve ser executado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time de dados decide que toda tabela nova deve seguir o padrão domínio_entidade_grão, como vendas_pedidos_dia. Que benefício isso traz para a governança, além de deixar os nomes organizados?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Reduz automaticamente o custo de armazenamento das tabelas no data warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Torna mais previsível entender uma tabela pelo nome, sem precisar perguntar a alguém.",
                                "isCorrect": true
                            },
                            {
                                "text": "Garante que a tabela passe em todos os testes de qualidade definidos no projeto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Impede automaticamente que alguém sem permissão acesse os dados daquela tabela.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em uma empresa, toda solicitação de acesso a qualquer tabela, mesmo as públicas, precisa de aprovação manual de um comitê que se reúne uma vez por mês. Isso é um exemplo de que problema?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Falta de política de retenção, já que o problema descrito é sobre por quanto tempo guardar os dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Excesso de descentralização, típico de uma empresa que adotou data mesh sem plataforma self-service.",
                                "isCorrect": false
                            },
                            {
                                "text": "Governança que trava mais do que habilita: falta variar o rigor da política pela classificação do dado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Falta de um data steward no domínio, que resolveria esse problema sozinho sem mudar o processo.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual alternativa ilustra uma política de acesso que habilita o time em vez de só bloquear, mantendo o rigor da governança?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Todo acesso a qualquer dado, de qualquer classificação, exige aprovação manual do data owner do domínio.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum acesso a dado passa por aprovação, nem os classificados como restritos, para agilizar o time.",
                                "isCorrect": false
                            },
                            {
                                "text": "Acesso liberado por padrão para todos os níveis de classificação, com auditoria uma vez por ano.",
                                "isCorrect": false
                            },
                            {
                                "text": "Acesso a dado público e interno liberado por padrão, e só confidencial ou restrito passa por aprovação.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "O que caracteriza uma cultura de dados madura numa empresa, além de existirem políticas escritas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Pessoas de fora do time de dados tratam a qualidade e a definição dos dados como parte do próprio trabalho.",
                                "isCorrect": true
                            },
                            {
                                "text": "Somente o time de engenharia de dados tem permissão para alterar qualquer definição usada nos relatórios.",
                                "isCorrect": false
                            },
                            {
                                "text": "Toda decisão sobre dado passa obrigatoriamente pelo comitê de governança, sem exceção.",
                                "isCorrect": false
                            },
                            {
                                "text": "As políticas de retenção e acesso são revisadas apenas quando um incidente de vazamento acontece.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 6 - Privacidade e a LGPD",
        "aulas": [
            {
                "titulo": "Dado pessoal x dado pessoal sensível",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Dado pessoal x dado pessoal sensível\n\nTudo o que você viu até aqui nesta trilha (qualidade, observabilidade, catálogo, governança) trata o dado como um ativo a ser cuidado. Quando esse dado descreve uma pessoa, entra uma camada a mais de responsabilidade: a lei. No Brasil, a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018) define o que é dado pessoal, o que é dado sensível e quais obrigações o engenheiro de dados carrega ao movê-los pelo pipeline. O equivalente europeu é o GDPR, com espírito muito parecido."
                    },
                    {
                        "type": "text",
                        "value": "## Dado pessoal\n\nDado pessoal é qualquer informação relacionada a uma pessoa natural identificada ou identificável. Não precisa ser um documento: se, sozinho ou combinado com outros, o dado permite chegar a uma pessoa, ele é pessoal. Nome, CPF, e-mail e telefone são óbvios, mas um identificador de dispositivo, um IP ou a combinação de CEP + data de nascimento + gênero também podem identificar alguém, e portanto também são dados pessoais."
                    },
                    {
                        "type": "text",
                        "value": "## Dado pessoal sensível\n\nA LGPD cria uma categoria especial, o dado pessoal sensível, com proteção reforçada porque seu uso indevido gera risco maior de discriminação. São dados sobre origem racial ou étnica, convicção religiosa, opinião política, filiação a sindicato ou a organização de caráter religioso/filosófico/político, dado referente à saúde ou à vida sexual, e dado genético ou biométrico. O tratamento desses dados tem hipóteses legais mais restritas do que o de um dado pessoal comum."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Categoria\", \"Exemplos\", \"Proteção\"], [\"Dado pessoal\", \"Nome, CPF, e-mail, telefone, IP\", \"Regras gerais da LGPD\"], [\"Dado pessoal sensível\", \"Saúde, biometria, raça, religião, opinião política\", \"Hipóteses legais mais restritas\"], [\"Dado anonimizado\", \"Total de vendas por cidade\", \"Fora do escopo da LGPD, se irreversível\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "A pergunta que define o dado pessoal não é o quão privado ele parece, e sim se ele permite, sozinho ou combinado, chegar a uma pessoa específica."
                    },
                    {
                        "type": "text",
                        "value": "## Por que isso importa no pipeline\n\nClassificar corretamente um campo como pessoal ou sensível é o que dispara todo o resto: onde ele pode ser armazenado, quem pode consultá-lo, se precisa ser mascarado, por quanto tempo pode ser retido. Um pipeline que trata um dado de saúde como se fosse um dado comum não está só mal modelado, está potencialmente fora da lei. Por isso a classificação de dados do módulo anterior é a base da privacidade."
                    }
                ],
                "questions": [
                    {
                        "statement": "Segundo a LGPD, o que caracteriza um dado como dado pessoal?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Ser uma informação que identifica ou torna identificável uma pessoa natural.",
                                "isCorrect": true
                            },
                            {
                                "text": "Ser uma informação que a própria pessoa considera privada e não quer divulgar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ser um documento oficial emitido por um órgão público para aquela pessoa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ser um dado que está guardado em um sistema interno e não é público.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela guarda, entre outras colunas, o plano de saúde e o resultado de exames dos clientes. Como a LGPD classifica esses dois campos?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Como dado pessoal sensível, por se referirem à saúde da pessoa.",
                                "isCorrect": true
                            },
                            {
                                "text": "Como dado pessoal comum, já que qualquer coluna de cliente é comum.",
                                "isCorrect": false
                            },
                            {
                                "text": "Como dado anonimizado, porque exame e plano não têm o nome junto.",
                                "isCorrect": false
                            },
                            {
                                "text": "Como dado público, uma vez que planos de saúde são regulados por lei.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um engenheiro argumenta que uma tabela com CEP, data de nascimento e gênero, sem nome nem CPF, não contém dado pessoal. Por que esse argumento é frágil sob a LGPD?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque a combinação desses campos pode tornar a pessoa identificável.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque todo dado guardado em um data warehouse é sempre pessoal.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque CEP e data de nascimento são classificados como dado sensível.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a ausência de nome exige o consentimento formal do titular.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que a LGPD dá proteção reforçada e hipóteses legais mais restritas ao dado pessoal sensível?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque seu uso indevido traz risco maior de discriminação contra a pessoa.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque esse tipo de dado é sempre mais caro de armazenar e processar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque esse tipo de dado é tecnicamente mais difícil de anonimizar.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque esse tipo de dado costuma ter um volume bem maior de registros.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao desenhar a camada bronze de um lakehouse que recebe um cadastro com biometria facial, qual classificação orienta as regras de acesso e retenção desse campo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Dado pessoal sensível, por ser dado biométrico protegido pela LGPD.",
                                "isCorrect": true
                            },
                            {
                                "text": "Dado pessoal comum, já que biometria é apenas outra forma de login.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dado técnico de sistema, porque a face vira um vetor de números.",
                                "isCorrect": false
                            },
                            {
                                "text": "Dado anonimizado, uma vez que o rosto não fica salvo como imagem.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Princípios da LGPD e direitos do titular",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Princípios da LGPD e direitos do titular\n\nA LGPD não é só uma lista de proibições, ela é guiada por princípios que orientam qualquer tratamento de dado pessoal. Para o engenheiro de dados, esses princípios não são abstração jurídica: eles se traduzem em decisões concretas de pipeline, como qual coluna coletar, por quanto tempo guardar e para que finalidade usar."
                    },
                    {
                        "type": "text",
                        "value": "## Alguns princípios centrais\n\n- **Finalidade**: o dado é tratado para um propósito específico, informado ao titular. Usar depois para outra coisa exige nova base.\n- **Adequação**: o tratamento tem que ser compatível com a finalidade informada.\n- **Necessidade (minimização)**: coletar e guardar o mínimo de dado necessário para a finalidade, nada além.\n- **Transparência**: o titular tem direito a informações claras sobre o tratamento.\n- **Segurança**: medidas técnicas para proteger o dado de acesso indevido."
                    },
                    {
                        "type": "text",
                        "value": "## Base legal do tratamento\n\nTodo tratamento de dado pessoal precisa se apoiar em uma base legal prevista na LGPD. O consentimento do titular é a mais conhecida, mas não é a única: legítimo interesse, cumprimento de obrigação legal, execução de contrato e outras hipóteses também autorizam o tratamento, cada uma com suas condições. Escolher a base errada (ou não ter base nenhuma) torna o tratamento irregular, ainda que o dado esteja tecnicamente correto."
                    },
                    {
                        "type": "text",
                        "value": "## Direitos do titular\n\nA pessoa dona do dado (o titular) tem direitos que o pipeline precisa conseguir atender: confirmação de que há tratamento, acesso aos seus dados, correção de dados incompletos ou desatualizados, anonimização ou eliminação de dados desnecessários, portabilidade a outro fornecedor e revogação do consentimento. Se o titular pede a eliminação, o engenheiro precisa saber onde aquele dado está espalhado, e é aí que a linhagem do módulo 4 vira ferramenta de compliance."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Princípio\", \"Tradução no pipeline\"], [\"Finalidade\", \"Documentar para que cada dado é usado\"], [\"Necessidade\", \"Não coletar coluna que não vai usar\"], [\"Transparência\", \"Conseguir dizer ao titular o que se guarda dele\"], [\"Direito à eliminação\", \"Localizar e apagar o dado do titular em todas as tabelas\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Minimização é o princípio que mais economiza dor de cabeça: o dado que você não coletou é o dado que você não precisa proteger, auditar nem apagar depois."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que o princípio da necessidade (minimização) exige de um pipeline de dados?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Coletar e reter apenas o dado mínimo necessário para a finalidade.",
                                "isCorrect": true
                            },
                            {
                                "text": "Guardar o máximo de dado possível, para o caso de vir a ser útil.",
                                "isCorrect": false
                            },
                            {
                                "text": "Minimizar o custo de armazenamento comprimindo todas as tabelas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir o número de pipelines para simplificar a manutenção do time.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time coletou e-mails para enviar a nota fiscal de uma compra e, meses depois, quer usar a mesma lista para uma campanha de marketing não informada na coleta. Qual princípio da LGPD isso contraria diretamente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A finalidade, pois o dado iria para um propósito diferente do informado.",
                                "isCorrect": true
                            },
                            {
                                "text": "A segurança, pois enviar marketing expõe o e-mail a um risco maior.",
                                "isCorrect": false
                            },
                            {
                                "text": "A portabilidade, pois o titular deixa de poder levar o dado embora.",
                                "isCorrect": false
                            },
                            {
                                "text": "A anonimização, pois o e-mail deveria ter sido anonimizado na coleta.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um titular exerce o direito de eliminação e pede que seus dados sejam apagados. Qual capacidade do pipeline é a mais crítica para atender esse pedido de forma completa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "A linhagem, para achar o dado do titular em todas as tabelas onde ele está.",
                                "isCorrect": true
                            },
                            {
                                "text": "O particionamento, para que a eliminação varra menos dados por consulta.",
                                "isCorrect": false
                            },
                            {
                                "text": "A materialização incremental, para que o apagamento rode a cada carga.",
                                "isCorrect": false
                            },
                            {
                                "text": "O cache de consultas, para que o dado apagado saia logo dos relatórios.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Sobre a base legal do tratamento na LGPD, qual afirmação está correta?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O consentimento é uma das bases legais, mas não é a única prevista.",
                                "isCorrect": true
                            },
                            {
                                "text": "O consentimento do titular é a única base legal aceita pela LGPD.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhuma base legal é exigida se o dado ficar só no ambiente interno.",
                                "isCorrect": false
                            },
                            {
                                "text": "A base legal só é necessária quando o dado é pessoal sensível.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao projetar um novo cadastro, o time quer adicionar campos de renda e estado civil que nenhum relatório atual usa, só por precaução. Sob os princípios da LGPD, qual é a orientação mais adequada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Não coletar o que não tem finalidade definida, seguindo a minimização.",
                                "isCorrect": true
                            },
                            {
                                "text": "Coletar tudo agora e decidir a finalidade de cada campo mais tarde.",
                                "isCorrect": false
                            },
                            {
                                "text": "Coletar os campos, mas guardá-los criptografados para ficar em conformidade.",
                                "isCorrect": false
                            },
                            {
                                "text": "Coletar os campos e classificá-los como sensíveis por segurança extra.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Anonimização x pseudonimização",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Anonimização x pseudonimização\n\nEssas duas palavras parecem sinônimos e são a confusão mais comum em privacidade de dados, mas a diferença entre elas muda tudo, inclusive se a LGPD ainda se aplica ao dado. Entender a fronteira é essencial para o engenheiro que precisa liberar dados para análise sem expor pessoas."
                    },
                    {
                        "type": "text",
                        "value": "## Anonimização\n\nAnonimizar é transformar o dado de modo que ele deixe de permitir a identificação da pessoa, de forma irreversível, considerando os meios técnicos razoáveis disponíveis. Um dado verdadeiramente anonimizado não é mais dado pessoal e, por isso, sai do escopo da LGPD. O exemplo típico é uma tabela agregada: total de vendas por cidade e mês, sem nenhuma linha que remeta a um indivíduo. O ponto difícil é a irreversibilidade: agregar pouco, ou deixar grupos muito pequenos, pode permitir reidentificação e aí a anonimização falhou."
                    },
                    {
                        "type": "text",
                        "value": "## Pseudonimização\n\nPseudonimizar é substituir os identificadores por um valor artificial (um pseudônimo), de forma que o dado só possa ser reassociado à pessoa com uma informação adicional, guardada em separado. Trocar o CPF por um id interno, mantendo em outro lugar a tabela que liga id a CPF, é pseudonimização. Como a reassociação é possível com a chave, o dado pseudonimizado continua sendo dado pessoal e continua no escopo da LGPD."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Aspecto\", \"Anonimização\", \"Pseudonimização\"], [\"Reversível?\", \"Não, é irreversível\", \"Sim, com a informação adicional\"], [\"Ainda é dado pessoal?\", \"Não\", \"Sim\"], [\"Sob a LGPD?\", \"Sai do escopo\", \"Permanece no escopo\"], [\"Exemplo\", \"Total por cidade\", \"CPF trocado por um id, com mapa à parte\"]]"
                    },
                    {
                        "type": "code",
                        "value": "-- Pseudonimização: o vínculo continua existindo em outro lugar\n-- tabela de fatos (uso analítico), sem o CPF direto\ncliente_id | valor_compra | data\nc_8f21     | 150.00       | 2026-03-01\n\n-- cofre de mapeamento (acesso restrito): permite reassociar\ncliente_id | cpf\nc_8f21     | 123.456.789-00\n\n-- Anonimização: nao existe vinculo para reassociar\ncidade     | mes     | total_vendas\nRecife     | 2026-03 | 48210.00"
                    },
                    {
                        "type": "quote",
                        "value": "Se existe, em algum lugar, uma chave que devolve a identidade da pessoa, o dado é pseudonimizado, não anonimizado, e a LGPD continua valendo."
                    }
                ],
                "questions": [
                    {
                        "statement": "Qual é a diferença central entre anonimização e pseudonimização?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "A anonimização é irreversível; a pseudonimização pode ser revertida com a chave.",
                                "isCorrect": true
                            },
                            {
                                "text": "A anonimização criptografa o dado; a pseudonimização apenas o mascara.",
                                "isCorrect": false
                            },
                            {
                                "text": "A anonimização vale para dado sensível; a pseudonimização, para dado comum.",
                                "isCorrect": false
                            },
                            {
                                "text": "A anonimização é feita na ingestão; a pseudonimização, só na camada gold.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time troca o CPF por um id interno na tabela analítica, mas mantém em um banco separado e restrito o mapa que liga id a CPF. Esse dado ainda está no escopo da LGPD?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Sim, porque a reassociação é possível com o mapa, então é pseudonimização.",
                                "isCorrect": true
                            },
                            {
                                "text": "Não, porque a tabela analítica em si já não contém mais o CPF.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não, porque trocar o CPF por um id caracteriza anonimização plena.",
                                "isCorrect": false
                            },
                            {
                                "text": "Sim, mas apenas enquanto o mapa de id para CPF não for criptografado.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que uma tabela agregada de total de vendas por cidade e mês costuma ser considerada anonimizada?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Porque não há como, a partir dela, remontar a compra de um indivíduo.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a agregação criptografa os dados originais de cada compra.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o nome do cliente foi apenas substituído por um pseudônimo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o total por cidade é sempre um dado classificado como público.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela dita anonimizada agrega gastos por bairro e mês, mas alguns bairros têm um único morador cadastrado. Por que essa anonimização pode ter falhado?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque um grupo com um só indivíduo permite reidentificar a pessoa.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque agregar por mês é uma granularidade fina demais para a LGPD.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque falta criptografar a coluna de bairro antes de publicar a tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a soma de gastos é sempre um dado pessoal de natureza sensível.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe quer liberar um conjunto de dados para um parceiro externo sem que ele fique sujeito às obrigações da LGPD sobre dado pessoal. Qual abordagem atende a esse objetivo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Anonimizar de forma irreversível, para que deixe de ser dado pessoal.",
                                "isCorrect": true
                            },
                            {
                                "text": "Pseudonimizar os identificadores e enviar a chave junto ao parceiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criptografar as colunas e compartilhar a senha por um canal seguro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Mascarar o CPF na exibição, mantendo o valor completo por baixo.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Mascaramento, tokenização e criptografia",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Mascaramento, tokenização e criptografia\n\nProteger um dado pessoal no pipeline não é uma técnica única, são várias, e escolher a errada custa caro. Mascaramento, tokenização e criptografia resolvem problemas diferentes, e a confusão entre elas leva a soluções que parecem seguras mas não são. Esta aula separa as três."
                    },
                    {
                        "type": "text",
                        "value": "## Mascaramento\n\nMascarar é esconder parte do valor na exibição, mantendo um pedaço legível para conferência. O CPF que aparece como ***.***.789-00 num painel de suporte é mascaramento. É simples e bom para limitar o que um usuário vê, mas atenção: se o dado original continua completo por baixo, o mascaramento protege a exibição, não o armazenamento. Há mascaramento estático (o dado é gravado já mascarado) e dinâmico (mascarado na consulta, conforme quem pergunta)."
                    },
                    {
                        "type": "text",
                        "value": "## Tokenização\n\nTokenizar é trocar o valor sensível por um token sem significado, guardando o vínculo token-valor num cofre separado e protegido. É a técnica clássica para cartão de crédito: o sistema opera com o token, e só o cofre sabe o número real. Diferente da criptografia, o token não é derivado matematicamente do valor, é só uma referência, então não há como voltar ao original sem o cofre."
                    },
                    {
                        "type": "text",
                        "value": "## Criptografia\n\nCriptografar é transformar o dado em texto ilegível por meio de um algoritmo e uma chave; quem tem a chave reverte. Protege o dado em repouso (no disco) e em trânsito (na rede). É reversível por natureza (essa é a intenção), então a segurança depende inteiramente de proteger a chave. Perdeu a chave, perdeu o dado; vazou a chave, vazou o dado."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Técnica\", \"Como funciona\", \"Boa para\"], [\"Mascaramento\", \"Esconde parte do valor na exibição\", \"Limitar o que o usuário vê\"], [\"Tokenização\", \"Troca por token, com cofre à parte\", \"Operar sem expor o valor real\"], [\"Criptografia\", \"Cifra com chave, reversível\", \"Proteger em repouso e em trânsito\"]]"
                    },
                    {
                        "type": "quote",
                        "value": "Mascaramento protege quem olha a tela; criptografia e tokenização protegem o dado guardado. Confundir os dois deixa PII exposta achando que está segura."
                    }
                ],
                "questions": [
                    {
                        "statement": "Um painel de suporte mostra o CPF do cliente como ***.***.789-00, mas o valor completo continua salvo na tabela. Que técnica é essa, e o que ela protege?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Mascaramento, que protege a exibição, não o dado armazenado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Criptografia, que protege o dado tanto na tela quanto no disco.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tokenização, que substitui o CPF por um token guardado à parte.",
                                "isCorrect": false
                            },
                            {
                                "text": "Anonimização, que remove de vez a ligação do CPF com a pessoa.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual característica distingue a tokenização da criptografia?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O token é só uma referência ao valor; a cifra é derivada dele por uma chave.",
                                "isCorrect": true
                            },
                            {
                                "text": "A tokenização é reversível com a chave, e a criptografia é irreversível.",
                                "isCorrect": false
                            },
                            {
                                "text": "A tokenização protege em trânsito, e a criptografia só protege em repouso.",
                                "isCorrect": false
                            },
                            {
                                "text": "A tokenização se aplica a dado sensível, e a criptografia a dado comum.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time cifra a coluna de salário no data warehouse para protegê-la em repouso. De que fator a segurança desse dado passa a depender mais diretamente?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Da proteção da chave, já que quem a tem consegue reverter a cifra.",
                                "isCorrect": true
                            },
                            {
                                "text": "Do tamanho da tabela, pois tabelas grandes são mais difíceis de ler.",
                                "isCorrect": false
                            },
                            {
                                "text": "Do particionamento, pois particionar impede a leitura da coluna inteira.",
                                "isCorrect": false
                            },
                            {
                                "text": "Da materialização, pois uma view protege melhor que uma tabela física.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um sistema de pagamentos precisa processar transações sem que o número real do cartão trafegue pelos serviços internos, mas ainda referenciando a mesma origem. Qual técnica atende melhor?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Criptografia, cifrando o cartão com uma chave e decifrando em cada serviço.",
                                "isCorrect": false
                            },
                            {
                                "text": "Tokenização, que substitui o cartão por um token ligado a um cofre à parte.",
                                "isCorrect": true
                            },
                            {
                                "text": "Mascaramento, exibindo só os quatro últimos dígitos em cada serviço.",
                                "isCorrect": false
                            },
                            {
                                "text": "Anonimização, removendo qualquer vínculo entre o token e o cartão real.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma equipe aplica apenas mascaramento dinâmico na consulta de uma coluna de PII e conclui que o dado está protegido de ponta a ponta. Por que essa conclusão é arriscada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque o valor original segue completo no armazenamento sob a máscara.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque o mascaramento dinâmico anonimiza o dado e viola a minimização.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque mascarar na consulta cifra a coluna e exige gestão de chave.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque o mascaramento dinâmico só funciona em dado já pseudonimizado.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Privacy by design no pipeline",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Privacy by design no pipeline\n\nPrivacy by design é a ideia de que a privacidade não é um remendo aplicado no fim, é um requisito considerado desde o desenho do pipeline. Para o engenheiro de dados, isso significa tomar decisões de proteção na ingestão e na arquitetura das camadas, não depois que a PII já se espalhou por dezenas de tabelas. O GDPR europeu consagra o mesmo princípio (privacy by design and by default)."
                    },
                    {
                        "type": "text",
                        "value": "## Minimizar na entrada\n\nO primeiro movimento é não coletar o que não se vai usar. Cada coluna de PII que entra no pipeline é um passivo: precisa ser protegida, auditada, retida por prazo e eventualmente apagada. Minimizar na ingestão reduz esse passivo pela raiz, é a aplicação prática do princípio da necessidade."
                    },
                    {
                        "type": "text",
                        "value": "## Proteger cedo e isolar\n\nQuando a PII precisa entrar, o desenho protege desde o começo: mascarar ou tokenizar já na camada bronze/silver, e isolar os dados sensíveis numa área de acesso restrito, separada das tabelas de consumo geral. Assim, a maioria dos consumidores trabalha com dados já protegidos, e só quem tem necessidade real (e autorização) chega ao valor sensível."
                    },
                    {
                        "type": "code",
                        "value": "Fluxo com privacy by design\n\nfonte  -->  bronze (PII isolada,        -->  silver (PII ja mascarada/    -->  gold (sem PII, so o\n            acesso restrito)                 tokenizada)                       necessario para analise)\n            |                                |                                 |\n            retencao curta,                  a maioria dos consumidores        dashboards e metricas\n            so quem precisa                  usa a partir daqui                sem dado pessoal cru"
                    },
                    {
                        "type": "text",
                        "value": "## Retenção e o direito ao esquecimento\n\nPrivacy by design também é planejar o fim do dado: definir por quanto tempo cada dado pessoal é retido e como ele é apagado quando o prazo vence ou o titular pede a eliminação. Um pipeline pensado para privacidade sabe onde cada dado do titular está (via linhagem e classificação) e consegue removê-lo de forma completa, sem deixar cópias esquecidas em uma camada bronze eterna."
                    },
                    {
                        "type": "quote",
                        "value": "O dado pessoal mais seguro é o que nunca foi coletado; o segundo mais seguro é o que foi protegido na entrada, não depois de já ter se espalhado."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que a ideia de privacy by design defende?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Considerar a privacidade desde o desenho do pipeline, não como remendo final.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aplicar as proteções de privacidade só depois do primeiro incidente real.",
                                "isCorrect": false
                            },
                            {
                                "text": "Delegar a privacidade inteiramente à equipe jurídica da empresa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Coletar todo o dado e restringir o acesso apenas na camada de BI.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Ao aplicar privacy by design, qual é a primeira e mais eficaz decisão sobre um campo de PII que nenhum caso de uso atual precisa?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Não coletá-lo, eliminando o passivo pela raiz (minimização).",
                                "isCorrect": true
                            },
                            {
                                "text": "Coletá-lo e mascará-lo dinamicamente em todas as consultas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Coletá-lo e movê-lo para uma camada gold de acesso amplo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Coletá-lo e anonimizá-lo logo depois, na primeira transformação.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Em uma arquitetura medalhão com privacy by design, como a PII costuma ser tratada entre as camadas?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Isolada e restrita na bronze, protegida na silver, fora da gold.",
                                "isCorrect": true
                            },
                            {
                                "text": "Exposta em todas as camadas, com controle de acesso só na gold.",
                                "isCorrect": false
                            },
                            {
                                "text": "Coletada só na gold, onde ficam os dados prontos para consumo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Mantida crua até a gold e mascarada apenas na entrega ao BI.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Por que uma camada bronze que retém dados pessoais crus indefinidamente é um problema para o direito ao esquecimento?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Porque deixa cópias do titular que precisam ser localizadas e apagadas também.",
                                "isCorrect": true
                            },
                            {
                                "text": "Porque a camada bronze não permite consultas SQL de eliminação de linhas.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque dado cru na bronze é sempre classificado como dado sensível.",
                                "isCorrect": false
                            },
                            {
                                "text": "Porque a retenção longa na bronze viola o princípio da transparência.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um pipeline coleta o documento completo do cliente, replica-o em bronze, silver e gold sem proteção, e só restringe o acesso no dashboard final. Que ajuste de privacy by design corrige melhor a raiz do problema?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Minimizar a coleta e proteger a PII na entrada, isolada das demais camadas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Manter a coleta e adicionar uma segunda camada de dashboard restrita.",
                                "isCorrect": false
                            },
                            {
                                "text": "Manter as cópias e criptografar apenas a exibição do documento no BI.",
                                "isCorrect": false
                            },
                            {
                                "text": "Manter tudo e anexar um aviso de consentimento na coleta do documento.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "titulo": "Módulo 7 - Acesso, custo e o fechamento",
        "aulas": [
            {
                "titulo": "Controle de acesso a dados",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Controle de acesso a dados\n\nGovernança (módulo 5) definiu quem é dono de cada dado e qual política se aplica a ele. Privacidade e LGPD (módulo 6) definiram o que é dado pessoal, dado sensível, e como cada um deve ser tratado. Falta a peça que transforma essas duas decisões em algo que o warehouse realmente aplica, a cada consulta: o controle de acesso.\n\nSem controle de acesso técnico, classificação de dado e política de privacidade viram documento. Com ele, a mesma tabela pode ser lida por dez papéis diferentes, cada um enxergando exatamente o que deveria, nem mais, nem menos."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Mecanismo\",\"O que controla\",\"Exemplo\"],[\"RBAC\",\"Quais tabelas e ações (leitura, escrita) um papel pode acessar\",\"O papel financeiro acessa o schema financeiro; o de vendas, não\"],[\"Row-level security (RLS)\",\"Quais linhas de uma tabela liberada o usuário vê\",\"Cada vendedor só vê pedidos da própria regional\"],[\"Column-level security (CLS)\",\"Quais colunas aparecem, e se aparecem mascaradas\",\"Só o papel financeiro vê o salário sem máscara\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## RBAC: papéis, não pessoas\n\nConceder acesso direto a cada pessoa (a Fulana pode ler a tabela X) não escala: a cada contratação, troca de time ou desligamento, alguém precisa lembrar de mexer numa permissão espalhada em algum lugar. O **RBAC** (role-based access control, controle de acesso baseado em papéis) resolve isso por indireção: cria-se um papel que representa uma função (`analista_vendas`, `engenheiro_dados`, `financeiro`), concede-se acesso ao papel, e cada pessoa entra ou sai do papel conforme muda de função.\n\nTrocar de time vira adicionar a pessoa a um papel e remover de outro. Auditar acesso vira olhar a lista de papéis, bem menor do que a lista de pessoas. E um papel não fica esquecido quando alguém sai da empresa, porque nunca foi amarrado a uma pessoa específica."
                    },
                    {
                        "type": "text",
                        "value": "## Least privilege: o mínimo necessário pra função\n\nO princípio do menor privilégio diz que cada papel recebe só o acesso necessário pro trabalho que faz, nada além, e que por padrão o acesso é negado até ser concedido de forma explícita. Na prática, isso significa não conceder leitura sobre todo o warehouse \"pra facilitar\", nem manter um acesso amplo que alguém pediu uma vez, usou uma vez, e nunca mais precisou.\n\nCada permissão extra é superfície de risco: se uma credencial vaza ou uma conta é comprometida, o estrago fica limitado ao que aquele papel específico enxerga. Por isso, revisar periodicamente quem tem acesso a quê, e revogar o que não é mais usado, é parte do princípio, não uma tarefa opcional."
                    },
                    {
                        "type": "text",
                        "value": "## RLS e CLS: a mesma tabela, visões diferentes\n\nDentro de uma tabela que um papel já pode acessar, duas técnicas afinam ainda mais o que cada usuário enxerga. **Row-level security (RLS)** filtra linhas: todo mundo consulta a mesma tabela de pedidos, mas cada vendedor só vê as linhas da própria regional, porque o warehouse aplica um filtro invisível conforme quem está perguntando, sem a consulta precisar desse filtro escrito nela. **Column-level security (CLS)** esconde ou mascara colunas inteiras: a tabela de clientes pode ser lida por vários papéis, mas a coluna de CPF aparece mascarada pra quem não é do papel autorizado.\n\nA vantagem de aplicar RLS e CLS dentro do próprio warehouse, e não em cada dashboard ou aplicação que consome o dado, é que a regra vale pra qualquer jeito de acessar aquela tabela, inclusive uma consulta ad-hoc que ninguém previu de antemão."
                    },
                    {
                        "type": "code",
                        "value": "-- criar um papel e conceder so o necessario (least privilege)\nCREATE ROLE analista_vendas;\nGRANT SELECT ON vendas.pedidos TO ROLE analista_vendas;\nGRANT SELECT ON vendas.clientes TO ROLE analista_vendas;\n-- o papel NAO recebe grant em schema financeiro nem em dados de RH\n\n-- row-level security: cada vendedor so ve pedidos da propria regional\nCREATE ROW ACCESS POLICY politica_regional ON vendas.pedidos\n  AS (regional STRING) RETURNS BOOLEAN ->\n  regional = PAPEL_REGIONAL_ATUAL();\n\n-- column-level security: mascara o cpf pra quem nao e do financeiro\nALTER TABLE vendas.clientes\n  ALTER COLUMN cpf SET MASKING POLICY mascarar_cpf;\n-- sintaxe ilustrativa: cada warehouse tem seu proprio comando de RLS e mascaramento"
                    },
                    {
                        "type": "quote",
                        "value": "Controle de acesso não decide se alguém é confiável, decide até onde vai o estrago se essa confiança for quebrada."
                    }
                ],
                "questions": [
                    {
                        "statement": "Num warehouse com centenas de usuários, conceder acesso a papéis (RBAC), em vez de conceder a cada pessoa individualmente, traz qual vantagem principal?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Revogar ou trocar o acesso de alguém é mudar o papel dela, sem editar permissão individual.",
                                "isCorrect": true
                            },
                            {
                                "text": "O warehouse passa a aplicar RBAC sozinho, sem nenhuma configuração do time de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Papéis dispensam qualquer revisão periódica de quem ainda precisa de determinado acesso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Um papel só pode ser atribuído a uma pessoa por vez, o que evita conflito de permissões.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Qual é a relação correta entre governança de dados e controle de acesso (RBAC, RLS, CLS)?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "São sinônimos: configurar RBAC num schema já equivale a ter um programa de governança.",
                                "isCorrect": false
                            },
                            {
                                "text": "Governança define dono e política; controle de acesso aplica essa política no dado.",
                                "isCorrect": true
                            },
                            {
                                "text": "Controle de acesso substitui a necessidade de definir um dono pra cada conjunto de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Governança é responsabilidade exclusiva do time de segurança, nunca do time de dados.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um vendedor consulta a tabela de pedidos e só vê as linhas da própria regional, embora a consulta em si não tenha nenhum filtro de regional escrito nela. Isso é resultado de qual mecanismo?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Particionamento da tabela por regional, que reduz o volume de dado lido pela consulta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Column-level security, que mascara a coluna de regional pras demais linhas da tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Row-level security, que filtra as linhas retornadas conforme o papel de quem consulta.",
                                "isCorrect": true
                            },
                            {
                                "text": "RBAC aplicado direto na tabela, sem nenhum papel específico envolvido na consulta.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Numa tabela de clientes, a coluna de CPF aparece mascarada pro papel de marketing e completa pro papel financeiro, sem existir duas cópias da tabela. Que mecanismo está em ação?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Anonimização aplicada na origem, que remove o CPF de forma permanente e irreversível.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criptografia da coluna inteira, decifrada automaticamente só pro papel financeiro.",
                                "isCorrect": false
                            },
                            {
                                "text": "Row-level security, que oculta as linhas em que o CPF pertence a clientes sensíveis.",
                                "isCorrect": false
                            },
                            {
                                "text": "Column-level security, que mascara a coluna de forma dinâmica conforme o papel de quem lê.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Uma investigação descobre que um analista desligado há três meses ainda conseguia autenticar no warehouse com acesso total ao schema financeiro, porque o desligamento nunca disparou a remoção do papel dele. Qual prática teria evitado isso?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Revisar periodicamente quem tem cada papel, removendo o acesso no desligamento.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar a granularidade do log de auditoria pra registrar cada consulta do analista.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criptografar todo o schema financeiro, independente de quem tem papel de acesso.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir a frequência de backup do schema financeiro pra limitar a exposição do dado.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Auditoria e trilha de acesso",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Auditoria e trilha de acesso\n\nControle de acesso (aula anterior) decide quem pode ver o quê. Auditoria registra quem de fato acessou, alterou ou exportou cada dado, e quando. As duas coisas são complementares: um papel bem desenhado reduz o risco de acesso indevido, mas não prova, sozinho, que esse acesso indevido não aconteceu. Quem prova é o log.\n\nUma plataforma pode ter o RBAC mais rigoroso do mercado e, ainda assim, ser incapaz de responder a uma pergunta simples: quem consultou essa tabela na última terça-feira? Sem trilha de auditoria, a resposta é sempre a mesma: não sabemos."
                    },
                    {
                        "type": "text",
                        "value": "## O que entra num audit log de dados\n\nUm log de auditoria de dados costuma registrar cinco coisas: quem (usuário ou papel autenticado), o quê (tabela, coluna, às vezes a linha), quando (o timestamp da operação), de onde (IP ou aplicação de origem) e qual operação (leitura, escrita, exportação, alteração de permissão).\n\nBoa parte disso já sai de graça do log de conexão e do log de query que o próprio warehouse mantém. O trabalho real do time de dados é garantir que esse log fica retido pelo tempo certo, que cobre as tabelas sensíveis, e que alguém, de fato, revisa o que ele mostra, em vez de deixá-lo acumulando sem nunca ser lido."
                    },
                    {
                        "type": "text",
                        "value": "## Por que a trilha de auditoria importa\n\nDuas razões práticas sustentam o investimento em audit log. Compliance: um regulador, uma auditoria externa ou o próprio titular do dado pode exigir evidência de quem acessou determinado dado pessoal, e \"confiamos que ninguém abusou\" não é uma resposta aceitável. Investigação: quando um vazamento é suspeitado ou confirmado, o audit log é o que permite reconstruir o que aconteceu, quem tocou no dado exposto e quando, em vez de uma apuração que termina em suposição.\n\nSem log, os dois cenários viram a mesma frase: não temos como saber."
                    },
                    {
                        "type": "text",
                        "value": "## A trilha de auditoria precisa ser imutável\n\nSe quem tem acesso ao dado também consegue editar ou apagar o próprio registro de acesso, o log deixa de servir como evidência: passa a provar só o que a pessoa auditada quis deixar provado. Por isso a trilha de auditoria costuma viver separada do sistema que ela audita, com escrita restrita ao processo que gera o log (ninguém edita ou apaga um registro já gravado) e, quando possível, sob um dono diferente do administrador do warehouse.\n\nUm log que o próprio administrador consegue limpar não é trilha de auditoria, é só um relatório opcional."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Pergunta que o log responde\",\"Campo que guarda a resposta\"],[\"Quem acessou?\",\"Usuário ou papel autenticado\"],[\"O que foi acessado?\",\"Tabela, coluna ou objeto consultado\"],[\"Quando?\",\"Timestamp da operação\"],[\"De onde?\",\"IP ou aplicação de origem\"],[\"O que foi feito?\",\"Tipo de operação: leitura, escrita, exportação, alteração de permissão\"]]"
                    },
                    {
                        "type": "code",
                        "value": "{\n  \"timestamp\": \"2026-07-15T14:32:07Z\",\n  \"usuario\": \"ana.marketing@empresa.com\",\n  \"papel\": \"analista_marketing\",\n  \"operacao\": \"SELECT\",\n  \"objeto\": \"vendas.clientes\",\n  \"colunas\": [\"nome\", \"email\", \"cpf\"],\n  \"linhas_retornadas\": 480000,\n  \"aplicacao_origem\": \"cliente_sql_desconhecido\",\n  \"ip_origem\": \"203.0.113.44\"\n}\n// alerta: papel de marketing raramente consulta cpf, e nunca em massa como essa"
                    },
                    {
                        "type": "quote",
                        "value": "Sem trilha de auditoria, toda investigação de vazamento termina na mesma frase: não temos como saber."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que um audit log de dados registra, fundamentalmente?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O desempenho de cada consulta, pra identificar quais delas custam mais pro warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Quem acessou ou alterou determinado dado, o que fez, e quando isso aconteceu.",
                                "isCorrect": true
                            },
                            {
                                "text": "A qualidade dos dados de cada tabela, apontando campos incompletos ou duplicados.",
                                "isCorrect": false
                            },
                            {
                                "text": "O schema de cada tabela, alertando quando uma coluna muda de tipo sem aviso.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma auditoria externa pede evidência de quem acessou os dados pessoais de um grupo específico de clientes nos últimos seis meses. Qual registro da plataforma responde a esse pedido?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O catálogo de dados, que descreve o schema e o dono de cada tabela envolvida.",
                                "isCorrect": false
                            },
                            {
                                "text": "O data contract firmado entre o time de dados e a área que consome a tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "A trilha de auditoria, que registra quem consultou aquele dado, e quando.",
                                "isCorrect": true
                            },
                            {
                                "text": "O relatório de qualidade, que mostra a completude e a validade da tabela.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time implementa RBAC rigoroso, com papéis bem definidos e least privilege aplicado em todo o warehouse, mas não mantém nenhum audit log. Que pergunta esse time continua incapaz de responder?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Quantos papéis diferentes existem hoje configurados no warehouse da empresa.",
                                "isCorrect": false
                            },
                            {
                                "text": "Quais tabelas cada papel tem permissão de ler, segundo o grant configurado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Se a definição de least privilege está sendo seguida na configuração atual.",
                                "isCorrect": false
                            },
                            {
                                "text": "Se uma pessoa específica consultou determinada tabela numa data específica.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Num warehouse, o mesmo administrador que configura o RBAC também tem permissão de editar e apagar entradas do audit log, caso ache necessário. Qual é o problema disso, do ponto de vista de auditoria?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O log deixa de ser prova confiável, porque quem ele deveria fiscalizar pode alterá-lo.",
                                "isCorrect": true
                            },
                            {
                                "text": "O warehouse fica mais lento, porque cada entrada do log passa por validação dupla.",
                                "isCorrect": false
                            },
                            {
                                "text": "O custo de storage aumenta, porque entradas editadas geram duplicidade no log.",
                                "isCorrect": false
                            },
                            {
                                "text": "O RBAC perde efeito, porque o log de auditoria também concede acesso a tabelas.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O audit log mostra que o papel analista_marketing fez uma consulta retornando 480 mil linhas da tabela de clientes, incluindo a coluna de CPF, a partir de uma aplicação não reconhecida pelo time de dados. Qual é a reação mais adequada?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Ignorar, pois o papel tinha permissão de leitura sobre a tabela consultada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Investigar a consulta como possível incidente, dado o volume e a coluna sensível.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o limite de linhas retornadas, pra evitar que a consulta falhe de novo.",
                                "isCorrect": false
                            },
                            {
                                "text": "Revogar o CPF da tabela inteira, removendo a coluna de todos os papéis existentes.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "FinOps de dados: storage x compute",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# FinOps de dados: storage x compute\n\nUm warehouse moderno (Snowflake, BigQuery, Redshift e afins) separa duas coisas que, num banco tradicional, viviam coladas na mesma máquina: onde o dado fica guardado (**storage**) e o poder de processamento usado pra consultar esse dado (**compute**). A separação é ótima pra escalar, mas move a pergunta \"quanto isso custa\" pra um lugar novo: não basta saber quantos terabytes o time guarda, é preciso saber quanto compute cada consulta consome."
                    },
                    {
                        "type": "text",
                        "value": "## Storage: barato e previsível\n\nGuardar dado em object storage ou num warehouse colunar custa, por gigabyte-mês, um valor pequeno e previsível: a conta cresce de forma linear conforme o volume aumenta, e dado parado, que ninguém consulta, continua custando só o storage dele, nada mais. Comparado ao compute, storage raramente é a linha que explode a fatura no fim do mês."
                    },
                    {
                        "type": "text",
                        "value": "## Compute: onde o custo costuma morar\n\nCompute é cobrado pelo tempo, ou pelo volume de dado, que uma consulta ou um pipeline usa pra processar informação, e é aqui que o custo costuma disparar. Uma consulta mal escrita, rodando várias vezes ao dia sobre uma tabela grande, pode custar sozinha mais do que meses de storage de todo o time. Diferente do storage, compute não cresce de forma óbvia: dobrar a frequência de um dashboard, ou trocar um filtro por uma varredura completa, pode multiplicar o custo sem que o volume de dado guardado tenha mudado nada."
                    },
                    {
                        "type": "text",
                        "value": "## Custo por consulta e por scan\n\nDois modelos comuns de cobrar compute num warehouse na nuvem: por tempo de cluster ligado (paga-se pelo servidor rodando, ocupado ou ocioso) ou por volume de dado escaneado pela consulta (paga-se pelos bytes que precisaram ser lidos pra responder). Nesse segundo modelo, a mesma pergunta de negócio pode custar cem vezes mais ou menos dependendo só de quanto dado a consulta varre: filtrar cedo, ler menos coluna e não reprocessar o que não mudou é, literalmente, dinheiro, o assunto da próxima aula."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Dimensão\",\"Storage\",\"Compute\"],[\"O que é cobrado\",\"Volume de dado guardado, por gigabyte-mês\",\"Tempo de processamento ou dado escaneado\"],[\"Padrão de custo\",\"Cresce devagar e de forma previsível\",\"Pode disparar com uma única consulta\"],[\"Custa algo se ninguém usar\",\"Sim, continua cobrando enquanto o dado existir\",\"Não, compute parado não gera custo\"],[\"Onde costuma valer mais otimizar\",\"Ajuda, mas raramente é o maior vilão\",\"Costuma ser o maior ganho possível\"]]"
                    },
                    {
                        "type": "code",
                        "value": "-- consulta A: varre a tabela inteira pra achar os pedidos de ontem\nSELECT * FROM vendas.pedidos\nWHERE DATE(criado_em) = '2026-07-16';\n-- sem filtro de particao, escaneia anos de historico pra achar um unico dia\n\n-- consulta B: mesma pergunta, aproveitando particao e colunas especificas\nSELECT id, cliente_id, valor_total FROM vendas.pedidos\nWHERE data_particao = '2026-07-16';\n-- escaneia so a particao do dia, le so 3 colunas em vez da tabela inteira"
                    },
                    {
                        "type": "quote",
                        "value": "Num warehouse moderno, guardar dado é barato. Consultar dado do jeito errado é que sai caro."
                    }
                ],
                "questions": [
                    {
                        "statement": "O que significa, na prática, um warehouse moderno separar storage e compute?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Guardar e processar dado são cobrados sempre pela mesma taxa fixa, por gigabyte.",
                                "isCorrect": false
                            },
                            {
                                "text": "O dado precisa ser copiado pra um servidor de processamento antes de qualquer consulta.",
                                "isCorrect": false
                            },
                            {
                                "text": "Guardar dado e processar dado são cobrados, e escalam, de forma independente.",
                                "isCorrect": true
                            },
                            {
                                "text": "Compute sempre custa menos que storage, independente de quantas consultas rodam.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "A fatura do warehouse de um time cresceu oito vezes num mês, enquanto o volume de dado guardado (storage) cresceu só cerca de 5%. Onde faz mais sentido investigar primeiro?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "No contrato de storage, renegociando o preço por gigabyte com o provedor.",
                                "isCorrect": false
                            },
                            {
                                "text": "No catálogo de dados, verificando se todas as tabelas têm dono definido.",
                                "isCorrect": false
                            },
                            {
                                "text": "No processo de backup, reduzindo a frequência de cópias de segurança.",
                                "isCorrect": false
                            },
                            {
                                "text": "No compute, revisando consultas, jobs e dashboards que rodam sobre os dados.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Num warehouse que cobra por volume de dado escaneado por consulta, uma consulta com SELECT * numa tabela de 2 TB sem nenhum filtro de partição, comparada a uma que lê só a partição de um dia, tende a:",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Custar bem mais, mesmo respondendo exatamente à mesma pergunta de negócio.",
                                "isCorrect": true
                            },
                            {
                                "text": "Custar o mesmo, já que o preço por consulta independe do volume escaneado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Custar menos, porque varrer a tabela inteira usa um único job mais eficiente.",
                                "isCorrect": false
                            },
                            {
                                "text": "Não gerar nenhum custo de compute, apenas custo adicional de storage.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Time A guarda 50 TB de dado histórico, raramente consultado, e roda poucas consultas por dia. Time B guarda 2 TB, mas mantém quarenta dashboards atualizando a cada cinco minutos, sem filtro de data. Qual time tende a gerar a maior fatura?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Time A, porque o volume de dado guardado é o principal fator de custo num warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Time B, porque o compute das consultas frequentes costuma pesar mais que o storage.",
                                "isCorrect": true
                            },
                            {
                                "text": "Os dois pagam o mesmo, já que o preço do warehouse é fixo por usuário cadastrado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum dos dois, pois storage e compute são sempre cobrados numa única taxa combinada.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Num warehouse tradicional, instalado numa única máquina, dobrar a capacidade de consulta exige comprar um servidor maior, o que também encarece guardar dado que nem estava sendo mais consultado. Qual vantagem a separação entre storage e compute resolve nesse cenário?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Elimina de vez a necessidade de otimizar qualquer consulta escrita pelo time.",
                                "isCorrect": false
                            },
                            {
                                "text": "Garante que o storage nunca gera custo, independente do volume guardado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Permite aumentar compute sem pagar mais storage, e o oposto também vale.",
                                "isCorrect": true
                            },
                            {
                                "text": "Faz o compute custar sempre menos que o storage, em qualquer cenário de uso.",
                                "isCorrect": false
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "Otimizar custo de dados",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# Otimizar custo de dados\n\nA aula anterior mostrou onde o custo mora (compute, na maior parte dos casos) e como ele é cobrado (tempo de cluster ou volume escaneado). Esta aula é sobre o que fazer a respeito: um conjunto de técnicas que, aplicadas com disciplina, costuma cortar a fatura de um warehouse sem cortar nenhuma funcionalidade, porque ataca o desperdício, não o uso legítimo."
                    },
                    {
                        "type": "text",
                        "value": "## Particionar e clusterizar: ler só o que interessa\n\nParticionar divide fisicamente uma tabela grande em pedaços, por data costuma ser o mais comum, um pedaço por dia ou por mês, e uma consulta que filtra por esse campo lê só as partições relevantes, ignorando o resto. Clusterizar, ordenar fisicamente o dado por outra coluna, tem efeito parecido pra campos que não são a partição principal, ajudando o motor a pular blocos inteiros que certamente não atendem ao filtro.\n\nAs duas técnicas reduzem quanto dado a consulta precisa varrer. E menos varredura, como visto na aula anterior, é, direto, menos custo de compute."
                    },
                    {
                        "type": "text",
                        "value": "## Materializar de forma incremental, e o lifecycle do storage frio\n\nRecalcular uma tabela inteira toda vez que o pipeline roda desperdiça compute reprocessando um dado que já estava certo e não mudou. Materializações incrementais (o padrão já visto na trilha de modern data stack, com o dbt) processam só o que é novo ou mudou desde a última execução, em vez de refazer a tabela do zero, e costumam ser a maior alavanca de custo disponível num pipeline que já roda há anos.\n\nDo lado do storage, nem todo dado consultado ontem precisa ficar no nível mais caro pelos próximos cinco anos: políticas de lifecycle movem dado antigo e raramente acessado pra camadas mais frias e mais baratas, ou arquivam automaticamente depois de um tempo definido, preservando o histórico sem pagar preço de storage quente por algo que ninguém consulta no dia a dia."
                    },
                    {
                        "type": "text",
                        "value": "## Evitar SELECT * e o full scan desnecessário\n\n`SELECT *` lê toda coluna da tabela mesmo quando o relatório usa só três delas, e uma consulta sem filtro pela coluna de partição varre dado que poderia ter sido descartado antes mesmo de começar a processar. Em Spark, o mesmo princípio aparece na leitura de arquivos Parquet: selecionar só as colunas necessárias evita ler o arquivo inteiro do disco, porque o formato colunar permite pular o resto.\n\nNo lakehouse, comandos de manutenção como o `OPTIMIZE` (compactar arquivos pequenos) e o vacuum (remover arquivo órfão) mantêm o custo de leitura sob controle à medida que a tabela recebe merge e updates ao longo do tempo."
                    },
                    {
                        "type": "table",
                        "value": "[[\"Técnica\",\"O que reduz\",\"Onde aparece\"],[\"Particionamento e clustering\",\"Volume de dado escaneado por consulta\",\"Warehouse e tabelas do lakehouse\"],[\"Materialização incremental\",\"Reprocessamento de dado que não mudou\",\"Modelos dbt e pipelines de transformação\"],[\"Lifecycle de storage\",\"Custo de storage de dado frio\",\"Object storage e camadas do warehouse\"],[\"Evitar SELECT * e full scan\",\"Bytes lidos por consulta ou job Spark\",\"Consultas SQL e leitura de Parquet no Spark\"]]"
                    },
                    {
                        "type": "code",
                        "value": "-- antes: recalcula a tabela inteira a cada execucao (custo cresce com o historico todo)\n{{ config(materialized='table') }}\nSELECT * FROM {{ ref('stg_pedidos') }}\n\n-- depois: processa so os pedidos novos desde a ultima execucao\n{{ config(materialized='incremental', unique_key='pedido_id') }}\nSELECT * FROM {{ ref('stg_pedidos') }}\n{% if is_incremental() %}\nWHERE criado_em > (SELECT max(criado_em) FROM {{ this }})\n{% endif %}\n\n# leitura em Spark: ler so as colunas necessarias, nao o parquet inteiro\ndf = (\n    spark.read.parquet(\"s3://lake/silver/pedidos\")\n    .select(\"pedido_id\", \"cliente_id\", \"valor_total\")\n    .filter(\"data_particao = '2026-07-16'\")\n)"
                    }
                ],
                "questions": [
                    {
                        "statement": "O que particionamento e clustering reduzem, numa consulta bem filtrada?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "O número de usuários que podem consultar a tabela ao mesmo tempo.",
                                "isCorrect": false
                            },
                            {
                                "text": "O tempo de retenção configurado pro backup da tabela no warehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "A quantidade de colunas que existem na definição da tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "O volume de dado que a consulta precisa escanear pra responder.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Um modelo dbt que processa 200 milhões de linhas está configurado como materialized='table' e recalcula tudo a cada execução, embora só cerca de 50 mil linhas novas cheguem por dia. Qual mudança reduz o custo de compute sem perder dado?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Trocar pra materialized='incremental', processando só as linhas novas.",
                                "isCorrect": true
                            },
                            {
                                "text": "Aumentar o cluster de computação, pra a mesma consulta rodar num tempo menor.",
                                "isCorrect": false
                            },
                            {
                                "text": "Trocar o formato de saída da tabela de Parquet pra CSV, economizando espaço.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzir a frequência de execução do pipeline pra uma vez por mês, só isso.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um dashboard financeiro roda SELECT * sobre uma tabela de pedidos particionada por data, filtrando por cliente_id mas sem nenhum filtro pela coluna de partição. O que acontece com o particionamento nesse caso?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O warehouse aplica a partição mais recente automaticamente, sem precisar de filtro.",
                                "isCorrect": false
                            },
                            {
                                "text": "A consulta varre todas as partições, porque não há filtro pela coluna de partição.",
                                "isCorrect": true
                            },
                            {
                                "text": "A tabela deixa de estar particionada a partir do momento dessa consulta rodar.",
                                "isCorrect": false
                            },
                            {
                                "text": "O resultado da consulta vem incompleto, faltando registros de dias anteriores.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela de eventos de cinco anos atrás é acessada em média uma vez por trimestre, mas continua na mesma camada de storage quente usada pelos dados do último mês. Qual ação reduz o custo sem descartar o histórico?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Apagar definitivamente todo dado com mais de um ano de existência na tabela.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o número de réplicas desse dado, melhorando o tempo de leitura dele.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aplicar uma política de lifecycle que mova esse dado pra uma camada mais fria.",
                                "isCorrect": true
                            },
                            {
                                "text": "Converter o dado de Parquet pra CSV, um formato mais compacto em disco.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um job Spark lê um diretório de Parquet selecionando só três colunas de uma tabela com quarenta, e um pipeline dbt roda periodicamente o OPTIMIZE pra compactar arquivos pequenos gerados por updates incrementais. Do ponto de vista de custo, o que essas duas práticas têm em comum?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Aumentam a durabilidade do dado armazenado, protegendo contra perda por falha de disco.",
                                "isCorrect": false
                            },
                            {
                                "text": "Garantem que o schema da tabela nunca muda, mesmo com updates incrementais frequentes.",
                                "isCorrect": false
                            },
                            {
                                "text": "Eliminam de vez a necessidade de particionar qualquer tabela do lakehouse.",
                                "isCorrect": false
                            },
                            {
                                "text": "Reduzem o volume de dado que as consultas seguintes vão precisar ler.",
                                "isCorrect": true
                            }
                        ]
                    }
                ]
            },
            {
                "titulo": "O fechamento: a plataforma de dados confiável",
                "blocks": [
                    {
                        "type": "text",
                        "value": "# O fechamento: a plataforma de dados confiável\n\nEsta é a última aula da trilha, e também a última aula do roadmap inteiro de Engenharia de Dados. Ela não traz conceito novo: amarra o que foi construído, módulo a módulo, trilha a trilha, numa ideia só. Uma plataforma de dados confiável não é a que usa a ferramenta mais recente, é a que entrega o mesmo número, com a mesma definição, pra qualquer pessoa que perguntar, e cuja origem qualquer pessoa da empresa consegue rastrear quando o número parece errado."
                    },
                    {
                        "type": "text",
                        "value": "## Do dado bruto à plataforma confiável, numa linha\n\nO caminho que essa trilha, e o roadmap inteiro, percorreu pode ser resumido assim: a ingestão traz o dado de onde ele nasce até onde a empresa consegue usá-lo; a orquestração garante que esse trajeto aconteça na ordem certa, todo dia, mesmo quando algo falha; o processamento distribuído e o lakehouse guardam e transformam esse dado em escala, de forma organizada; o modern data stack transforma dado bruto em modelo testado, documentado, com uma métrica única; e qualidade, observabilidade, lineage, governança, privacidade, acesso e custo, o conteúdo desta trilha, são o que faz esse conjunto inteiro continuar funcionando mês após mês, sem depender da memória de uma única pessoa.\n\nO diagrama a seguir resume essa cadeia."
                    },
                    {
                        "type": "code",
                        "value": "fonte (banco, API, arquivo)\n  -> ingestao / ETL-ELT (extracao, formatos, incrementos)\n    -> orquestracao (agenda, encadeia, garante ordem e retentativa)\n      -> processamento distribuido (Spark) + lakehouse (bronze / silver / gold)\n        -> modern data stack (dbt: modelos, testes, metrica unica)\n          -> consumo (dashboard, modelo de ML, API)\n\nem toda etapa dessa cadeia, ao mesmo tempo:\n  qualidade (testa) . observabilidade (monitora) . lineage e catalogo (explica)\n  governanca (define dono e politica) . privacidade (protege) . acesso e custo (controla)"
                    },
                    {
                        "type": "table",
                        "value": "[[\"Fase\",\"Estágios do roadmap de Engenharia de Dados\"],[\"Fundamentos\",\"Lógica de programação, Python, SQL e bancos de dados\"],[\"Core\",\"Análise de dados com Python, Modelagem de dados e data warehousing, ETL e ELT, Orquestração de pipelines\"],[\"Avançado\",\"Processamento distribuído com Spark, Data lake e lakehouse, Streaming de dados, Modern data stack\"],[\"Capstone\",\"Qualidade e Governança de Dados: o fechamento de acesso, custo, qualidade e confiança\"]]"
                    },
                    {
                        "type": "text",
                        "value": "## O que caracteriza um bom engenheiro de dados\n\nNão é quem conhece mais ferramentas. É quem trata pipeline quebrado ou dado errado como incidente, não como detalhe, porque entende que decisão de negócio depende daquele número. É quem escreve pensando em quem vai dar manutenção dali a um ano, não só em fazer rodar hoje. É quem testa e documenta antes de alguém perguntar, em vez de reagir depois que o painel já quebrou. É quem sabe quanto custa cada decisão técnica, não só se ela funciona. E é quem trata qualidade, governança e privacidade como parte do desenho desde o início, não como etapa extra no fim do projeto."
                    },
                    {
                        "type": "quote",
                        "value": "Uma plataforma de dados confiável não é a que nunca falha, é a que avisa antes de alguém confiar no número errado."
                    },
                    {
                        "type": "text",
                        "value": "## Fim da trilha, fim do roadmap, início do trabalho de verdade\n\nTerminar este roadmap não significa saber tudo, significa ter o mapa e o vocabulário pra continuar aprendendo dentro de um time de dados real, onde cada empresa combina essas peças de um jeito um pouco diferente. Da lógica de programação até aqui, o fio condutor foi sempre o mesmo: dado em que alguém confia é dado tratado com cuidado, do início ao fim, por quem entende tanto a ferramenta quanto o motivo dela existir. Esse alguém, a partir de agora, é quem chegou até o final desta trilha."
                    }
                ],
                "questions": [
                    {
                        "statement": "No mapa do roadmap de Engenharia de Dados, a fase core reúne modelagem, ETL e orquestração, e a fase avançada reúne Spark, lakehouse, streaming e modern data stack. Qual é a lógica dessa progressão?",
                        "difficulty": "facil",
                        "options": [
                            {
                                "text": "Core cobre construir e mover dado de forma confiável; avançado cobre processar em escala.",
                                "isCorrect": true
                            },
                            {
                                "text": "Core é conteúdo opcional pro roadmap; avançado é obrigatório pra quem busca uma certificação.",
                                "isCorrect": false
                            },
                            {
                                "text": "Core ensina só SQL; avançado ensina só ferramentas em Python, sem nenhuma linha de SQL.",
                                "isCorrect": false
                            },
                            {
                                "text": "Core é voltado a quem já atua na área; avançado é voltado a quem está começando do zero.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Um time já usa Airflow, Spark, um lakehouse em camadas e o dbt há meses, mas ninguém confia nos números do painel de vendas, porque toda semana aparece uma surpresa diferente. Segundo esta trilha, o que provavelmente falta nesse time?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Trocar o Airflow por outro orquestrador mais recente, resolvendo a raiz do problema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Uma camada de qualidade, observabilidade e governança sobre o que o time já construiu.",
                                "isCorrect": true
                            },
                            {
                                "text": "Migrar o lakehouse pra outro table format, o que costuma restaurar a confiança no dado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar o cluster do Spark, processando o mesmo pipeline de forma mais rápida.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "O pipeline A roda em dez minutos, sem teste, sem documentação e sem dono definido. O pipeline B roda em vinte e cinco minutos, com teste, trilha de auditoria e dono claro. Qual dos dois constrói melhor uma plataforma de dados confiável?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "O pipeline A, porque velocidade de execução é o critério mais importante em produção.",
                                "isCorrect": false
                            },
                            {
                                "text": "Nenhum dos dois, pois confiabilidade só existe com aprovação formal da área jurídica.",
                                "isCorrect": false
                            },
                            {
                                "text": "O pipeline B, porque confiabilidade depende de teste, rastreabilidade e dono definido.",
                                "isCorrect": true
                            },
                            {
                                "text": "Os dois são equivalentes, já que entregam exatamente o mesmo resultado no final.",
                                "isCorrect": false
                            }
                        ]
                    },
                    {
                        "statement": "Uma tabela usada por um dashboard financeiro não tem dono definido, não passa por nenhum teste de qualidade, e é lida com SELECT * numa consulta que varre cinco anos de histórico a cada atualização. Qual conjunto de ações ataca as três causas ao mesmo tempo?",
                        "difficulty": "dificil",
                        "options": [
                            {
                                "text": "Aumentar o cluster de computação do warehouse e trocar a ferramenta de BI usada.",
                                "isCorrect": false
                            },
                            {
                                "text": "Criptografar a tabela inteira e restringir o acesso a um único usuário administrador.",
                                "isCorrect": false
                            },
                            {
                                "text": "Aumentar a frequência de atualização do painel e duplicar a tabela em outro schema.",
                                "isCorrect": false
                            },
                            {
                                "text": "Definir um dono, adicionar teste de qualidade e ajustar a consulta pro período necessário.",
                                "isCorrect": true
                            }
                        ]
                    },
                    {
                        "statement": "Segundo o fechamento desta trilha, o que significa, na prática, ter concluído o roadmap de Engenharia de Dados do início ao fim?",
                        "difficulty": "medio",
                        "options": [
                            {
                                "text": "Ter o mapa e o vocabulário pra continuar aprendendo dentro de um time de dados real.",
                                "isCorrect": true
                            },
                            {
                                "text": "Nunca mais precisar estudar uma ferramenta nova, pois o roadmap cobre tudo do mercado.",
                                "isCorrect": false
                            },
                            {
                                "text": "Estar pronto pra atuar sozinho, sem depender de mais ninguém do time de dados.",
                                "isCorrect": false
                            },
                            {
                                "text": "Ter decorado a sintaxe de todas as ferramentas citadas ao longo de cada trilha.",
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
