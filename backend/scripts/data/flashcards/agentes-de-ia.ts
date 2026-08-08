import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Agentes de IA, quarta trilha do roadmap de Engenharia de IA.
 *
 * Sem trilhos de linguagem: tudo em "neutra".
 *
 * Mesma régua das demais. Nesta trilha o quiz cobre bem os conceitos e as
 * decisões de risco, então as cartas ficam com as classificações, os nomes de
 * guarda-corpo e as regras operacionais que a aula enumera de passagem.
 */
export const agentesDeIa: CartasDaTrilha = {
    trilha: "Agentes de IA",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Qual é o horizonte de um agente, comparado ao chat com ferramentas?",
                        verso: "Uma tarefa inteira, com quantos passos precisar.",
                    },
                    {
                        frente: "Quantas ferramentas um agente encadeia por interação?",
                        verso: "Várias, na sequência que o próprio modelo decide.",
                    },
                    {
                        frente: "Que guarda-corpos o agente exige além da validação de saída?",
                        verso: "Limites de loop, permissões e aprovação humana.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a sigla ReAct nomeia no padrão?",
                        verso: "A intercalação de raciocínio e ação no loop.",
                    },
                    {
                        frente: "Qual peça do ReAct realimenta o raciocínio?",
                        verso: "A observação, que traz o fato novo da ferramenta.",
                    },
                    {
                        frente: "A que o rastro do ReAct é comparado?",
                        verso: "A um stack trace: conta a história da execução.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Em que moedas a autonomia é paga?",
                        verso: "Chamadas, latência, variância e superfície de risco.",
                    },
                    {
                        frente: "O que é o desenho híbrido no espectro de autonomia?",
                        verso: "Pipeline fixo com etapas agênticas só onde o caminho é imprevisível.",
                    },
                    {
                        frente: "Quando o loop de agente é desperdício puro?",
                        verso: "Em tarefa de um passo só, que uma chamada resolve.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Em quantas linhas cabe o loop de um agente?",
                        verso: "Cerca de cinquenta. O produto não está no loop.",
                    },
                    {
                        frente: "Que guarda-corpo protege contra ferramenta travada?",
                        verso: "O timeout por ferramenta, na execução.",
                    },
                    {
                        frente: "Por que o histórico de um agente cresce rápido?",
                        verso: "Cada volta soma o pedido de ferramenta e o resultado.",
                    },
                    {
                        frente: "O que a regra de parada precisa dizer ao agente?",
                        verso: "Que ao concluir, ou ao ver que é impossível, responda e pare.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que é injection com mãos?",
                        verso: "Prompt injection num agente que executa ações no mundo.",
                    },
                    {
                        frente: "Qual é o remédio principal contra a opacidade dos agentes?",
                        verso: "O rastro completo por execução, que evolui para tracing.",
                    },
                    {
                        frente: "Que postura resume a engenharia de agentes?",
                        verso: "Saber agir, parar, pedir aprovação e falhar com clareza.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Por que resultado enxuto de ferramenta importa mais em agente?",
                        verso: "A observação é paga em todas as voltas seguintes.",
                    },
                    {
                        frente: "Qual é a granularidade certa de uma ferramenta de agente?",
                        verso: "Um passo significativo: nem micro, nem faz-tudo.",
                    },
                    {
                        frente: "Qual é o problema de um cardápio de cinquenta ferramentas?",
                        verso: "Dilui a escolha do modelo e amplia a superfície de risco.",
                    },
                    {
                        frente: "Por que o vocabulário das ferramentas deve ser consistente?",
                        verso: "Dezenas de decisões seguidas confundem fácil com nomes trocados.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Qual é a anatomia de um erro útil para o agente?",
                        verso: "O que falhou, o provável porquê e o que tentar em seguida.",
                    },
                    {
                        frente: "Qual é o perigo do vazio mentiroso?",
                        verso: "O agente conclui que não existe e segue com premissa falsa.",
                    },
                    {
                        frente: "O que o erro precisa orientar sobre repetição?",
                        verso: "Quantas vezes repetir e qual é o plano B.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quais são as três classes de ferramenta perante o risco?",
                        verso: "Leitura, escrita reversível e escrita crítica.",
                    },
                    {
                        frente: "Qual é a melhor política para ferramenta que a tarefa não precisa?",
                        verso: "Nem declarar no cardápio.",
                    },
                    {
                        frente: "Que trilha de auditoria habilita o desfazer?",
                        verso: "O registro de ação, que permite reverter escrita reversível.",
                    },
                    {
                        frente: "Como tornar o envio de email reversível sem perder utilidade?",
                        verso: "Virar criação de rascunho, com envio humano em um clique.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Por que o interpretador é chamado de ferramenta universal?",
                        verso: "Cobre cálculo exato, transformação de dados e sub-rotinas novas.",
                    },
                    {
                        frente: "Qual é a configuração de rede padrão do sandbox?",
                        verso: "Sem rede, com exceções só por allowlist explícita.",
                    },
                    {
                        frente: "Por que a saída do interpretador é truncada?",
                        verso: "Observação gigante incharia o contexto de todas as voltas.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que rótulo o conteúdo vindo da web deve receber?",
                        verso: "Dado a analisar, nunca instrução a seguir.",
                    },
                    {
                        frente: "O que é privilégio mínimo por fase?",
                        verso: "Restringir o cardápio enquanto o agente processa conteúdo externo.",
                    },
                    {
                        frente: "Que defesa segura o ataque que passou por todas as outras?",
                        verso: "A aprovação humana obrigatória nas ações críticas.",
                    },
                ],
            },
        },
    },
};
