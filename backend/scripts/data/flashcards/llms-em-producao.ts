import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de LLMs em Produção, quinta e última trilha do roadmap de Engenharia
 * de IA.
 *
 * Sem trilhos de linguagem: tudo em "neutra".
 *
 * Mesma régua das demais. Esta trilha é de operação, então sobram os nomes de
 * viés, os campos que cada span registra e as suspeitas que cada alerta levanta,
 * que é o tipo de coisa consultada sob pressão e esquecida entre um incidente e
 * outro.
 */
export const llmsEmProducao: CartasDaTrilha = {
    trilha: "LLMs em Produção",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Quem escolhe os casos num demo, e quem escolhe em produção?",
                        verso: "No demo, você. Em produção, o usuário, inclusive os casos raros.",
                    },
                    {
                        frente: "Qual é a meta de um produto, diferente da de um demo?",
                        verso: "Ser confiável no percentil 95, não impressionar uma vez.",
                    },
                    {
                        frente: "O que fazer quando o provedor lança um modelo novo?",
                        verso: "Passar pela suíte antes de subir, em vez de trocar na empolgação.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que quatro fontes alimentam o golden set?",
                        verso: "Logs reais, tíquetes de suporte, arestas inventadas e adversariais.",
                    },
                    {
                        frente: "Que papel os casos adversariais cumprem no conjunto?",
                        verso: "Medir a resistência ao pior cenário, como tentativa de injection.",
                    },
                    {
                        frente: "Que papel as arestas inventadas cumprem?",
                        verso: "Cobrir o raro antes de acontecer: entrada vazia, outra língua.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quanto custa uma métrica objetiva por caso?",
                        verso: "Zero. Ela roda em milissegundos.",
                    },
                    {
                        frente: "Que métrica avalia campos extraídos?",
                        verso: "Exact match e F1 por campo.",
                    },
                    {
                        frente: "Qual tipo de saída obriga a usar juiz?",
                        verso: "Texto livre, onde qualidade tem várias dimensões.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que é o viés de verbosidade do juiz?",
                        verso: "Resposta longa ganha da correta; a rubrica precisa exigir concisão.",
                    },
                    {
                        frente: "O que é o viés de auto-preferência?",
                        verso: "O juiz dá nota maior ao estilo do próprio modelo.",
                    },
                    {
                        frente: "Como mitigar o viés de auto-preferência?",
                        verso: "Usando um juiz de família diferente.",
                    },
                    {
                        frente: "Na divisão de trabalho com o juiz, o que é a rubrica?",
                        verso: "O seu produto. O juiz é só o estagiário que a aplica.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que mudanças exigem rodar a suíte inteira?",
                        verso: "Prompt do sistema e troca de modelo.",
                    },
                    {
                        frente: "Por que a troca de modelo pede rodar o custo junto?",
                        verso: "Comportamento e preço mudam juntos.",
                    },
                    {
                        frente: "O que rodar depois de corrigir um bug pontual?",
                        verso: "O caso novo e a vizinhança dele.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Para que servem os identificadores de usuário e sessão no log?",
                        verso: "Seguir o fio de uma reclamação até a chamada exata.",
                    },
                    {
                        frente: "Que tratamento os prompts logados exigem por conterem dado pessoal?",
                        verso: "Mascarar, restringir acesso e definir retenção.",
                    },
                    {
                        frente: "O que o registro de tokens e custo por chamada habilita?",
                        verso: "Fechar a conta do produto com dado, não com estimativa.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que um span de rerank deve registrar?",
                        verso: "A ordem antes e depois da reordenação.",
                    },
                    {
                        frente: "O que um span de ferramenta registra num agente?",
                        verso: "Os argumentos e o resultado resumido.",
                    },
                    {
                        frente: "O que correlaciona os spans de uma requisição?",
                        verso: "Um identificador comum, formando a árvore do trace.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que critérios guiam a escolha da ferramenta de observabilidade?",
                        verso: "Hospedagem, integração, avaliação, gestão de prompt e abertura.",
                    },
                    {
                        frente: "Quando a gestão de prompts pesa na escolha da ferramenta?",
                        verso: "Quando o time itera muito em prompt.",
                    },
                    {
                        frente: "Por que a trilha ensina critério em vez de ranking de ferramenta?",
                        verso: "Nomes e líderes mudam rápido; os critérios permanecem.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que suspeita levantar quando a taxa de erro da API dispara?",
                        verso: "Incidente do provedor.",
                    },
                    {
                        frente: "Que suspeita levantar quando o p95 de latência estoura o SLO?",
                        verso: "Provedor degradado, ou prompt que inchou.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Qual sinal implícito tem a confiabilidade mais baixa?",
                        verso: "O abandono da sessão: tem muitas causas possíveis.",
                    },
                    {
                        frente: "O que a cópia da resposta pelo usuário sinaliza?",
                        verso: "Sinal implícito positivo, de confiabilidade média.",
                    },
                    {
                        frente: "Como uma reclamação vira vacina?",
                        verso: "Virando caso na suíte, depois do trace e do diagnóstico.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que perfil de produto tem o custo dominado pelas voltas do loop?",
                        verso: "O agente. A alavanca é limite de voltas e dieta de contexto.",
                    },
                    {
                        frente: "O que domina o custo de uma geração longa, como relatório?",
                        verso: "Os tokens de saída. A alavanca é limitar o tamanho.",
                    },
                    {
                        frente: "Em três cenários de projeção de custo, quais são eles?",
                        verso: "Médio, percentil 95 e abuso.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Onde vive o cache semântico, diferente do cache de prompt?",
                        verso: "Na sua infra, em Redis ou pgvector, e não no provedor.",
                    },
                    {
                        frente: "O que o cache semântico economiza, diferente do de prompt?",
                        verso: "A chamada inteira, e não só o reprocessamento do prefixo.",
                    },
                    {
                        frente: "O que fazer com o cache semântico quando a base é atualizada?",
                        verso: "Invalidar, senão ele serve resposta velha com confiança.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que é a estratégia de roteamento por escolha do produto?",
                        verso: "A própria feature define o tier: simples e previsível.",
                    },
                    {
                        frente: "Qual é o custo da escalada por falha?",
                        verso: "A latência dobra no caso difícil, que tenta duas vezes.",
                    },
                    {
                        frente: "Como se vigia a qualidade de um roteamento?",
                        verso: "Com uma suíte de avaliação por rota, e não só no agregado.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Qual é o canal certo quando ninguém espera e o volume é grande?",
                        verso: "A Batch API, com prazo de horas e cerca de metade do preço.",
                    },
                    {
                        frente: "Qual é o canal certo para análise pronta em minutos?",
                        verso: "Fila própria com workers, respeitando o rate limit.",
                    },
                    {
                        frente: "Por que jobs de fila precisam ser idempotentes?",
                        verso: "Retry acontece, e o job repetido não pode duplicar o efeito.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Qual alavanca de latência muda só a percepção, e não o real?",
                        verso: "Estados visíveis na interface: a espera vira progresso.",
                    },
                    {
                        frente: "O que paralelizar etapas faz com o tempo total?",
                        verso: "A soma vira o máximo entre elas.",
                    },
                    {
                        frente: "Por que custo e latência costumam melhorar juntos?",
                        verso: "Contexto menor custa menos tokens e processa mais rápido.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Qual é a diferença entre injection direta e indireta?",
                        verso: "A direta vem do usuário; a indireta vem escondida no que o sistema lê.",
                    },
                    {
                        frente: "Por que lista negra de palavras falha contra injection?",
                        verso: "A linguagem natural tem variações infinitas para o mesmo pedido.",
                    },
                    {
                        frente: "Por que o system prompt não deve conter segredo?",
                        verso: "Ele pode vazar; projete assumindo que será lido um dia.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que guardrail de saída protege especificamente o RAG?",
                        verso: "Groundedness: a resposta precisa se apoiar nos documentos.",
                    },
                    {
                        frente: "Em que ordem organizar as checagens do pipeline?",
                        verso: "Baratas e rápidas primeiro; juiz de LLM só onde for crítico.",
                    },
                    {
                        frente: "Qual é o custo de um guardrail agressivo demais?",
                        verso: "Falso positivo: uso legítimo bloqueado e usuário frustrado.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Na LGPD, quem é controlador e quem é operador numa chamada de API?",
                        verso: "Sua empresa controla; o provedor opera sob contrato.",
                    },
                    {
                        frente: "O que verificar no contrato com o provedor sobre dados?",
                        verso: "Treino com seus dados, retenção, local e DPA assinado.",
                    },
                    {
                        frente: "Além do banco principal, onde o dado de um titular pode estar?",
                        verso: "Em logs, traces, caches, memórias e embeddings derivados.",
                    },
                    {
                        frente: "Que risco os embeddings da base carregam?",
                        verso: "Reidentificação indireta: são dado, e se apagam junto.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Qual é o papel do backend proxy entre o app e o provedor?",
                        verso: "Proteger a chave e aplicar autenticação, limites e log.",
                    },
                    {
                        frente: "Qual é o primeiro passo ao achar a chave num commit público?",
                        verso: "Revogar imediatamente e auditar o uso dela.",
                    },
                    {
                        frente: "Que risco o acesso interno indevido representa?",
                        verso: "Logs com dado pessoal abertos ao time inteiro.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que é a suíte adversarial?",
                        verso: "Um golden set de ataques que roda como teste de regressão.",
                    },
                    {
                        frente: "O que é um kill switch num produto com IA?",
                        verso: "Um flag que desliga ou restringe a IA sem precisar de deploy.",
                    },
                    {
                        frente: "Quais são as cinco fases de um incidente?",
                        verso: "Detectar, conter, comunicar, corrigir e aprender.",
                    },
                    {
                        frente: "Por que o red team caseiro complementa a ferramenta automática?",
                        verso: "Ele mira as regras e os fluxos específicos do seu produto.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Por que o estado da conversa não pode viver na RAM da réplica?",
                        verso: "Com várias réplicas, a próxima requisição cai em outra máquina.",
                    },
                    {
                        frente: "O que a fila com workers absorve na arquitetura?",
                        verso: "Picos e o trabalho assíncrono, evitando 429 na cara do usuário.",
                    },
                    {
                        frente: "Onde os guardrails devem rodar?",
                        verso: "No seu backend, antes e depois da chamada ao provedor.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Para que serve o jitter no backoff?",
                        verso: "Evitar que todos os clientes tentem de novo em sincronia.",
                    },
                    {
                        frente: "O que o circuit breaker faz que o retry não faz?",
                        verso: "Para de insistir na falha sistêmica e testa a volta em meia-abertura.",
                    },
                    {
                        frente: "Por que homologar o modelo de fallback antes do incidente?",
                        verso: "Descobrir a qualidade do plano B durante a crise é tarde.",
                    },
                    {
                        frente: "O que fazer quando o principal e o fallback caem juntos?",
                        verso: "Degradação honesta: mensagem clara, sem nunca fingir que funcionou.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que um 429 esporádico costuma indicar?",
                        verso: "Rajada local passageira, que o backoff resolve sozinho.",
                    },
                    {
                        frente: "A fila cresce e os workers estão no teto. Escalar workers resolve?",
                        verso: "Não. O gargalo é o teto: negociar limite ou somar provedor.",
                    },
                    {
                        frente: "O que um 429 constante fora de pico denuncia?",
                        verso: "Loop ou abuso interno queimando cota.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que é o deploy canário de um prompt?",
                        verso: "Servir a versão nova a uma fração e comparar as métricas.",
                    },
                    {
                        frente: "Qual é a diferença de propósito entre canário e teste A/B?",
                        verso: "O canário barra regressão; o A/B escolhe entre versões boas.",
                    },
                    {
                        frente: "Por que fixar a versão do modelo em vez de usar o alias recente?",
                        verso: "Upgrade silencioso muda o comportamento sem passar na esteira.",
                    },
                    {
                        frente: "Que esteira uma ferramenta nova no agente exige a mais?",
                        verso: "A suíte adversarial, porque a superfície de ataque cresce.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que é um runbook?",
                        verso: "Passos prontos por cenário, para agir durante o incidente.",
                    },
                    {
                        frente: "Por que todo alerta precisa de runbook associado?",
                        verso: "Alerta sem ação clara vira ruído e passa a ser ignorado.",
                    },
                    {
                        frente: "O custo por hora estourou de madrugada. Qual é o primeiro movimento?",
                        verso: "Achar a feature ou usuário que queima e conter com quota.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Qual é a ordem da escada de intervenção?",
                        verso: "Prompt primeiro, depois RAG e por último fine-tuning.",
                    },
                    {
                        frente: "O que o fine-tuning oferece a um prompt gigante de instruções?",
                        verso: "Destilar as instruções no peso e encurtar o prompt em produção.",
                    },
                    {
                        frente: "Como corrigir um caso pontual que errou?",
                        verso: "Com caso na suíte e ajuste de prompt: cirúrgico e reversível.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que é SFT?",
                        verso: "Treinar com pares de entrada e saída ideais, para o modelo imitar.",
                    },
                    {
                        frente: "Qualidade ou quantidade no dataset de SFT?",
                        verso: "Centenas de exemplos excelentes batem milhares medianos.",
                    },
                    {
                        frente: "Qual é o sinal clássico de overfitting no tune?",
                        verso: "Métrica de treino ótima e desempenho pior na avaliação.",
                    },
                    {
                        frente: "Contra que baseline o modelo ajustado deve ser comparado?",
                        verso: "Contra o modelo base com um prompt bom, não com baseline fraco.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o DPO otimiza?",
                        verso: "A escolha entre duas respostas: aprender a preferida.",
                    },
                    {
                        frente: "Por que o DPO virou padrão em times de produto?",
                        verso: "Treina direto nos pares, sem modelo de recompensa nem RL.",
                    },
                    {
                        frente: "De onde saem bons pares de preferência quase de graça?",
                        verso: "Do feedback de produção: joinhas e respostas editadas.",
                    },
                    {
                        frente: "Qual é a ordem entre SFT e treino de preferência?",
                        verso: "Preferência depois do SFT, quando o subjetivo estagna.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Qual é a ideia central do LoRA?",
                        verso: "Congelar o modelo base e treinar matrizes pequenas anexas.",
                    },
                    {
                        frente: "Como o LoRA viabiliza um modelo por cliente?",
                        verso: "Um base na GPU e adapters trocados dinamicamente por requisição.",
                    },
                    {
                        frente: "O que o QLoRA acrescenta ao LoRA?",
                        verso: "Base quantizado no treino: cabe em GPU ainda menor.",
                    },
                    {
                        frente: "De que tamanho é o artefato de uma versão em LoRA?",
                        verso: "Megabytes, contra gigabytes de um checkpoint completo.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Qual requisito elimina a API fechada de cara?",
                        verso: "Dado que não pode sair da infraestrutura por regulação.",
                    },
                    {
                        frente: "Por que GPU ociosa muda a conta do self-host?",
                        verso: "O custo é fixo por mês; sem volume constante, vira prejuízo.",
                    },
                    {
                        frente: "O que o vLLM oferece a quem serve modelo aberto?",
                        verso: "Inferência eficiente com batching e API compatível.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "O que são requisitos não funcionais de um produto com IA?",
                        verso: "Orçamento, latência, disponibilidade, privacidade e segurança.",
                    },
                    {
                        frente: "Para que serve a gap analysis antes de lançar?",
                        verso: "Mapear o que falta entre o demo e a operação real.",
                    },
                    {
                        frente: "Por que registrar decisões em ADRs curtos?",
                        verso: "O porquê de cada escolha sobrevive à memória do time.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Por que a suíte inicial já inclui casos adversariais?",
                        verso: "Para medir a resistência a injection desde o primeiro dia.",
                    },
                    {
                        frente: "O que o baseline registrado permite?",
                        verso: "Comparar qualquer mudança futura com o ponto de partida.",
                    },
                    {
                        frente: "Qual é o papel da revisão semanal de conversas?",
                        verso: "Achar padrões que a métrica não pega e gerar casos novos.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a quota por cliente protege?",
                        verso: "O orçamento mensal contra abuso e uso desmedido.",
                    },
                    {
                        frente: "O que valida a rota barata antes de ela pegar o grosso do tráfego?",
                        verso: "A suíte rodada nela, comparada com o baseline.",
                    },
                    {
                        frente: "Por que o layout do prompt importa para o custo?",
                        verso: "Prefixo fixo estável ativa o cache e corta entrada e TTFT.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Por que ter kill switch separado por feature?",
                        verso: "Desligar a que tem problema sem derrubar o resto do produto.",
                    },
                    {
                        frente: "O que a checagem de ownership nas ferramentas impede?",
                        verso: "Um cliente acessar pedido ou dado de outro cliente.",
                    },
                    {
                        frente: "Qual é o objetivo de um game day antes do lançamento?",
                        verso: "Ensaiar incidentes com tudo de mentira antes do de verdade.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Por que um produto nunca está pronto, e sim operado?",
                        verso: "O ciclo de feedback, suíte e canário roda sem fim.",
                    },
                    {
                        frente: "O que diferencia demo de produto?",
                        verso: "Como o sistema se comporta quando as coisas dão errado.",
                    },
                    {
                        frente: "Por que os fundamentos valem mais que o nome das ferramentas?",
                        verso: "Ferramentas trocam a cada trimestre; fundamentos ficam.",
                    },
                ],
            },
        },
    },
};
