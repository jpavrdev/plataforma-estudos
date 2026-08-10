import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Compiladores e Toolchain, sexta trilha do roadmap de C++ e
 * Baixo Nível.
 *
 * Sem trilhos de linguagem: tudo em "neutra". O quiz cobra o diagnóstico
 * do cenário; as cartas guardam as listas fechadas, os nomes de flag e as
 * distinções que a aula enuncia de passagem.
 */
export const compiladoresEToolchain: CartasDaTrilha = {
    trilha: "Compiladores e Toolchain",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "Que quatro ferramentas o comando de compilar chama?",
                        verso: "Pré-processador, compilador, assembler e linker.",
                    },
                    {
                        frente: "Que flag para o fluxo logo depois do compilador?",
                        verso: "A que gera assembly, parando antes do assembler.",
                    },
                    {
                        frente: "Como projetos grandes organizam o build?",
                        verso: "Cada arquivo com objeto próprio e um link só no fim.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que linguagem o pré-processador realmente entende?",
                        verso: "Nenhuma: ele só enxerga texto e diretivas com cerquilha.",
                    },
                    {
                        frente: "Que alternativa ao guard clássico os compiladores aceitam?",
                        verso: "O pragma once, mais curto e sem nome de macro.",
                    },
                    {
                        frente: "Que substitutos a regra prática prefere às macros?",
                        verso: "Constantes const ou constexpr e funções inline.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que dois erros a ODR produz quando é violada?",
                        verso: "Referência indefinida com zero, e duplicada com duas.",
                    },
                    {
                        frente: "Que licença o inline moderno realmente concede?",
                        verso: "A de repetir a definição em várias unidades de tradução.",
                    },
                    {
                        frente: "Que efeito o static tem sobre um nome global?",
                        verso: "Dá linkage interno: cada unidade tem a própria cópia.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que letras o nm usa para os símbolos principais?",
                        verso: "T no código, U no indefinido, D e B nos dados.",
                    },
                    {
                        frente: "Que anotação o assembler deixa no lugar do endereço?",
                        verso: "Um buraco com bilhete de relocação para o linker.",
                    },
                    {
                        frente: "Que formato os objetos usam no Linux?",
                        verso: "O ELF, com seções separadas de código e dados.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Em que momento o erro de biblioteca dinâmica aparece?",
                        verso: "Na execução, quando o carregador não acha o arquivo.",
                    },
                    {
                        frente: "Que argumento decisivo favorece a linkagem dinâmica?",
                        verso: "A segurança: um patch conserta todos os programas.",
                    },
                    {
                        frente: "Que variável adiciona diretórios à busca do carregador?",
                        verso: "A de caminho de biblioteca, ótima em teste e ruim fixa.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "Que regra decide onde um token termina?",
                        verso: "A do bocado máximo, comendo o maior trecho válido.",
                    },
                    {
                        frente: "Que dois exemplos de erro léxico a aula dá?",
                        verso: "Um caractere fora da linguagem e uma string sem fechar.",
                    },
                    {
                        frente: "Que informação cada token carrega além da categoria?",
                        verso: "O lexema, o texto original que apareceu no fonte.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Por que a árvore sintática é chamada de abstrata?",
                        verso: "Ela descarta o que era só notação, como o parêntese.",
                    },
                    {
                        frente: "Que papel a precedência cumpre na forma da árvore?",
                        verso: "Decide quem fica mais perto das folhas na expressão.",
                    },
                    {
                        frente: "O que a associatividade resolve que a precedência não?",
                        verso: "O empate entre operadores de mesma força na expressão.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que produto a análise semântica entrega adiante?",
                        verso: "A árvore anotada, com tipo em cada nó e nome resolvido.",
                    },
                    {
                        frente: "Que erro usar função definida mais abaixo produz?",
                        verso: "Semântico, por falta de declaração visível ali.",
                    },
                    {
                        frente: "Que fase produz o undefined reference, afinal?",
                        verso: "O linker, bem depois da análise semântica.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que linha vale olhar além da apontada pelo erro?",
                        verso: "A anterior: a pontuação faltante mora logo acima.",
                    },
                    {
                        frente: "Que flags limitam a saída ao primeiro erro?",
                        verso: "O máximo de erros no gcc e o limite no clang.",
                    },
                    {
                        frente: "Que proporção de problema e eco a tela costuma ter?",
                        verso: "Um problema real e dezenas de ecos do parser perdido.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que ordem a avaliação de uma árvore segue?",
                        verso: "A pós-ordem: filhos antes do pai e folhas antes de tudo.",
                    },
                    {
                        frente: "Que descoberta o exercício de avaliar revela?",
                        verso: "Que interpretar é percorrer, em poucas linhas recursivas.",
                    },
                    {
                        frente: "Como o hábito muda a leitura de expressão difícil?",
                        verso: "Localiza-se o operador da raiz em vez de ler em linha.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "Que conta a IR transforma de multiplicação em soma?",
                        verso: "N vezes M tradutores viram N front-ends mais M back-ends.",
                    },
                    {
                        frente: "Que duas siglas o GCC usa no lugar da IR única?",
                        verso: "O GIMPLE de alto nível e o RTL antes do assembly.",
                    },
                    {
                        frente: "Que consequência libertadora a IR traz ao otimizar?",
                        verso: "A otimização vale igual para todas as linguagens.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que regra autoriza o compilador a reescrever tudo?",
                        verso: "A do como se: o comportamento observável não muda.",
                    },
                    {
                        frente: "Que efeito dominó uma otimização provoca nas outras?",
                        verso: "Propagar vira constante, dobrar resolve e o morto some.",
                    },
                    {
                        frente: "Que limite o otimizador nunca ultrapassa?",
                        verso: "Ele só reescreve o que consegue provar seguro.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que promessa o nível zero de otimização cumpre?",
                        verso: "Traduzir quase literalmente, com cada variável na pilha.",
                    },
                    {
                        frente: "Que risco subir para o nível três costuma trazer?",
                        verso: "Código maior, que às vezes perde onde deveria ganhar.",
                    },
                    {
                        frente: "Que combinação a aula recomenda para desenvolver?",
                        verso: "Otimização mínima com informação de depuração ligada.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que caso real de 2009 ilustra o UB no kernel?",
                        verso: "O teste de nulo removido depois da desreferência.",
                    },
                    {
                        frente: "Por que assumir a ausência de UB não é malícia?",
                        verso: "É a outra face da velocidade que se cobra do compilador.",
                    },
                    {
                        frente: "Que buracos deliberados o padrão deixa sem promessa?",
                        verso: "O estouro com sinal e o acesso fora dos limites.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que exercício fundamental o godbolt torna trivial?",
                        verso: "Comparar o assembly de dois níveis lado a lado.",
                    },
                    {
                        frente: "Que meia dúzia de padrões basta para ler assembly?",
                        verso: "O mover, o chamar, o retornar e os rótulos de salto.",
                    },
                    {
                        frente: "Que rotina o hábito do godbolt instala na engenharia?",
                        verso: "Comparar as duas versões antes de afirmar o ganho.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "Que convenção o GCC e o Clang seguem no Linux?",
                        verso: "A mesma ABI, e por isso os objetos deles se linkam.",
                    },
                    {
                        frente: "Que flag do nm já imprime o nome legível?",
                        verso: "A de demangle, que desfaz a decoração do C++.",
                    },
                    {
                        frente: "Que custo o extern C impõe às funções ligadas?",
                        verso: "Elas não podem ser sobrecarregadas, com símbolo cru.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que método de três passos diagnostica o erro?",
                        verso: "Anotar o símbolo, ver quem consome e quem deveria dar.",
                    },
                    {
                        frente: "Que variante do erro aponta para a tabela virtual?",
                        verso: "A que cita a vtable de uma classe sem método definido.",
                    },
                    {
                        frente: "Que ferramenta confirma os dois lados do problema?",
                        verso: "O nm, listando o indefinido e o definido em cada objeto.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Em que sentido o linker lê o comando de estáticas?",
                        verso: "Da esquerda para a direita, sem olhar para trás.",
                    },
                    {
                        frente: "Que uso clássico o símbolo fraco tem no embarcado?",
                        verso: "Handlers de interrupção que o seu código sobrescreve.",
                    },
                    {
                        frente: "Que letra o nm usa para marcar um símbolo fraco?",
                        verso: "A de fraco, no lugar do T de código definido.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Por que o script de link fica invisível no desktop?",
                        verso: "O linker usa um padrão embutido, adequado ao sistema.",
                    },
                    {
                        frente: "Por que a área de dados inicial mora na flash?",
                        verso: "A RAM perde tudo sem energia e precisa ser copiada.",
                    },
                    {
                        frente: "Que erro o script emite quando o código não cabe?",
                        verso: "O de região estourada, citando a área e os bytes a mais.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que ferramenta lista as funções por tamanho?",
                        verso: "O nm ordenado por tamanho, com o nome já legível.",
                    },
                    {
                        frente: "Que dupla de flags permite o linker podar de verdade?",
                        verso: "Seção por função na compilação e coleta de lixo no link.",
                    },
                    {
                        frente: "Que recurso do C++ mais incha o binário?",
                        verso: "Os templates, com uma cópia por combinação de tipos.",
                    },
                ],
            },
        },
    },
};
