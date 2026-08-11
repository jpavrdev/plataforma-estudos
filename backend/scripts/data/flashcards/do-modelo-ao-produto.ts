import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Do Modelo ao Produto, trilha que fecha o roadmap de Ciência
 * de Dados.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o julgamento do
 * cenário; as cartas guardam as listas fechadas, os nomes próprios e as
 * regras que a aula enuncia de passagem.
 */
export const doModeloAoProduto: CartasDaTrilha = {
    trilha: "Do Modelo ao Produto",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que três exigências o notebook nunca precisa cumprir?",
                        verso: "Rodar sozinho de madrugada, responder rápido e aguentar dado maluco.",
                    },
                    {
                        frente: "Que nome a distância entre os dois mundos recebe?",
                        verso: "O abismo entre pesquisa e produção.",
                    },
                    {
                        frente: "Quando o modelo passa a gerar valor de verdade?",
                        verso: "Quando alguém recebe a previsão sem depender de você.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que três frentes o MLOps junta ao mesmo tempo?",
                        verso: "Ciência de dados, engenharia de software e operações.",
                    },
                    {
                        frente: "Que dependência extra o sistema de ML carrega?",
                        verso: "Os dados, além do código que define o comportamento.",
                    },
                    {
                        frente: "Que honestidade a aula faz sobre a disciplina?",
                        verso: "É nova: cada empresa monta o próprio jeito de aplicar.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que reproduzir exige, para além de rodar de novo?",
                        verso: "O mesmo resultado em qualquer máquina e em qualquer data.",
                    },
                    {
                        frente: "O que monitorar acompanha que o notebook nunca pergunta?",
                        verso: "Se o modelo continua bom depois de já estar no ar.",
                    },
                    {
                        frente: "Que decisões o retreino carrega além de treinar de novo?",
                        verso: "Quando retreinar e como validar antes de substituir.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que sete etapas o ciclo de vida percorre?",
                        verso: "Problema, dados, treino, avaliação, deploy, monitoramento e retreino.",
                    },
                    {
                        frente: "Que erro comum trata o deploy como linha de chegada?",
                        verso: "Achar que o projeto acabou: ele é só a primeira volta.",
                    },
                    {
                        frente: "Que etapa costuma tomar a maior parte do tempo real?",
                        verso: "A de dados, com coleta, entendimento e limpeza.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que três papéis a aula separa no mesmo sistema?",
                        verso: "Cientista de dados, engenheiro de ML e engenheiro de dados.",
                    },
                    {
                        frente: "Que pergunta o engenheiro de ML responde, diferente?",
                        verso: "Como servir aquele modelo com confiabilidade em produção.",
                    },
                    {
                        frente: "O que o engenheiro de dados garante antes de tudo?",
                        verso: "Que o dado existe, está acessível e é utilizável.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que biblioteca padrão o joblib substitui, e por quê?",
                        verso: "O pickle, por ser mais eficiente com arrays do numpy.",
                    },
                    {
                        frente: "O que persistir guarda de um objeto já treinado?",
                        verso: "O estado inteiro, para recarregar sem repetir o treino.",
                    },
                    {
                        frente: "Por que o nome do arquivo do modelo importa?",
                        verso: "Uma versão nova precisa conviver com a anterior.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que três coisas a aplicação que serve o modelo faz?",
                        verso: "Carrega o modelo, expõe o endpoint e devolve a previsão.",
                    },
                    {
                        frente: "Que formato entra e sai numa chamada de previsão?",
                        verso: "JSON com as features na entrada e a previsão na saída.",
                    },
                    {
                        frente: "Que dois frameworks Python montam esse endpoint?",
                        verso: "O Flask e o FastAPI, com o mesmo padrão por trás.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Por que o dicionário vira um DataFrame antes do predict?",
                        verso: "O Pipeline foi treinado esperando tabela com nome de coluna.",
                    },
                    {
                        frente: "Como o FastAPI valida a entrada da requisição?",
                        verso: "Declarando o formato esperado numa classe própria.",
                    },
                    {
                        frente: "Que diferença central separa os dois frameworks?",
                        verso: "O quanto cada um valida a entrada antes do predict.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que pergunta decide entre batch e online?",
                        verso: "Se alguém espera a resposta naquele exato instante.",
                    },
                    {
                        frente: "Que vantagem operacional o batch costuma ter?",
                        verso: "É mais simples e mais barato, sem servidor sempre no ar.",
                    },
                    {
                        frente: "Quando o batch costuma rodar, e com que gatilho?",
                        verso: "Em horário programado, geralmente de madrugada.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que nome a divergência entre treino e produção recebe?",
                        verso: "Training-serving skew, quando a entrada deixa de casar.",
                    },
                    {
                        frente: "Que exemplo sutil de quebra de contrato a aula dá?",
                        verso: "Renda mensal no treino virando renda anual na chamada.",
                    },
                    {
                        frente: "Que dois hábitos seguram o contrato de pé?",
                        verso: "Persistir o Pipeline inteiro e validar o formato de entrada.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "O que um objeto salvo com joblib guarda além dos pesos?",
                        verso: "A estrutura interna dos objetos daquela versão da biblioteca.",
                    },
                    {
                        frente: "Por que fixar as bibliotecas ainda não basta?",
                        verso: "O interpretador Python também precisa ser o mesmo.",
                    },
                    {
                        frente: "Que frase resume o problema que a reprodutibilidade ataca?",
                        verso: "Funciona na minha máquina, e só nela.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que camadas o requirements.txt deixa de resolver?",
                        verso: "O sistema operacional e as bibliotecas de sistema.",
                    },
                    {
                        frente: "Que três coisas a imagem do modelo carrega juntas?",
                        verso: "O código da API, o arquivo do modelo e as dependências.",
                    },
                    {
                        frente: "Que pergunta o container troca sobre a máquina?",
                        verso: "Deixa de ser o que ela tem instalado e vira se tem Docker.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que papel o Dockerfile e a imagem cumprem, comparados?",
                        verso: "O Dockerfile é a receita; a imagem é o prato pronto.",
                    },
                    {
                        frente: "Que vantagem a variante slim da imagem oficial traz?",
                        verso: "Ela é mais enxuta, com só o essencial do sistema.",
                    },
                    {
                        frente: "Que arquivos nunca deveriam entrar na imagem do modelo?",
                        verso: "O notebook de treino, o dado bruto e o histórico de teste.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que três serviços gerenciados de nuvem a aula cita?",
                        verso: "O SageMaker, o Vertex AI e o Azure Machine Learning.",
                    },
                    {
                        frente: "Que troca a VPS faz ante o serviço gerenciado?",
                        verso: "Mais atenção operacional por custo previsível e controle.",
                    },
                    {
                        frente: "Que critérios decidem onde o modelo vai rodar?",
                        verso: "O volume de pedidos, o orçamento e o tamanho do time.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que peças o módulo junta até chegar ao serviço no ar?",
                        verso: "O modelo salvo, a API, o ambiente fixado e a imagem.",
                    },
                    {
                        frente: "Quem passa a chamar o modelo depois do deploy?",
                        verso: "Outras aplicações, sozinhas, sem ninguém rodar nada.",
                    },
                    {
                        frente: "A partir de quando um modelo em produção envelhece?",
                        verso: "Do primeiro dia: o mundo ao redor não para.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "O que o modelo memoriza, e o que ele não entende?",
                        verso: "Relações estatísticas daquele momento, não o mundo.",
                    },
                    {
                        frente: "Que dois nomes as causas da degradação recebem?",
                        verso: "Data drift na entrada e concept drift na relação.",
                    },
                    {
                        frente: "Que exemplo de crédito a aula usa para a degradação?",
                        verso: "Modelo treinado com juros baixos, avaliado com juros altos.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que permanece igual quando existe só data drift?",
                        verso: "A relação entre as features e o que o modelo prevê.",
                    },
                    {
                        frente: "Que dois testes formais detectam data drift?",
                        verso: "O de Kolmogorov-Smirnov e o índice PSI do mercado.",
                    },
                    {
                        frente: "Que leitura o data drift detectado merece?",
                        verso: "É alerta para investigar, não sentença de modelo ruim.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Por que o concept drift é mais difícil de pegar?",
                        verso: "Só fica evidente quando o rótulo verdadeiro chega.",
                    },
                    {
                        frente: "Que exemplo de streaming ilustra o concept drift?",
                        verso: "Dias sem assistir deixando de indicar cancelamento.",
                    },
                    {
                        frente: "O que pode continuar parecido mesmo com concept drift?",
                        verso: "A distribuição das próprias features de entrada.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que três indicadores de saúde a API também exige?",
                        verso: "A latência, a taxa de erro e o throughput do serviço.",
                    },
                    {
                        frente: "Como as métricas do modelo devem ser lidas no tempo?",
                        verso: "Comparadas semana a semana, nunca num número isolado.",
                    },
                    {
                        frente: "Que sinal indireto a própria previsão do modelo dá?",
                        verso: "A distribuição dela, se muda muito de uma classe.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que dois limites um alerta bem calibrado define?",
                        verso: "Um de atenção e outro mais grave, pelo histórico.",
                    },
                    {
                        frente: "Que três causas um alerta pode ter, antes do drift?",
                        verso: "Bug no pipeline, evento pontual ou drift de verdade.",
                    },
                    {
                        frente: "Que ferramentas de dashboard a aula cita?",
                        verso: "O Grafana, o Prometheus e o CloudWatch da nuvem.",
                    },
                ],
            },
        },
    },
};
