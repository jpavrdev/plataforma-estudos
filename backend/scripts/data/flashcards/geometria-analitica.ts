import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Geometria Analítica, quarta trilha do roadmap de Matemática.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra a conta feita;
 * as cartas guardam as definições fechadas, os testes rápidos e as
 * condições que a aula enuncia de passagem.
 *
 * As fórmulas vão por extenso, em palavras: a carta é lida no verso curto
 * do baralho, sem a renderização de LaTeX que as aulas usam.
 */
export const geometriaAnalitica: CartasDaTrilha = {
    trilha: "Geometria Analítica",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que três dados um vetor carrega?",
                        verso: "Módulo, direção e sentido.",
                    },
                    {
                        frente: "O que um vetor ignora por completo?",
                        verso: "Onde foi desenhado: só o deslocamento importa.",
                    },
                    {
                        frente: "Como se obtêm as coordenadas de um vetor?",
                        verso: "Pela diferença entre o ponto final e o inicial.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que somar dois vetores representa?",
                        verso: "Combinar deslocamentos, um depois do outro.",
                    },
                    {
                        frente: "Que regra geométrica soma dois vetores?",
                        verso: "A do paralelogramo, ou a do polígono ligando um ao outro.",
                    },
                    {
                        frente: "Que efeito o escalar negativo produz no vetor?",
                        verso: "Inverte o sentido, além de mudar o tamanho.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o módulo e o versor guardam, cada um?",
                        verso: "O módulo guarda o tamanho e o versor guarda o rumo.",
                    },
                    {
                        frente: "Como se obtém o versor de um vetor?",
                        verso: "Dividindo o vetor pelo próprio módulo.",
                    },
                    {
                        frente: "Que módulo todo versor tem?",
                        verso: "Módulo igual a um.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que forma uma base do plano?",
                        verso: "Um par de direções independentes.",
                    },
                    {
                        frente: "O que dois vetores dependentes têm em comum?",
                        verso: "A mesma direção, um sendo múltiplo do outro.",
                    },
                    {
                        frente: "Que alcance uma base do plano tem?",
                        verso: "Reconstrói o plano inteiro por combinações.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o espaço acrescenta às ideias do plano?",
                        verso: "Apenas mais uma coordenada, sem regras novas.",
                    },
                    {
                        frente: "Quantas coordenadas um vetor no espaço tem?",
                        verso: "Três, uma para cada eixo.",
                    },
                    {
                        frente: "Que operações mudam ao passar do plano ao espaço?",
                        verso: "Nenhuma: soma e escalar seguem coordenada a coordenada.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Em que o produto escalar transforma a geometria?",
                        verso: "Em aritmética: ângulo e comprimento viram contas de coordenadas.",
                    },
                    {
                        frente: "Como o produto escalar é calculado por coordenadas?",
                        verso: "Somando os produtos das coordenadas correspondentes.",
                    },
                    {
                        frente: "Que tipo de resultado o produto escalar devolve?",
                        verso: "Um número, nunca um vetor.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que conta isola o cosseno do ângulo?",
                        verso: "O produto escalar dividido pelo produto dos módulos.",
                    },
                    {
                        frente: "Que ângulo o produto escalar negativo indica?",
                        verso: "Um ângulo obtuso, maior que o reto.",
                    },
                    {
                        frente: "Que ângulo dois vetores de mesmo sentido formam?",
                        verso: "Zero, com o cosseno valendo um.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que a projeção de um vetor sobre outro mede?",
                        verso: "Quanto do primeiro segue na direção do segundo.",
                    },
                    {
                        frente: "Que forma a projeção ortogonal devolve?",
                        verso: "Um vetor, na direção daquele sobre o qual se projeta.",
                    },
                    {
                        frente: "Que operação aparece no cálculo da projeção?",
                        verso: "O produto escalar, dividido pelo módulo ao quadrado.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que conta testa o perpendicularismo?",
                        verso: "O produto escalar: dá zero quando os vetores são ortogonais.",
                    },
                    {
                        frente: "Que medida o teste de ortogonalidade dispensa?",
                        verso: "A do ângulo, trocada por uma única conta.",
                    },
                    {
                        frente: "Que vetor é ortogonal a todos os outros?",
                        verso: "O vetor nulo.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que grandeza física o produto escalar calcula?",
                        verso: "O trabalho de uma força ao longo do deslocamento.",
                    },
                    {
                        frente: "Que decomposição o produto escalar permite?",
                        verso: "A do vetor em parte paralela e parte perpendicular.",
                    },
                    {
                        frente: "Que uso o produto escalar tem junto do versor?",
                        verso: "Extrai a componente do vetor naquela direção.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "O que o produto vetorial mede, ao contrário do escalar?",
                        verso: "O quanto os dois vetores se abrem no espaço.",
                    },
                    {
                        frente: "Que tipo de resultado o produto vetorial devolve?",
                        verso: "Um vetor, perpendicular aos dois originais.",
                    },
                    {
                        frente: "Que efeito trocar a ordem tem no produto vetorial?",
                        verso: "Inverte o sentido do vetor resultado.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que grandeza o módulo do produto vetorial representa?",
                        verso: "A área do paralelogramo formado pelos dois vetores.",
                    },
                    {
                        frente: "Que área o triângulo dos mesmos vetores tem?",
                        verso: "Metade da área do paralelogramo.",
                    },
                    {
                        frente: "Que produto vetorial dá zero?",
                        verso: "O de vetores paralelos, que não abrem área nenhuma.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quantos vetores o produto misto envolve?",
                        verso: "Três, resumidos num único número.",
                    },
                    {
                        frente: "Que operações o produto misto encadeia?",
                        verso: "Um produto vetorial seguido de um produto escalar.",
                    },
                    {
                        frente: "Que conta calcula o produto misto direto?",
                        verso: "O determinante da matriz com os três vetores.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que grandeza o módulo do produto misto dá?",
                        verso: "O volume do paralelepípedo dos três vetores.",
                    },
                    {
                        frente: "Que régua mede área e volume nessas contas?",
                        verso: "O determinante.",
                    },
                    {
                        frente: "Que volume o tetraedro dos três vetores tem?",
                        verso: "Um sexto do volume do paralelepípedo.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que o produto misto zerado anuncia?",
                        verso: "Coplanaridade: os três vetores cabem num mesmo plano.",
                    },
                    {
                        frente: "Que volume três vetores coplanares formam?",
                        verso: "Zero, com o espaço colapsando num plano.",
                    },
                    {
                        frente: "Que teste verifica se quatro pontos são coplanares?",
                        verso: "O produto misto dos vetores entre eles, conferindo se zera.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Que dois dados determinam uma reta no espaço?",
                        verso: "Um ponto de apoio e um vetor diretor.",
                    },
                    {
                        frente: "O que o parâmetro representa na equação da reta?",
                        verso: "O quanto se caminha na direção do vetor diretor.",
                    },
                    {
                        frente: "Que rastro a reta descreve, na imagem da aula?",
                        verso: "O de um ponto que caminha sempre na mesma direção.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que as equações simétricas eliminam?",
                        verso: "O parâmetro, deixando só as coordenadas conversando.",
                    },
                    {
                        frente: "Que impedimento a coordenada nula do diretor cria?",
                        verso: "Ela não pode virar denominador na forma simétrica.",
                    },
                    {
                        frente: "De onde saem os denominadores nas equações simétricas?",
                        verso: "Das coordenadas do vetor diretor.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que duas setas toda reta do plano carrega?",
                        verso: "A diretora, por dentro, e a normal, que a atravessa em ângulo reto.",
                    },
                    {
                        frente: "Que relação liga o vetor normal ao diretor?",
                        verso: "São perpendiculares: conhecer um é conhecer o outro.",
                    },
                    {
                        frente: "Onde o vetor normal aparece na equação geral?",
                        verso: "Nos coeficientes das incógnitas.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que posições duas retas no espaço podem ter?",
                        verso: "Paralelas, concorrentes, coincidentes ou reversas.",
                    },
                    {
                        frente: "O que caracteriza duas retas reversas?",
                        verso: "Nem se cruzam nem são paralelas, por morarem em planos distintos.",
                    },
                    {
                        frente: "Que comparação abre o estudo da posição relativa?",
                        verso: "A dos vetores diretores das duas retas.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que pergunta a interseção de duas retas faz?",
                        verso: "Em que instante os dois caminhos pisam no mesmo ponto.",
                    },
                    {
                        frente: "Que cuidado o sistema da interseção exige?",
                        verso: "Usar um parâmetro diferente para cada reta.",
                    },
                    {
                        frente: "O que a ausência de solução no sistema indica?",
                        verso: "Retas paralelas ou reversas, sem ponto em comum.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "Que dados determinam um plano na forma vetorial?",
                        verso: "Um ponto de apoio e duas direções independentes.",
                    },
                    {
                        frente: "Quantos parâmetros a equação paramétrica do plano usa?",
                        verso: "Dois, um para cada direção de deslize.",
                    },
                    {
                        frente: "Que exigência as duas direções do plano têm?",
                        verso: "Serem independentes, sem uma ser múltipla da outra.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que o vetor normal resume?",
                        verso: "O plano inteiro numa direção só, a que aponta para fora dele.",
                    },
                    {
                        frente: "Onde o vetor normal aparece na equação geral do plano?",
                        verso: "Nos coeficientes das três incógnitas.",
                    },
                    {
                        frente: "Como obter o normal a partir das direções do plano?",
                        verso: "Pelo produto vetorial entre as duas direções.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que comparação resolve a posição entre reta e plano?",
                        verso: "A do vetor diretor da reta com o normal do plano.",
                    },
                    {
                        frente: "O que o diretor ortogonal ao normal indica?",
                        verso: "Reta paralela ao plano, ou contida nele.",
                    },
                    {
                        frente: "O que o diretor paralelo ao normal indica?",
                        verso: "Reta perpendicular ao plano.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que três destinos dois planos podem ter?",
                        verso: "Correr lado a lado, coincidir por completo ou se cruzar numa reta.",
                    },
                    {
                        frente: "O que normais paralelas indicam sobre os planos?",
                        verso: "Que são paralelos, ou então o mesmo plano.",
                    },
                    {
                        frente: "O que separa planos paralelos de coincidentes?",
                        verso: "Um ponto: se pertence aos dois, os planos coincidem.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "O que nasce do encontro de dois planos?",
                        verso: "Sempre uma reta.",
                    },
                    {
                        frente: "Que conta dá a direção dessa reta?",
                        verso: "O produto vetorial dos dois vetores normais.",
                    },
                    {
                        frente: "Que dado falta depois de achar a direção?",
                        verso: "Um ponto comum, obtido resolvendo o sistema.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Por onde a distância de ponto a reta é medida?",
                        verso: "Pela perpendicular, nunca por um caminho oblíquo.",
                    },
                    {
                        frente: "Que conta dá a distância entre dois pontos?",
                        verso: "O módulo do vetor que liga um ao outro.",
                    },
                    {
                        frente: "Que dados a fórmula da distância no plano usa?",
                        verso: "Os coeficientes da equação geral e as coordenadas do ponto.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que figura a distância de ponto a reta no espaço usa?",
                        verso: "Um paralelogramo, cuja altura é a distância procurada.",
                    },
                    {
                        frente: "Que divisão devolve essa altura?",
                        verso: "A da área pela base.",
                    },
                    {
                        frente: "Que produto calcula a área nesse caso?",
                        verso: "O vetorial, entre o diretor e o vetor até o ponto.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que substituir o ponto na equação do plano mede?",
                        verso: "O quanto ele desobedece à equação.",
                    },
                    {
                        frente: "Que divisão converte isso em distância?",
                        verso: "A pela norma do vetor normal.",
                    },
                    {
                        frente: "Que distância um ponto do próprio plano tem até ele?",
                        verso: "Zero, porque a equação é satisfeita.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "O que a perpendicular comum tem de único?",
                        verso: "É a única reta em ângulo reto com as duas reversas.",
                    },
                    {
                        frente: "O que o comprimento da perpendicular comum representa?",
                        verso: "A distância entre as duas retas reversas.",
                    },
                    {
                        frente: "Que produto aparece na distância entre reversas?",
                        verso: "O misto, dividido pelo módulo do produto vetorial.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que vetores representam reta e plano na comparação?",
                        verso: "O diretor para a reta e o normal para o plano.",
                    },
                    {
                        frente: "Que operação cuida do ângulo entre eles?",
                        verso: "O produto escalar, com os módulos no denominador.",
                    },
                    {
                        frente: "Que ajuste o ângulo entre reta e plano exige?",
                        verso: "Tomar o complemento do ângulo formado com a normal.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Que dois dados decidem uma circunferência?",
                        verso: "O centro e a distância até ele, o raio.",
                    },
                    {
                        frente: "Que forma a equação reduzida da circunferência tem?",
                        verso: "Soma dos quadrados das diferenças igual ao raio ao quadrado.",
                    },
                    {
                        frente: "Que técnica revela a circunferência na equação geral?",
                        verso: "Completar quadrados até achar centro e raio.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que soma a elipse mantém constante?",
                        verso: "A das distâncias do ponto aos dois focos.",
                    },
                    {
                        frente: "Que nome os dois pontos fixos da elipse recebem?",
                        verso: "Focos.",
                    },
                    {
                        frente: "Que eixo da elipse contém os focos?",
                        verso: "O maior, chamado eixo focal.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que dois elementos disputam cada ponto da parábola?",
                        verso: "O foco e a reta diretriz, em pé de igualdade.",
                    },
                    {
                        frente: "Que igualdade define a parábola?",
                        verso: "A distância ao foco igual à distância à diretriz.",
                    },
                    {
                        frente: "Que reta divide a parábola ao meio?",
                        verso: "O eixo de simetria, que passa pelo foco e pelo vértice.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que grandeza a hipérbole mantém constante?",
                        verso: "A diferença das distâncias aos dois focos.",
                    },
                    {
                        frente: "Que troca separa a hipérbole da elipse?",
                        verso: "A soma das distâncias vira diferença entre elas.",
                    },
                    {
                        frente: "Que retas a hipérbole persegue sem jamais tocar?",
                        verso: "As assíntotas, que guiam os dois ramos.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que passo a aula recomenda antes de resolver?",
                        verso: "Classificar a cônica escondida na equação.",
                    },
                    {
                        frente: "Que economia a classificação costuma trazer?",
                        verso: "Poupar cerca de metade do trabalho de conta.",
                    },
                    {
                        frente: "Que termos denunciam a cônica na equação geral?",
                        verso: "Os quadráticos, pelos sinais e pelos coeficientes.",
                    },
                ],
            },
        },
    },
};
