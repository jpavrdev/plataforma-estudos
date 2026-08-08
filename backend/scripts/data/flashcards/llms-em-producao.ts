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
    },
};
