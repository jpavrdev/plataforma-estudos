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
    },
};
