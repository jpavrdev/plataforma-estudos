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
