import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Aplicações com LLMs, segunda trilha do roadmap de Engenharia de IA.
 *
 * Sem trilhos de linguagem: tudo em "neutra".
 *
 * Mesma régua das demais: fica o que a aula ensina e o quiz não cobra. Como esta
 * trilha é de prática, sobra muito nome concreto de campo, de erro HTTP e de
 * parâmetro, que é justamente o que se esquece entre uma sessão de código e outra.
 */
export const aplicacoesComLlms: CartasDaTrilha = {
    trilha: "Aplicações com LLMs",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que papel a pessoa usuária ocupa na lista de mensagens?",
                        verso: "O papel user, com a pergunta ou instrução do turno.",
                    },
                    {
                        frente: "O que a API devolve como resposta de uma chamada de chat?",
                        verso: "Uma nova mensagem de papel assistant.",
                    },
                    {
                        frente: "Onde o system pode aparecer, dependendo do provedor?",
                        verso: "Como mensagem na lista, ou como campo separado fora dela.",
                    },
                    {
                        frente: "Que nomes o limite de saída recebe conforme o provedor?",
                        verso: "max_tokens ou max_output_tokens.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quanto custa uma chamada de teste com um modelo pequeno?",
                        verso: "Frações de centavo.",
                    },
                    {
                        frente: "Que teto de gasto a aula sugere para estudar com rede de proteção?",
                        verso: "De 5 a 10 dólares no painel do provedor.",
                    },
                    {
                        frente: "Como os SDKs encontram a chave sem ela aparecer no código?",
                        verso: "Leem sozinhos a variável de ambiente padrão do provedor.",
                    },
                    {
                        frente: "Quem varre o GitHub atrás de chave de API vazada?",
                        verso: "Bots, o dia inteiro. O gasto começa em minutos.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Para que serve o id da resposta da API?",
                        verso: "Log, depuração e suporte, identificando a chamada.",
                    },
                    {
                        frente: "Qual é a fonte de verdade do custo de uma chamada?",
                        verso: "O campo usage, com os tokens de entrada e de saída.",
                    },
                    {
                        frente: "Que outro nome o stop_reason recebe em alguns provedores?",
                        verso: "finish_reason.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que erros indicam sobrecarga temporária do provedor?",
                        verso: "Os 5xx, como 503 e 529.",
                    },
                    {
                        frente: "O que o erro 401 indica?",
                        verso: "Chave inválida. É definitivo, não adianta retentar.",
                    },
                    {
                        frente: "Que limites todo provedor publica?",
                        verso: "Requisições e tokens por minuto, por modelo e nível de conta.",
                    },
                    {
                        frente: "O que conferir antes de escrever a própria retentativa?",
                        verso: "O que o SDK já faz, para não empilhar duas camadas de retry.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que método HTTP toda chamada de geração usa?",
                        verso: "POST, com corpo em JSON.",
                    },
                    {
                        frente: "Que ferramenta de terminal reproduz uma chamada crua?",
                        verso: "O curl.",
                    },
                    {
                        frente: "Que formas de autorização variam entre provedores?",
                        verso: "Authorization com Bearer, ou um cabeçalho próprio.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Quantos exemplos costuma bastar num few-shot?",
                        verso: "De um a três.",
                    },
                    {
                        frente: "Onde colocar os exemplos para aproveitar o cache de prompt?",
                        verso: "No prefixo estável da chamada.",
                    },
                    {
                        frente: "Como a aula manda tratar os exemplos de um prompt?",
                        verso: "Como código: revisados, versionados e testados.",
                    },
                    {
                        frente: "Com muitos exemplos disponíveis, o que fazer?",
                        verso: "Selecionar os melhores. Qualidade supera volume, e token custa.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Por que gerar passos intermediários melhora a resposta?",
                        verso: "Dá espaço para o modelo computar em vez de saltar à conclusão.",
                    },
                    {
                        frente: "Em que tarefas o chain-of-thought é desperdício?",
                        verso: "Classificação simples e extração de campos.",
                    },
                    {
                        frente: "Mostrar o raciocínio ao usuário é boa experiência?",
                        verso: "Raramente. Melhor exibir só a resposta final.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Por que o formato vira contrato quando a saída alimenta outro código?",
                        verso: "Porque o sistema seguinte depende dele para funcionar.",
                    },
                    {
                        frente: "Que hábito de pedido corta o excesso de preâmbulo?",
                        verso: "Pedir menos: em até três frases, só a lista.",
                    },
                    {
                        frente: "O que garante o formato de vez, sem depender do prompt?",
                        verso: "Structured outputs, com schema imposto pela API.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Por que o pipeline decomposto é mais fácil de depurar?",
                        verso: "A etapa que errou fica visível, em vez de uma caixa-preta.",
                    },
                    {
                        frente: "Quando a decomposição não se justifica?",
                        verso: "Quando um prompt bom já resolve a tarefa.",
                    },
                    {
                        frente: "Que ganho, além da qualidade, as etapas separadas trazem?",
                        verso: "Log, revisão humana entre elas e retentativa isolada.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "De que tamanho é o conjunto mínimo de casos de teste de um prompt?",
                        verso: "De 15 a 30 entradas reais.",
                    },
                    {
                        frente: "Que tipos de caso o conjunto de teste precisa misturar?",
                        verso: "Fáceis, difíceis e as bordas que já morderam.",
                    },
                    {
                        frente: "O que registrar a cada versão de um prompt?",
                        verso: "Data, motivo da mudança e resultado no conjunto de casos.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "O que o bloco de papel do system prompt responde?",
                        verso: "Quem o assistente é e para quem trabalha.",
                    },
                    {
                        frente: "Que dois inquilinos não devem morar no system prompt?",
                        verso: "Dados voláteis e segredos.",
                    },
                    {
                        frente: "Um system prompt precisa ser longo?",
                        verso: "Não. Precisa ser inequívoco.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que uma regra boa precisa ter, além do alvo?",
                        verso: "Uma saída para o caso proibido e prioridade no conflito.",
                    },
                    {
                        frente: "Por que seja conciso vale menos que até quatro frases?",
                        verso: "Regra vaga rende obediência vaga.",
                    },
                    {
                        frente: "O que ancora uma regra crítica melhor que qualquer adjetivo?",
                        verso: "Um mini exemplo no system: pergunta difícil e resposta modelo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que decisões definem a voz de um assistente?",
                        verso: "Registro, energia, humor, identidade e vocabulário.",
                    },
                    {
                        frente: "O que a decisão de energia da persona define?",
                        verso: "Se a voz é entusiasta ou sóbria.",
                    },
                    {
                        frente: "Persona que só funciona no dia bom é o quê?",
                        verso: "Não é persona, é sorte.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Por que a recusa seca frustra o usuário?",
                        verso: "Ela nega sem apontar caminho nenhum.",
                    },
                    {
                        frente: "Que casos difíceis entram no conjunto de teste com prioridade máxima?",
                        verso: "Fora de escopo, informação ausente, insistência e ação impossível.",
                    },
                    {
                        frente: "Por que recusar bem é arquitetura e não cosmética?",
                        verso: "Cada recusa desenhada é uma alucinação e um risco jurídico a menos.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Onde o prompt deve viver para ter histórico e revisão?",
                        verso: "No repositório, com diff e revisão de PR.",
                    },
                    {
                        frente: "Que prática de código a revisão de par traz para o prompt?",
                        verso: "Outra pessoa lê a mudança antes de ela subir.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Com bom prompt, que taxa de JSON válido se alcança?",
                        verso: "A casa dos 95%.",
                    },
                    {
                        frente: "Por que 95% de acerto não basta em produto?",
                        verso: "Em dez mil chamadas por dia, são quinhentas quebradas.",
                    },
                    {
                        frente: "Que valor fora da lista quebra a validação e o banco?",
                        verso: "Enum inventado, como positivo com exclamação.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que biblioteca Python gera o JSON Schema a partir de uma classe?",
                        verso: "Pydantic.",
                    },
                    {
                        frente: "Para que serve um campo de escape como outro num enum?",
                        verso: "Evitar que o modelo force o encaixe errado.",
                    },
                    {
                        frente: "O schema também é código?",
                        verso: "Sim. Versionado e testado como o prompt.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O modelo executa a função no function calling?",
                        verso: "Não. Ele pede; quem executa é o seu código.",
                    },
                    {
                        frente: "O que o modelo faz com o resultado da função?",
                        verso: "Usa para formular a resposta final ao usuário.",
                    },
                    {
                        frente: "Que tipo de ação pede confirmação antes de executar?",
                        verso: "Ação com consequência, como cancelar ou pagar.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que tipo de nome uma ferramenta deve ter?",
                        verso: "Nome-verbo específico da intenção, como consultar_pedido.",
                    },
                    {
                        frente: "Vinte micro-ferramentas sobrepostas causam o quê?",
                        verso: "Disputa pela escolha; o certo é consolidar com fronteiras nítidas.",
                    },
                    {
                        frente: "Como testar as declarações de ferramenta?",
                        verso: "Com conversas de caso e a ferramenta certa esperada em cada uma.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Quantas iterações de ferramenta costumam bastar como teto?",
                        verso: "De três a cinco.",
                    },
                    {
                        frente: "O resultado de uma ferramenta conta na janela de contexto?",
                        verso: "Sim. Ele é contexto e gasta tokens.",
                    },
                    {
                        frente: "Que quatro passos formam o ciclo do loop de ferramentas?",
                        verso: "Perceber, decidir, agir e observar, até concluir.",
                    },
                ],
            },
        },
    },
};
