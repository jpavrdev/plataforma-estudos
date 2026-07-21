// Seed dos desafios difíceis (formato função). Idempotente por título;
// o número de exibição é atribuído dinamicamente (próximo livre) para não colidir.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-desafios-hard.ts
import { db } from "../db.ts";
import { challenges, challengeTests } from "../schema.ts";
import { eq, sql } from "drizzle-orm";

const DESAFIOS = [
    {
        "title": "Água da Chuva",
        "topic": "Array · Dois Ponteiros · Pilha",
        "entryPoint": "trap",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe um vetor de inteiros não negativos `height`, no qual cada `height[i]` representa a altura de uma barra de largura `1` posicionada no índice `i`. As barras ficam encostadas umas nas outras, formando um relevo irregular.\n\nImagine que começa a chover sobre esse relevo. A água se acumula nas depressões entre as barras: em cada posição, o nível de água que fica retido é limitado pela menor altura entre a barra mais alta à sua esquerda e a barra mais alta à sua direita. Se essa menor altura for maior que a barra daquela posição, a diferença vira água acumulada; caso contrário, nada se acumula ali. A água que passa das bordas do relevo escorre para fora.\n\nPor exemplo, para `height = [0,1,0,2,1,0,1,3,2,1,2,1]` o total de água retida é `6`.\n\nImplemente o método `trap`, que recebe o vetor `height` e retorna o total de unidades de água da chuva que ficam retidas entre as barras."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `0 ≤ height.length ≤ 2 * 10^4`\n- `0 ≤ height[i] ≤ 10^5`\n- A resposta é um número inteiro não negativo."
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[]} height\n   * @return {number}\n   */\n  trap(height) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def trap(self, height: List[int]) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int trap(int[] height) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[0,1,0,2,1,0,1,3,2,1,2,1]]",
                "expectedOutput": "6",
                "isPublic": true
            },
            {
                "input": "[[4,2,0,3,2,5]]",
                "expectedOutput": "9",
                "isPublic": true
            },
            {
                "input": "[[]]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[[5]]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[[3,3]]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[[2,0,2]]",
                "expectedOutput": "2",
                "isPublic": false
            },
            {
                "input": "[[4,2,3]]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[[5,4,1,2]]",
                "expectedOutput": "1",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Mediana de Dois Vetores Ordenados",
        "topic": "Array · Busca Binária",
        "entryPoint": "findMedianSortedArrays",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe dois vetores de inteiros `nums1` e `nums2`, cada um já ordenado em ordem não decrescente. Considere o conjunto formado pela junção de todos os elementos dos dois vetores, mantendo as repetições.\n\nA mediana desse conjunto combinado é o valor que fica no meio quando todos os elementos são colocados em ordem crescente. Quando a quantidade total de elementos é ímpar, a mediana é o elemento central. Quando é par, a mediana é a média aritmética dos dois elementos centrais, e por isso pode ter parte fracionária.\n\nPor exemplo, para `nums1 = [1,3]` e `nums2 = [2]` o conjunto combinado é `[1,2,3]` e a mediana é `2`. Já para `nums1 = [1,2]` e `nums2 = [3,4]` o conjunto é `[1,2,3,4]` e a mediana é `2.5`, a média entre `2` e `3`.\n\nImplemente o método `findMedianSortedArrays`, que recebe `nums1` e `nums2` e retorna a mediana exata do conjunto combinado, seja ela um inteiro ou um valor com parte fracionária."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `0 ≤ nums1.length, nums2.length ≤ 1000`\n- `1 ≤ nums1.length + nums2.length`\n- `-10^6 ≤ nums1[i], nums2[i] ≤ 10^6`\n- Cada vetor, isoladamente, já vem ordenado em ordem não decrescente."
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[]} nums1\n   * @param {number[]} nums2\n   * @return {number}\n   */\n  findMedianSortedArrays(nums1, nums2) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        // sua solução aqui\n        return 0.0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[1,3],[2]]",
                "expectedOutput": "2",
                "isPublic": true
            },
            {
                "input": "[[1,2],[3,4]]",
                "expectedOutput": "2.5",
                "isPublic": true
            },
            {
                "input": "[[],[1]]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[[2],[]]",
                "expectedOutput": "2",
                "isPublic": false
            },
            {
                "input": "[[0,0],[0,0]]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[[1,3],[2,7]]",
                "expectedOutput": "2.5",
                "isPublic": false
            },
            {
                "input": "[[1,2,3,4,5],[6,7,8]]",
                "expectedOutput": "4.5",
                "isPublic": false
            },
            {
                "input": "[[3],[-2,-1]]",
                "expectedOutput": "-1",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Casamento de Expressão Regular",
        "topic": "String · Programação Dinâmica · Recursão",
        "entryPoint": "isMatch",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe uma string `s`, formada apenas por letras minúsculas, e um padrão `p`, que pode conter letras minúsculas e os caracteres especiais `.` e `*`. Determine se o padrão casa com a string inteira.\n\nAs regras de casamento são: o caractere `.` casa com qualquer caractere único; o caractere `*` casa com zero ou mais repetições do caractere imediatamente anterior a ele no padrão. Um `*` sempre aparece precedido por uma letra ou por um `.`, e atua apenas sobre esse elemento anterior.\n\nO casamento precisa cobrir a string `s` por completo, e não apenas um pedaço dela. Por exemplo, `a*` casa com `aa` porque `*` repete o `a` duas vezes, mas `a` sozinho não casa com `aa`. Já `.*` casa com qualquer string, pois repete o `.` quantas vezes for preciso.\n\nImplemente o método `isMatch`, que recebe `s` e `p` e retorna `true` se o padrão casa com toda a string `s` e `false` caso contrário."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `0 ≤ s.length ≤ 20`\n- `0 ≤ p.length ≤ 30`\n- `s` contém apenas letras minúsculas do alfabeto inglês.\n- `p` contém apenas letras minúsculas e os caracteres `.` e `*`.\n- Todo `*` em `p` é precedido por um caractere válido ao qual ele se aplica."
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {string} s\n   * @param {string} p\n   * @return {boolean}\n   */\n  isMatch(s, p) {\n    // sua solução aqui\n  }\n}\n",
            "python": "class Solution:\n    def isMatch(self, s: str, p: str) -> bool:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public boolean isMatch(String s, String p) {\n        // sua solução aqui\n        return false;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[\"aa\",\"a\"]",
                "expectedOutput": "false",
                "isPublic": true
            },
            {
                "input": "[\"aa\",\"a*\"]",
                "expectedOutput": "true",
                "isPublic": true
            },
            {
                "input": "[\"ab\",\".*\"]",
                "expectedOutput": "true",
                "isPublic": false
            },
            {
                "input": "[\"aab\",\"c*a*b\"]",
                "expectedOutput": "true",
                "isPublic": false
            },
            {
                "input": "[\"mississippi\",\"mis*is*p*.\"]",
                "expectedOutput": "false",
                "isPublic": false
            },
            {
                "input": "[\"\",\"c*\"]",
                "expectedOutput": "true",
                "isPublic": false
            },
            {
                "input": "[\"mississippi\",\"mis*is*ip*.\"]",
                "expectedOutput": "true",
                "isPublic": false
            },
            {
                "input": "[\"ab\",\".*c\"]",
                "expectedOutput": "false",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Casamento com Coringa",
        "topic": "String · Programação Dinâmica · Guloso",
        "entryPoint": "isMatch",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe uma string `s`, formada apenas por letras minúsculas, e um padrão `p`, que pode conter letras minúsculas e os caracteres coringa `?` e `*`. Determine se o padrão casa com a string inteira.\n\nAs regras de casamento são: o caractere `?` casa com exatamente um caractere qualquer; o caractere `*` casa com qualquer sequência de caracteres, inclusive a sequência vazia. Aqui o `*` funciona sozinho e não depende do caractere anterior.\n\nO casamento precisa cobrir a string `s` por completo. Por exemplo, o padrão `*` casa com qualquer string, pois seu único coringa pode absorver tudo. Já `?a` não casa com `cb`, porque `?` casa com o `c`, mas o `a` do padrão não corresponde ao `b`.\n\nImplemente o método `isMatch`, que recebe `s` e `p` e retorna `true` se o padrão casa com toda a string `s` e `false` caso contrário."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `0 ≤ s.length ≤ 2000`\n- `0 ≤ p.length ≤ 2000`\n- `s` contém apenas letras minúsculas do alfabeto inglês.\n- `p` contém apenas letras minúsculas e os caracteres `?` e `*`."
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {string} s\n   * @param {string} p\n   * @return {boolean}\n   */\n  isMatch(s, p) {\n    // sua solução aqui\n  }\n}\n",
            "python": "class Solution:\n    def isMatch(self, s: str, p: str) -> bool:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public boolean isMatch(String s, String p) {\n        // sua solução aqui\n        return false;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[\"aa\",\"a\"]",
                "expectedOutput": "false",
                "isPublic": true
            },
            {
                "input": "[\"aa\",\"*\"]",
                "expectedOutput": "true",
                "isPublic": true
            },
            {
                "input": "[\"cb\",\"?a\"]",
                "expectedOutput": "false",
                "isPublic": false
            },
            {
                "input": "[\"adceb\",\"*a*b\"]",
                "expectedOutput": "true",
                "isPublic": false
            },
            {
                "input": "[\"acdcb\",\"a*c?b\"]",
                "expectedOutput": "false",
                "isPublic": false
            },
            {
                "input": "[\"\",\"*\"]",
                "expectedOutput": "true",
                "isPublic": false
            },
            {
                "input": "[\"\",\"?\"]",
                "expectedOutput": "false",
                "isPublic": false
            },
            {
                "input": "[\"abc\",\"a*c\"]",
                "expectedOutput": "true",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Distância de Edição",
        "topic": "String · Programação Dinâmica",
        "entryPoint": "minDistance",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe duas strings `word1` e `word2`. Seu objetivo é descobrir o número mínimo de operações necessárias para transformar `word1` em `word2`.\n\nSão permitidas três operações, cada uma contando como uma unidade: inserir um caractere em qualquer posição, remover um caractere existente ou substituir um caractere por outro. As operações podem ser aplicadas em qualquer ordem e a qualquer posição da palavra em construção.\n\nEsse valor mínimo é conhecido como distância de edição entre as duas palavras. Por exemplo, transformar `horse` em `ros` exige `3` operações: substituir `h` por `r`, remover o `r` seguinte e remover o `e` final.\n\nImplemente o método `minDistance`, que recebe `word1` e `word2` e retorna o menor número de operações necessárias para transformar a primeira palavra na segunda."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `0 ≤ word1.length, word2.length ≤ 500`\n- `word1` e `word2` contêm apenas letras minúsculas do alfabeto inglês."
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {string} word1\n   * @param {string} word2\n   * @return {number}\n   */\n  minDistance(word1, word2) {\n    // sua solução aqui\n  }\n}\n",
            "python": "class Solution:\n    def minDistance(self, word1: str, word2: str) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int minDistance(String word1, String word2) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[\"horse\",\"ros\"]",
                "expectedOutput": "3",
                "isPublic": true
            },
            {
                "input": "[\"intention\",\"execution\"]",
                "expectedOutput": "5",
                "isPublic": true
            },
            {
                "input": "[\"\",\"abc\"]",
                "expectedOutput": "3",
                "isPublic": false
            },
            {
                "input": "[\"abc\",\"\"]",
                "expectedOutput": "3",
                "isPublic": false
            },
            {
                "input": "[\"\",\"\"]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[\"abc\",\"abc\"]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[\"a\",\"ab\"]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[\"sunday\",\"saturday\"]",
                "expectedOutput": "3",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Parênteses Válidos Mais Longos",
        "topic": "String · Programação Dinâmica · Pilha",
        "entryPoint": "longestValidParentheses",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe uma string `s` formada apenas pelos caracteres `(` e `)`. Uma substring de parênteses é considerada **bem-formada** quando cada `(` possui um `)` correspondente que o fecha na ordem correta, sem sobrar nenhum parêntese de qualquer lado."
            },
            {
                "type": "text",
                "value": "Considere apenas as substrings **contíguas** (trechos sem pular posições) de `s`. Entre todas as que são bem-formadas, retorne o comprimento da mais longa. Por exemplo, em `(()` a maior substring válida é `()`, de comprimento 2; já em `)()())` a maior é `()()`, de comprimento 4. Quando não existe nenhum trecho válido, o resultado é 0."
            },
            {
                "type": "text",
                "value": "Implemente o método `longestValidParentheses`, que recebe a string `s` e devolve o comprimento da maior substring contígua de parênteses bem-formados."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `0 ≤ s.length ≤ 3 * 10^4`\n- `s` contém apenas os caracteres `(` e `)`"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {string} s\n   * @return {number}\n   */\n  longestValidParentheses(s) {\n    // sua solução aqui\n  }\n}\n",
            "python": "class Solution:\n    def longestValidParentheses(self, s: str) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int longestValidParentheses(String s) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[\"(()\"]",
                "expectedOutput": "2",
                "isPublic": true
            },
            {
                "input": "[\")()())\"]",
                "expectedOutput": "4",
                "isPublic": true
            },
            {
                "input": "[\"\"]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[\")(\"]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[\"()(())\"]",
                "expectedOutput": "6",
                "isPublic": false
            },
            {
                "input": "[\"((()))\"]",
                "expectedOutput": "6",
                "isPublic": false
            },
            {
                "input": "[\"()()\"]",
                "expectedOutput": "4",
                "isPublic": false
            },
            {
                "input": "[\"(()())\"]",
                "expectedOutput": "6",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Primeiro Positivo Faltando",
        "topic": "Array · Tabela Hash",
        "entryPoint": "firstMissingPositive",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Dada uma lista de inteiros `nums`, encontre o **menor inteiro positivo** (isto é, maior ou igual a 1) que **não** aparece em `nums`. Valores negativos, zeros e repetições podem existir na lista e devem simplesmente ser ignorados quando não ajudam a formar a sequência 1, 2, 3, ..."
            },
            {
                "type": "text",
                "value": "Por exemplo, em `[1, 2, 0]` os positivos presentes são 1 e 2, então o primeiro que falta é 3. Em `[3, 4, -1, 1]` o 1 está presente mas o 2 não, logo a resposta é 2. Quando a lista é vazia, o menor positivo ausente é 1."
            },
            {
                "type": "text",
                "value": "Implemente o método `firstMissingPositive`, que recebe a lista `nums` e devolve o menor inteiro positivo que não está presente nela."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `0 ≤ nums.length ≤ 10^5`\n- `-2^31 ≤ nums[i] ≤ 2^31 - 1`"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[]} nums\n   * @return {number}\n   */\n  firstMissingPositive(nums) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def firstMissingPositive(self, nums: List[int]) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int firstMissingPositive(int[] nums) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[1,2,0]]",
                "expectedOutput": "3",
                "isPublic": true
            },
            {
                "input": "[[3,4,-1,1]]",
                "expectedOutput": "2",
                "isPublic": true
            },
            {
                "input": "[[7,8,9,11,12]]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[[]]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[[1,2,3]]",
                "expectedOutput": "4",
                "isPublic": false
            },
            {
                "input": "[[-1,-2]]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[[1]]",
                "expectedOutput": "2",
                "isPublic": false
            },
            {
                "input": "[[2,2]]",
                "expectedOutput": "1",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Maior Retângulo no Histograma",
        "topic": "Pilha · Array",
        "entryPoint": "largestRectangleArea",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe uma lista de inteiros não negativos `heights`, em que `heights[i]` é a altura da `i`-ésima barra de um histograma. Todas as barras têm largura 1 e ficam encostadas umas nas outras, na ordem dada."
            },
            {
                "type": "text",
                "value": "Determine a **maior área** de um retângulo que caiba inteiramente dentro do histograma. O retângulo pode abranger várias barras consecutivas, mas sua altura fica limitada à menor barra do trecho escolhido. Por exemplo, para `heights = [2, 1, 5, 6, 2, 3]` a maior área é 10, obtida pelas barras de alturas 5 e 6 (altura 5, largura 2)."
            },
            {
                "type": "text",
                "value": "Implemente o método `largestRectangleArea`, que recebe a lista `heights` e devolve a maior área retangular contida no histograma."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `0 ≤ heights.length ≤ 10^5`\n- `0 ≤ heights[i] ≤ 10^4`"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[]} heights\n   * @return {number}\n   */\n  largestRectangleArea(heights) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def largestRectangleArea(self, heights: List[int]) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int largestRectangleArea(int[] heights) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[2,1,5,6,2,3]]",
                "expectedOutput": "10",
                "isPublic": true
            },
            {
                "input": "[[2,4]]",
                "expectedOutput": "4",
                "isPublic": true
            },
            {
                "input": "[[]]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[[1,1]]",
                "expectedOutput": "2",
                "isPublic": false
            },
            {
                "input": "[[0]]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[[2,1,2]]",
                "expectedOutput": "3",
                "isPublic": false
            },
            {
                "input": "[[5,4,3,2,1]]",
                "expectedOutput": "9",
                "isPublic": false
            },
            {
                "input": "[[6,2,5,4,5,1,6]]",
                "expectedOutput": "12",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Maior Retângulo Binário",
        "topic": "Matriz · Programação Dinâmica · Pilha",
        "entryPoint": "maximalRectangle",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe uma matriz `matrix` preenchida com as strings `\"0\"` e `\"1\"`. Cada linha da matriz tem o mesmo número de colunas."
            },
            {
                "type": "text",
                "value": "Encontre o retângulo de maior **área** formado apenas por células iguais a `\"1\"` e retorne essa área (número de células que ele cobre). O retângulo precisa ter lados alinhados às linhas e colunas e ser totalmente composto por `\"1\"`. Se a matriz for vazia ou não contiver nenhum `\"1\"`, a resposta é 0."
            },
            {
                "type": "text",
                "value": "Implemente o método `maximalRectangle`, que recebe a matriz `matrix` e devolve a área do maior retângulo formado somente por `\"1\"`."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `0 ≤ matrix.length ≤ 200`\n- `0 ≤ matrix[i].length ≤ 200`\n- Cada célula é a string `\"0\"` ou a string `\"1\"`"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {string[][]} matrix\n   * @return {number}\n   */\n  maximalRectangle(matrix) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def maximalRectangle(self, matrix: List[List[str]]) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int maximalRectangle(String[][] matrix) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[[\"1\",\"0\",\"1\",\"0\",\"0\"],[\"1\",\"0\",\"1\",\"1\",\"1\"],[\"1\",\"1\",\"1\",\"1\",\"1\"],[\"1\",\"0\",\"0\",\"1\",\"0\"]]]",
                "expectedOutput": "6",
                "isPublic": true
            },
            {
                "input": "[[[\"0\"]]]",
                "expectedOutput": "0",
                "isPublic": true
            },
            {
                "input": "[[[\"1\"]]]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[[]]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[[[\"1\",\"1\"],[\"1\",\"1\"]]]",
                "expectedOutput": "4",
                "isPublic": false
            },
            {
                "input": "[[[\"0\",\"1\"],[\"1\",\"0\"]]]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[[[\"1\",\"1\",\"1\",\"1\"]]]",
                "expectedOutput": "4",
                "isPublic": false
            },
            {
                "input": "[[[\"1\",\"0\",\"1\"],[\"1\",\"1\",\"1\"],[\"1\",\"1\",\"1\"]]]",
                "expectedOutput": "6",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Máximo em Janela Deslizante",
        "topic": "Array · Deque · Janela Deslizante",
        "entryPoint": "maxSlidingWindow",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe uma lista de inteiros `nums` e um inteiro `k`. Imagine uma janela de tamanho `k` que começa encostada na extremidade esquerda de `nums` e desliza uma posição por vez até a extremidade direita. A cada passo a janela enxerga exatamente `k` números consecutivos."
            },
            {
                "type": "text",
                "value": "Para cada posição da janela, determine o **valor máximo** entre os `k` elementos visíveis. Retorne esses máximos em uma lista, na mesma ordem em que as janelas aparecem, da esquerda para a direita. Por exemplo, com `nums = [1, 3, -1, -3, 5, 3, 6, 7]` e `k = 3` o resultado é `[3, 3, 5, 5, 6, 7]`."
            },
            {
                "type": "text",
                "value": "Implemente o método `maxSlidingWindow`, que recebe a lista `nums` e o inteiro `k` e devolve a lista com o máximo de cada janela deslizante."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 ≤ nums.length ≤ 10^5`\n- `-10^4 ≤ nums[i] ≤ 10^4`\n- `1 ≤ k ≤ nums.length`"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[]} nums\n   * @param {number} k\n   * @return {number[]}\n   */\n  maxSlidingWindow(nums, k) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int[] maxSlidingWindow(int[] nums, int k) {\n        // sua solução aqui\n        return new int[0];\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[1,3,-1,-3,5,3,6,7], 3]",
                "expectedOutput": "[3,3,5,5,6,7]",
                "isPublic": true
            },
            {
                "input": "[[1], 1]",
                "expectedOutput": "[1]",
                "isPublic": true
            },
            {
                "input": "[[9,11], 2]",
                "expectedOutput": "[11]",
                "isPublic": false
            },
            {
                "input": "[[4,-2], 2]",
                "expectedOutput": "[4]",
                "isPublic": false
            },
            {
                "input": "[[7,2,4], 2]",
                "expectedOutput": "[7,4]",
                "isPublic": false
            },
            {
                "input": "[[1,3,1,2,0,5], 3]",
                "expectedOutput": "[3,3,2,5]",
                "isPublic": false
            },
            {
                "input": "[[9,10,9,-7,-4,-8,2,-6], 5]",
                "expectedOutput": "[10,10,9,2]",
                "isPublic": false
            },
            {
                "input": "[[1,-1], 1]",
                "expectedOutput": "[1,-1]",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Menor Substring com Todos os Caracteres",
        "topic": "String · Janela Deslizante · Tabela Hash",
        "entryPoint": "minWindow",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe duas strings, `s` e `t`. Uma **substring** de `s` é uma sequência de caracteres contíguos de `s`, sem pular posições. Queremos a menor substring de `s` que contenha **todos os caracteres de `t`, respeitando a multiplicidade**: se uma letra aparece `k` vezes em `t`, ela precisa aparecer pelo menos `k` vezes na substring escolhida.\n\nImplemente o método `minWindow`, que recebe `s` e `t` e retorna essa menor substring. Se nenhuma substring de `s` contiver todos os caracteres de `t`, retorne a string vazia `\"\"`."
            },
            {
                "type": "text",
                "value": "Pode haver mais de uma substring de tamanho mínimo. Nesse caso, retorne a de **menor índice inicial** (a que começa mais à esquerda em `s`).\n\nPor exemplo, para `s = \"ADOBECODEBANC\"` e `t = \"ABC\"`, a resposta é `\"BANC\"`."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `0 ≤ s.length, t.length ≤ 10^5`\n- `s` e `t` contêm apenas letras do alfabeto inglês (maiúsculas e minúsculas), diferenciando maiúsculas de minúsculas\n- Se `t` for vazia, não há caractere a cobrir e o resultado é `\"\"`"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {string} s\n   * @param {string} t\n   * @return {string}\n   */\n  minWindow(s, t) {\n    // sua solução aqui\n  }\n}\n",
            "python": "class Solution:\n    def minWindow(self, s: str, t: str) -> str:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public String minWindow(String s, String t) {\n        // sua solução aqui\n        return \"\";\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[\"ADOBECODEBANC\",\"ABC\"]",
                "expectedOutput": "\"BANC\"",
                "isPublic": true
            },
            {
                "input": "[\"a\",\"a\"]",
                "expectedOutput": "\"a\"",
                "isPublic": true
            },
            {
                "input": "[\"a\",\"aa\"]",
                "expectedOutput": "\"\"",
                "isPublic": false
            },
            {
                "input": "[\"ABAB\",\"AB\"]",
                "expectedOutput": "\"AB\"",
                "isPublic": false
            },
            {
                "input": "[\"cabwefgewcwaefgcf\",\"cae\"]",
                "expectedOutput": "\"cwae\"",
                "isPublic": false
            },
            {
                "input": "[\"aaabbb\",\"aab\"]",
                "expectedOutput": "\"aab\"",
                "isPublic": false
            },
            {
                "input": "[\"abc\",\"\"]",
                "expectedOutput": "\"\"",
                "isPublic": false
            },
            {
                "input": "[\"bba\",\"ab\"]",
                "expectedOutput": "\"ba\"",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Escada de Palavras",
        "topic": "Grafos · Busca em Largura",
        "entryPoint": "ladderLength",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Uma **escada de palavras** de `beginWord` até `endWord` é uma sequência de palavras `w1 → w2 → ... → wk` em que:\n\n- `w1` é `beginWord` e `wk` é `endWord`;\n- cada par de palavras consecutivas difere em **exatamente uma letra**, na mesma posição;\n- todas as palavras `w2, w3, ..., wk` pertencem à lista `wordList`.\n\nRepare que `beginWord` não precisa estar em `wordList`, mas `endWord` precisa. Todas as palavras têm o mesmo comprimento.\n\nImplemente o método `ladderLength`, que recebe `beginWord`, `endWord` e `wordList` e retorna o **número de palavras** da menor escada possível (contando `beginWord` e `endWord`). Se não existir nenhuma escada, retorne `0`."
            },
            {
                "type": "text",
                "value": "Por exemplo, para `beginWord = \"hit\"`, `endWord = \"cog\"` e `wordList = [\"hot\", \"dot\", \"dog\", \"lot\", \"log\", \"cog\"]`, a menor escada é `hit → hot → dot → dog → cog`, com 5 palavras, então a resposta é `5`."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 ≤ beginWord.length ≤ 10`\n- `endWord.length == beginWord.length`\n- `1 ≤ wordList.length ≤ 5000`\n- Todas as palavras contêm apenas letras minúsculas do alfabeto inglês\n- `beginWord` é diferente de `endWord` e todas as palavras de `wordList` são distintas"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {string} beginWord\n   * @param {string} endWord\n   * @param {string[]} wordList\n   * @return {number}\n   */\n  ladderLength(beginWord, endWord, wordList) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def ladderLength(self, beginWord: str, endWord: str, wordList: List[str]) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "import java.util.*;\n\npublic class Solution {\n    public int ladderLength(String beginWord, String endWord, String[] wordList) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[\"hit\",\"cog\",[\"hot\",\"dot\",\"dog\",\"lot\",\"log\",\"cog\"]]",
                "expectedOutput": "5",
                "isPublic": true
            },
            {
                "input": "[\"hit\",\"cog\",[\"hot\",\"dot\",\"dog\",\"lot\",\"log\"]]",
                "expectedOutput": "0",
                "isPublic": true
            },
            {
                "input": "[\"a\",\"c\",[\"a\",\"b\",\"c\"]]",
                "expectedOutput": "2",
                "isPublic": false
            },
            {
                "input": "[\"hot\",\"dog\",[\"hot\",\"dog\",\"dot\"]]",
                "expectedOutput": "3",
                "isPublic": false
            },
            {
                "input": "[\"hot\",\"dog\",[\"hot\",\"dog\"]]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[\"red\",\"tax\",[\"ted\",\"tex\",\"red\",\"tax\",\"tad\",\"den\",\"rex\",\"pee\"]]",
                "expectedOutput": "4",
                "isPublic": false
            },
            {
                "input": "[\"cat\",\"dog\",[\"cat\",\"bat\",\"bag\",\"cog\",\"dog\",\"dag\"]]",
                "expectedOutput": "5",
                "isPublic": false
            }
        ]
    },
    {
        "title": "N-Rainhas",
        "topic": "Backtracking",
        "entryPoint": "totalNQueens",
        "statementBlocks": [
            {
                "type": "text",
                "value": "O **problema das N rainhas** consiste em posicionar `n` rainhas de xadrez em um tabuleiro `n × n` de modo que **nenhuma delas ataque outra**. Duas rainhas se atacam quando estão na mesma linha, na mesma coluna ou na mesma diagonal (nas duas direções diagonais).\n\nImplemente o método `totalNQueens`, que recebe o inteiro `n` e retorna o **número de maneiras distintas** de posicionar as `n` rainhas sem que nenhuma ataque outra."
            },
            {
                "type": "text",
                "value": "Por exemplo, para `n = 4` existem exatamente 2 disposições válidas, então a resposta é `2`. Para `n = 1` há apenas 1 disposição (uma única casa), e para `n = 2` ou `n = 3` não existe nenhuma, logo a resposta é `0`."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 ≤ n ≤ 9`\n- Cada disposição usa exatamente `n` rainhas, uma em cada linha e uma em cada coluna\n- Duas disposições são distintas se houver ao menos uma casa ocupada em uma e livre na outra"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number} n\n   * @return {number}\n   */\n  totalNQueens(n) {\n    // sua solução aqui\n  }\n}\n",
            "python": "class Solution:\n    def totalNQueens(self, n: int) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int totalNQueens(int n) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[1]",
                "expectedOutput": "1",
                "isPublic": true
            },
            {
                "input": "[4]",
                "expectedOutput": "2",
                "isPublic": true
            },
            {
                "input": "[2]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[3]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[5]",
                "expectedOutput": "10",
                "isPublic": false
            },
            {
                "input": "[6]",
                "expectedOutput": "4",
                "isPublic": false
            },
            {
                "input": "[8]",
                "expectedOutput": "92",
                "isPublic": false
            },
            {
                "input": "[9]",
                "expectedOutput": "352",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Distribuição de Doces",
        "topic": "Array · Guloso",
        "entryPoint": "candy",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Há `n` crianças em fila, cada uma com uma nota dada pela lista `ratings`. Você vai distribuir doces às crianças seguindo duas regras:\n\n- cada criança recebe **pelo menos um** doce;\n- entre duas crianças **vizinhas** (posições adjacentes na fila), a que tiver a nota **maior** recebe **mais** doces que a de nota menor.\n\nCrianças vizinhas com a mesma nota não têm nenhuma exigência entre si: uma pode receber mais, menos ou a mesma quantidade que a outra.\n\nImplemente o método `candy`, que recebe `ratings` e retorna o **menor número total** de doces necessário para atender a essas regras."
            },
            {
                "type": "text",
                "value": "Por exemplo, para `ratings = [1, 0, 2]` uma distribuição ótima é `2, 1, 2` doces, totalizando `5`. Já para `ratings = [1, 2, 2]`, uma distribuição ótima é `1, 2, 1`, totalizando `4` (as duas últimas crianças têm a mesma nota, então podem receber quantidades diferentes)."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 ≤ ratings.length ≤ 2 * 10^4`\n- `0 ≤ ratings[i] ≤ 2 * 10^4`\n- A regra vale apenas entre posições adjacentes da fila"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[]} ratings\n   * @return {number}\n   */\n  candy(ratings) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def candy(self, ratings: List[int]) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int candy(int[] ratings) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[1,0,2]]",
                "expectedOutput": "5",
                "isPublic": true
            },
            {
                "input": "[[1,2,2]]",
                "expectedOutput": "4",
                "isPublic": true
            },
            {
                "input": "[[1]]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[[1,2,3,4,5]]",
                "expectedOutput": "15",
                "isPublic": false
            },
            {
                "input": "[[5,4,3,2,1]]",
                "expectedOutput": "15",
                "isPublic": false
            },
            {
                "input": "[[1,3,2,2,1]]",
                "expectedOutput": "7",
                "isPublic": false
            },
            {
                "input": "[[1,2,87,87,87,2,1]]",
                "expectedOutput": "13",
                "isPublic": false
            },
            {
                "input": "[[2,2,2]]",
                "expectedOutput": "3",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Melhor Momento para Comprar e Vender III",
        "topic": "Array · Programação Dinâmica",
        "entryPoint": "maxProfit",
        "statementBlocks": [
            {
                "type": "text",
                "value": "A lista `prices` guarda o preço de uma ação a cada dia: `prices[i]` é o preço no dia `i`. Você pode realizar **no máximo duas transações** para maximizar o lucro. Uma transação é comprar a ação em um dia e vendê-la em um dia **posterior**.\n\nHá uma restrição importante: você **não pode ter duas transações ao mesmo tempo**. Ou seja, é preciso vender a ação que está em mãos antes de comprar de novo.\n\nImplemente o método `maxProfit`, que recebe `prices` e retorna o **lucro máximo** que pode ser obtido. Se não for possível ter lucro, retorne `0`."
            },
            {
                "type": "text",
                "value": "Por exemplo, para `prices = [3, 3, 5, 0, 0, 3, 1, 4]` uma estratégia ótima é comprar no dia `3` (preço `0`) e vender no dia `5` (preço `3`), lucrando `3`, e depois comprar no dia `6` (preço `1`) e vender no dia `7` (preço `4`), lucrando `3`, totalizando `6`."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `0 ≤ prices.length ≤ 10^5`\n- `0 ≤ prices[i] ≤ 10^5`\n- Uma transação é sempre comprar antes e vender depois, e as duas transações não podem se sobrepor"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[]} prices\n   * @return {number}\n   */\n  maxProfit(prices) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int maxProfit(int[] prices) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[3,3,5,0,0,3,1,4]]",
                "expectedOutput": "6",
                "isPublic": true
            },
            {
                "input": "[[1,2,3,4,5]]",
                "expectedOutput": "4",
                "isPublic": true
            },
            {
                "input": "[[7,6,4,3,1]]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[[]]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[[1]]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[[1,2,4,2,5,7,2,4,9,0]]",
                "expectedOutput": "13",
                "isPublic": false
            },
            {
                "input": "[[2,1,2,0,1]]",
                "expectedOutput": "2",
                "isPublic": false
            },
            {
                "input": "[[1,2]]",
                "expectedOutput": "1",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Melhor Momento para Comprar e Vender IV",
        "topic": "Array · Programação Dinâmica",
        "entryPoint": "maxProfit",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe um inteiro `k` e um vetor `prices`, em que `prices[i]` é o preço de uma ação no dia `i`. Você pode realizar no máximo `k` transações: cada transação consiste em **comprar** a ação em um dia e **vendê-la** em um dia posterior.\n\nAs transações não podem se sobrepor: é preciso vender a ação que você tem antes de comprar de novo (você segura no máximo uma ação por vez). Some o lucro de todas as transações e devolva o **lucro máximo** que dá para obter."
            },
            {
                "type": "text",
                "value": "Por exemplo, com `k = 2` e `prices = [3, 2, 6, 5, 0, 3]`, uma escolha ótima é comprar por 2 e vender por 6 (lucro 4) e depois comprar por 0 e vender por 3 (lucro 3), totalizando 7. Se nenhuma sequência de operações der lucro, o resultado é 0. Repare na ordem dos argumentos: `k` vem antes de `prices`. Implemente o método `maxProfit`, que devolve o lucro máximo com no máximo `k` transações."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `0 ≤ k ≤ 100`\n- `0 ≤ prices.length ≤ 1000`\n- `0 ≤ prices[i] ≤ 1000`"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number} k\n   * @param {number[]} prices\n   * @return {number}\n   */\n  maxProfit(k, prices) {\n    // sua solução aqui\n  }\n}\n",
            "python": "class Solution:\n    def maxProfit(self, k, prices):\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int maxProfit(int k, int[] prices) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[2, [2,4,1]]",
                "expectedOutput": "2",
                "isPublic": true
            },
            {
                "input": "[2, [3,2,6,5,0,3]]",
                "expectedOutput": "7",
                "isPublic": true
            },
            {
                "input": "[0, [1,3]]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[2, []]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[1, [7,6,4,3,1]]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[2, [1,2,3,4,5]]",
                "expectedOutput": "4",
                "isPublic": false
            },
            {
                "input": "[2, [3,3,5,0,0,3,1,4]]",
                "expectedOutput": "6",
                "isPublic": false
            },
            {
                "input": "[3, [5,11,3,50,60,90]]",
                "expectedOutput": "93",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Maior Caminho Crescente na Matriz",
        "topic": "Matriz · Programação Dinâmica · Busca em Profundidade",
        "entryPoint": "longestIncreasingPath",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Dada uma matriz `matrix` de inteiros com `m` linhas e `n` colunas, encontre o comprimento do maior caminho **estritamente crescente**.\n\nA partir de cada célula você pode se mover em quatro direções — cima, baixo, esquerda ou direita — nunca na diagonal e sem sair dos limites da matriz. Um caminho é válido quando cada célula visitada tem valor estritamente maior que a anterior. O comprimento do caminho é a quantidade de células que ele percorre."
            },
            {
                "type": "text",
                "value": "Por exemplo, em `[[9,9,4],[6,6,8],[2,1,1]]` o maior caminho crescente é `1 → 2 → 6 → 9`, de comprimento 4. Uma única célula já conta como um caminho de comprimento 1. Implemente o método `longestIncreasingPath`, que devolve o comprimento do maior caminho estritamente crescente."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 ≤ m, n ≤ 200`\n- `0 ≤ matrix[i][j] ≤ 2^31 - 1`"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[][]} matrix\n   * @return {number}\n   */\n  longestIncreasingPath(matrix) {\n    // sua solução aqui\n  }\n}\n",
            "python": "class Solution:\n    def longestIncreasingPath(self, matrix):\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int longestIncreasingPath(int[][] matrix) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[[9,9,4],[6,6,8],[2,1,1]]]",
                "expectedOutput": "4",
                "isPublic": true
            },
            {
                "input": "[[[3,4,5],[3,2,6],[2,2,1]]]",
                "expectedOutput": "4",
                "isPublic": true
            },
            {
                "input": "[[[1]]]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[[[1,2,3,4,5]]]",
                "expectedOutput": "5",
                "isPublic": false
            },
            {
                "input": "[[[7,6,5],[8,9,4]]]",
                "expectedOutput": "6",
                "isPublic": false
            },
            {
                "input": "[[[3,2,1],[4,5,6],[7,8,9]]]",
                "expectedOutput": "7",
                "isPublic": false
            },
            {
                "input": "[[[5,5,5],[5,5,5]]]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[[[1,2],[4,3]]]",
                "expectedOutput": "4",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Cortes de Partição Palíndroma",
        "topic": "String · Programação Dinâmica",
        "entryPoint": "minCut",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Dada uma string `s`, você quer particioná-la em pedaços contíguos de modo que **cada pedaço seja um palíndromo** (uma string que se lê igual de trás para frente).\n\nUm corte é feito entre dois caracteres vizinhos e separa a string em partes. Devolva o **número mínimo de cortes** necessário para que toda parte da partição seja um palíndromo."
            },
            {
                "type": "text",
                "value": "Por exemplo, em `aab` basta 1 corte, separando em `aa` e `b`, ambos palíndromos. Uma string que já é um palíndromo inteiro precisa de 0 cortes. Implemente o método `minCut`, que devolve o número mínimo de cortes."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 ≤ s.length ≤ 2000`\n- `s` contém apenas letras minúsculas do alfabeto inglês"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {string} s\n   * @return {number}\n   */\n  minCut(s) {\n    // sua solução aqui\n  }\n}\n",
            "python": "class Solution:\n    def minCut(self, s):\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int minCut(String s) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[\"aab\"]",
                "expectedOutput": "1",
                "isPublic": true
            },
            {
                "input": "[\"a\"]",
                "expectedOutput": "0",
                "isPublic": true
            },
            {
                "input": "[\"ab\"]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[\"racecar\"]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[\"abccba\"]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[\"coder\"]",
                "expectedOutput": "4",
                "isPublic": false
            },
            {
                "input": "[\"leet\"]",
                "expectedOutput": "2",
                "isPublic": false
            },
            {
                "input": "[\"aabbc\"]",
                "expectedOutput": "2",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Subsequências Distintas",
        "topic": "String · Programação Dinâmica",
        "entryPoint": "numDistinct",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Dadas duas strings `s` e `t`, conte quantas **subsequências distintas** de `s` são iguais a `t`.\n\nUma subsequência é obtida apagando zero ou mais caracteres de `s` sem alterar a ordem dos que restam — ela preserva a ordem, mas não precisa ser contígua. Duas subsequências são consideradas distintas quando usam conjuntos diferentes de posições de `s`."
            },
            {
                "type": "text",
                "value": "Por exemplo, em `s = \"rabbbit\"` e `t = \"rabbit\"` existem 3 formas distintas de escolher as posições que formam `rabbit`. Implemente o método `numDistinct`, que devolve essa contagem. Nos testes, o resultado cabe em um inteiro de 32 bits."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `0 ≤ s.length, t.length ≤ 1000`\n- `s` e `t` contêm apenas letras do alfabeto inglês\n- O resultado cabe em um inteiro de 32 bits com sinal"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {string} s\n   * @param {string} t\n   * @return {number}\n   */\n  numDistinct(s, t) {\n    // sua solução aqui\n  }\n}\n",
            "python": "class Solution:\n    def numDistinct(self, s, t):\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int numDistinct(String s, String t) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[\"rabbbit\", \"rabbit\"]",
                "expectedOutput": "3",
                "isPublic": true
            },
            {
                "input": "[\"babgbag\", \"bag\"]",
                "expectedOutput": "5",
                "isPublic": true
            },
            {
                "input": "[\"\", \"\"]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[\"abc\", \"\"]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[\"\", \"abc\"]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[\"aaa\", \"aa\"]",
                "expectedOutput": "3",
                "isPublic": false
            },
            {
                "input": "[\"aaaaa\", \"a\"]",
                "expectedOutput": "5",
                "isPublic": false
            },
            {
                "input": "[\"abcabc\", \"abc\"]",
                "expectedOutput": "4",
                "isPublic": false
            }
        ]
    },
    {
        "title": "String Intercalada",
        "topic": "String · Programação Dinâmica",
        "entryPoint": "isInterleave",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Dadas as strings `s1`, `s2` e `s3`, determine se `s3` pode ser formada **intercalando** os caracteres de `s1` e `s2`.\n\nNa intercalação, os caracteres de `s1` e de `s2` são distribuídos ao longo de `s3` preservando a ordem relativa de cada string: as letras de `s1` aparecem em `s3` na mesma ordem em que estão em `s1`, e o mesmo vale para `s2`. Só é possível formar `s3` quando `s1.length + s2.length == s3.length`."
            },
            {
                "type": "text",
                "value": "Por exemplo, `s1 = \"aabcc\"`, `s2 = \"dbbca\"` e `s3 = \"aadbbcbcac\"` resultam em `true`, pois dá para intercalar as duas strings e obter `s3`. Implemente o método `isInterleave`, que devolve `true` se `s3` é uma intercalação de `s1` e `s2`, e `false` caso contrário."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `0 ≤ s1.length, s2.length ≤ 100`\n- `0 ≤ s3.length ≤ 200`\n- `s1`, `s2` e `s3` contêm apenas letras minúsculas do alfabeto inglês"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {string} s1\n   * @param {string} s2\n   * @param {string} s3\n   * @return {boolean}\n   */\n  isInterleave(s1, s2, s3) {\n    // sua solução aqui\n  }\n}\n",
            "python": "class Solution:\n    def isInterleave(self, s1, s2, s3):\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public boolean isInterleave(String s1, String s2, String s3) {\n        // sua solução aqui\n        return false;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[\"aabcc\", \"dbbca\", \"aadbbcbcac\"]",
                "expectedOutput": "true",
                "isPublic": true
            },
            {
                "input": "[\"aabcc\", \"dbbca\", \"aadbbbaccc\"]",
                "expectedOutput": "false",
                "isPublic": true
            },
            {
                "input": "[\"\", \"\", \"\"]",
                "expectedOutput": "true",
                "isPublic": false
            },
            {
                "input": "[\"a\", \"\", \"a\"]",
                "expectedOutput": "true",
                "isPublic": false
            },
            {
                "input": "[\"abc\", \"def\", \"adbecf\"]",
                "expectedOutput": "true",
                "isPublic": false
            },
            {
                "input": "[\"ab\", \"cd\", \"abdc\"]",
                "expectedOutput": "false",
                "isPublic": false
            },
            {
                "input": "[\"aaa\", \"aaa\", \"aaaaaa\"]",
                "expectedOutput": "true",
                "isPublic": false
            },
            {
                "input": "[\"a\", \"b\", \"abc\"]",
                "expectedOutput": "false",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Estourar Balões",
        "topic": "Programação Dinâmica · Intervalos",
        "entryPoint": "maxCoins",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você tem `n` balões dispostos em fila, numerados de `0` a `n - 1`, e cada balão `i` carrega um número de moedas dado por `nums[i]`. Você vai estourar **todos** os balões, um de cada vez. Ao estourar o balão `i`, você ganha `nums[i - 1] * nums[i] * nums[i + 1]` moedas, em que `nums[i - 1]` e `nums[i + 1]` são os valores dos balões **vizinhos imediatos** que ainda não estouraram. Se um vizinho não existir (o balão está na borda da fila) ou já tiver estourado, o valor usado no lugar dele é `1`.\n\nDepois que um balão estoura, os balões que sobraram passam a ser adjacentes, e as próximas contagens usam essa nova vizinhança. Você deve escolher a ordem de estouro que **maximiza** o total de moedas somadas ao longo de todos os estouros.\n\nPor exemplo, para `nums = [3, 1, 5, 8]` a melhor ordem rende `167` moedas: estourando na ordem dos valores `1`, `5`, `3` e por fim `8`, as parcelas são `3*1*5 + 3*5*8 + 1*3*8 + 1*8*1 = 15 + 120 + 24 + 8 = 167`.\n\nImplemente o método `maxCoins`, que recebe `nums` e retorna o número máximo de moedas que dá para obter estourando todos os balões."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `0 ≤ nums.length ≤ 500`\n- `0 ≤ nums[i] ≤ 100`\n- Um vizinho inexistente ou já estourado vale `1` na conta\n- Se a lista estiver vazia, o total é `0`"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[]} nums\n   * @return {number}\n   */\n  maxCoins(nums) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def maxCoins(self, nums: List[int]) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int maxCoins(int[] nums) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[3,1,5,8]]",
                "expectedOutput": "167",
                "isPublic": true
            },
            {
                "input": "[[1,5]]",
                "expectedOutput": "10",
                "isPublic": true
            },
            {
                "input": "[[1]]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[[]]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[[7,9,8,0,7,1,3,5,5,2,3]]",
                "expectedOutput": "1654",
                "isPublic": false
            },
            {
                "input": "[[9,76,64,21,97,60]]",
                "expectedOutput": "1086136",
                "isPublic": false
            },
            {
                "input": "[[2,4,6,8,10]]",
                "expectedOutput": "830",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Envelopes Russos",
        "topic": "Programação Dinâmica · Busca Binária · Ordenação",
        "entryPoint": "maxEnvelopes",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe uma lista de envelopes, em que cada envelope é um par `[largura, altura]`. Um envelope cabe **dentro** de outro apenas quando **as duas** dimensões do primeiro são estritamente menores que as do segundo — ou seja, tanto a largura quanto a altura precisam ser menores; se qualquer uma delas for igual ou maior, ele não entra. Não é permitido girar os envelopes.\n\nVocê pode encaixar um envelope dentro de outro formando uma sequência aninhada, como bonecas russas: o menor dentro do próximo, esse dentro do seguinte, e assim por diante. Determine o maior número de envelopes que podem ser aninhados dessa forma.\n\nPor exemplo, para `envelopes = [[5, 4], [6, 4], [6, 7], [2, 3]]` a resposta é `3`, pois `[2, 3]` cabe em `[5, 4]`, que cabe em `[6, 7]`.\n\nImplemente o método `maxEnvelopes`, que recebe `envelopes` e retorna a maior quantidade de envelopes que dá para aninhar, um dentro do outro."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 ≤ envelopes.length ≤ 10^5`\n- `envelopes[i].length == 2`\n- `1 ≤ largura, altura ≤ 10^5`\n- O aninhamento exige as duas dimensões estritamente maiores\n- Não é permitido rotacionar os envelopes"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[][]} envelopes\n   * @return {number}\n   */\n  maxEnvelopes(envelopes) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def maxEnvelopes(self, envelopes: List[List[int]]) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int maxEnvelopes(int[][] envelopes) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[[5,4],[6,4],[6,7],[2,3]]]",
                "expectedOutput": "3",
                "isPublic": true
            },
            {
                "input": "[[[1,1],[1,1],[1,1]]]",
                "expectedOutput": "1",
                "isPublic": true
            },
            {
                "input": "[[[4,5],[4,6],[6,7],[2,3],[1,1]]]",
                "expectedOutput": "4",
                "isPublic": false
            },
            {
                "input": "[[[2,100],[3,200],[4,300],[5,500],[5,400],[5,250],[6,370],[6,360],[7,380]]]",
                "expectedOutput": "5",
                "isPublic": false
            },
            {
                "input": "[[[1,1]]]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[[[30,50],[12,2],[3,4],[12,15]]]",
                "expectedOutput": "3",
                "isPublic": false
            },
            {
                "input": "[[[10,8],[1,12],[6,15],[2,18]]]",
                "expectedOutput": "2",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Salto do Sapo",
        "topic": "Programação Dinâmica · Tabela Hash",
        "entryPoint": "canCross",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Um sapo quer atravessar um rio pulando sobre pedras. As posições das pedras, em unidades a partir da margem, são dadas em ordem **estritamente crescente** na lista `stones`. O sapo começa sobre a primeira pedra (`stones[0]`) e o **primeiro salto deve ter exatamente 1 unidade**.\n\nA partir daí vale a regra: se o último salto teve comprimento `k`, o próximo salto pode ter comprimento `k - 1`, `k` ou `k + 1`, sempre para a **frente** e sempre com comprimento **maior que zero**. O sapo só pode pousar em posições que tenham pedra — cair na água significa fracasso.\n\nPor exemplo, para `stones = [0, 1, 3, 5, 6, 8, 12, 17]` o sapo consegue chegar à última pedra, então a resposta é `true`; já para `stones = [0, 1, 2, 3, 4, 8, 9, 11]` não existe sequência de saltos válida até o fim, então a resposta é `false`.\n\nImplemente o método `canCross`, que recebe `stones` e retorna `true` se o sapo consegue alcançar a última pedra pousando apenas em pedras, e `false` caso contrário."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `2 ≤ stones.length ≤ 2000`\n- `0 ≤ stones[i] ≤ 2^31 - 1`\n- `stones[0] == 0` e a lista está em ordem estritamente crescente\n- O primeiro salto é sempre de 1 unidade\n- Depois de um salto de comprimento `k`, o próximo é `k - 1`, `k` ou `k + 1`, sempre para frente e maior que zero"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[]} stones\n   * @return {boolean}\n   */\n  canCross(stones) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def canCross(self, stones: List[int]) -> bool:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public boolean canCross(int[] stones) {\n        // sua solução aqui\n        return false;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[0,1,3,5,6,8,12,17]]",
                "expectedOutput": "true",
                "isPublic": true
            },
            {
                "input": "[[0,1,2,3,4,8,9,11]]",
                "expectedOutput": "false",
                "isPublic": true
            },
            {
                "input": "[[0,1]]",
                "expectedOutput": "true",
                "isPublic": false
            },
            {
                "input": "[[0,2]]",
                "expectedOutput": "false",
                "isPublic": false
            },
            {
                "input": "[[0,1,3,6,10,13,14]]",
                "expectedOutput": "true",
                "isPublic": false
            },
            {
                "input": "[[0,1,3,4,5,7,9,10,12]]",
                "expectedOutput": "true",
                "isPublic": false
            },
            {
                "input": "[[0,1,3,6,7,9,10,12,14,15,17,18,20]]",
                "expectedOutput": "true",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Dividir Vetor pela Maior Soma",
        "topic": "Busca Binária · Programação Dinâmica",
        "entryPoint": "splitArray",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe uma lista de inteiros não negativos `nums` e um inteiro `k`. Sua tarefa é dividir `nums` em exatamente `k` subvetores **contíguos e não vazios** — ou seja, `k` pedaços consecutivos que, juntos e na ordem original, formam a lista inteira, sem sobreposição e sem deixar nenhum elemento de fora.\n\nPara cada divisão, considere a **soma** de cada subvetor e olhe para a **maior** dessas somas. Entre todas as maneiras possíveis de dividir, você quer aquela em que essa maior soma seja a **menor** possível.\n\nPor exemplo, para `nums = [7, 2, 5, 10, 8]` e `k = 2`, a melhor divisão é `[7, 2, 5]` e `[10, 8]`, com somas `14` e `18`; a maior é `18`, e nenhuma outra divisão em dois pedaços consegue uma maior soma menor que essa, então a resposta é `18`.\n\nImplemente o método `splitArray`, que recebe `nums` e `k` e retorna o menor valor possível para a maior soma entre os `k` subvetores."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 ≤ nums.length ≤ 1000`\n- `0 ≤ nums[i] ≤ 10^6`\n- `1 ≤ k ≤ nums.length`\n- Os `k` subvetores são contíguos, não vazios e cobrem toda a lista"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[]} nums\n   * @param {number} k\n   * @return {number}\n   */\n  splitArray(nums, k) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def splitArray(self, nums: List[int], k: int) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int splitArray(int[] nums, int k) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[7,2,5,10,8],2]",
                "expectedOutput": "18",
                "isPublic": true
            },
            {
                "input": "[[1,2,3,4,5],2]",
                "expectedOutput": "9",
                "isPublic": true
            },
            {
                "input": "[[1,4,4],3]",
                "expectedOutput": "4",
                "isPublic": false
            },
            {
                "input": "[[1,2,3,4,5],1]",
                "expectedOutput": "15",
                "isPublic": false
            },
            {
                "input": "[[1,2,3,4,5],5]",
                "expectedOutput": "5",
                "isPublic": false
            },
            {
                "input": "[[10,5,13,4,8,4,5,11,14,9,16,10,20,8],8]",
                "expectedOutput": "25",
                "isPublic": false
            },
            {
                "input": "[[2,3,1,2,4,3],5]",
                "expectedOutput": "4",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Água da Chuva II",
        "topic": "Matriz · Heap · Busca em Largura",
        "entryPoint": "trapRainWater",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe uma matriz `heightMap` de dimensões `m x n`, em que cada célula guarda a **altura** daquele ponto de um terreno. Imagine que chove sobre esse terreno até saturar: a água se acumula nas depressões, mas escorre e cai para fora sempre que encontra uma saída pelas **bordas** da matriz.\n\nUma célula interna retém água até o nível da menor parede que a cerca, considerando todos os caminhos de escoamento pelas células vizinhas (para cima, para baixo, para a esquerda e para a direita). O volume retido em cada célula é a diferença entre esse nível de água e a altura da própria célula, quando positiva. Some o volume retido em todas as células para obter o total.\n\nPor exemplo, para `heightMap = [[1, 4, 3, 1, 3, 2], [3, 2, 1, 3, 2, 4], [2, 3, 3, 2, 3, 1]]` o volume total de água retido é `4`.\n\nImplemente o método `trapRainWater`, que recebe `heightMap` e retorna o volume total de água da chuva que fica retido na superfície depois de chover."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `m == heightMap.length` e `n == heightMap[i].length`\n- `1 ≤ m, n ≤ 200`\n- `0 ≤ heightMap[i][j] ≤ 2 * 10^4`\n- A água escoa livremente pelas bordas da matriz\n- Grades com menos de 3 linhas ou 3 colunas não retêm água"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[][]} heightMap\n   * @return {number}\n   */\n  trapRainWater(heightMap) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def trapRainWater(self, heightMap: List[List[int]]) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int trapRainWater(int[][] heightMap) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[[1,4,3,1,3,2],[3,2,1,3,2,4],[2,3,3,2,3,1]]]",
                "expectedOutput": "4",
                "isPublic": true
            },
            {
                "input": "[[[3,3,3,3,3],[3,2,2,2,3],[3,2,1,2,3],[3,2,2,2,3],[3,3,3,3,3]]]",
                "expectedOutput": "10",
                "isPublic": true
            },
            {
                "input": "[[[12,13,1,12],[13,4,13,12],[13,8,10,12],[12,13,12,12],[13,13,13,13]]]",
                "expectedOutput": "14",
                "isPublic": false
            },
            {
                "input": "[[[1,1,1],[1,1,1],[1,1,1]]]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[[[5,5,5,5],[5,1,1,5],[5,1,1,5],[5,5,5,5]]]",
                "expectedOutput": "16",
                "isPublic": false
            },
            {
                "input": "[[[9,9,9,9,9],[9,0,1,0,9],[9,1,0,1,9],[9,0,1,0,9],[9,9,9,9,9]]]",
                "expectedOutput": "77",
                "isPublic": false
            },
            {
                "input": "[[[14,17,18,16,14,16],[17,3,10,2,3,8],[14,15,2,10,15,18],[16,2,10,2,10,10],[14,3,15,10,15,18],[16,8,18,10,18,20]]]",
                "expectedOutput": "45",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Jogo da Masmorra",
        "topic": "Matriz · Programação Dinâmica",
        "entryPoint": "calculateMinimumHP",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Um cavaleiro precisa resgatar a princesa, presa no canto **inferior-direito** de uma masmorra representada pela matriz `dungeon` de tamanho `m x n`. O cavaleiro começa no canto **superior-esquerdo** e, a cada passo, só pode se mover para a **direita** ou para **baixo**, avançando célula a célula até chegar à princesa.\n\nCada célula guarda um inteiro: um valor negativo representa demônios que **retiram** aquela quantidade de pontos de vida; um valor positivo representa esferas mágicas que **restauram** vida; e `0` não altera nada. A vida do cavaleiro é ajustada assim que ele **entra** em cada célula, incluindo a inicial e a final. Se a vida chegar a `0` ou menos em **qualquer** momento, ele morre.\n\nImplemente o método `calculateMinimumHP`, que recebe `dungeon` e retorna o **menor** número inteiro de pontos de vida iniciais (no mínimo `1`) que permite ao cavaleiro alcançar a princesa vivo."
            },
            {
                "type": "text",
                "value": "Por exemplo, para `dungeon = [[-2, -3, 3], [-5, -10, 1], [10, 30, -5]]` a resposta é `7`: com `7` de vida inicial o cavaleiro sobrevive ao caminho direita → direita → baixo → baixo, e nenhum valor inicial menor garante a travessia."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `m == dungeon.length`\n- `n == dungeon[i].length`\n- `1 ≤ m, n ≤ 200`\n- `-1000 ≤ dungeon[i][j] ≤ 1000`\n- A resposta é sempre um inteiro maior ou igual a `1`"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[][]} dungeon\n   * @return {number}\n   */\n  calculateMinimumHP(dungeon) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def calculateMinimumHP(self, dungeon: List[List[int]]) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int calculateMinimumHP(int[][] dungeon) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[[-2,-3,3],[-5,-10,1],[10,30,-5]]]",
                "expectedOutput": "7",
                "isPublic": true
            },
            {
                "input": "[[[0]]]",
                "expectedOutput": "1",
                "isPublic": true
            },
            {
                "input": "[[[100]]]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[[[-3]]]",
                "expectedOutput": "4",
                "isPublic": false
            },
            {
                "input": "[[[2,3],[1,-20]]]",
                "expectedOutput": "16",
                "isPublic": false
            },
            {
                "input": "[[[1,-3,3],[0,-2,0],[-3,-3,-3]]]",
                "expectedOutput": "3",
                "isPublic": false
            },
            {
                "input": "[[[-1,-2,-3],[-4,-5,-6],[-7,-8,-9]]]",
                "expectedOutput": "22",
                "isPublic": false
            },
            {
                "input": "[[[3,-20,30],[-3,4,0]]]",
                "expectedOutput": "1",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Contar Menores Depois de Si",
        "topic": "Árvore Indexada · Ordenação · Divisão e Conquista",
        "entryPoint": "countSmaller",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe um vetor de inteiros `nums`. Para cada posição `i`, queremos saber quantos elementos que aparecem **à direita** de `i` (ou seja, em posições `j > i`) são **estritamente menores** que `nums[i]`.\n\nImplemente o método `countSmaller`, que recebe `nums` e retorna um vetor `counts` de mesmo tamanho, em que `counts[i]` é a quantidade de elementos à direita de `i` menores que `nums[i]`."
            },
            {
                "type": "text",
                "value": "Por exemplo, para `nums = [5, 2, 6, 1]` o resultado é `[2, 1, 1, 0]`: à direita do `5` há dois menores (`2` e `1`); à direita do `2` há um menor (`1`); à direita do `6` há um menor (`1`); e à direita do último elemento não há ninguém."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 ≤ nums.length ≤ 10^5`\n- `-10^4 ≤ nums[i] ≤ 10^4`\n- `counts` tem o mesmo tamanho de `nums` e preserva a ordem das posições"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[]} nums\n   * @return {number[]}\n   */\n  countSmaller(nums) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def countSmaller(self, nums: List[int]) -> List[int]:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int[] countSmaller(int[] nums) {\n        // sua solução aqui\n        return new int[0];\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[5,2,6,1]]",
                "expectedOutput": "[2,1,1,0]",
                "isPublic": true
            },
            {
                "input": "[[-1]]",
                "expectedOutput": "[0]",
                "isPublic": true
            },
            {
                "input": "[[-1,-1]]",
                "expectedOutput": "[0,0]",
                "isPublic": false
            },
            {
                "input": "[[2,0,1]]",
                "expectedOutput": "[2,0,0]",
                "isPublic": false
            },
            {
                "input": "[[5,5,5,5]]",
                "expectedOutput": "[0,0,0,0]",
                "isPublic": false
            },
            {
                "input": "[[5,4,3,2,1]]",
                "expectedOutput": "[4,3,2,1,0]",
                "isPublic": false
            },
            {
                "input": "[[1,2,3,4,5]]",
                "expectedOutput": "[0,0,0,0,0]",
                "isPublic": false
            },
            {
                "input": "[[10,-3,4,-3,7,-3,8,1]]",
                "expectedOutput": "[7,0,3,0,2,0,1,0]",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Pares Invertidos",
        "topic": "Ordenação · Divisão e Conquista",
        "entryPoint": "reversePairs",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe um vetor de inteiros `nums`. Um **par invertido** é um par de posições `(i, j)` tal que `i < j` e `nums[i] > 2 * nums[j]`.\n\nImplemente o método `reversePairs`, que recebe `nums` e retorna o **número total** de pares invertidos existentes no vetor."
            },
            {
                "type": "text",
                "value": "Por exemplo, para `nums = [1, 3, 2, 3, 1]` a resposta é `2`, referente aos pares `(1, 4)` e `(3, 4)` — em ambos vale `3 > 2 * 1`. Já para `nums = [2, 4, 3, 5, 1]` a resposta é `3`."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 ≤ nums.length ≤ 5 * 10^4`\n- `-2^31 ≤ nums[i] ≤ 2^31 - 1`\n- Atenção ao calcular `2 * nums[j]`: o produto pode estourar um inteiro de 32 bits\n- O resultado cabe em um inteiro de 32 bits"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[]} nums\n   * @return {number}\n   */\n  reversePairs(nums) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def reversePairs(self, nums: List[int]) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int reversePairs(int[] nums) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[1,3,2,3,1]]",
                "expectedOutput": "2",
                "isPublic": true
            },
            {
                "input": "[[2,4,3,5,1]]",
                "expectedOutput": "3",
                "isPublic": true
            },
            {
                "input": "[[1,2,3,4,5]]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[[5,4,3,2,1]]",
                "expectedOutput": "4",
                "isPublic": false
            },
            {
                "input": "[[-5,-4,-3,-2,-1]]",
                "expectedOutput": "4",
                "isPublic": false
            },
            {
                "input": "[[0,0,0]]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[[1000000000,-1000000000,1000000000,-1000000000]]",
                "expectedOutput": "4",
                "isPublic": false
            },
            {
                "input": "[[-2,-1,0,1,2]]",
                "expectedOutput": "0",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Maior Lacuna",
        "topic": "Ordenação · Bucket",
        "entryPoint": "maximumGap",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe um vetor de inteiros `nums`. Imagine `nums` **ordenado** em ordem crescente; queremos a **maior diferença** entre dois elementos que ficam em posições consecutivas nessa ordenação.\n\nImplemente o método `maximumGap`, que recebe `nums` e retorna essa maior diferença. Se o vetor tiver **menos de dois** elementos, retorne `0`."
            },
            {
                "type": "text",
                "value": "Por exemplo, para `nums = [3, 6, 9, 1]` a versão ordenada é `[1, 3, 6, 9]`, cujas diferenças consecutivas são `2`, `3` e `3`; a maior é `3`. Já para `nums = [10]` a resposta é `0`, pois não há dois elementos para comparar."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `0 ≤ nums.length ≤ 10^5`\n- `0 ≤ nums[i] ≤ 10^9`\n- A resposta é sempre um inteiro não negativo"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[]} nums\n   * @return {number}\n   */\n  maximumGap(nums) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def maximumGap(self, nums: List[int]) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int maximumGap(int[] nums) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[3,6,9,1]]",
                "expectedOutput": "3",
                "isPublic": true
            },
            {
                "input": "[[10]]",
                "expectedOutput": "0",
                "isPublic": true
            },
            {
                "input": "[[]]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[[1,1,1,1]]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[[1,10000000]]",
                "expectedOutput": "9999999",
                "isPublic": false
            },
            {
                "input": "[[5,3,1,9,7]]",
                "expectedOutput": "2",
                "isPublic": false
            },
            {
                "input": "[[100,3,2,1]]",
                "expectedOutput": "97",
                "isPublic": false
            },
            {
                "input": "[[1,3,100,2,7]]",
                "expectedOutput": "93",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Calculadora Básica",
        "topic": "Pilha · String · Recursão",
        "entryPoint": "calculate",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Implemente uma calculadora básica para avaliar a expressão aritmética contida em uma string `s`. A expressão é composta por inteiros **não negativos**, pelos operadores de adição `+` e subtração `-` (sempre binários), por parênteses `(` e `)` para agrupar subexpressões e por espaços em branco, que devem ser ignorados. **Não** há multiplicação nem divisão.\n\nImplemente o método `calculate`, que recebe `s` e retorna o valor inteiro resultante da avaliação da expressão."
            },
            {
                "type": "text",
                "value": "Por exemplo, `\"(1+(4+5+2)-3)+(6+8)\"` resulta em `23`, e `\" 2-1 + 2 \"` resulta em `3`. Os parênteses podem estar aninhados em qualquer profundidade."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 ≤ s.length ≤ 3 * 10^5`\n- `s` contém apenas dígitos, `+`, `-`, `(`, `)` e espaços\n- `s` representa uma expressão válida\n- Todos os valores intermediários e o resultado cabem em um inteiro de 32 bits"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {string} s\n   * @return {number}\n   */\n  calculate(s) {\n    // sua solução aqui\n  }\n}\n",
            "python": "class Solution:\n    def calculate(self, s: str) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int calculate(String s) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[\"(1+(4+5+2)-3)+(6+8)\"]",
                "expectedOutput": "23",
                "isPublic": true
            },
            {
                "input": "[\" 2-1 + 2 \"]",
                "expectedOutput": "3",
                "isPublic": true
            },
            {
                "input": "[\"1 + 1\"]",
                "expectedOutput": "2",
                "isPublic": false
            },
            {
                "input": "[\"2-1\"]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[\"(1)\"]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[\"10-(4+5-2)\"]",
                "expectedOutput": "3",
                "isPublic": false
            },
            {
                "input": "[\"100\"]",
                "expectedOutput": "100",
                "isPublic": false
            },
            {
                "input": "[\"((9-8)+(7-6))-((5-4)+(3-2))\"]",
                "expectedOutput": "0",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Justificação de Texto",
        "topic": "String · Simulação",
        "entryPoint": "fullJustify",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Dado um vetor de palavras `words` e uma largura `maxWidth`, formate o texto de modo que cada linha tenha **exatamente** `maxWidth` caracteres e fique **justificada** nos dois lados (esquerda e direita).\n\nDistribua as palavras de forma **gulosa**: coloque em cada linha o máximo de palavras que couber, separando-as por pelo menos um espaço. Os espaços extras de cada linha devem ser distribuídos o mais uniformemente possível; quando não for possível dividir igualmente, as lacunas **mais à esquerda** recebem um espaço a mais do que as da direita.\n\nUma linha que contém uma **única** palavra é alinhada à esquerda (os espaços restantes vão no fim). A **última** linha também é alinhada à esquerda: as palavras são separadas por um único espaço e o restante da largura é preenchido com espaços no fim.\n\nImplemente o método `fullJustify`, que recebe `words` e `maxWidth` e devolve a lista de linhas formatadas."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 ≤ words.length ≤ 300`\n- `1 ≤ words[i].length ≤ maxWidth ≤ 100`\n- `words[i]` contém apenas caracteres ASCII imprimíveis, sem espaços\n- Cada palavra cabe sozinha em uma linha (`words[i].length ≤ maxWidth`)"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {string[]} words\n   * @param {number} maxWidth\n   * @return {string[]}\n   */\n  fullJustify(words, maxWidth) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def fullJustify(self, words: List[str], maxWidth: int) -> List[str]:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public String[] fullJustify(String[] words, int maxWidth) {\n        // sua solução aqui\n        return new String[0];\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[\"This\",\"is\",\"an\",\"example\",\"of\",\"text\",\"justification.\"],16]",
                "expectedOutput": "[\"This    is    an\",\"example  of text\",\"justification.  \"]",
                "isPublic": true
            },
            {
                "input": "[[\"What\",\"must\",\"be\",\"acknowledgment\",\"shall\",\"be\"],16]",
                "expectedOutput": "[\"What   must   be\",\"acknowledgment  \",\"shall be        \"]",
                "isPublic": true
            },
            {
                "input": "[[\"Science\",\"is\",\"what\",\"we\",\"understand\",\"well\",\"enough\",\"to\",\"explain\",\"to\",\"a\",\"computer.\",\"Art\",\"is\",\"everything\",\"else\",\"we\",\"do\"],20]",
                "expectedOutput": "[\"Science  is  what we\",\"understand      well\",\"enough to explain to\",\"a  computer.  Art is\",\"everything  else  we\",\"do                  \"]",
                "isPublic": false
            },
            {
                "input": "[[\"hello\"],10]",
                "expectedOutput": "[\"hello     \"]",
                "isPublic": false
            },
            {
                "input": "[[\"aaa\",\"bbb\",\"ccc\"],3]",
                "expectedOutput": "[\"aaa\",\"bbb\",\"ccc\"]",
                "isPublic": false
            },
            {
                "input": "[[\"The\",\"quick\",\"brown\",\"fox\"],11]",
                "expectedOutput": "[\"The   quick\",\"brown fox  \"]",
                "isPublic": false
            },
            {
                "input": "[[\"Listen\",\"to\",\"many,\",\"speak\",\"to\",\"a\",\"few.\"],6]",
                "expectedOutput": "[\"Listen\",\"to    \",\"many, \",\"speak \",\"to   a\",\"few.  \"]",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Inteiro para Palavras em Inglês",
        "topic": "Matemática · String · Recursão",
        "entryPoint": "numberToWords",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Converta um inteiro não-negativo `num` para a sua representação por extenso em **inglês**.\n\nAs palavras devem ser separadas por um único espaço, **sem** vírgulas e **sem** hífens. Por exemplo, `123` vira `\"One Hundred Twenty Three\"`, `12345` vira `\"Twelve Thousand Three Hundred Forty Five\"` e `0` vira `\"Zero\"`. Use as escalas `Thousand`, `Million` e `Billion` conforme necessário.\n\nImplemente o método `numberToWords`, que recebe `num` e devolve a string por extenso, sem espaços no início ou no fim."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `0 ≤ num ≤ 2^31 - 1`\n- Cada palavra da saída começa com letra maiúscula (ex.: `One`, `Twenty`, `Hundred`, `Thousand`, `Million`, `Billion`)\n- Não use vírgulas nem hífens; separe as palavras por um único espaço"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number} num\n   * @return {string}\n   */\n  numberToWords(num) {\n    // sua solução aqui\n  }\n}\n",
            "python": "class Solution:\n    def numberToWords(self, num: int) -> str:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public String numberToWords(int num) {\n        // sua solução aqui\n        return \"\";\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[123]",
                "expectedOutput": "\"One Hundred Twenty Three\"",
                "isPublic": true
            },
            {
                "input": "[12345]",
                "expectedOutput": "\"Twelve Thousand Three Hundred Forty Five\"",
                "isPublic": true
            },
            {
                "input": "[0]",
                "expectedOutput": "\"Zero\"",
                "isPublic": false
            },
            {
                "input": "[100]",
                "expectedOutput": "\"One Hundred\"",
                "isPublic": false
            },
            {
                "input": "[1000000]",
                "expectedOutput": "\"One Million\"",
                "isPublic": false
            },
            {
                "input": "[1234567]",
                "expectedOutput": "\"One Million Two Hundred Thirty Four Thousand Five Hundred Sixty Seven\"",
                "isPublic": false
            },
            {
                "input": "[1000010]",
                "expectedOutput": "\"One Million Ten\"",
                "isPublic": false
            },
            {
                "input": "[2147483647]",
                "expectedOutput": "\"Two Billion One Hundred Forty Seven Million Four Hundred Eighty Three Thousand Six Hundred Forty Seven\"",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Substring com Concatenação de Todas as Palavras",
        "topic": "Tabela Hash · Janela Deslizante · String",
        "entryPoint": "findSubstring",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe uma string `s` e um vetor `words` em que **todas** as palavras têm o **mesmo** comprimento.\n\nUma substring **concatenada** é uma substring de `s` formada pela junção de **todas** as palavras de `words`, cada uma usada **exatamente uma vez**, em **qualquer** ordem e **sem** nenhum caractere entre elas. Por exemplo, com `words = [\"ab\",\"cd\",\"ef\"]`, as strings `\"abcdef\"`, `\"abefcd\"` e `\"cdabef\"` são concatenações válidas, mas `\"acdbef\"` não é. O vetor `words` pode conter palavras repetidas.\n\nImplemente o método `findSubstring`, que devolve os **índices iniciais** de todas as substrings concatenadas de `s`, em **ordem crescente**."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 ≤ s.length ≤ 10^4`\n- `1 ≤ words.length ≤ 5000`\n- `1 ≤ words[i].length ≤ 30`\n- Todas as palavras de `words` têm o mesmo comprimento\n- `s` e `words[i]` contêm apenas letras minúsculas do inglês\n- Se nenhuma substring existir, devolva uma lista vazia"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {string} s\n   * @param {string[]} words\n   * @return {number[]}\n   */\n  findSubstring(s, words) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def findSubstring(self, s: str, words: List[str]) -> List[int]:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int[] findSubstring(String s, String[] words) {\n        // sua solução aqui\n        return new int[0];\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[\"barfoothefoobarman\",[\"foo\",\"bar\"]]",
                "expectedOutput": "[0,9]",
                "isPublic": true
            },
            {
                "input": "[\"wordgoodgoodgoodbestword\",[\"word\",\"good\",\"best\",\"word\"]]",
                "expectedOutput": "[]",
                "isPublic": true
            },
            {
                "input": "[\"barfoofoobarthefoobarman\",[\"bar\",\"foo\",\"the\"]]",
                "expectedOutput": "[6,9,12]",
                "isPublic": false
            },
            {
                "input": "[\"aaaa\",[\"a\",\"a\"]]",
                "expectedOutput": "[0,1,2]",
                "isPublic": false
            },
            {
                "input": "[\"abc\",[\"def\"]]",
                "expectedOutput": "[]",
                "isPublic": false
            },
            {
                "input": "[\"aaaaaa\",[\"aa\",\"aa\",\"aa\"]]",
                "expectedOutput": "[0]",
                "isPublic": false
            },
            {
                "input": "[\"lingmindraboofooowingdingbarrwingmonkeypoundcake\",[\"fooo\",\"barr\",\"wing\",\"ding\",\"wing\"]]",
                "expectedOutput": "[13]",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Menor Palíndromo por Prefixo",
        "topic": "String · KMP",
        "entryPoint": "shortestPalindrome",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe uma string `s`. Adicionando caracteres **somente no início** de `s`, é possível transformá-la em um palíndromo (uma string que se lê igual da esquerda para a direita e da direita para a esquerda).\n\nDentre todos os palíndromos que podem ser formados dessa maneira, devolva o **menor** deles (o de menor comprimento). Por exemplo, para `\"abcd\"` a resposta é `\"dcbabcd\"`, e para `\"aacecaaa\"` a resposta é `\"aaacecaaa\"`.\n\nImplemente o método `shortestPalindrome`, que recebe `s` e devolve esse menor palíndromo."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `0 ≤ s.length ≤ 5 * 10^4`\n- `s` contém apenas letras minúsculas do inglês\n- Se `s` for vazia, a resposta é a string vazia"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {string} s\n   * @return {string}\n   */\n  shortestPalindrome(s) {\n    // sua solução aqui\n  }\n}\n",
            "python": "class Solution:\n    def shortestPalindrome(self, s: str) -> str:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public String shortestPalindrome(String s) {\n        // sua solução aqui\n        return \"\";\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[\"aacecaaa\"]",
                "expectedOutput": "\"aaacecaaa\"",
                "isPublic": true
            },
            {
                "input": "[\"abcd\"]",
                "expectedOutput": "\"dcbabcd\"",
                "isPublic": true
            },
            {
                "input": "[\"\"]",
                "expectedOutput": "\"\"",
                "isPublic": false
            },
            {
                "input": "[\"a\"]",
                "expectedOutput": "\"a\"",
                "isPublic": false
            },
            {
                "input": "[\"aba\"]",
                "expectedOutput": "\"aba\"",
                "isPublic": false
            },
            {
                "input": "[\"abbacd\"]",
                "expectedOutput": "\"dcabbacd\"",
                "isPublic": false
            },
            {
                "input": "[\"aabba\"]",
                "expectedOutput": "\"abbaabba\"",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Torneiras para Regar o Jardim",
        "topic": "Guloso · Programação Dinâmica",
        "entryPoint": "minTaps",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Há um jardim unidimensional que vai da posição `0` até a posição `n`. Em **cada** ponto inteiro `i` (de `0` a `n`) existe uma torneira.\n\nA torneira no ponto `i` tem alcance dado por `ranges[i]`: quando aberta, ela rega toda a faixa `[i - ranges[i], i + ranges[i]]`. Se `ranges[i]` for `0`, a torneira `i` não rega nada.\n\nImplemente o método `minTaps`, que recebe `n` e `ranges` e devolve o **menor número** de torneiras que precisam ser abertas para que todo o intervalo `[0, n]` fique regado, ou `-1` se for impossível regar o jardim inteiro."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 ≤ n ≤ 10^4`\n- `ranges.length == n + 1`\n- `0 ≤ ranges[i] ≤ 100`"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number} n\n   * @param {number[]} ranges\n   * @return {number}\n   */\n  minTaps(n, ranges) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def minTaps(self, n: int, ranges: List[int]) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int minTaps(int n, int[] ranges) {\n        // sua solução aqui\n        return -1;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[5,[3,4,1,1,0,0]]",
                "expectedOutput": "1",
                "isPublic": true
            },
            {
                "input": "[3,[0,0,0,0]]",
                "expectedOutput": "-1",
                "isPublic": true
            },
            {
                "input": "[7,[1,2,1,0,2,1,0,1]]",
                "expectedOutput": "3",
                "isPublic": false
            },
            {
                "input": "[8,[0,0,2,0,0,0,2,0,0]]",
                "expectedOutput": "2",
                "isPublic": false
            },
            {
                "input": "[8,[2,0,0,0,0,0,0,0,2]]",
                "expectedOutput": "-1",
                "isPublic": false
            },
            {
                "input": "[1,[1,0]]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[2,[1,0,1]]",
                "expectedOutput": "2",
                "isPublic": false
            }
        ]
    },
    {
        "title": "K-ésimo Menor na Matriz Ordenada",
        "topic": "Heap · Busca Binária · Matriz",
        "entryPoint": "kthSmallest",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe uma matriz quadrada `matrix` de tamanho `n × n` em que **cada linha** e **cada coluna** estão ordenadas em ordem crescente. Seu objetivo é encontrar o `k`-ésimo menor elemento da matriz na ordem dos **valores**.\n\nAtenção: é o `k`-ésimo menor na sequência de todos os elementos com repetições, e **não** o `k`-ésimo valor distinto. Ou seja, se você listasse os `n²` valores da matriz em ordem crescente (mantendo as repetições), a resposta é o valor que ocupa a posição `k`, contando a partir de 1.\n\nImplemente o método `kthSmallest`, que recebe `matrix` e `k` e retorna esse valor."
            },
            {
                "type": "text",
                "value": "Por exemplo, para `matrix = [[1, 5, 9], [10, 11, 13], [12, 13, 15]]` e `k = 8`, a sequência ordenada dos valores é `[1, 5, 9, 10, 11, 12, 13, 13, 15]`; o 8º elemento é `13`, então a resposta é `13`. Repare que o valor `13` aparece duas vezes e as duas ocorrências contam."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `n == matrix.length == matrix[i].length`\n- `1 ≤ n ≤ 300`\n- `-10^9 ≤ matrix[i][j] ≤ 10^9`\n- Cada linha de `matrix` está ordenada em ordem crescente\n- Cada coluna de `matrix` está ordenada em ordem crescente\n- `1 ≤ k ≤ n²`"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[][]} matrix\n   * @param {number} k\n   * @return {number}\n   */\n  kthSmallest(matrix, k) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def kthSmallest(self, matrix: List[List[int]], k: int) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int kthSmallest(int[][] matrix, int k) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[[1,5,9],[10,11,13],[12,13,15]],8]",
                "expectedOutput": "13",
                "isPublic": true
            },
            {
                "input": "[[[-5]],1]",
                "expectedOutput": "-5",
                "isPublic": true
            },
            {
                "input": "[[[1,2],[1,3]],2]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[[[1,2],[1,3]],3]",
                "expectedOutput": "2",
                "isPublic": false
            },
            {
                "input": "[[[1,3,5],[6,7,12],[11,14,14]],6]",
                "expectedOutput": "11",
                "isPublic": false
            },
            {
                "input": "[[[1,1,3],[1,2,4],[2,3,5]],4]",
                "expectedOutput": "2",
                "isPublic": false
            },
            {
                "input": "[[[-10,-8,-6],[-9,-5,-2],[-7,-3,0]],9]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[[[1,2,3,4],[2,3,4,5],[3,4,5,6],[4,5,6,7]],10]",
                "expectedOutput": "4",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Contagem de Somas de Intervalo",
        "topic": "Ordenação · Divisão e Conquista · Árvore Indexada",
        "entryPoint": "countRangeSum",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe uma lista de inteiros `nums` e dois inteiros `lower` e `upper`. Considere todas as **somas de subvetores contíguos** de `nums`: para cada par de índices `i ≤ j`, a soma dos elementos de `nums[i]` até `nums[j]` (inclusive).\n\nImplemente o método `countRangeSum`, que recebe `nums`, `lower` e `upper` e retorna **quantas** dessas somas ficam dentro do intervalo `[lower, upper]`, ou seja, quantas satisfazem `lower ≤ soma ≤ upper` (inclusive nos dois extremos)."
            },
            {
                "type": "text",
                "value": "Cada par de índices `i ≤ j` conta como um subvetor distinto, mesmo que dois subvetores diferentes tenham a mesma soma.\n\nPor exemplo, para `nums = [-2, 5, -1]`, `lower = -2` e `upper = 2`, as somas de subvetores dentro de `[-2, 2]` são `-2` (do subvetor `[-2]`), `2` (de `[-2, 5, -1]`) e `-1` (de `[-1]`), totalizando `3`."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 ≤ nums.length ≤ 10^5`\n- `-2^31 ≤ nums[i] ≤ 2^31 - 1`\n- `-10^5 ≤ lower ≤ upper ≤ 10^5`\n- A soma de qualquer subvetor cabe em um inteiro de 64 bits\n- Subvetores diferentes (pares `i ≤ j` diferentes) são contados separadamente"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[]} nums\n   * @param {number} lower\n   * @param {number} upper\n   * @return {number}\n   */\n  countRangeSum(nums, lower, upper) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def countRangeSum(self, nums: List[int], lower: int, upper: int) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int countRangeSum(int[] nums, int lower, int upper) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[-2,5,-1],-2,2]",
                "expectedOutput": "3",
                "isPublic": true
            },
            {
                "input": "[[0],0,0]",
                "expectedOutput": "1",
                "isPublic": true
            },
            {
                "input": "[[1,2,3],3,6]",
                "expectedOutput": "4",
                "isPublic": false
            },
            {
                "input": "[[-1,-1,-1],-2,-1]",
                "expectedOutput": "5",
                "isPublic": false
            },
            {
                "input": "[[2147483647,-2147483648,-1,0],-1,0]",
                "expectedOutput": "4",
                "isPublic": false
            },
            {
                "input": "[[0,0,0],0,0]",
                "expectedOutput": "6",
                "isPublic": false
            },
            {
                "input": "[[-3,1,2,-2,2,-1],-3,-1]",
                "expectedOutput": "7",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Resolvedor de Sudoku",
        "topic": "Backtracking · Matriz",
        "entryPoint": "solveSudoku",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe um tabuleiro de Sudoku `board` de tamanho `9 × 9`, representado como uma matriz de **strings**. Cada célula contém um dígito de `\"1\"` a `\"9\"` (já preenchida) ou o caractere `\".\"` (célula vazia). É garantido que o quebra-cabeça tem **solução única**.\n\nImplemente o método `solveSudoku`, que recebe `board` e retorna a **mesma matriz** `9 × 9` de strings com **todas as células preenchidas**, respeitando as regras do Sudoku."
            },
            {
                "type": "text",
                "value": "As regras do Sudoku: cada uma das 9 **linhas** deve conter os dígitos de `1` a `9` sem repetição; cada uma das 9 **colunas** deve conter os dígitos de `1` a `9` sem repetição; e cada uma das nove **sub-grades** `3 × 3` deve conter os dígitos de `1` a `9` sem repetição.\n\nComo a solução é única, a saída é determinística: retorne o tabuleiro completamente preenchido, mantendo os valores que já vinham dados."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `board.length == 9` e `board[i].length == 9`\n- Cada `board[i][j]` é um dos caracteres `\"1\"`, `\"2\"`, …, `\"9\"` ou `\".\"`\n- As células já preenchidas não violam as regras do Sudoku\n- É garantido que o quebra-cabeça tem exatamente uma solução"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {string[][]} board\n   * @return {string[][]}\n   */\n  solveSudoku(board) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def solveSudoku(self, board: List[List[str]]) -> List[List[str]]:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public String[][] solveSudoku(String[][] board) {\n        // sua solução aqui\n        return board;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[[\"5\",\"3\",\".\",\".\",\"7\",\".\",\".\",\".\",\".\"],[\"6\",\".\",\".\",\"1\",\"9\",\"5\",\".\",\".\",\".\"],[\".\",\"9\",\"8\",\".\",\".\",\".\",\".\",\"6\",\".\"],[\"8\",\".\",\".\",\".\",\"6\",\".\",\".\",\".\",\"3\"],[\"4\",\".\",\".\",\"8\",\".\",\"3\",\".\",\".\",\"1\"],[\"7\",\".\",\".\",\".\",\"2\",\".\",\".\",\".\",\"6\"],[\".\",\"6\",\".\",\".\",\".\",\".\",\"2\",\"8\",\".\"],[\".\",\".\",\".\",\"4\",\"1\",\"9\",\".\",\".\",\"5\"],[\".\",\".\",\".\",\".\",\"8\",\".\",\".\",\"7\",\"9\"]]]",
                "expectedOutput": "[[\"5\",\"3\",\"4\",\"6\",\"7\",\"8\",\"9\",\"1\",\"2\"],[\"6\",\"7\",\"2\",\"1\",\"9\",\"5\",\"3\",\"4\",\"8\"],[\"1\",\"9\",\"8\",\"3\",\"4\",\"2\",\"5\",\"6\",\"7\"],[\"8\",\"5\",\"9\",\"7\",\"6\",\"1\",\"4\",\"2\",\"3\"],[\"4\",\"2\",\"6\",\"8\",\"5\",\"3\",\"7\",\"9\",\"1\"],[\"7\",\"1\",\"3\",\"9\",\"2\",\"4\",\"8\",\"5\",\"6\"],[\"9\",\"6\",\"1\",\"5\",\"3\",\"7\",\"2\",\"8\",\"4\"],[\"2\",\"8\",\"7\",\"4\",\"1\",\"9\",\"6\",\"3\",\"5\"],[\"3\",\"4\",\"5\",\"2\",\"8\",\"6\",\"1\",\"7\",\"9\"]]",
                "isPublic": true
            },
            {
                "input": "[[[\"1\",\".\",\"7\",\"3\",\"6\",\"4\",\"5\",\"8\",\"2\"],[\".\",\"8\",\"2\",\"7\",\"1\",\"9\",\"6\",\".\",\"3\"],[\".\",\"4\",\"3\",\".\",\"5\",\"8\",\"1\",\".\",\"7\"],[\".\",\"3\",\".\",\"5\",\".\",\"2\",\"4\",\".\",\"1\"],[\"4\",\".\",\"1\",\"6\",\"8\",\"3\",\"9\",\"2\",\".\"],[\".\",\"2\",\"5\",\"1\",\"4\",\"7\",\"8\",\"3\",\"6\"],[\"2\",\"6\",\"8\",\"9\",\"7\",\".\",\"3\",\".\",\"4\"],[\".\",\"5\",\"9\",\"4\",\"3\",\"1\",\".\",\"6\",\"8\"],[\".\",\"1\",\"4\",\"8\",\".\",\"6\",\"7\",\".\",\"9\"]]]",
                "expectedOutput": "[[\"1\",\"9\",\"7\",\"3\",\"6\",\"4\",\"5\",\"8\",\"2\"],[\"5\",\"8\",\"2\",\"7\",\"1\",\"9\",\"6\",\"4\",\"3\"],[\"6\",\"4\",\"3\",\"2\",\"5\",\"8\",\"1\",\"9\",\"7\"],[\"8\",\"3\",\"6\",\"5\",\"9\",\"2\",\"4\",\"7\",\"1\"],[\"4\",\"7\",\"1\",\"6\",\"8\",\"3\",\"9\",\"2\",\"5\"],[\"9\",\"2\",\"5\",\"1\",\"4\",\"7\",\"8\",\"3\",\"6\"],[\"2\",\"6\",\"8\",\"9\",\"7\",\"5\",\"3\",\"1\",\"4\"],[\"7\",\"5\",\"9\",\"4\",\"3\",\"1\",\"2\",\"6\",\"8\"],[\"3\",\"1\",\"4\",\"8\",\"2\",\"6\",\"7\",\"5\",\"9\"]]",
                "isPublic": true
            },
            {
                "input": "[[[\".\",\".\",\".\",\"9\",\".\",\".\",\"3\",\".\",\"1\"],[\".\",\"1\",\".\",\".\",\"7\",\"4\",\".\",\".\",\".\"],[\".\",\".\",\"5\",\"1\",\".\",\".\",\"7\",\"4\",\"6\"],[\".\",\"8\",\".\",\"4\",\"6\",\"2\",\".\",\"3\",\".\"],[\".\",\".\",\"2\",\"5\",\"9\",\".\",\"1\",\".\",\".\"],[\".\",\"5\",\"3\",\".\",\"1\",\".\",\".\",\"2\",\"4\"],[\".\",\".\",\".\",\"2\",\".\",\"9\",\".\",\"1\",\"3\"],[\".\",\"2\",\".\",\".\",\"5\",\"1\",\"8\",\".\",\"7\"],[\".\",\".\",\".\",\".\",\".\",\".\",\"4\",\".\",\"2\"]]]",
                "expectedOutput": "[[\"7\",\"6\",\"4\",\"9\",\"2\",\"5\",\"3\",\"8\",\"1\"],[\"3\",\"1\",\"8\",\"6\",\"7\",\"4\",\"2\",\"5\",\"9\"],[\"2\",\"9\",\"5\",\"1\",\"3\",\"8\",\"7\",\"4\",\"6\"],[\"1\",\"8\",\"7\",\"4\",\"6\",\"2\",\"9\",\"3\",\"5\"],[\"6\",\"4\",\"2\",\"5\",\"9\",\"3\",\"1\",\"7\",\"8\"],[\"9\",\"5\",\"3\",\"8\",\"1\",\"7\",\"6\",\"2\",\"4\"],[\"8\",\"7\",\"6\",\"2\",\"4\",\"9\",\"5\",\"1\",\"3\"],[\"4\",\"2\",\"9\",\"3\",\"5\",\"1\",\"8\",\"6\",\"7\"],[\"5\",\"3\",\"1\",\"7\",\"8\",\"6\",\"4\",\"9\",\"2\"]]",
                "isPublic": false
            },
            {
                "input": "[[[\".\",\"5\",\".\",\".\",\"3\",\"7\",\".\",\".\",\".\"],[\"6\",\"3\",\"7\",\".\",\".\",\"8\",\".\",\"5\",\".\"],[\".\",\"1\",\"8\",\"9\",\".\",\".\",\".\",\".\",\".\"],[\".\",\"8\",\".\",\".\",\".\",\".\",\"6\",\"7\",\".\"],[\"1\",\".\",\".\",\".\",\"7\",\"6\",\".\",\".\",\"3\"],[\".\",\".\",\".\",\".\",\"8\",\".\",\"9\",\".\",\"1\"],[\".\",\"4\",\"3\",\".\",\".\",\"1\",\".\",\".\",\".\"],[\"2\",\".\",\".\",\".\",\"4\",\".\",\".\",\"9\",\"8\"],[\"8\",\"9\",\"1\",\"2\",\"6\",\".\",\".\",\".\",\".\"]]]",
                "expectedOutput": "[[\"9\",\"5\",\"2\",\"6\",\"3\",\"7\",\"8\",\"1\",\"4\"],[\"6\",\"3\",\"7\",\"4\",\"1\",\"8\",\"2\",\"5\",\"9\"],[\"4\",\"1\",\"8\",\"9\",\"5\",\"2\",\"7\",\"3\",\"6\"],[\"3\",\"8\",\"4\",\"1\",\"2\",\"9\",\"6\",\"7\",\"5\"],[\"1\",\"2\",\"9\",\"5\",\"7\",\"6\",\"4\",\"8\",\"3\"],[\"5\",\"7\",\"6\",\"3\",\"8\",\"4\",\"9\",\"2\",\"1\"],[\"7\",\"4\",\"3\",\"8\",\"9\",\"1\",\"5\",\"6\",\"2\"],[\"2\",\"6\",\"5\",\"7\",\"4\",\"3\",\"1\",\"9\",\"8\"],[\"8\",\"9\",\"1\",\"2\",\"6\",\"5\",\"3\",\"4\",\"7\"]]",
                "isPublic": false
            },
            {
                "input": "[[[\"2\",\".\",\".\",\".\",\".\",\".\",\"1\",\"9\",\".\"],[\"3\",\"5\",\"6\",\"1\",\".\",\".\",\".\",\".\",\"7\"],[\".\",\"1\",\".\",\".\",\".\",\".\",\".\",\".\",\"6\"],[\"8\",\".\",\".\",\".\",\".\",\".\",\"4\",\"1\",\"3\"],[\".\",\".\",\"3\",\".\",\"8\",\"9\",\".\",\".\",\"2\"],[\".\",\"6\",\".\",\".\",\".\",\"3\",\".\",\".\",\".\"],[\".\",\".\",\"8\",\".\",\".\",\".\",\".\",\"7\",\".\"],[\".\",\"3\",\".\",\".\",\"7\",\".\",\"2\",\".\",\".\"],[\"7\",\".\",\".\",\"2\",\"6\",\".\",\"3\",\"4\",\"5\"]]]",
                "expectedOutput": "[[\"2\",\"8\",\"7\",\"5\",\"3\",\"6\",\"1\",\"9\",\"4\"],[\"3\",\"5\",\"6\",\"1\",\"9\",\"4\",\"8\",\"2\",\"7\"],[\"9\",\"1\",\"4\",\"8\",\"2\",\"7\",\"5\",\"3\",\"6\"],[\"8\",\"7\",\"9\",\"6\",\"5\",\"2\",\"4\",\"1\",\"3\"],[\"1\",\"4\",\"3\",\"7\",\"8\",\"9\",\"6\",\"5\",\"2\"],[\"5\",\"6\",\"2\",\"4\",\"1\",\"3\",\"7\",\"8\",\"9\"],[\"6\",\"2\",\"8\",\"3\",\"4\",\"5\",\"9\",\"7\",\"1\"],[\"4\",\"3\",\"5\",\"9\",\"7\",\"1\",\"2\",\"6\",\"8\"],[\"7\",\"9\",\"1\",\"2\",\"6\",\"8\",\"3\",\"4\",\"5\"]]",
                "isPublic": false
            },
            {
                "input": "[[[\".\",\"4\",\".\",\"2\",\".\",\"8\",\".\",\"3\",\".\"],[\"1\",\"2\",\"8\",\".\",\".\",\".\",\"9\",\"4\",\".\"],[\"7\",\".\",\".\",\".\",\"9\",\"5\",\".\",\"2\",\".\"],[\"8\",\".\",\"4\",\".\",\".\",\".\",\".\",\".\",\"3\"],[\".\",\"1\",\".\",\".\",\"5\",\"3\",\".\",\".\",\".\"],[\".\",\".\",\"3\",\"9\",\"8\",\"4\",\".\",\"1\",\".\"],[\".\",\"8\",\".\",\"6\",\"3\",\".\",\".\",\".\",\"7\"],[\".\",\"6\",\"1\",\"5\",\".\",\"7\",\".\",\".\",\".\"],[\"4\",\".\",\".\",\".\",\".\",\"9\",\".\",\"6\",\".\"]]]",
                "expectedOutput": "[[\"9\",\"4\",\"5\",\"2\",\"1\",\"8\",\"7\",\"3\",\"6\"],[\"1\",\"2\",\"8\",\"3\",\"7\",\"6\",\"9\",\"4\",\"5\"],[\"7\",\"3\",\"6\",\"4\",\"9\",\"5\",\"1\",\"2\",\"8\"],[\"8\",\"9\",\"4\",\"1\",\"6\",\"2\",\"5\",\"7\",\"3\"],[\"6\",\"1\",\"2\",\"7\",\"5\",\"3\",\"8\",\"9\",\"4\"],[\"5\",\"7\",\"3\",\"9\",\"8\",\"4\",\"6\",\"1\",\"2\"],[\"2\",\"8\",\"9\",\"6\",\"3\",\"1\",\"4\",\"5\",\"7\"],[\"3\",\"6\",\"1\",\"5\",\"4\",\"7\",\"2\",\"8\",\"9\"],[\"4\",\"5\",\"7\",\"8\",\"2\",\"9\",\"3\",\"6\",\"1\"]]",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Busca de Palavras II",
        "topic": "Trie · Backtracking · Matriz",
        "entryPoint": "findWords",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe uma grade de letras `board` (uma matriz de strings de **1 caractere**) e uma lista de palavras `words`. Uma palavra pode ser **construída** percorrendo letras de células **adjacentes**, onde adjacentes são as vizinhas na horizontal ou na vertical. A **mesma célula não pode ser usada mais de uma vez** na construção de uma mesma palavra.\n\nImplemente o método `findWords`, que recebe `board` e `words` e retorna todas as palavras de `words` que podem ser construídas no tabuleiro."
            },
            {
                "type": "text",
                "value": "O resultado **não** deve conter palavras repetidas e deve estar em **ordem crescente** (lexicográfica).\n\nPor exemplo, para `board = [[\"o\", \"a\", \"a\", \"n\"], [\"e\", \"t\", \"a\", \"e\"], [\"i\", \"h\", \"k\", \"r\"], [\"i\", \"f\", \"l\", \"v\"]]` e `words = [\"oath\", \"pea\", \"eat\", \"rain\"]`, as palavras que existem no tabuleiro são `\"eat\"` e `\"oath\"`, retornadas como `[\"eat\", \"oath\"]`."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 ≤ board.length, board[i].length ≤ 12`\n- Cada `board[i][j]` é uma letra minúscula do alfabeto inglês\n- `1 ≤ words.length ≤ 3 × 10^4`\n- `1 ≤ words[i].length ≤ 10`\n- `words[i]` contém apenas letras minúsculas do alfabeto inglês\n- O resultado não tem palavras repetidas e está em ordem lexicográfica crescente"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {string[][]} board\n   * @param {string[]} words\n   * @return {string[]}\n   */\n  findWords(board, words) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def findWords(self, board: List[List[str]], words: List[str]) -> List[str]:\n        # sua solução aqui\n        pass\n",
            "java": "import java.util.*;\n\npublic class Solution {\n    public String[] findWords(String[][] board, String[] words) {\n        // sua solução aqui\n        return new String[0];\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[[\"o\",\"a\",\"a\",\"n\"],[\"e\",\"t\",\"a\",\"e\"],[\"i\",\"h\",\"k\",\"r\"],[\"i\",\"f\",\"l\",\"v\"]],[\"oath\",\"pea\",\"eat\",\"rain\"]]",
                "expectedOutput": "[\"eat\",\"oath\"]",
                "isPublic": true
            },
            {
                "input": "[[[\"a\",\"b\"],[\"c\",\"d\"]],[\"abcb\",\"abdc\"]]",
                "expectedOutput": "[\"abdc\"]",
                "isPublic": true
            },
            {
                "input": "[[[\"a\"]],[\"a\"]]",
                "expectedOutput": "[\"a\"]",
                "isPublic": false
            },
            {
                "input": "[[[\"a\"]],[\"b\"]]",
                "expectedOutput": "[]",
                "isPublic": false
            },
            {
                "input": "[[[\"a\",\"b\"],[\"c\",\"d\"]],[\"ab\",\"ab\",\"ca\",\"bd\",\"ac\"]]",
                "expectedOutput": "[\"ab\",\"ac\",\"bd\",\"ca\"]",
                "isPublic": false
            },
            {
                "input": "[[[\"a\",\"b\"],[\"c\",\"d\"]],[\"aba\"]]",
                "expectedOutput": "[]",
                "isPublic": false
            },
            {
                "input": "[[[\"a\",\"a\",\"a\"],[\"a\",\"a\",\"a\"],[\"a\",\"a\",\"a\"]],[\"aaaa\",\"aaaaaaaaaa\"]]",
                "expectedOutput": "[\"aaaa\"]",
                "isPublic": false
            },
            {
                "input": "[[[\"c\",\"a\",\"t\"],[\"x\",\"o\",\"x\"],[\"d\",\"o\",\"g\"]],[\"cat\",\"dog\",\"cot\",\"tox\"]]",
                "expectedOutput": "[\"cat\",\"dog\"]",
                "isPublic": false
            }
        ]
    },
    {
        "title": "String Embaralhada",
        "topic": "String · Programação Dinâmica · Recursão",
        "entryPoint": "isScramble",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Dizemos que uma string `s2` é um **embaralhamento** de uma string `s1` de mesmo tamanho quando pode ser obtida pelo seguinte processo recursivo:\n\n- se a string tem tamanho `1`, então `s1` e `s2` precisam ser iguais;\n- caso contrário, quebre `s1` em duas partes **não vazias** em algum ponto, obtendo `x` e `y` (com `s1 = x + y`). Então `s2` é um embaralhamento de `s1` se, para alguma quebra, valer `s2 = x' + y'` com `x'` embaralhamento de `x` e `y'` embaralhamento de `y`, **ou** `s2 = y' + x'` (as duas partes **trocam de ordem**) com `x'` embaralhamento de `x` e `y'` embaralhamento de `y`.\n\nImplemente o método `isScramble`, que recebe `s1` e `s2` e retorna `true` se `s2` é um embaralhamento de `s1` e `false` caso contrário."
            },
            {
                "type": "text",
                "value": "Por exemplo, `s1 = \"great\"` e `s2 = \"rgeat\"` retorna `true`: quebrando `\"great\"` em `\"gr\"` e `\"eat\"`, ao trocar `\"gr\"` por `\"rg\"` (um embaralhamento de `\"gr\"`) e manter `\"eat\"`, obtém-se `\"rgeat\"`. Já `s1 = \"abcde\"` e `s2 = \"caebd\"` retorna `false`."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `s1.length == s2.length`\n- `1 ≤ s1.length ≤ 30`\n- `s1` e `s2` contêm apenas letras minúsculas do alfabeto inglês\n- Se `s1` e `s2` não tiverem exatamente as mesmas letras, a resposta é `false`"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {string} s1\n   * @param {string} s2\n   * @return {boolean}\n   */\n  isScramble(s1, s2) {\n    // sua solução aqui\n  }\n}\n",
            "python": "class Solution:\n    def isScramble(self, s1: str, s2: str) -> bool:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public boolean isScramble(String s1, String s2) {\n        // sua solução aqui\n        return false;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[\"great\",\"rgeat\"]",
                "expectedOutput": "true",
                "isPublic": true
            },
            {
                "input": "[\"abcde\",\"caebd\"]",
                "expectedOutput": "false",
                "isPublic": true
            },
            {
                "input": "[\"a\",\"a\"]",
                "expectedOutput": "true",
                "isPublic": false
            },
            {
                "input": "[\"ab\",\"ba\"]",
                "expectedOutput": "true",
                "isPublic": false
            },
            {
                "input": "[\"abc\",\"cba\"]",
                "expectedOutput": "true",
                "isPublic": false
            },
            {
                "input": "[\"abcd\",\"bdac\"]",
                "expectedOutput": "false",
                "isPublic": false
            },
            {
                "input": "[\"aacbb\",\"bbcaa\"]",
                "expectedOutput": "true",
                "isPublic": false
            },
            {
                "input": "[\"abc\",\"abd\"]",
                "expectedOutput": "false",
                "isPublic": false
            }
        ]
    }
];

async function main() {
    const [{ max }] = await db
        .select({ max: sql<number>`coalesce(max(${challenges.number}), 0)` })
        .from(challenges);
    let proximo = Number(max) + 1;
    let criados = 0;
    for (const d of DESAFIOS) {
        const [existe] = await db
            .select({ id: challenges.id })
            .from(challenges)
            .where(eq(challenges.title, d.title));
        if (existe) continue;
        const [c] = await db
            .insert(challenges)
            .values({
                number: proximo++,
                title: d.title,
                topic: d.topic,
                kind: "function",
                entryPoint: d.entryPoint,
                statementBlocks: d.statementBlocks,
                difficulty: "dificil",
                starterCode: d.starterCode,
                activeDate: null,
                published: true,
            })
            .returning();
        await db.insert(challengeTests).values(
            d.tests.map((t, i) => ({
                challengeId: c.id,
                input: t.input,
                expectedOutput: t.expectedOutput,
                isPublic: t.isPublic,
                position: i + 1,
            })),
        );
        criados++;
    }
    console.log(`Desafios difíceis criados: ${criados} (de ${DESAFIOS.length}).`);
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
