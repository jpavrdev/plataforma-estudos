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
        3: {
            1: {
                neutra: [
                    {
                        frente: "Qual é a divisão de papéis entre LangChain e LangGraph?",
                        verso: "LangChain é a camada ergonômica; LangGraph, o runtime de orquestração.",
                    },
                    {
                        frente: "Qual é o custo honesto de adotar o framework?",
                        verso: "Mais uma camada para aprender e depurar, e a tentação de usar tudo.",
                    },
                    {
                        frente: "Por que construir o loop na mão antes de adotar framework?",
                        verso: "Para entender o que ele faz por você e usá-lo bem.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "De onde o decorator de ferramenta deriva o schema?",
                        verso: "Da assinatura da função e da docstring escrita.",
                    },
                    {
                        frente: "O que não muda com a adoção do framework?",
                        verso: "O desenho das ferramentas, o prompt e os guarda-corpos de negócio.",
                    },
                    {
                        frente: "Que sinais indicam que é hora do grafo explícito?",
                        verso: "Fases distintas, pausas para aprovação e ramos paralelos.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que é um nó no LangGraph?",
                        verso: "Uma função que recebe o estado e devolve atualizações.",
                    },
                    {
                        frente: "O que a aresta condicional faz?",
                        verso: "Decide o próximo nó olhando o estado atual da execução.",
                    },
                    {
                        frente: "Como o guarda-corpo de voltas aparece no grafo?",
                        verso: "Como aresta condicional que roteia para o fim ao bater o teto.",
                    },
                    {
                        frente: "Onde o privilégio mínimo por fase entra no grafo?",
                        verso: "Num nó de política que restringe o cardápio conforme a fase.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o checkpointer grava, e quando?",
                        verso: "O estado do grafo a cada passo, em armazenamento durável.",
                    },
                    {
                        frente: "O que o identificador de thread permite após um reinício?",
                        verso: "Retomar do último checkpoint, sem repetir as voltas anteriores.",
                    },
                    {
                        frente: "Como a interrupção antes de um nó habilita a aprovação humana?",
                        verso: "O estado dorme antes do nó crítico até alguém retomar.",
                    },
                    {
                        frente: "Que políticas de dados valem para o estado gravado?",
                        verso: "Backup, retenção definida e nenhum segredo no estado.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Em que cenário o LlamaIndex brilha?",
                        verso: "Agentes sobre documentos e índices, com integração de dados forte.",
                    },
                    {
                        frente: "Qual é a troca ao adotar o SDK de agentes de um provedor?",
                        verso: "Integração profunda em troca de acoplamento ao ecossistema dele.",
                    },
                    {
                        frente: "Quando o Python puro continua sendo escolha honesta?",
                        verso: "Agentes simples, com controle total e sem dependência extra.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Por que o custo por volta cresce ao longo da tarefa?",
                        verso: "O histórico inteiro é reprocessado e pago a cada nova chamada.",
                    },
                    {
                        frente: "Quais são as três frentes da disciplina de contexto?",
                        verso: "Dieta na entrada, organização do meio e memória de longo prazo.",
                    },
                    {
                        frente: "O que um salto abrupto no gráfico de tokens por volta revela?",
                        verso: "Entrou uma observação gorda: alguma ferramenta foi tagarela.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Qual é a técnica número um de dieta de contexto?",
                        verso: "Truncar na fonte: a ferramenta devolve resumo e id para detalhar.",
                    },
                    {
                        frente: "O que um stub substitui na poda de observações?",
                        verso: "O conteúdo bruto já processado, mantendo o registro da ação.",
                    },
                    {
                        frente: "O que nunca se comprime no contexto do agente?",
                        verso: "A tarefa original e as notas de decisão.",
                    },
                    {
                        frente: "Qual é o sinal de que a dieta passou do ponto?",
                        verso: "O agente repete trabalho ou pergunta o que já foi respondido.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Qual é a diferença entre o histórico e o scratchpad?",
                        verso: "O histórico é a sequência bruta; o scratchpad é o destilado.",
                    },
                    {
                        frente: "Que seções compõem um bom scratchpad?",
                        verso: "Plano com status, fatos com fonte, decisões e pendências.",
                    },
                    {
                        frente: "Onde o scratchpad deve ser renderizado no contexto?",
                        verso: "Em destaque perto do topo, longe do meio perdido.",
                    },
                    {
                        frente: "O que o padrão plan-and-execute acrescenta ao loop?",
                        verso: "Um plano escrito antes de agir, atualizado a cada passo.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Qual é a diferença de escopo entre scratchpad e memória longa?",
                        verso: "O scratchpad vive uma tarefa; a memória atravessa tarefas.",
                    },
                    {
                        frente: "Por que a memória do agente é por agente, e não por usuário?",
                        verso: "É conhecimento operacional do papel, não preferência pessoal.",
                    },
                    {
                        frente: "Qual é o risco da memória sem revisão do que entra?",
                        verso: "Uma execução ruim vira lição errada repetida em toda tarefa.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Como se implementa o isolamento de estado entre usuários?",
                        verso: "Todo estado tem dono e toda leitura filtra por ele.",
                    },
                    {
                        frente: "Como duas tarefas simultâneas do mesmo usuário convivem?",
                        verso: "Em threads separados por tarefa, sem escrita cruzada.",
                    },
                    {
                        frente: "Por que o estado de tarefa concluída deve expirar?",
                        verso: "Retenção definida evita acúmulo infinito e passivo de LGPD.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Qual é a história institucional do MCP?",
                        verso: "Criado pela Anthropic em 2024 e doado à Linux Foundation em 2025.",
                    },
                    {
                        frente: "Quantos conectores o MCP troca por quantos?",
                        verso: "Troca N vezes M conectores por N clientes mais M servidores.",
                    },
                    {
                        frente: "Quais são as duas frentes práticas do MCP?",
                        verso: "Consumir servidores existentes e expor o próprio sistema como servidor.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quais são as três primitivas que um servidor MCP expõe?",
                        verso: "Tools, resources e prompts.",
                    },
                    {
                        frente: "Quais são os dois transportes do MCP?",
                        verso: "STDIO para servidores locais e HTTP para remotos.",
                    },
                    {
                        frente: "Qual é a diferença de uso entre tools e resources?",
                        verso: "Tool é ação que o modelo chama; resource é dado que a aplicação lê.",
                    },
                    {
                        frente: "O que a descoberta do protocolo permite?",
                        verso: "Listar as tools e schemas do servidor sem código novo no host.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O servidor expõe vinte tools e a tarefa precisa de três. O que fazer?",
                        verso: "Filtrar: só as três necessárias entram no cardápio.",
                    },
                    {
                        frente: "Por que classificar o risco das tools importadas?",
                        verso: "A política de leitura, reversível e crítica não viaja pelo protocolo.",
                    },
                    {
                        frente: "O que a escolha entre credencial de serviço e OAuth define?",
                        verso: "Em nome de quem o agente age no sistema externo.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que quer dizer que tool não é endpoint, e sim intenção?",
                        verso: "Expõem-se ações de valor com granularidade de passo, não a API inteira.",
                    },
                    {
                        frente: "Por que as descrições exigem capricho extra num servidor público?",
                        verso: "Serão lidas por modelos de terceiros, sem o contexto da casa.",
                    },
                    {
                        frente: "Por que separar escopos OAuth de leitura e de escrita?",
                        verso: "O cliente recebe só o poder de que precisa.",
                    },
                    {
                        frente: "O que o teste do consumidor cego revela?",
                        verso: "Descrições que só fazem sentido para quem já conhece o sistema.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que é tool poisoning?",
                        verso: "Instruções maliciosas injetadas nas descrições das tools descobertas.",
                    },
                    {
                        frente: "Como se avalia a procedência de um servidor MCP?",
                        verso: "Preferindo servidores oficiais ou auditados, e fixando versões.",
                    },
                    {
                        frente: "O que hosts maduros fazem com as descrições entre conexões?",
                        verso: "Detectam mudanças e mostram ao usuário o que cada servidor expõe.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Quais são os três motivos legítimos para dividir em agentes?",
                        verso: "Contexto, especialização e paralelismo.",
                    },
                    {
                        frente: "Que tipo de erro nasce especificamente do multiagente?",
                        verso: "O erro de coordenação: mal-entendidos entre os papéis.",
                    },
                    {
                        frente: "Qual é o antídoto para erros de coordenação?",
                        verso: "Contratos claros: schemas nas fronteiras entre os agentes.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "No padrão supervisor, para onde o controle sempre volta?",
                        verso: "Ao agente coordenador, que delega e consolida.",
                    },
                    {
                        frente: "O que caracteriza o handoff?",
                        verso: "Transferir a conversa inteira ao agente mais adequado.",
                    },
                    {
                        frente: "Qual é o cuidado típico do padrão supervisor?",
                        verso: "O coordenador vira gargalo de contexto ao consolidar tudo.",
                    },
                    {
                        frente: "Qual é o cuidado típico do pipeline?",
                        verso: "Rigidez: etapa fora da ordem prevista não cabe.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que viaja entre os agentes de uma equipe bem desenhada?",
                        verso: "Resultados estruturados no schema combinado da fronteira.",
                    },
                    {
                        frente: "O que o supervisor faz com uma entrega fora do schema?",
                        verso: "Rejeita antes de repassar e devolve o erro orientado.",
                    },
                    {
                        frente: "Qual é o dividendo de teste dos contratos?",
                        verso: "Cada agente vira testável isolado, com entradas sintéticas.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Quais são as três formas canônicas de human-in-the-loop?",
                        verso: "Aprovação, escalação e revisão amostral.",
                    },
                    {
                        frente: "O que acontece com a recusa de uma aprovação?",
                        verso: "Vira observação com motivo, e o agente replaneja.",
                    },
                    {
                        frente: "O que organiza a transferência para o humano na escalação?",
                        verso: "O scratchpad virando resumo do caso: plano, fatos e pendências.",
                    },
                    {
                        frente: "Por que aprovações em atacado matam o controle?",
                        verso: "Fadiga de aprovação vira aprovação cega.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Como se orça o custo em sistemas multiagente?",
                        verso: "Por tarefa composta, com teto somado e aborto gracioso.",
                    },
                    {
                        frente: "Qual é a ordem de depuração de uma execução composta?",
                        verso: "Log de coordenação primeiro, depois o rastro do agente culpado.",
                    },
                    {
                        frente: "Qual é o tamanho típico de uma boa equipe de agentes?",
                        verso: "Pequena: de dois a cinco papéis com contratos nítidos.",
                    },
                    {
                        frente: "Quando parar de dividir a equipe em mais agentes?",
                        verso: "Quando o log de coordenação fica mais complexo que o trabalho.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Qual é a tarefa típica do agente do projeto?",
                        verso: "Investigar um pedido atrasado e resolver com o cliente, sob aprovação.",
                    },
                    {
                        frente: "Como o RAG da trilha anterior entra no projeto?",
                        verso: "Como ferramenta de consulta às políticas, com citações.",
                    },
                    {
                        frente: "Quantas tools do servidor MCP externo entram no cardápio?",
                        verso: "Três das quinze expostas, filtradas.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Qual é o cardápio da primeira etapa do projeto?",
                        verso: "Somente leitura: consultas, rastreio e políticas.",
                    },
                    {
                        frente: "O que o teste de derrubar o servidor na volta 3 prova?",
                        verso: "Que o checkpointer retoma a execução do ponto exato.",
                    },
                    {
                        frente: "Por que o agente só de leitura é a via de adoção nas empresas?",
                        verso: "O diagnóstico pronto constrói a confiança que compra as ações depois.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Como o projeto torna reversível o envio de email?",
                        verso: "Vira criação de rascunho, com envio humano em um clique.",
                    },
                    {
                        frente: "O que a tela de aprovação renderiza?",
                        verso: "O diagnóstico com fontes e as ações propostas, completas e editáveis.",
                    },
                    {
                        frente: "Qual é a prova de fogo da etapa de ações?",
                        verso: "Nenhuma crítica roda sem aprovação, por nenhum caminho do grafo.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Por que testar agente por desfecho, e não por caminho?",
                        verso: "O caminho varia entre execuções; o desfecho e as regras não.",
                    },
                    {
                        frente: "Por que rodar cada caso cinco vezes e medir taxa?",
                        verso: "A variância é parte do sistema: uma execução é sorte, taxa é retrato.",
                    },
                    {
                        frente: "O que a sabotagem de ferramentas avalia?",
                        verso: "Se o agente se recupera ou desiste com elegância quando o mundo falha.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que é autonomia com contabilidade?",
                        verso: "Poderes classificados, voltas medidas e críticas com dono humano.",
                    },
                    {
                        frente: "Que trio entrega tarefas duráveis com pausa e retomada?",
                        verso: "Grafo de estado, checkpointer e interrupção antes do nó crítico.",
                    },
                    {
                        frente: "Que hábito a trilha sela sobre ferramentas?",
                        verso: "Classificar toda ferramenta por risco antes de dá-la ao modelo.",
                    },
                ],
            },
        },
    },
};
