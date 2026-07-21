// Seed dos desafios médios (lote 2, formato função). Idempotente por título;
// o número de exibição é atribuído dinamicamente (próximo livre) para não colidir.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-desafios-medium-2.ts
import { db } from "../db.ts";
import { challenges, challengeTests } from "../schema.ts";
import { eq, sql } from "drizzle-orm";

const DESAFIOS = [
    {
        "title": "Soma de Três Números",
        "topic": "Array · Dois Ponteiros",
        "entryPoint": "threeSum",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe uma lista de inteiros `nums`. Encontre todas as **triplas distintas** `[a, b, c]` formadas por elementos de três posições diferentes de `nums` cuja soma seja igual a zero, ou seja, `a + b + c == 0`. Duas triplas são consideradas iguais quando têm exatamente os mesmos valores, independentemente da ordem, e cada tripla distinta deve aparecer uma única vez no resultado.\n\nImplemente o método `threeSum`, que recebe `nums` e retorna a lista de todas essas triplas. Se não houver nenhuma, retorne uma lista vazia."
            },
            {
                "type": "text",
                "value": "Para que a resposta seja única, a ordem é fixada: os três valores de **cada tripla** ficam em ordem crescente (`a ≤ b ≤ c`), e a **lista de triplas** é ordenada lexicograficamente — comparando primeiro o valor da posição `0`, em caso de empate o da posição `1` e, persistindo o empate, o da posição `2`.\n\nPor exemplo, para `nums = [-1, 0, 1, 2, -1, -4]` o resultado é `[[-1, -1, 2], [-1, 0, 1]]`."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `0 ≤ nums.length ≤ 3000`\n- `-10^5 ≤ nums[i] ≤ 10^5`\n- Cada tripla é formada por três posições distintas de `nums`\n- As triplas do resultado são distintas entre si"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[]} nums\n   * @return {number[][]}\n   */\n  threeSum(nums) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def threeSum(self, nums: List[int]) -> List[List[int]]:\n        # sua solução aqui\n        pass\n",
            "java": "import java.util.*;\n\npublic class Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        // sua solução aqui\n        return new ArrayList<>();\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[-1,0,1,2,-1,-4]]",
                "expectedOutput": "[[-1,-1,2],[-1,0,1]]",
                "isPublic": true
            },
            {
                "input": "[[0,1,1]]",
                "expectedOutput": "[]",
                "isPublic": true
            },
            {
                "input": "[[0,0,0]]",
                "expectedOutput": "[[0,0,0]]",
                "isPublic": false
            },
            {
                "input": "[[]]",
                "expectedOutput": "[]",
                "isPublic": false
            },
            {
                "input": "[[-2,0,1,1,2]]",
                "expectedOutput": "[[-2,0,2],[-2,1,1]]",
                "isPublic": false
            },
            {
                "input": "[[-2,-1,0,1,2]]",
                "expectedOutput": "[[-2,0,2],[-1,0,1]]",
                "isPublic": false
            },
            {
                "input": "[[-4,-2,-2,-2,0,1,2,2,2,3,3,4,4,6,6]]",
                "expectedOutput": "[[-4,-2,6],[-4,0,4],[-4,1,3],[-4,2,2],[-2,-2,4],[-2,0,2]]",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Agrupar Anagramas",
        "topic": "Tabela Hash · String · Ordenação",
        "entryPoint": "groupAnagrams",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe uma lista de palavras `strs`. Agrupe todas as palavras que são **anagramas** entre si, isto é, palavras formadas exatamente pelas mesmas letras, nas mesmas quantidades, apenas reordenadas.\n\nImplemente o método `groupAnagrams`, que recebe `strs` e retorna a lista de grupos, em que cada grupo reúne as palavras que são anagramas umas das outras. Toda palavra da entrada aparece em exatamente um grupo, e palavras repetidas na entrada aparecem repetidas no grupo correspondente."
            },
            {
                "type": "text",
                "value": "Para que a resposta seja única, a ordem é fixada: dentro de cada grupo, as palavras ficam em ordem crescente (lexicográfica); e os grupos são ordenados pela sua primeira palavra (a menor de cada grupo), também em ordem crescente.\n\nPor exemplo, para `strs = [\"eat\", \"tea\", \"tan\", \"ate\", \"nat\", \"bat\"]` o resultado é `[[\"ate\", \"eat\", \"tea\"], [\"bat\"], [\"nat\", \"tan\"]]`."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 ≤ strs.length ≤ 10^4`\n- `0 ≤ strs[i].length ≤ 100`\n- `strs[i]` contém apenas letras minúsculas do alfabeto inglês\n- A comparação lexicográfica segue a ordem dos caracteres"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {string[]} strs\n   * @return {string[][]}\n   */\n  groupAnagrams(strs) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:\n        # sua solução aqui\n        pass\n",
            "java": "import java.util.*;\n\npublic class Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        // sua solução aqui\n        return new ArrayList<>();\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]]",
                "expectedOutput": "[[\"ate\",\"eat\",\"tea\"],[\"bat\"],[\"nat\",\"tan\"]]",
                "isPublic": true
            },
            {
                "input": "[[\"\"]]",
                "expectedOutput": "[[\"\"]]",
                "isPublic": true
            },
            {
                "input": "[[\"a\"]]",
                "expectedOutput": "[[\"a\"]]",
                "isPublic": false
            },
            {
                "input": "[[\"abc\",\"bca\",\"cab\",\"xyz\",\"zxy\"]]",
                "expectedOutput": "[[\"abc\",\"bca\",\"cab\"],[\"xyz\",\"zxy\"]]",
                "isPublic": false
            },
            {
                "input": "[[\"listen\",\"silent\",\"enlist\",\"google\",\"gooogle\"]]",
                "expectedOutput": "[[\"enlist\",\"listen\",\"silent\"],[\"google\"],[\"gooogle\"]]",
                "isPublic": false
            },
            {
                "input": "[[\"ab\",\"ba\",\"abc\",\"cba\",\"bca\"]]",
                "expectedOutput": "[[\"ab\",\"ba\"],[\"abc\",\"bca\",\"cba\"]]",
                "isPublic": false
            },
            {
                "input": "[[\"z\",\"z\",\"z\"]]",
                "expectedOutput": "[[\"z\",\"z\",\"z\"]]",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Maior Subarray",
        "topic": "Array · Programação Dinâmica",
        "entryPoint": "maxSubArray",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe uma lista de inteiros `nums`. Um subarray é uma sequência de elementos contíguos de `nums`, sem pular posições, e precisa conter ao menos um elemento.\n\nImplemente o método `maxSubArray`, que recebe `nums` e retorna a **maior soma** possível entre todos os subarrays contíguos não vazios."
            },
            {
                "type": "text",
                "value": "Por exemplo, para `nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]` o subarray de maior soma é `[4, -1, 2, 1]`, cuja soma é `6`. Quando todos os valores são negativos, a resposta é o maior deles, pois o subarray precisa ter pelo menos um elemento."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 ≤ nums.length ≤ 10^5`\n- `-10^4 ≤ nums[i] ≤ 10^4`"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[]} nums\n   * @return {number}\n   */\n  maxSubArray(nums) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int maxSubArray(int[] nums) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[-2,1,-3,4,-1,2,1,-5,4]]",
                "expectedOutput": "6",
                "isPublic": true
            },
            {
                "input": "[[1]]",
                "expectedOutput": "1",
                "isPublic": true
            },
            {
                "input": "[[5,4,-1,7,8]]",
                "expectedOutput": "23",
                "isPublic": false
            },
            {
                "input": "[[-1]]",
                "expectedOutput": "-1",
                "isPublic": false
            },
            {
                "input": "[[-2,-1]]",
                "expectedOutput": "-1",
                "isPublic": false
            },
            {
                "input": "[[-3,-2,-5,-1,-4]]",
                "expectedOutput": "-1",
                "isPublic": false
            },
            {
                "input": "[[8,-19,5,-4,20]]",
                "expectedOutput": "21",
                "isPublic": false
            },
            {
                "input": "[[0,0,0]]",
                "expectedOutput": "0",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Produto Máximo de Subarray",
        "topic": "Array · Programação Dinâmica",
        "entryPoint": "maxProduct",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe uma lista de inteiros `nums`. Um subarray é uma sequência de elementos contíguos de `nums`, sem pular posições, e precisa conter ao menos um elemento.\n\nImplemente o método `maxProduct`, que recebe `nums` e retorna o **maior produto** possível entre todos os subarrays contíguos não vazios."
            },
            {
                "type": "text",
                "value": "Atenção aos sinais: um número negativo inverte o sinal do produto, então dois negativos podem se combinar para formar um produto positivo grande, enquanto um `0` interrompe a sequência e zera qualquer produto que passe por ele. Por exemplo, para `nums = [2, 3, -2, 4]` o melhor subarray é `[2, 3]`, com produto `6`; já em `[-2, 0, -1]` o maior produto possível é `0`."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 ≤ nums.length ≤ 2 * 10^4`\n- `-10 ≤ nums[i] ≤ 10`\n- O produto de qualquer subarray de `nums` cabe em um inteiro de 32 bits"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[]} nums\n   * @return {number}\n   */\n  maxProduct(nums) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def maxProduct(self, nums: List[int]) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int maxProduct(int[] nums) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[2,3,-2,4]]",
                "expectedOutput": "6",
                "isPublic": true
            },
            {
                "input": "[[-2,0,-1]]",
                "expectedOutput": "0",
                "isPublic": true
            },
            {
                "input": "[[-2,3,-4]]",
                "expectedOutput": "24",
                "isPublic": false
            },
            {
                "input": "[[0,2]]",
                "expectedOutput": "2",
                "isPublic": false
            },
            {
                "input": "[[-3]]",
                "expectedOutput": "-3",
                "isPublic": false
            },
            {
                "input": "[[2,-5,-2,-4,3]]",
                "expectedOutput": "24",
                "isPublic": false
            },
            {
                "input": "[[-2,-3,7]]",
                "expectedOutput": "42",
                "isPublic": false
            },
            {
                "input": "[[3,-1,4]]",
                "expectedOutput": "4",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Pulo no Jogo II",
        "topic": "Array · Guloso",
        "entryPoint": "jump",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe uma lista de inteiros não negativos `nums` e começa na primeira posição (índice `0`). Cada valor `nums[i]` indica o comprimento máximo do pulo que você pode dar a partir do índice `i`: estando em `i`, você pode avançar para qualquer índice entre `i + 1` e `i + nums[i]`.\n\nImplemente o método `jump`, que recebe `nums` e retorna o **número mínimo de pulos** necessário para chegar ao último índice da lista."
            },
            {
                "type": "text",
                "value": "Você pode assumir que sempre é possível alcançar o último índice. Se a lista tiver um único elemento, você já começa no destino, então nenhum pulo é preciso e a resposta é `0`.\n\nPor exemplo, para `nums = [2, 3, 1, 1, 4]` a resposta é `2`: pule do índice `0` para o índice `1` (avançando 1 posição) e do índice `1` até o último índice (avançando 3 posições)."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 ≤ nums.length ≤ 10^4`\n- `0 ≤ nums[i] ≤ 1000`\n- É garantido que dá para chegar ao último índice a partir do índice `0`"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[]} nums\n   * @return {number}\n   */\n  jump(nums) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def jump(self, nums: List[int]) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int jump(int[] nums) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[2,3,1,1,4]]",
                "expectedOutput": "2",
                "isPublic": true
            },
            {
                "input": "[[2,3,0,1,4]]",
                "expectedOutput": "2",
                "isPublic": true
            },
            {
                "input": "[[0]]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[[1,2]]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[[1,1,1,1]]",
                "expectedOutput": "3",
                "isPublic": false
            },
            {
                "input": "[[5,1,1,1,1,1]]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[[2,3,1,1,4,0,0]]",
                "expectedOutput": "3",
                "isPublic": false
            },
            {
                "input": "[[7,0,9,6,9,6,1,7,9,0,1,2,9,0,3]]",
                "expectedOutput": "2",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Inserir Intervalo",
        "topic": "Array",
        "entryPoint": "insert",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe uma lista de intervalos `intervals`, em que cada intervalo é um par `[início, fim]`. A lista já está ordenada em ordem crescente de início e nenhum de seus intervalos se sobrepõe. Você também recebe um novo intervalo `newInterval`.\n\nInsira `newInterval` na lista de modo que ela continue ordenada por início e sem sobreposições, mesclando todos os intervalos que passarem a se sobrepor. Dois intervalos que apenas se tocam nas pontas (por exemplo, `[1,5]` e `[5,8]`) são considerados sobrepostos e devem ser mesclados em um só.\n\nImplemente o método `insert`, que devolve a lista de intervalos resultante, ordenada por início."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `0 <= intervals.length <= 10^4`\n- `intervals[i].length == 2` e `newInterval.length == 2`\n- `-10^9 <= início <= fim <= 10^9`\n- `intervals` está ordenada por início em ordem crescente e não contém sobreposições."
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[][]} intervals\n   * @param {number[]} newInterval\n   * @return {number[][]}\n   */\n  insert(intervals, newInterval) {\n    // sua solução aqui\n  }\n}\n",
            "python": "class Solution:\n    def insert(self, intervals: list[list[int]], newInterval: list[int]) -> list[list[int]]:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int[][] insert(int[][] intervals, int[] newInterval) {\n        // sua solução aqui\n        return new int[0][];\n    }\n}"
        },
        "tests": [
            {
                "input": "[[[1,3],[6,9]],[2,5]]",
                "expectedOutput": "[[1,5],[6,9]]",
                "isPublic": true
            },
            {
                "input": "[[[1,2],[3,5],[6,7],[8,10],[12,16]],[4,8]]",
                "expectedOutput": "[[1,2],[3,10],[12,16]]",
                "isPublic": true
            },
            {
                "input": "[[],[5,7]]",
                "expectedOutput": "[[5,7]]",
                "isPublic": false
            },
            {
                "input": "[[[1,5]],[2,3]]",
                "expectedOutput": "[[1,5]]",
                "isPublic": false
            },
            {
                "input": "[[[1,5]],[6,8]]",
                "expectedOutput": "[[1,5],[6,8]]",
                "isPublic": false
            },
            {
                "input": "[[[1,5]],[0,0]]",
                "expectedOutput": "[[0,0],[1,5]]",
                "isPublic": false
            },
            {
                "input": "[[[2,3],[5,7]],[1,10]]",
                "expectedOutput": "[[1,10]]",
                "isPublic": false
            },
            {
                "input": "[[[1,5]],[5,8]]",
                "expectedOutput": "[[1,8]]",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Intervalos Não Sobrepostos",
        "topic": "Array · Guloso",
        "entryPoint": "eraseOverlapIntervals",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe uma lista de intervalos `intervals`, em que `intervals[i] = [início_i, fim_i]`. Determine o número mínimo de intervalos que precisam ser removidos para que os intervalos restantes não se sobreponham entre si.\n\nDois intervalos que apenas se tocam nas pontas não são considerados sobrepostos: por exemplo, `[1,2]` e `[2,3]` podem coexistir sem que nenhum precise ser removido.\n\nImplemente o método `eraseOverlapIntervals`, que devolve esse número mínimo de remoções."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `0 <= intervals.length <= 10^5`\n- `intervals[i].length == 2`\n- `-5 * 10^4 <= início_i < fim_i <= 5 * 10^4`"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[][]} intervals\n   * @return {number}\n   */\n  eraseOverlapIntervals(intervals) {\n    // sua solução aqui\n  }\n}\n",
            "python": "class Solution:\n    def eraseOverlapIntervals(self, intervals: list[list[int]]) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int eraseOverlapIntervals(int[][] intervals) {\n        // sua solução aqui\n        return 0;\n    }\n}"
        },
        "tests": [
            {
                "input": "[[[1,2],[2,3],[3,4],[1,3]]]",
                "expectedOutput": "1",
                "isPublic": true
            },
            {
                "input": "[[[1,2],[1,2],[1,2]]]",
                "expectedOutput": "2",
                "isPublic": true
            },
            {
                "input": "[[[1,2],[2,3]]]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[[[1,100],[11,22],[1,11],[2,12]]]",
                "expectedOutput": "2",
                "isPublic": false
            },
            {
                "input": "[[]]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[[[1,2]]]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[[[1,10],[2,3],[3,4],[4,5]]]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[[[1,3],[2,4],[3,5],[4,6]]]",
                "expectedOutput": "2",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Rótulos de Partição",
        "topic": "Tabela Hash · Guloso",
        "entryPoint": "partitionLabels",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe uma string `s` formada apenas por letras minúsculas do alfabeto inglês. Particione `s` no maior número possível de pedaços de forma que cada letra apareça em, no máximo, um pedaço. A concatenação dos pedaços, na ordem, deve reproduzir exatamente `s`.\n\nPor exemplo, para `s = \"ababcbacadefegdehijhklij\"` a partição ótima é `\"ababcbaca\"`, `\"defegde\"`, `\"hijhklij\"`, cujos tamanhos são `[9, 7, 8]`.\n\nImplemente o método `partitionLabels`, que devolve uma lista com os tamanhos dos pedaços, na ordem em que aparecem em `s`."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 <= s.length <= 500`\n- `s` contém apenas letras minúsculas do alfabeto inglês (`a`-`z`)."
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {string} s\n   * @return {number[]}\n   */\n  partitionLabels(s) {\n    // sua solução aqui\n  }\n}\n",
            "python": "class Solution:\n    def partitionLabels(self, s: str) -> list[int]:\n        # sua solução aqui\n        pass\n",
            "java": "import java.util.*;\n\npublic class Solution {\n    public List<Integer> partitionLabels(String s) {\n        // sua solução aqui\n        return new ArrayList<>();\n    }\n}"
        },
        "tests": [
            {
                "input": "[\"ababcbacadefegdehijhklij\"]",
                "expectedOutput": "[9,7,8]",
                "isPublic": true
            },
            {
                "input": "[\"eccbbbbdec\"]",
                "expectedOutput": "[10]",
                "isPublic": true
            },
            {
                "input": "[\"a\"]",
                "expectedOutput": "[1]",
                "isPublic": false
            },
            {
                "input": "[\"abc\"]",
                "expectedOutput": "[1,1,1]",
                "isPublic": false
            },
            {
                "input": "[\"aaaa\"]",
                "expectedOutput": "[4]",
                "isPublic": false
            },
            {
                "input": "[\"abac\"]",
                "expectedOutput": "[3,1]",
                "isPublic": false
            },
            {
                "input": "[\"abcabc\"]",
                "expectedOutput": "[6]",
                "isPublic": false
            },
            {
                "input": "[\"abcddefgg\"]",
                "expectedOutput": "[1,1,1,2,1,1,2]",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Decodificar String",
        "topic": "Pilha · String",
        "entryPoint": "decodeString",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe uma string codificada `s` e deve devolvê-la decodificada. A regra de codificação é `k[conteudo]`, em que o `conteudo` entre colchetes deve ser repetido exatamente `k` vezes, sendo `k` sempre um inteiro positivo.\n\nAs codificações podem estar aninhadas, como em `2[abc3[cd]]`. Você pode assumir que a entrada é sempre válida (colchetes bem formados) e que os dígitos aparecem apenas indicando a repetição de um bloco `k[...]`, nunca soltos no conteúdo.\n\nPor exemplo, `3[a]2[bc]` resulta em `aaabcbc`, e `2[abc3[cd]]` resulta em `abccdcdcdabccdcdcd`.\n\nImplemente o método `decodeString`, que devolve a string já decodificada."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 <= s.length <= 30`\n- `s` contém letras minúsculas do alfabeto inglês, dígitos e os colchetes `[` e `]`.\n- `1 <= k <= 300`\n- A string decodificada cabe em memória (no máximo cerca de `10^5` caracteres)."
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {string} s\n   * @return {string}\n   */\n  decodeString(s) {\n    // sua solução aqui\n  }\n}\n",
            "python": "class Solution:\n    def decodeString(self, s: str) -> str:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public String decodeString(String s) {\n        // sua solução aqui\n        return \"\";\n    }\n}"
        },
        "tests": [
            {
                "input": "[\"3[a]2[bc]\"]",
                "expectedOutput": "\"aaabcbc\"",
                "isPublic": true
            },
            {
                "input": "[\"2[abc3[cd]]\"]",
                "expectedOutput": "\"abccdcdcdabccdcdcd\"",
                "isPublic": true
            },
            {
                "input": "[\"3[a2[c]]\"]",
                "expectedOutput": "\"accaccacc\"",
                "isPublic": false
            },
            {
                "input": "[\"2[abc]3[cd]ef\"]",
                "expectedOutput": "\"abcabccdcdcdef\"",
                "isPublic": false
            },
            {
                "input": "[\"abc\"]",
                "expectedOutput": "\"abc\"",
                "isPublic": false
            },
            {
                "input": "[\"10[a]\"]",
                "expectedOutput": "\"aaaaaaaaaa\"",
                "isPublic": false
            },
            {
                "input": "[\"2[b3[a]]\"]",
                "expectedOutput": "\"baaabaaa\"",
                "isPublic": false
            },
            {
                "input": "[\"3[abc]\"]",
                "expectedOutput": "\"abcabcabc\"",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Avaliar Notação Polonesa Reversa",
        "topic": "Pilha",
        "entryPoint": "evalRPN",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe um array de strings `tokens` que representa uma expressão aritmética em notação polonesa reversa (RPN). Avalie a expressão e devolva o resultado como um inteiro.\n\nOs operadores válidos são `+`, `-`, `*` e `/`, e cada um atua sobre os dois valores imediatamente anteriores na pilha. Cada operando é um inteiro que pode ser negativo. A divisão entre dois inteiros deve truncar o resultado em direção ao zero (por exemplo, `-7 / 2` resulta em `-3`).\n\nVocê pode assumir que a expressão é sempre válida, que não há divisão por zero e que o resultado e todos os resultados intermediários cabem em um inteiro de 32 bits. Por exemplo, `[\"2\",\"1\",\"+\",\"3\",\"*\"]` resulta em `9`.\n\nImplemente o método `evalRPN`, que devolve o valor da expressão."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 <= tokens.length <= 10^4`\n- Cada `token` é um dos operadores `+`, `-`, `*`, `/` ou um inteiro no intervalo `[-200, 200]`.\n- A expressão está sempre em notação polonesa reversa válida."
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {string[]} tokens\n   * @return {number}\n   */\n  evalRPN(tokens) {\n    // sua solução aqui\n  }\n}\n",
            "python": "class Solution:\n    def evalRPN(self, tokens: list[str]) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int evalRPN(String[] tokens) {\n        // sua solução aqui\n        return 0;\n    }\n}"
        },
        "tests": [
            {
                "input": "[[\"2\",\"1\",\"+\",\"3\",\"*\"]]",
                "expectedOutput": "9",
                "isPublic": true
            },
            {
                "input": "[[\"4\",\"13\",\"5\",\"/\",\"+\"]]",
                "expectedOutput": "6",
                "isPublic": true
            },
            {
                "input": "[[\"10\",\"6\",\"9\",\"3\",\"+\",\"-11\",\"*\",\"/\",\"*\",\"17\",\"+\",\"5\",\"+\"]]",
                "expectedOutput": "22",
                "isPublic": false
            },
            {
                "input": "[[\"3\",\"-4\",\"+\"]]",
                "expectedOutput": "-1",
                "isPublic": false
            },
            {
                "input": "[[\"-7\",\"2\",\"/\"]]",
                "expectedOutput": "-3",
                "isPublic": false
            },
            {
                "input": "[[\"7\",\"-3\",\"/\"]]",
                "expectedOutput": "-2",
                "isPublic": false
            },
            {
                "input": "[[\"5\"]]",
                "expectedOutput": "5",
                "isPublic": false
            },
            {
                "input": "[[\"15\",\"7\",\"1\",\"1\",\"+\",\"-\",\"/\",\"3\",\"*\"]]",
                "expectedOutput": "9",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Elemento de Pico",
        "topic": "Array · Busca Binária",
        "entryPoint": "findPeakElement",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Um elemento de uma lista é chamado de **pico** quando é estritamente maior do que os seus vizinhos imediatos. Você recebe uma lista de inteiros `nums` na qual quaisquer dois elementos adjacentes são diferentes entre si. Para efeito de comparação nas extremidades, considere que existem valores imaginários `nums[-1]` e `nums[n]` iguais a `-∞`, de modo que o primeiro e o último elemento também podem ser um pico.\n\nImplemente o método `findPeakElement`, que recebe `nums` e retorna o **índice** de um elemento de pico."
            },
            {
                "type": "text",
                "value": "A lista pode conter mais de um pico. Para que a resposta seja única, é fixado que você deve retornar o pico de **menor índice**.\n\nPor exemplo, para `nums = [1, 2, 1, 3, 5, 6, 4]` existem picos nos índices `1` e `5`; o resultado é `1`, por ser o de menor índice."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 ≤ nums.length ≤ 1000`\n- `-2^31 ≤ nums[i] ≤ 2^31 - 1`\n- `nums[i] != nums[i + 1]` para todo `i` válido"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[]} nums\n   * @return {number}\n   */\n  findPeakElement(nums) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def findPeakElement(self, nums: List[int]) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int findPeakElement(int[] nums) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[1,2,3,1]]",
                "expectedOutput": "2",
                "isPublic": true
            },
            {
                "input": "[[1,2,1,3,5,6,4]]",
                "expectedOutput": "1",
                "isPublic": true
            },
            {
                "input": "[[1]]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[[1,2]]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[[3,2,1]]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[[1,3,2,4,1]]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[[1,2,3,4,5]]",
                "expectedOutput": "4",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Koko Comendo Bananas",
        "topic": "Busca Binária",
        "entryPoint": "minEatingSpeed",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Koko adora bananas. Há `piles.length` pilhas de bananas, e a pilha de índice `i` tem `piles[i]` bananas. Os guardas voltarão em `h` horas.\n\nKoko escolhe uma velocidade de comer `k` (bananas por hora). A cada hora, ela escolhe **uma** pilha e come até `k` bananas dessa pilha. Se a pilha tiver menos do que `k` bananas, ela come todas as restantes e não passa para outra pilha naquela hora.\n\nImplemente o método `minEatingSpeed`, que recebe `piles` e `h` e retorna a **menor** velocidade inteira `k` com a qual Koko consegue comer todas as bananas em no máximo `h` horas."
            },
            {
                "type": "text",
                "value": "Por exemplo, para `piles = [3, 6, 7, 11]` e `h = 8`, o resultado é `4`: com `k = 4` o total de horas é `1 + 2 + 2 + 3 = 8`, e nenhuma velocidade menor cabe em `8` horas."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 ≤ piles.length ≤ 10^4`\n- `piles.length ≤ h ≤ 10^9`\n- `1 ≤ piles[i] ≤ 10^9`"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[]} piles\n   * @param {number} h\n   * @return {number}\n   */\n  minEatingSpeed(piles, h) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def minEatingSpeed(self, piles: List[int], h: int) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int minEatingSpeed(int[] piles, int h) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[3,6,7,11],8]",
                "expectedOutput": "4",
                "isPublic": true
            },
            {
                "input": "[[30,11,23,4,20],5]",
                "expectedOutput": "30",
                "isPublic": true
            },
            {
                "input": "[[30,11,23,4,20],6]",
                "expectedOutput": "23",
                "isPublic": false
            },
            {
                "input": "[[1],1]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[[1000000000],2]",
                "expectedOutput": "500000000",
                "isPublic": false
            },
            {
                "input": "[[3,6,7,11],4]",
                "expectedOutput": "11",
                "isPublic": false
            },
            {
                "input": "[[5,5,5,5],8]",
                "expectedOutput": "3",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Maior Substring Palíndroma",
        "topic": "String · Programação Dinâmica",
        "entryPoint": "longestPalindrome",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Uma substring é palíndroma quando é lida da mesma forma da esquerda para a direita e da direita para a esquerda. Você recebe uma string `s`.\n\nImplemente o método `longestPalindrome`, que recebe `s` e retorna a **maior** substring de `s` que seja um palíndromo."
            },
            {
                "type": "text",
                "value": "Pode haver mais de uma substring palíndroma com o comprimento máximo. Para que a resposta seja única, é fixado que, em caso de empate no comprimento, você deve retornar a de **menor índice inicial**.\n\nPor exemplo, para `s = \"babad\"` as substrings `\"bab\"` e `\"aba\"` têm comprimento `3`; o resultado é `\"bab\"`, por começar antes."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 ≤ s.length ≤ 1000`\n- `s` contém apenas letras minúsculas do alfabeto inglês"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {string} s\n   * @return {string}\n   */\n  longestPalindrome(s) {\n    // sua solução aqui\n  }\n}\n",
            "python": "class Solution:\n    def longestPalindrome(self, s: str) -> str:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public String longestPalindrome(String s) {\n        // sua solução aqui\n        return \"\";\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[\"babad\"]",
                "expectedOutput": "\"bab\"",
                "isPublic": true
            },
            {
                "input": "[\"cbbd\"]",
                "expectedOutput": "\"bb\"",
                "isPublic": true
            },
            {
                "input": "[\"a\"]",
                "expectedOutput": "\"a\"",
                "isPublic": false
            },
            {
                "input": "[\"ac\"]",
                "expectedOutput": "\"a\"",
                "isPublic": false
            },
            {
                "input": "[\"forgeeksskeegfor\"]",
                "expectedOutput": "\"geeksskeeg\"",
                "isPublic": false
            },
            {
                "input": "[\"abcba\"]",
                "expectedOutput": "\"abcba\"",
                "isPublic": false
            },
            {
                "input": "[\"aaaa\"]",
                "expectedOutput": "\"aaaa\"",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Subsequência Comum Mais Longa",
        "topic": "Programação Dinâmica",
        "entryPoint": "longestCommonSubsequence",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Uma **subsequência** de uma string é obtida removendo zero ou mais caracteres, sem alterar a ordem relativa dos caracteres restantes (por exemplo, `\"ace\"` é subsequência de `\"abcde\"`, mas `\"aec\"` não é). Uma subsequência comum a duas strings é uma subsequência de ambas.\n\nVocê recebe duas strings `text1` e `text2`. Implemente o método `longestCommonSubsequence`, que recebe `text1` e `text2` e retorna o **comprimento** da maior subsequência comum às duas. Se não houver nenhuma, retorne `0`."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 ≤ text1.length, text2.length ≤ 1000`\n- `text1` e `text2` contêm apenas letras minúsculas do alfabeto inglês"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {string} text1\n   * @param {string} text2\n   * @return {number}\n   */\n  longestCommonSubsequence(text1, text2) {\n    // sua solução aqui\n  }\n}\n",
            "python": "class Solution:\n    def longestCommonSubsequence(self, text1: str, text2: str) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int longestCommonSubsequence(String text1, String text2) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[\"abcde\",\"ace\"]",
                "expectedOutput": "3",
                "isPublic": true
            },
            {
                "input": "[\"abc\",\"abc\"]",
                "expectedOutput": "3",
                "isPublic": true
            },
            {
                "input": "[\"abc\",\"def\"]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[\"bl\",\"yby\"]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[\"abcba\",\"abcbcba\"]",
                "expectedOutput": "5",
                "isPublic": false
            },
            {
                "input": "[\"ezupkr\",\"ubmrapg\"]",
                "expectedOutput": "2",
                "isPublic": false
            },
            {
                "input": "[\"abcde\",\"aec\"]",
                "expectedOutput": "2",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Casa do Ladrão II",
        "topic": "Programação Dinâmica",
        "entryPoint": "rob",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Um ladrão planeja roubar casas de uma rua. Cada casa guarda uma certa quantia de dinheiro, dada pela lista `nums`. As casas estão dispostas em **círculo**: a primeira e a última são vizinhas. Como o sistema de segurança dispara ao detectar duas casas vizinhas roubadas na mesma noite, o ladrão não pode roubar duas casas adjacentes.\n\nImplemente o método `rob`, que recebe `nums` e retorna a **maior** quantia que o ladrão consegue roubar sem alertar o sistema."
            },
            {
                "type": "text",
                "value": "Por exemplo, para `nums = [2, 3, 2]` o resultado é `3`: embora as casas das pontas guardem `2` cada, elas são vizinhas por causa do círculo, então não podem ser roubadas juntas; roubar apenas a casa do meio rende `3`."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 ≤ nums.length ≤ 100`\n- `0 ≤ nums[i] ≤ 1000`"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[]} nums\n   * @return {number}\n   */\n  rob(nums) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def rob(self, nums: List[int]) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int rob(int[] nums) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[2,3,2]]",
                "expectedOutput": "3",
                "isPublic": true
            },
            {
                "input": "[[1,2,3,1]]",
                "expectedOutput": "4",
                "isPublic": true
            },
            {
                "input": "[[1]]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[[1,2,3]]",
                "expectedOutput": "3",
                "isPublic": false
            },
            {
                "input": "[[200,3,140,20,10]]",
                "expectedOutput": "340",
                "isPublic": false
            },
            {
                "input": "[[2,7,9,3,1]]",
                "expectedOutput": "11",
                "isPublic": false
            },
            {
                "input": "[[1,3,1,3,100]]",
                "expectedOutput": "103",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Laranjas Apodrecendo",
        "topic": "Busca em Largura · Matriz",
        "entryPoint": "orangesRotting",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe uma grade `grid` de tamanho `m x n` em que cada célula pode ter um de três valores:\n\n- `0` representa uma célula vazia;\n- `1` representa uma laranja fresca;\n- `2` representa uma laranja podre.\n\nA cada minuto, qualquer laranja fresca que seja adjacente (nas 4 direções: cima, baixo, esquerda e direita) a uma laranja podre também apodrece.\n\nRetorne o número mínimo de minutos que devem passar até que nenhuma célula tenha uma laranja fresca. Se isso nunca for possível, retorne `-1`. Se não houver nenhuma laranja fresca no início, retorne `0`.\n\nImplemente o método `orangesRotting`, que recebe a grade `grid` e devolve o número de minutos necessário."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `m == grid.length`\n- `n == grid[i].length`\n- `1 <= m, n <= 10`\n- `grid[i][j]` é `0`, `1` ou `2`"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[][]} grid\n   * @return {number}\n   */\n  orangesRotting(grid) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def orangesRotting(self, grid: List[List[int]]) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int orangesRotting(int[][] grid) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[[2,1,1],[1,1,0],[0,1,1]]]",
                "expectedOutput": "4",
                "isPublic": true
            },
            {
                "input": "[[[2,1,1],[0,1,1],[1,0,1]]]",
                "expectedOutput": "-1",
                "isPublic": true
            },
            {
                "input": "[[[0,2]]]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[[[0]]]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[[[1]]]",
                "expectedOutput": "-1",
                "isPublic": false
            },
            {
                "input": "[[[2,2],[1,1]]]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[[[2,1,1],[1,1,1],[0,1,2]]]",
                "expectedOutput": "2",
                "isPublic": false
            },
            {
                "input": "[[[2,0,1]]]",
                "expectedOutput": "-1",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Número de Províncias",
        "topic": "Grafos · Busca em Profundidade",
        "entryPoint": "findCircleNum",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Há `n` cidades. Algumas delas estão conectadas e outras não. Se a cidade `a` está diretamente conectada à cidade `b`, e a cidade `b` está diretamente conectada à cidade `c`, então `a` e `c` estão conectadas indiretamente.\n\nUma província é um grupo de cidades conectadas direta ou indiretamente, sem nenhuma outra cidade fora do grupo.\n\nVocê recebe uma matriz `n x n` chamada `isConnected`, em que `isConnected[i][j] = 1` indica que a i-ésima e a j-ésima cidades estão diretamente conectadas, e `isConnected[i][j] = 0` indica que não estão.\n\nImplemente o método `findCircleNum`, que recebe a matriz de adjacência `isConnected` e devolve o número total de províncias."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 <= n <= 200`\n- `n == isConnected.length`\n- `n == isConnected[i].length`\n- `isConnected[i][j]` é `0` ou `1`\n- `isConnected[i][i] == 1`\n- `isConnected[i][j] == isConnected[j][i]`"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[][]} isConnected\n   * @return {number}\n   */\n  findCircleNum(isConnected) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def findCircleNum(self, isConnected: List[List[int]]) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int findCircleNum(int[][] isConnected) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[[1,1,0],[1,1,0],[0,0,1]]]",
                "expectedOutput": "2",
                "isPublic": true
            },
            {
                "input": "[[[1,0,0],[0,1,0],[0,0,1]]]",
                "expectedOutput": "3",
                "isPublic": true
            },
            {
                "input": "[[[1]]]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[[[1,1,1],[1,1,1],[1,1,1]]]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[[[1,0,0,1],[0,1,1,0],[0,1,1,0],[1,0,0,1]]]",
                "expectedOutput": "2",
                "isPublic": false
            },
            {
                "input": "[[[1,1,0,0,0],[1,1,0,0,0],[0,0,1,1,0],[0,0,1,1,0],[0,0,0,0,1]]]",
                "expectedOutput": "3",
                "isPublic": false
            },
            {
                "input": "[[[1,0,0,1,0],[0,1,0,0,0],[0,0,1,0,0],[1,0,0,1,0],[0,0,0,0,1]]]",
                "expectedOutput": "4",
                "isPublic": false
            },
            {
                "input": "[[[1,1,0,0],[1,1,1,0],[0,1,1,0],[0,0,0,1]]]",
                "expectedOutput": "2",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Substituição de Caractere Repetido",
        "topic": "Janela Deslizante",
        "entryPoint": "characterReplacement",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe uma string `s` formada apenas por letras maiúsculas do alfabeto inglês e um inteiro `k`. Você pode escolher no máximo `k` posições da string e trocar cada uma delas por qualquer outra letra maiúscula.\n\nApós realizar no máximo `k` trocas, retorne o comprimento da maior substring contígua composta por uma única letra repetida que você consegue obter.\n\nImplemente o método `characterReplacement`, que recebe a string `s` e o inteiro `k` e devolve esse comprimento máximo."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 <= s.length <= 10^5`\n- `s` contém apenas letras maiúsculas do alfabeto inglês\n- `0 <= k <= s.length`"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {string} s\n   * @param {number} k\n   * @return {number}\n   */\n  characterReplacement(s, k) {\n    // sua solução aqui\n  }\n}\n",
            "python": "class Solution:\n    def characterReplacement(self, s: str, k: int) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int characterReplacement(String s, int k) {\n        // sua solução aqui\n        return 0;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[\"ABAB\",2]",
                "expectedOutput": "4",
                "isPublic": true
            },
            {
                "input": "[\"AABABBA\",1]",
                "expectedOutput": "4",
                "isPublic": true
            },
            {
                "input": "[\"AAAA\",0]",
                "expectedOutput": "4",
                "isPublic": false
            },
            {
                "input": "[\"ABCDE\",1]",
                "expectedOutput": "2",
                "isPublic": false
            },
            {
                "input": "[\"AAAB\",0]",
                "expectedOutput": "3",
                "isPublic": false
            },
            {
                "input": "[\"ABBB\",2]",
                "expectedOutput": "4",
                "isPublic": false
            },
            {
                "input": "[\"A\",0]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[\"ABAA\",0]",
                "expectedOutput": "2",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Permutação em String",
        "topic": "Janela Deslizante · Tabela Hash",
        "entryPoint": "checkInclusion",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe duas strings `s1` e `s2`. Retorne `true` se `s2` contém alguma permutação de `s1` como substring contígua, ou `false` caso contrário.\n\nEm outras palavras, retorne `true` se alguma reordenação dos caracteres de `s1` aparece como um trecho contíguo dentro de `s2`.\n\nImplemente o método `checkInclusion`, que recebe `s1` e `s2` e devolve o booleano correspondente."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 <= s1.length, s2.length <= 10^4`\n- `s1` e `s2` contêm apenas letras minúsculas do alfabeto inglês"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {string} s1\n   * @param {string} s2\n   * @return {boolean}\n   */\n  checkInclusion(s1, s2) {\n    // sua solução aqui\n  }\n}\n",
            "python": "class Solution:\n    def checkInclusion(self, s1: str, s2: str) -> bool:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public boolean checkInclusion(String s1, String s2) {\n        // sua solução aqui\n        return false;\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[\"ab\",\"eidbaooo\"]",
                "expectedOutput": "true",
                "isPublic": true
            },
            {
                "input": "[\"ab\",\"eidboaoo\"]",
                "expectedOutput": "false",
                "isPublic": true
            },
            {
                "input": "[\"abc\",\"abc\"]",
                "expectedOutput": "true",
                "isPublic": false
            },
            {
                "input": "[\"abc\",\"ab\"]",
                "expectedOutput": "false",
                "isPublic": false
            },
            {
                "input": "[\"a\",\"a\"]",
                "expectedOutput": "true",
                "isPublic": false
            },
            {
                "input": "[\"adc\",\"dcda\"]",
                "expectedOutput": "true",
                "isPublic": false
            },
            {
                "input": "[\"hello\",\"ooolleoooleh\"]",
                "expectedOutput": "false",
                "isPublic": false
            },
            {
                "input": "[\"abcd\",\"dcba\"]",
                "expectedOutput": "true",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Top K Elementos Frequentes",
        "topic": "Tabela Hash · Heap",
        "entryPoint": "topKFrequent",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você recebe um array de inteiros `nums` e um inteiro `k`. Retorne os `k` elementos que aparecem com maior frequência no array.\n\nPara que a resposta seja única, a ordem é fixada: ordene o resultado pela frequência em ordem **decrescente**; em caso de empate na frequência, ordene esses elementos pelo próprio valor em ordem **crescente**.\n\nImplemente o método `topKFrequent`, que recebe o array `nums` e o inteiro `k` e devolve o array com os `k` elementos mais frequentes na ordem especificada."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 <= nums.length <= 10^5`\n- `-10^4 <= nums[i] <= 10^4`\n- `k` está no intervalo `[1, número de elementos distintos em nums]`"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[]} nums\n   * @param {number} k\n   * @return {number[]}\n   */\n  topKFrequent(nums, k) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def topKFrequent(self, nums: List[int], k: int) -> List[int]:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int[] topKFrequent(int[] nums, int k) {\n        // sua solução aqui\n        return new int[0];\n    }\n}\n"
        },
        "tests": [
            {
                "input": "[[1,1,1,2,2,3],2]",
                "expectedOutput": "[1,2]",
                "isPublic": true
            },
            {
                "input": "[[1],1]",
                "expectedOutput": "[1]",
                "isPublic": true
            },
            {
                "input": "[[4,4,4,5,5,6,6,6,6],2]",
                "expectedOutput": "[6,4]",
                "isPublic": false
            },
            {
                "input": "[[1,2,3,4],2]",
                "expectedOutput": "[1,2]",
                "isPublic": false
            },
            {
                "input": "[[5,5,4,4,3,3],3]",
                "expectedOutput": "[3,4,5]",
                "isPublic": false
            },
            {
                "input": "[[-1,-1,2,2,3],1]",
                "expectedOutput": "[-1]",
                "isPublic": false
            },
            {
                "input": "[[7,7,7],1]",
                "expectedOutput": "[7]",
                "isPublic": false
            },
            {
                "input": "[[1,1,2,2,3,3,4],2]",
                "expectedOutput": "[1,2]",
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
                difficulty: "medio",
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
    console.log(`Desafios médios (lote 2) criados: ${criados} (de ${DESAFIOS.length}).`);
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
