import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Modern Data Stack, do roadmap de Engenharia de Dados.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a decisão de
 * projeto; as cartas guardam as definições fechadas, as divisões de
 * responsabilidade e as regras que a aula enuncia de passagem.
 */
export const modernDataStack: CartasDaTrilha = {
    trilha: "Modern Data Stack",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "O que o modern data stack não é?",
                        verso: "Uma ferramenta única.",
                    },
                    {
                        frente: "O que o modern data stack é, então?",
                        verso: "Um warehouse elástico com ferramentas gerenciadas e plugáveis.",
                    },
                    {
                        frente: "Que responsabilidade cada ferramenta tem?",
                        verso: "Cuidar de uma etapa só do caminho do dado.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que camada fica no centro do stack?",
                        verso: "O warehouse, para onde tudo converge.",
                    },
                    {
                        frente: "Que etapa abre o caminho do dado no stack?",
                        verso: "A ingestão, que traz o dado das fontes.",
                    },
                    {
                        frente: "O que a camada de análise entrega?",
                        verso: "O painel e a consulta que respondem ao negócio.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "De que o analytics engineer é dono?",
                        verso: "Da camada de transformação e da definição das métricas.",
                    },
                    {
                        frente: "Entre o que ele fica?",
                        verso: "Entre a infraestrutura e a pergunta de negócio.",
                    },
                    {
                        frente: "Quem mantém a infraestrutura, nessa divisão?",
                        verso: "O data engineer.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que guardar o dado bruto no warehouse permite?",
                        verso: "Refazer qualquer regra de transformação do zero.",
                    },
                    {
                        frente: "O que deixa de ser necessário?",
                        verso: "Voltar à fonte original para buscar o mesmo dado.",
                    },
                    {
                        frente: "Que letra do ELT o warehouse passou a executar?",
                        verso: "O T, da transformação.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Alguma ferramenta do stack faz sentido sozinha?",
                        verso: "Nenhuma: o valor está em como elas se conectam.",
                    },
                    {
                        frente: "Em torno do que elas se conectam?",
                        verso: "Do warehouse.",
                    },
                    {
                        frente: "Quem dá coerência à camada de transformação?",
                        verso: "O dbt.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "No que o SQL de transformação virou?",
                        verso: "Código de produção.",
                    },
                    {
                        frente: "O que faltava a esse código?",
                        verso: "As práticas que a engenharia de software já usava.",
                    },
                    {
                        frente: "Que práticas o dbt trouxe para o SQL?",
                        verso: "Versionamento, teste, documentação e dependência declarada.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o dbt não faz?",
                        verso: "Extrair nem carregar dado.",
                    },
                    {
                        frente: "O que ele assume como ponto de partida?",
                        verso: "Que o dado bruto já chegou ao warehouse.",
                    },
                    {
                        frente: "De que etapa o dbt cuida?",
                        verso: "Só da transformação, o T do ELT.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que dbt Core e dbt Cloud têm em comum?",
                        verso: "A mesma engine por baixo.",
                    },
                    {
                        frente: "Onde está a diferença entre os dois?",
                        verso: "Em quem cuida do agendador, do editor e da infraestrutura.",
                    },
                    {
                        frente: "O que muda nos conceitos entre eles?",
                        verso: "Nada.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que o arquivo de projeto do dbt declara?",
                        verso: "O nome, os caminhos e as configurações padrão.",
                    },
                    {
                        frente: "Onde os modelos ficam num projeto dbt?",
                        verso: "Na pasta de modelos, organizados por camada.",
                    },
                    {
                        frente: "O que o arquivo de schema declara ao lado dos modelos?",
                        verso: "Testes, descrições e colunas.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o comando de execução faz?",
                        verso: "Constrói os modelos dentro do warehouse.",
                    },
                    {
                        frente: "O que o comando de teste faz?",
                        verso: "Roda as verificações declaradas sobre o resultado.",
                    },
                    {
                        frente: "O que o build combina numa passada só?",
                        verso: "A execução e os testes, modelo a modelo.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "O que um modelo dbt não é?",
                        verso: "A tabela em si.",
                    },
                    {
                        frente: "O que um modelo dbt é, então?",
                        verso: "A definição de como aquela tabela deve ser construída.",
                    },
                    {
                        frente: "O que acontece com a tabela a cada execução?",
                        verso: "É recriada a partir da definição.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que um nome de tabela escrito à mão indica?",
                        verso: "Que falta um ref, ou falta um source declarado.",
                    },
                    {
                        frente: "O que o ref aponta?",
                        verso: "Outro modelo do mesmo projeto.",
                    },
                    {
                        frente: "O que o source declara?",
                        verso: "Uma tabela bruta que o dbt não construiu.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "De onde vem o grafo de um projeto dbt?",
                        verso: "Da soma de todos os ref e source escritos no SQL.",
                    },
                    {
                        frente: "Que qualidade esse grafo tem?",
                        verso: "Fica sempre atualizado, porque nasce do próprio código.",
                    },
                    {
                        frente: "O que esse grafo não é?",
                        verso: "Um diagrama mantido à parte.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que a camada de staging responde?",
                        verso: "Qual é a fonte, já limpa.",
                    },
                    {
                        frente: "O que a camada intermediária responde?",
                        verso: "Como essas fontes se combinam.",
                    },
                    {
                        frente: "O que a camada de marts responde?",
                        verso: "O que o negócio precisa consultar.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que duas perguntas um bom nome de modelo responde?",
                        verso: "Em que camada ele está e o que ele representa.",
                    },
                    {
                        frente: "O que fazer se o nome não responde isso?",
                        verso: "Rever a convenção de nomes do projeto.",
                    },
                    {
                        frente: "Quando o nome precisa responder isso?",
                        verso: "Antes de alguém abrir o arquivo.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "O que uma view guarda?",
                        verso: "Uma pergunta, e não o dado.",
                    },
                    {
                        frente: "O que acontece a cada consulta a uma view?",
                        verso: "O warehouse refaz a pergunta do zero.",
                    },
                    {
                        frente: "Que garantia isso traz?",
                        verso: "O resultado sempre reflete a origem naquele instante.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que a materialização em tabela troca?",
                        verso: "Custo de leitura por custo de escrita.",
                    },
                    {
                        frente: "O que cada execução passa a pagar?",
                        verso: "O recálculo do modelo inteiro.",
                    },
                    {
                        frente: "O que fica barato depois disso?",
                        verso: "Cada consulta ao modelo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Sobre o que a materialização incremental é?",
                        verso: "Reprocessar só o necessário na maioria das vezes.",
                    },
                    {
                        frente: "Sobre o que ela não é?",
                        verso: "Nunca reprocessar tudo.",
                    },
                    {
                        frente: "De onde vem o ganho de custo?",
                        verso: "De não recalcular a tabela inteira a cada execução.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que a materialização efêmera elimina?",
                        verso: "O objeto, e não o processamento.",
                    },
                    {
                        frente: "Onde a lógica passa a rodar?",
                        verso: "Embutida dentro de quem a referencia.",
                    },
                    {
                        frente: "O que ela não deixa no warehouse?",
                        verso: "Rastro consultável.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Existe materialização certa em abstrato?",
                        verso: "Não existe.",
                    },
                    {
                        frente: "O que a escolha precisa equilibrar?",
                        verso: "Custo, frescor e complexidade.",
                    },
                    {
                        frente: "De que mais a escolha depende?",
                        verso: "Do volume e do padrão de consulta daquele modelo.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "O que um teste genérico não substitui?",
                        verso: "A modelagem.",
                    },
                    {
                        frente: "O que um teste genérico confirma?",
                        verso: "Que uma suposição sobre o dado continua verdadeira.",
                    },
                    {
                        frente: "Com que frequência essa confirmação acontece?",
                        verso: "A cada execução do pipeline.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que um teste singular é?",
                        verso: "Uma pergunta que só devia ter uma resposta: nenhuma linha.",
                    },
                    {
                        frente: "O que uma linha no resultado significa?",
                        verso: "A realidade quebrou a regra que alguém escreveu.",
                    },
                    {
                        frente: "Que forma um teste singular tem?",
                        verso: "A de uma consulta que procura o caso proibido.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "De onde nasce o site de documentação?",
                        verso: "Do mesmo arquivo de schema que já declara os testes.",
                    },
                    {
                        frente: "O que documentar deixa de ser?",
                        verso: "Uma tarefa extra.",
                    },
                    {
                        frente: "No que documentar se transforma?",
                        verso: "Em parte de declarar o modelo.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que uma execução bem-sucedida garante?",
                        verso: "Só que a consulta rodou sem erro.",
                    },
                    {
                        frente: "O que ela não garante?",
                        verso: "Que o dado está atualizado.",
                    },
                    {
                        frente: "Quem responde se o dado está fresco?",
                        verso: "A verificação de freshness na origem.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Para que o teste existe?",
                        verso: "Para avisar rápido no dia em que o pipeline parar.",
                    },
                    {
                        frente: "Para que ele não existe?",
                        verso: "Para provar que o pipeline funcionou uma vez.",
                    },
                    {
                        frente: "O que testar cedo encurta?",
                        verso: "O tempo entre o erro e a descoberta dele.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "O que o warehouse nunca recebe?",
                        verso: "Jinja: ele só recebe SQL.",
                    },
                    {
                        frente: "Quem faz a ponte entre o modelo e o select final?",
                        verso: "A compilação do dbt.",
                    },
                    {
                        frente: "Que arquivo depurar quando algo não bate?",
                        verso: "O SQL compilado, e não o modelo escrito.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que perguntar antes de escrever um macro novo?",
                        verso: "Se aquela necessidade já não foi resolvida num package.",
                    },
                    {
                        frente: "Que vantagem o package pronto tem?",
                        verso: "Já vem testado e usado por outros times.",
                    },
                    {
                        frente: "O que um package traz para o projeto?",
                        verso: "Macros e modelos prontos, versionados como dependência.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que um snapshot não faz?",
                        verso: "Transformar o dado.",
                    },
                    {
                        frente: "O que o snapshot preserva?",
                        verso: "Um estado que a origem apagaria na próxima sobrescrita.",
                    },
                    {
                        frente: "Que técnica de modelagem o snapshot implementa?",
                        verso: "A dimensão que muda devagar, do tipo 2.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que é um seed?",
                        verso: "Dado do próprio time, versionado junto do projeto.",
                    },
                    {
                        frente: "O que é um source?",
                        verso: "Dado que já existe no warehouse e o dbt apenas declara.",
                    },
                    {
                        frente: "Qual dos dois o dbt carrega?",
                        verso: "O seed.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que a configuração muda entre dev e produção?",
                        verso: "Para onde o dbt escreve e como ele se conecta.",
                    },
                    {
                        frente: "O que não muda entre os ambientes?",
                        verso: "Uma linha sequer do SQL dos modelos.",
                    },
                    {
                        frente: "O que essa separação permite?",
                        verso: "Testar em dev exatamente o que vai rodar em produção.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "O que o dbt sabe sozinho?",
                        verso: "Em que ordem os próprios modelos devem rodar.",
                    },
                    {
                        frente: "O que o dbt não sabe?",
                        verso: "Que horas são.",
                    },
                    {
                        frente: "Quem cuida do horário, então?",
                        verso: "O orquestrador que chama o dbt.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que é uma métrica que existe em três lugares?",
                        verso: "Três opiniões parecidas com números.",
                    },
                    {
                        frente: "O que o semantic layer centraliza?",
                        verso: "A definição da métrica, num lugar só.",
                    },
                    {
                        frente: "O que isso garante a quem consulta?",
                        verso: "O mesmo número, venha de onde vier a pergunta.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quando um PR de dado inspira confiança?",
                        verso: "Depois que o pipeline provou sozinho que compila e passa.",
                    },
                    {
                        frente: "O que a integração contínua roda nesse PR?",
                        verso: "A compilação dos modelos e os testes.",
                    },
                    {
                        frente: "O que ela evita?",
                        verso: "Descobrir a quebra só depois do merge.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que existe entre a tabela crua e o número do painel?",
                        verso: "Uma cadeia inteira de decisões.",
                    },
                    {
                        frente: "Quem assina cada uma dessas decisões?",
                        verso: "O analytics engineer.",
                    },
                    {
                        frente: "O que isso implica sobre o número final?",
                        verso: "Ele carrega escolhas, e não apenas cálculo.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Pelo que um projeto dbt maduro não se reconhece?",
                        verso: "Pelo número de modelos.",
                    },
                    {
                        frente: "Pelo que ele se reconhece?",
                        verso: "Pela confiança de quem lê o SQL escrito por outra pessoa.",
                    },
                    {
                        frente: "O que essa pessoa precisa entender na hora?",
                        verso: "O que o modelo faz e de onde vem o dado.",
                    },
                ],
            },
        },
    },
};
