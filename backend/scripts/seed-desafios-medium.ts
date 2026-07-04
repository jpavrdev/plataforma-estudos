// Seed dos desafios médios (formato função, estilo LeetCode). Idempotente por título;
// o número de exibição é atribuído dinamicamente (próximo livre) para não colidir.
//
// Rodar em dev:  node --env-file=.env scripts/seed-desafios-medium.ts
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend \
//                  node scripts/seed-desafios-medium.ts
import { db } from "../db.ts";
import { challenges, challengeTests } from "../schema.ts";
import { eq, sql } from "drizzle-orm";

const DESAFIOS = [
    {
        title: "Substring Sem Repetição",
        topic: "String · Janela Deslizante",
        entryPoint: "lengthOfLongestSubstring",
        statementBlocks: [
            {
                type: "text",
                value: "Dada uma string `s`, encontre o comprimento da maior substring que não contém caracteres repetidos.\n\nUma substring é uma sequência contígua de caracteres dentro de `s`, sem pular posições. Entre todas as substrings possíveis, considere apenas aquelas em que cada caractere aparece uma única vez e retorne o tamanho da mais longa delas.",
            },
            {
                type: "text",
                value: "Por exemplo, em `abcabcbb` a maior substring sem repetição é `abc`, de comprimento 3. Já em `bbbbb` a maior é `b`, de comprimento 1, pois qualquer trecho maior repetiria o caractere `b`. Quando `s` é vazia, o resultado é 0.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `0 ≤ s.length ≤ 5 * 10^4`\n- `s` pode conter letras, dígitos, símbolos e espaços (caracteres ASCII imprimíveis)",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {string} s\n   * @return {number}\n   */\n  lengthOfLongestSubstring(s) {\n    // sua solução aqui\n  }\n}\n",
            python: "class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        # sua solução aqui\n        pass\n",
            java: "public class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // sua solução aqui\n        return 0;\n    }\n}\n",
        },
        tests: [
            {
                input: '["abcabcbb"]',
                expectedOutput: "3",
                isPublic: true,
            },
            {
                input: '["bbbbb"]',
                expectedOutput: "1",
                isPublic: true,
            },
            {
                input: '["pwwkew"]',
                expectedOutput: "3",
                isPublic: true,
            },
            {
                input: '[""]',
                expectedOutput: "0",
                isPublic: false,
            },
            {
                input: '[" "]',
                expectedOutput: "1",
                isPublic: false,
            },
            {
                input: '["abba"]',
                expectedOutput: "2",
                isPublic: false,
            },
        ],
    },
    {
        title: "Produto Exceto Ele Mesmo",
        topic: "Array · Prefixo",
        entryPoint: "productExceptSelf",
        statementBlocks: [
            {
                type: "text",
                value: "Dada uma lista de inteiros `nums`, retorne uma nova lista `resultado` em que `resultado[i]` é igual ao produto de todos os elementos de `nums`, exceto o próprio `nums[i]`.",
            },
            {
                type: "text",
                value: "A solução deve funcionar **sem usar a operação de divisão**. Uma forma de conseguir isso é combinar, para cada posição, o produto de tudo o que está à esquerda dela com o produto de tudo o que está à direita.",
            },
            {
                type: "text",
                value: "Por exemplo, para `nums = [1, 2, 3, 4]` o resultado é `[24, 12, 8, 6]`: na posição 0 fica 2·3·4 = 24, na posição 1 fica 1·3·4 = 12, na posição 2 fica 1·2·4 = 8 e na posição 3 fica 1·2·3 = 6.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `1 ≤ nums.length ≤ 10^5`\n- `-30 ≤ nums[i] ≤ 30`\n- O produto de qualquer prefixo ou sufixo de `nums` cabe em um inteiro de 32 bits\n- Não é permitido usar a operação de divisão",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[]} nums\n   * @return {number[]}\n   */\n  productExceptSelf(nums) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def productExceptSelf(self, nums: List[int]) -> List[int]:\n        # sua solução aqui\n        pass\n",
            java: "public class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        // sua solução aqui\n        return new int[0];\n    }\n}\n",
        },
        tests: [
            {
                input: "[[1,2,3,4]]",
                expectedOutput: "[24,12,8,6]",
                isPublic: true,
            },
            {
                input: "[[-1,1,0,-3,3]]",
                expectedOutput: "[0,0,9,0,0]",
                isPublic: true,
            },
            {
                input: "[[2,3]]",
                expectedOutput: "[3,2]",
                isPublic: true,
            },
            {
                input: "[[0,0]]",
                expectedOutput: "[0,0]",
                isPublic: false,
            },
            {
                input: "[[5]]",
                expectedOutput: "[1]",
                isPublic: false,
            },
            {
                input: "[[-2,-3,-4]]",
                expectedOutput: "[12,8,6]",
                isPublic: false,
            },
        ],
    },
    {
        title: "Recipiente com Mais Água",
        topic: "Array · Dois Ponteiros",
        entryPoint: "maxArea",
        statementBlocks: [
            {
                type: "text",
                value: "Você recebe uma lista de inteiros não negativos `height`, em que `height[i]` é a altura de uma linha vertical desenhada na posição `i`. Cada linha vai do ponto de coordenadas (i, 0) até (i, height[i]).",
            },
            {
                type: "text",
                value: "Escolha duas dessas linhas que, junto com o eixo horizontal, formem um recipiente capaz de reter a maior quantidade de água possível. A área de água entre as linhas nas posições `i` e `j`, com `i < j`, é `(j - i) * min(height[i], height[j])`, pois a água transborda pela linha mais baixa. As linhas não podem ser inclinadas.\n\nRetorne a maior área que pode ser obtida.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `2 ≤ height.length ≤ 10^5`\n- `0 ≤ height[i] ≤ 10^4`",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[]} height\n   * @return {number}\n   */\n  maxArea(height) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def maxArea(self, height: List[int]) -> int:\n        # sua solução aqui\n        pass\n",
            java: "public class Solution {\n    public int maxArea(int[] height) {\n        // sua solução aqui\n        return 0;\n    }\n}\n",
        },
        tests: [
            {
                input: "[[1,8,6,2,5,4,8,3,7]]",
                expectedOutput: "49",
                isPublic: true,
            },
            {
                input: "[[1,1]]",
                expectedOutput: "1",
                isPublic: true,
            },
            {
                input: "[[4,3,2,1,4]]",
                expectedOutput: "16",
                isPublic: true,
            },
            {
                input: "[[1,2,1]]",
                expectedOutput: "2",
                isPublic: false,
            },
            {
                input: "[[2,3,4,5,18,17,6]]",
                expectedOutput: "17",
                isPublic: false,
            },
            {
                input: "[[1,2,4,3]]",
                expectedOutput: "4",
                isPublic: false,
            },
        ],
    },
    {
        title: "Troco de Moedas",
        topic: "Programação Dinâmica",
        entryPoint: "coinChange",
        statementBlocks: [
            {
                type: "text",
                value: "Você recebe uma lista `coins` com os valores das moedas disponíveis e um inteiro `amount` que representa uma quantia total. Há moedas em quantidade ilimitada de cada valor.",
            },
            {
                type: "text",
                value: "Retorne o **menor número de moedas** necessário para somar exatamente `amount`. Se não for possível formar essa quantia com nenhuma combinação das moedas dadas, retorne `-1`. Quando `amount` for 0, a resposta é 0, pois nenhuma moeda é necessária.",
            },
            {
                type: "text",
                value: "Por exemplo, com `coins = [1, 2, 5]` e `amount = 11`, a melhor combinação é 5 + 5 + 1, que usa 3 moedas, então a resposta é 3.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `1 ≤ coins.length ≤ 12`\n- `1 ≤ coins[i] ≤ 2^31 - 1`\n- `0 ≤ amount ≤ 10^4`\n- Cada valor de moeda pode ser usado quantas vezes for preciso",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[]} coins\n   * @param {number} amount\n   * @return {number}\n   */\n  coinChange(coins, amount) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def coinChange(self, coins: List[int], amount: int) -> int:\n        # sua solução aqui\n        pass\n",
            java: "public class Solution {\n    public int coinChange(int[] coins, int amount) {\n        // sua solução aqui\n        return 0;\n    }\n}\n",
        },
        tests: [
            {
                input: "[[1,2,5], 11]",
                expectedOutput: "3",
                isPublic: true,
            },
            {
                input: "[[2], 3]",
                expectedOutput: "-1",
                isPublic: true,
            },
            {
                input: "[[1,2,5], 100]",
                expectedOutput: "20",
                isPublic: true,
            },
            {
                input: "[[1,2,5], 0]",
                expectedOutput: "0",
                isPublic: false,
            },
            {
                input: "[[5,7], 1]",
                expectedOutput: "-1",
                isPublic: false,
            },
            {
                input: "[[186,419,83,408], 6249]",
                expectedOutput: "20",
                isPublic: false,
            },
        ],
    },
    {
        title: "Assaltante de Casas",
        topic: "Programação Dinâmica",
        entryPoint: "rob",
        statementBlocks: [
            {
                type: "text",
                value: "Você é um assaltante planejando roubar casas ao longo de uma rua. Cada casa guarda uma certa quantia de dinheiro, informada na lista `nums`, em que `nums[i]` é o valor guardado na casa da posição `i`.",
            },
            {
                type: "text",
                value: "Há um detalhe: casas adjacentes possuem alarmes conectados, e o alarme dispara automaticamente se duas casas vizinhas forem roubadas na mesma noite. Determine a **maior quantia** que você consegue roubar sem nunca escolher duas casas consecutivas. Quando a rua estiver vazia, a resposta é 0.",
            },
            {
                type: "text",
                value: "Por exemplo, para `nums = [2, 7, 9, 3, 1]` a melhor escolha é roubar as casas das posições 0, 2 e 4 (valores 2, 9 e 1), somando 12.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `0 ≤ nums.length ≤ 100`\n- `0 ≤ nums[i] ≤ 400`",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[]} nums\n   * @return {number}\n   */\n  rob(nums) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def rob(self, nums: List[int]) -> int:\n        # sua solução aqui\n        pass\n",
            java: "public class Solution {\n    public int rob(int[] nums) {\n        // sua solução aqui\n        return 0;\n    }\n}\n",
        },
        tests: [
            {
                input: "[[1,2,3,1]]",
                expectedOutput: "4",
                isPublic: true,
            },
            {
                input: "[[2,7,9,3,1]]",
                expectedOutput: "12",
                isPublic: true,
            },
            {
                input: "[[5]]",
                expectedOutput: "5",
                isPublic: true,
            },
            {
                input: "[[2,1,1,2]]",
                expectedOutput: "4",
                isPublic: false,
            },
            {
                input: "[[]]",
                expectedOutput: "0",
                isPublic: false,
            },
            {
                input: "[[2,7,9,3,1,5,8]]",
                expectedOutput: "20",
                isPublic: false,
            },
        ],
    },
    {
        title: "Quebra de Palavras",
        topic: "Programação Dinâmica · String",
        entryPoint: "wordBreak",
        statementBlocks: [
            {
                type: "text",
                value: "Dada uma string `s` e uma lista de palavras `wordDict`, determine se `s` pode ser segmentada em uma sequência de uma ou mais palavras que estejam presentes no dicionário.\n\nAs palavras do dicionário podem ser reutilizadas quantas vezes forem necessárias, e toda a string `s` precisa ser coberta pela segmentação, sem sobrar nenhum caractere. Retorne `true` se existir ao menos uma forma de quebrar `s` dessa maneira e `false` caso contrário.",
            },
            {
                type: "text",
                value: "Por exemplo, com `s = applepenapple` e o dicionário contendo `apple` e `pen`, a resposta é `true`: `s` pode ser dividida em `apple` + `pen` + `apple`, reutilizando a palavra `apple`. Já `catsandog` não pode ser formada a partir de `cats`, `dog`, `sand`, `and` e `cat`, então o resultado seria `false`.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `1 ≤ s.length ≤ 300`\n- `1 ≤ wordDict.length ≤ 1000`\n- `1 ≤ wordDict[i].length ≤ 20`\n- `s` e `wordDict[i]` contêm apenas letras minúsculas do alfabeto inglês\n- todas as palavras de `wordDict` são distintas",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {string} s\n   * @param {string[]} wordDict\n   * @return {boolean}\n   */\n  wordBreak(s, wordDict) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def wordBreak(self, s: str, wordDict: List[str]) -> bool:\n        # sua solução aqui\n        pass\n",
            java: "public class Solution {\n    public boolean wordBreak(String s, String[] wordDict) {\n        // sua solução aqui\n        return false;\n    }\n}\n",
        },
        tests: [
            {
                input: '["leetcode", ["leet","code"]]',
                expectedOutput: "true",
                isPublic: true,
            },
            {
                input: '["catsandog", ["cats","dog","sand","and","cat"]]',
                expectedOutput: "false",
                isPublic: true,
            },
            {
                input: '["applepenapple", ["apple","pen"]]',
                expectedOutput: "true",
                isPublic: false,
            },
            {
                input: '["a", ["a"]]',
                expectedOutput: "true",
                isPublic: false,
            },
            {
                input: '["b", ["a"]]',
                expectedOutput: "false",
                isPublic: false,
            },
            {
                input: '["aaaaaaa", ["aaaa","aaa"]]',
                expectedOutput: "true",
                isPublic: false,
            },
        ],
    },
    {
        title: "Caminhos Únicos",
        topic: "Programação Dinâmica · Matemática",
        entryPoint: "uniquePaths",
        statementBlocks: [
            {
                type: "text",
                value: "Um robô está no canto superior-esquerdo de uma grade com `m` linhas e `n` colunas e quer chegar ao canto inferior-direito dela.\n\nA cada passo, o robô só pode se mover uma casa para a direita ou uma casa para baixo, nunca para cima nem para a esquerda. Conte de quantas maneiras distintas ele consegue chegar do canto superior-esquerdo ao canto inferior-direito.",
            },
            {
                type: "text",
                value: "Implemente o método `uniquePaths`, que recebe as dimensões `m` e `n` da grade e retorna o número total de caminhos diferentes.\n\nPor exemplo, numa grade com `m = 3` linhas e `n = 2` colunas existem `3` caminhos distintos até o destino.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `1 ≤ m ≤ 100`\n- `1 ≤ n ≤ 100`\n- Os casos de teste garantem que o resultado cabe em um inteiro de 32 bits.",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number} m\n   * @param {number} n\n   * @return {number}\n   */\n  uniquePaths(m, n) {\n    // sua solução aqui\n  }\n}\n",
            python: "class Solution:\n    def uniquePaths(self, m: int, n: int) -> int:\n        # sua solução aqui\n        pass\n",
            java: "public class Solution {\n    public int uniquePaths(int m, int n) {\n        // sua solução aqui\n        return 0;\n    }\n}\n",
        },
        tests: [
            {
                input: "[3, 7]",
                expectedOutput: "28",
                isPublic: true,
            },
            {
                input: "[3, 2]",
                expectedOutput: "3",
                isPublic: true,
            },
            {
                input: "[1, 1]",
                expectedOutput: "1",
                isPublic: false,
            },
            {
                input: "[1, 10]",
                expectedOutput: "1",
                isPublic: false,
            },
            {
                input: "[10, 10]",
                expectedOutput: "48620",
                isPublic: false,
            },
            {
                input: "[7, 3]",
                expectedOutput: "28",
                isPublic: false,
            },
        ],
    },
    {
        title: "Jogo do Pulo",
        topic: "Array · Guloso",
        entryPoint: "canJump",
        statementBlocks: [
            {
                type: "text",
                value: "Você recebe uma lista de inteiros não negativos `nums`. Você começa na primeira posição da lista (índice `0`), e cada valor `nums[i]` indica o comprimento máximo do pulo que você pode dar a partir do índice `i`.\n\nOu seja, estando no índice `i`, você pode avançar para qualquer índice entre `i + 1` e `i + nums[i]`, desde que ele exista na lista.",
            },
            {
                type: "text",
                value: "Determine se é possível chegar ao último índice da lista partindo do índice `0`. Retorne `true` quando existir alguma sequência de pulos que alcance o final e `false` caso contrário.\n\nRepare que, se a lista tiver um único elemento, você já começa no último índice, então a resposta é `true`.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `1 ≤ nums.length ≤ 10^4`\n- `0 ≤ nums[i] ≤ 10^5`",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[]} nums\n   * @return {boolean}\n   */\n  canJump(nums) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def canJump(self, nums: List[int]) -> bool:\n        # sua solução aqui\n        pass\n",
            java: "public class Solution {\n    public boolean canJump(int[] nums) {\n        // sua solução aqui\n        return false;\n    }\n}\n",
        },
        tests: [
            {
                input: "[[2,3,1,1,4]]",
                expectedOutput: "true",
                isPublic: true,
            },
            {
                input: "[[3,2,1,0,4]]",
                expectedOutput: "false",
                isPublic: true,
            },
            {
                input: "[[0]]",
                expectedOutput: "true",
                isPublic: false,
            },
            {
                input: "[[2,0,0]]",
                expectedOutput: "true",
                isPublic: false,
            },
            {
                input: "[[1,0,1,0]]",
                expectedOutput: "false",
                isPublic: false,
            },
            {
                input: "[[5,0,0,0,0,0]]",
                expectedOutput: "true",
                isPublic: false,
            },
        ],
    },
    {
        title: "Busca em Vetor Rotacionado",
        topic: "Array · Busca Binária",
        entryPoint: "search",
        statementBlocks: [
            {
                type: "text",
                value: "Você recebe um vetor de inteiros `nums`, originalmente ordenado em ordem crescente e com todos os valores distintos, que foi rotacionado em torno de um pivô desconhecido. Depois da rotação, o vetor assume a forma `[nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]]` para algum índice `k`.\n\nPor exemplo, `[0,1,2,4,5,6,7]` pode virar `[4,5,6,7,0,1,2]` após uma rotação.",
            },
            {
                type: "text",
                value: "Dado o vetor rotacionado `nums` e um inteiro `target`, retorne o índice de `target` em `nums`, ou `-1` se ele não estiver presente.\n\nEspera-se uma solução com complexidade de tempo `O(log n)`, aproveitando o fato de que o vetor, apesar de rotacionado, ainda é formado por dois trechos ordenados.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `1 ≤ nums.length ≤ 5000`\n- `-10^4 ≤ nums[i] ≤ 10^4`\n- Todos os valores de `nums` são distintos\n- `-10^4 ≤ target ≤ 10^4`",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[]} nums\n   * @param {number} target\n   * @return {number}\n   */\n  search(nums, target) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def search(self, nums: List[int], target: int) -> int:\n        # sua solução aqui\n        pass\n",
            java: "public class Solution {\n    public int search(int[] nums, int target) {\n        // sua solução aqui\n        return -1;\n    }\n}\n",
        },
        tests: [
            {
                input: "[[4,5,6,7,0,1,2], 0]",
                expectedOutput: "4",
                isPublic: true,
            },
            {
                input: "[[4,5,6,7,0,1,2], 3]",
                expectedOutput: "-1",
                isPublic: true,
            },
            {
                input: "[[1], 0]",
                expectedOutput: "-1",
                isPublic: false,
            },
            {
                input: "[[1], 1]",
                expectedOutput: "0",
                isPublic: false,
            },
            {
                input: "[[5,1,3], 5]",
                expectedOutput: "0",
                isPublic: false,
            },
            {
                input: "[[6,7,0,1,2,4,5], 4]",
                expectedOutput: "5",
                isPublic: false,
            },
        ],
    },
    {
        title: "Primeira e Última Posição",
        topic: "Array · Busca Binária",
        entryPoint: "searchRange",
        statementBlocks: [
            {
                type: "text",
                value: "Você recebe um vetor de inteiros `nums` ordenado em ordem não decrescente (pode haver valores repetidos) e um inteiro `target`. Encontre a primeira e a última posição em que `target` aparece em `nums`.\n\nRetorne um vetor com dois elementos no formato `[primeiro, ultimo]`, onde `primeiro` é o menor índice e `ultimo` é o maior índice em que `target` ocorre. Se `target` não estiver em `nums`, retorne `[-1, -1]`.",
            },
            {
                type: "text",
                value: "Por exemplo, em `nums = [5,7,7,8,8,10]` com `target = 8`, o valor `8` aparece nos índices `3` e `4`, então o resultado é `[3, 4]`.\n\nEspera-se uma solução com complexidade de tempo `O(log n)`.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `0 ≤ nums.length ≤ 10^5`\n- `-10^9 ≤ nums[i] ≤ 10^9`\n- `nums` está ordenado em ordem não decrescente\n- `-10^9 ≤ target ≤ 10^9`",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[]} nums\n   * @param {number} target\n   * @return {number[]}\n   */\n  searchRange(nums, target) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def searchRange(self, nums: List[int], target: int) -> List[int]:\n        # sua solução aqui\n        pass\n",
            java: "public class Solution {\n    public int[] searchRange(int[] nums, int target) {\n        // sua solução aqui\n        return new int[]{-1, -1};\n    }\n}\n",
        },
        tests: [
            {
                input: "[[5,7,7,8,8,10], 8]",
                expectedOutput: "[3,4]",
                isPublic: true,
            },
            {
                input: "[[5,7,7,8,8,10], 6]",
                expectedOutput: "[-1,-1]",
                isPublic: true,
            },
            {
                input: "[[], 0]",
                expectedOutput: "[-1,-1]",
                isPublic: false,
            },
            {
                input: "[[1], 1]",
                expectedOutput: "[0,0]",
                isPublic: false,
            },
            {
                input: "[[2,2,2,2], 2]",
                expectedOutput: "[0,3]",
                isPublic: false,
            },
            {
                input: "[[1,2,3], 3]",
                expectedOutput: "[2,2]",
                isPublic: false,
            },
        ],
    },
    {
        title: "Mesclar Intervalos",
        topic: "Array · Ordenação",
        entryPoint: "merge",
        statementBlocks: [
            {
                type: "text",
                value: "Você recebe uma lista `intervals`, em que cada elemento é um intervalo no formato `[inicio, fim]`, representando todos os números entre `inicio` e `fim`, incluindo as duas pontas.\n\nMescle todos os intervalos que se sobrepõem e devolva a lista dos intervalos resultantes, ordenada em ordem crescente pelo início de cada intervalo. Dois intervalos se sobrepõem quando compartilham ao menos um ponto, inclusive quando apenas se tocam nas pontas: `[1, 4]` e `[4, 5]` se combinam em `[1, 5]`.",
            },
            {
                type: "text",
                value: "Por exemplo, em `[[1,3],[2,6],[8,10],[15,18]]` os intervalos `[1,3]` e `[2,6]` se sobrepõem e formam `[1,6]`, enquanto `[8,10]` e `[15,18]` permanecem intactos. O resultado é `[[1,6],[8,10],[15,18]]`.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `1 <= intervals.length <= 10^4`\n- Cada intervalo tem exatamente dois valores, `inicio` e `fim`, com `inicio <= fim`\n- `0 <= inicio <= fim <= 10^4`\n- A lista de entrada não vem necessariamente ordenada",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[][]} intervals\n   * @return {number[][]}\n   */\n  merge(intervals) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def merge(self, intervals: List[List[int]]) -> List[List[int]]:\n        # sua solução aqui\n        pass\n",
            java: "public class Solution {\n    public int[][] merge(int[][] intervals) {\n        // sua solução aqui\n        return new int[0][];\n    }\n}\n",
        },
        tests: [
            {
                input: "[[[1,3],[2,6],[8,10],[15,18]]]",
                expectedOutput: "[[1,6],[8,10],[15,18]]",
                isPublic: true,
            },
            {
                input: "[[[1,4],[4,5]]]",
                expectedOutput: "[[1,5]]",
                isPublic: true,
            },
            {
                input: "[[[1,4],[2,3]]]",
                expectedOutput: "[[1,4]]",
                isPublic: false,
            },
            {
                input: "[[[2,3],[4,5],[6,7],[1,10]]]",
                expectedOutput: "[[1,10]]",
                isPublic: false,
            },
            {
                input: "[[[1,4]]]",
                expectedOutput: "[[1,4]]",
                isPublic: false,
            },
            {
                input: "[[[1,3],[5,8],[2,4]]]",
                expectedOutput: "[[1,4],[5,8]]",
                isPublic: false,
            },
        ],
    },
    {
        title: "Zerar Matriz",
        topic: "Array · Matriz",
        entryPoint: "setZeroes",
        statementBlocks: [
            {
                type: "text",
                value: "Você recebe uma matriz `matrix` de dimensões `m x n` preenchida com números inteiros. Se algum elemento for igual a `0`, transforme em `0` todos os elementos da mesma linha e da mesma coluna desse elemento.\n\nDevolva a matriz já modificada.",
            },
            {
                type: "text",
                value: "A decisão sobre quais linhas e colunas zerar depende apenas das posições dos zeros na matriz original. Um zero que surge durante o processo não deve provocar novas linhas ou colunas zeradas: use as posições dos zeros iniciais como referência.",
            },
            {
                type: "text",
                value: "Por exemplo, para `[[1,1,1],[1,0,1],[1,1,1]]` o único zero está no centro, então a linha do meio e a coluna do meio são zeradas, resultando em `[[1,0,1],[0,0,0],[1,0,1]]`.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `m == matrix.length`\n- `n == matrix[0].length`\n- `1 <= m, n <= 200`\n- `-2^31 <= matrix[i][j] <= 2^31 - 1`",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[][]} matrix\n   * @return {number[][]}\n   */\n  setZeroes(matrix) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def setZeroes(self, matrix: List[List[int]]) -> List[List[int]]:\n        # sua solução aqui\n        pass\n",
            java: "public class Solution {\n    public int[][] setZeroes(int[][] matrix) {\n        // sua solução aqui\n        return matrix;\n    }\n}\n",
        },
        tests: [
            {
                input: "[[[1,1,1],[1,0,1],[1,1,1]]]",
                expectedOutput: "[[1,0,1],[0,0,0],[1,0,1]]",
                isPublic: true,
            },
            {
                input: "[[[0,1,2,0],[3,4,5,2],[1,3,1,5]]]",
                expectedOutput: "[[0,0,0,0],[0,4,5,0],[0,3,1,0]]",
                isPublic: true,
            },
            {
                input: "[[[1,2,3],[4,5,6]]]",
                expectedOutput: "[[1,2,3],[4,5,6]]",
                isPublic: false,
            },
            {
                input: "[[[0]]]",
                expectedOutput: "[[0]]",
                isPublic: false,
            },
            {
                input: "[[[5]]]",
                expectedOutput: "[[5]]",
                isPublic: false,
            },
            {
                input: "[[[1,0],[0,1]]]",
                expectedOutput: "[[0,0],[0,0]]",
                isPublic: false,
            },
        ],
    },
    {
        title: "Matriz em Espiral",
        topic: "Array · Matriz",
        entryPoint: "spiralOrder",
        statementBlocks: [
            {
                type: "text",
                value: "Você recebe uma matriz `matrix` de dimensões `m x n`. Devolva uma lista com todos os elementos da matriz percorridos em espiral, no sentido horário, começando pelo canto superior esquerdo.\n\nO percurso avança pela primeira linha da esquerda para a direita, depois desce pela última coluna, segue pela última linha da direita para a esquerda, sobe pela primeira coluna e continua girando para dentro até visitar todos os elementos exatamente uma vez.",
            },
            {
                type: "text",
                value: "Por exemplo, para `[[1,2,3],[4,5,6],[7,8,9]]` o percurso visita `1, 2, 3` na primeira linha, desce para `6, 9`, volta por `8, 7`, sobe para `4` e termina no centro `5`, produzindo `[1,2,3,6,9,8,7,4,5]`.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `m == matrix.length`\n- `n == matrix[0].length`\n- `1 <= m, n <= 100`\n- `-100 <= matrix[i][j] <= 100`",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[][]} matrix\n   * @return {number[]}\n   */\n  spiralOrder(matrix) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def spiralOrder(self, matrix: List[List[int]]) -> List[int]:\n        # sua solução aqui\n        pass\n",
            java: "public class Solution {\n    public int[] spiralOrder(int[][] matrix) {\n        // sua solução aqui\n        return new int[0];\n    }\n}\n",
        },
        tests: [
            {
                input: "[[[1,2,3],[4,5,6],[7,8,9]]]",
                expectedOutput: "[1,2,3,6,9,8,7,4,5]",
                isPublic: true,
            },
            {
                input: "[[[1,2,3,4],[5,6,7,8],[9,10,11,12]]]",
                expectedOutput: "[1,2,3,4,8,12,11,10,9,5,6,7]",
                isPublic: true,
            },
            {
                input: "[[[1]]]",
                expectedOutput: "[1]",
                isPublic: false,
            },
            {
                input: "[[[1,2,3,4]]]",
                expectedOutput: "[1,2,3,4]",
                isPublic: false,
            },
            {
                input: "[[[1],[2],[3]]]",
                expectedOutput: "[1,2,3]",
                isPublic: false,
            },
            {
                input: "[[[1,2],[3,4]]]",
                expectedOutput: "[1,2,4,3]",
                isPublic: false,
            },
        ],
    },
    {
        title: "Rotacionar Imagem",
        topic: "Array · Matriz",
        entryPoint: "rotate",
        statementBlocks: [
            {
                type: "text",
                value: "Você recebe uma matriz quadrada `matrix` de dimensões `n x n`, que representa uma imagem. Rotacione a imagem em 90 graus no sentido horário e devolva a matriz resultante.\n\nNa rotação de 90 graus no sentido horário, a primeira linha da matriz original passa a ser a última coluna, a segunda linha passa a ser a penúltima coluna, e assim por diante.",
            },
            {
                type: "text",
                value: "Por exemplo, para `[[1,2,3],[4,5,6],[7,8,9]]` a rotação produz `[[7,4,1],[8,5,2],[9,6,3]]`: a primeira coluna do resultado, de cima para baixo, é a primeira linha original lida de baixo para cima.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `n == matrix.length == matrix[i].length`\n- `1 <= n <= 20`\n- `-1000 <= matrix[i][j] <= 1000`",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[][]} matrix\n   * @return {number[][]}\n   */\n  rotate(matrix) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def rotate(self, matrix: List[List[int]]) -> List[List[int]]:\n        # sua solução aqui\n        pass\n",
            java: "public class Solution {\n    public int[][] rotate(int[][] matrix) {\n        // sua solução aqui\n        return matrix;\n    }\n}\n",
        },
        tests: [
            {
                input: "[[[1,2,3],[4,5,6],[7,8,9]]]",
                expectedOutput: "[[7,4,1],[8,5,2],[9,6,3]]",
                isPublic: true,
            },
            {
                input: "[[[1,2],[3,4]]]",
                expectedOutput: "[[3,1],[4,2]]",
                isPublic: true,
            },
            {
                input: "[[[1]]]",
                expectedOutput: "[[1]]",
                isPublic: false,
            },
            {
                input: "[[[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]]",
                expectedOutput: "[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]",
                isPublic: false,
            },
            {
                input: "[[[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16]]]",
                expectedOutput: "[[13,9,5,1],[14,10,6,2],[15,11,7,3],[16,12,8,4]]",
                isPublic: false,
            },
            {
                input: "[[[0,1],[2,3]]]",
                expectedOutput: "[[2,0],[3,1]]",
                isPublic: false,
            },
        ],
    },
    {
        title: "K-ésimo Maior Elemento",
        topic: "Array · Ordenação",
        entryPoint: "findKthLargest",
        statementBlocks: [
            {
                type: "text",
                value: "Você recebe uma lista de inteiros `nums` e um número inteiro `k`. Devolva o `k`-ésimo maior elemento de `nums`.\n\nO `k`-ésimo maior é o elemento que ocupa a posição `k` quando a lista é ordenada em ordem decrescente. Considere a posição na ordem, e não o `k`-ésimo valor distinto: se houver valores repetidos, cada repetição conta como uma posição.",
            },
            {
                type: "text",
                value: "Por exemplo, em `[3,2,3,1,2,4,5,5,6]` com `k = 4`, a lista ordenada de forma decrescente é `[6,5,5,4,3,3,2,2,1]`, cujo quarto elemento é `4`. Repare que o `6` e os dois `5` ocupam as três primeiras posições, mesmo o `5` sendo repetido.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `1 <= k <= nums.length <= 10^4`\n- `-10^4 <= nums[i] <= 10^4`",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[]} nums\n   * @param {number} k\n   * @return {number}\n   */\n  findKthLargest(nums, k) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def findKthLargest(self, nums: List[int], k: int) -> int:\n        # sua solução aqui\n        pass\n",
            java: "public class Solution {\n    public int findKthLargest(int[] nums, int k) {\n        // sua solução aqui\n        return 0;\n    }\n}\n",
        },
        tests: [
            {
                input: "[[3,2,1,5,6,4], 2]",
                expectedOutput: "5",
                isPublic: true,
            },
            {
                input: "[[3,2,3,1,2,4,5,5,6], 4]",
                expectedOutput: "4",
                isPublic: true,
            },
            {
                input: "[[1], 1]",
                expectedOutput: "1",
                isPublic: false,
            },
            {
                input: "[[2,1], 2]",
                expectedOutput: "1",
                isPublic: false,
            },
            {
                input: "[[7,7,7,7], 3]",
                expectedOutput: "7",
                isPublic: false,
            },
            {
                input: "[[-1,-1,0,2], 4]",
                expectedOutput: "-1",
                isPublic: false,
            },
        ],
    },
    {
        title: "Temperaturas Diárias",
        topic: "Array · Pilha",
        entryPoint: "dailyTemperatures",
        statementBlocks: [
            {
                type: "text",
                value: "Você recebe a lista `temperatures`, em que `temperatures[i]` é a temperatura registrada no dia `i`. Para cada dia, descubra quantos dias você precisa esperar até que a temperatura fique mais alta do que a daquele dia.\n\nRetorne uma lista `answer` do mesmo tamanho de `temperatures`, na qual `answer[i]` é a quantidade de dias entre o dia `i` e o primeiro dia seguinte com temperatura estritamente maior. Se não existir nenhum dia futuro mais quente, `answer[i]` vale `0`.",
            },
            {
                type: "text",
                value: "Por exemplo, para `temperatures = [73, 74, 75, 71, 69, 72, 76, 73]`, a resposta é `[1, 1, 4, 2, 1, 1, 0, 0]`: do dia `0` (73 graus) basta esperar `1` dia até o `74`, enquanto o dia `6` (76 graus) e o dia `7` (73 graus) nunca encontram um dia mais quente à frente.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `1 <= temperatures.length <= 10^5`\n- `30 <= temperatures[i] <= 100`\n- Uma temperatura mais alta significa estritamente maior; dias com temperatura igual não contam.",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[]} temperatures\n   * @return {number[]}\n   */\n  dailyTemperatures(temperatures) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:\n        # sua solução aqui\n        pass\n",
            java: "public class Solution {\n    public int[] dailyTemperatures(int[] temperatures) {\n        // sua solução aqui\n        return new int[0];\n    }\n}\n",
        },
        tests: [
            {
                input: "[[73,74,75,71,69,72,76,73]]",
                expectedOutput: "[1,1,4,2,1,1,0,0]",
                isPublic: true,
            },
            {
                input: "[[30,40,50,60]]",
                expectedOutput: "[1,1,1,0]",
                isPublic: true,
            },
            {
                input: "[[30,60,90]]",
                expectedOutput: "[1,1,0]",
                isPublic: true,
            },
            {
                input: "[[90,80,70,60]]",
                expectedOutput: "[0,0,0,0]",
                isPublic: false,
            },
            {
                input: "[[55,55,55]]",
                expectedOutput: "[0,0,0]",
                isPublic: false,
            },
            {
                input: "[[89,62,70,58,47,47,46,76,100,70]]",
                expectedOutput: "[8,1,5,4,3,2,1,1,0,0]",
                isPublic: false,
            },
        ],
    },
    {
        title: "Número de Ilhas",
        topic: "Grafos · Busca em Profundidade",
        entryPoint: "numIslands",
        statementBlocks: [
            {
                type: "text",
                value: "Você recebe uma matriz `grid` de tamanho `m x n` formada por `0` e `1`, em que `1` representa terra e `0` representa água. Uma ilha é um grupo de células de terra conectadas na horizontal ou na vertical.\n\nConte quantas ilhas existem em `grid`.",
            },
            {
                type: "text",
                value: "Duas células de terra pertencem à mesma ilha quando dá para ir de uma até a outra andando apenas por terra, movendo-se para cima, para baixo, para a esquerda ou para a direita. Células que se tocam somente pelos cantos (na diagonal) não estão conectadas. Você pode assumir que toda a borda da matriz está cercada por água.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `m == grid.length`\n- `n == grid[i].length`\n- `1 <= m, n <= 300`\n- Cada célula de `grid` vale `0` (água) ou `1` (terra).",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[][]} grid\n   * @return {number}\n   */\n  numIslands(grid) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def numIslands(self, grid: List[List[int]]) -> int:\n        # sua solução aqui\n        pass\n",
            java: "public class Solution {\n    public int numIslands(int[][] grid) {\n        // sua solução aqui\n        return 0;\n    }\n}\n",
        },
        tests: [
            {
                input: "[[[1,1,1,1,0],[1,1,0,1,0],[1,1,0,0,0],[0,0,0,0,0]]]",
                expectedOutput: "1",
                isPublic: true,
            },
            {
                input: "[[[1,1,0,0,0],[1,1,0,0,0],[0,0,1,0,0],[0,0,0,1,1]]]",
                expectedOutput: "3",
                isPublic: true,
            },
            {
                input: "[[[0,0,0],[0,0,0]]]",
                expectedOutput: "0",
                isPublic: true,
            },
            {
                input: "[[[1,1,1],[1,1,1]]]",
                expectedOutput: "1",
                isPublic: false,
            },
            {
                input: "[[[1,0,1,0,1]]]",
                expectedOutput: "3",
                isPublic: false,
            },
            {
                input: "[[[1,0,0],[0,1,0],[0,0,1]]]",
                expectedOutput: "3",
                isPublic: false,
            },
        ],
    },
    {
        title: "Cronograma de Cursos",
        topic: "Grafos · Ordenação Topológica",
        entryPoint: "canFinish",
        statementBlocks: [
            {
                type: "text",
                value: "Há `numCourses` cursos numerados de `0` até `numCourses - 1`. Os pré-requisitos vêm na lista `prerequisites`, em que cada par `prerequisites[i] = [a, b]` significa que o curso `b` precisa ser concluído antes do curso `a`.\n\nDetermine se é possível concluir todos os cursos. Retorne `true` quando existe uma ordem que respeita todos os pré-requisitos e `false` caso contrário.",
            },
            {
                type: "text",
                value: "Concluir todos os cursos é impossível apenas quando os pré-requisitos formam um ciclo, ou seja, quando um curso depende, direta ou indiretamente, de si mesmo. Sem nenhum ciclo, sempre existe pelo menos uma ordem válida para cursar tudo.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `1 <= numCourses <= 2000`\n- `0 <= prerequisites.length <= 5000`\n- `prerequisites[i].length == 2`\n- `0 <= a, b < numCourses`\n- Todos os pares `[a, b]` são distintos.",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number} numCourses\n   * @param {number[][]} prerequisites\n   * @return {boolean}\n   */\n  canFinish(numCourses, prerequisites) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:\n        # sua solução aqui\n        pass\n",
            java: "public class Solution {\n    public boolean canFinish(int numCourses, int[][] prerequisites) {\n        // sua solução aqui\n        return false;\n    }\n}\n",
        },
        tests: [
            {
                input: "[2, [[1,0]]]",
                expectedOutput: "true",
                isPublic: true,
            },
            {
                input: "[2, [[1,0],[0,1]]]",
                expectedOutput: "false",
                isPublic: true,
            },
            {
                input: "[1, []]",
                expectedOutput: "true",
                isPublic: true,
            },
            {
                input: "[5, [[1,0],[2,1],[3,2],[4,3]]]",
                expectedOutput: "true",
                isPublic: false,
            },
            {
                input: "[3, [[0,1],[1,2],[2,0]]]",
                expectedOutput: "false",
                isPublic: false,
            },
            {
                input: "[4, [[1,0],[2,0],[3,1],[3,2]]]",
                expectedOutput: "true",
                isPublic: false,
            },
        ],
    },
    {
        title: "Formas de Decodificar",
        topic: "String · Programação Dinâmica",
        entryPoint: "numDecodings",
        statementBlocks: [
            {
                type: "text",
                value: "Uma mensagem com letras de `A` a `Z` foi codificada em números usando o mapeamento `A -> 1`, `B -> 2`, ..., `Z -> 26`. Para decodificar, os dígitos são agrupados e cada grupo vira uma letra, sempre usando um número entre `1` e `26`.\n\nDada uma string `s` formada apenas por dígitos, retorne de quantas maneiras diferentes ela pode ser decodificada.",
            },
            {
                type: "text",
                value: "Um mesmo texto de dígitos pode ter várias leituras. Por exemplo, `226` pode ser lido como `2 26` (BZ), `22 6` (VF) ou `2 2 6` (BBF), num total de `3` formas. O dígito `0` não vira letra sozinho: ele só é válido quando forma `10` ou `20` junto do dígito anterior. Assim, uma string que começa com `0`, ou que tenha um `0` sem par válido, resulta em `0` formas.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `1 <= s.length <= 100`\n- `s` contém apenas dígitos de `0` a `9`.\n- A resposta cabe em um inteiro de 32 bits.",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {string} s\n   * @return {number}\n   */\n  numDecodings(s) {\n    // sua solução aqui\n  }\n}\n",
            python: "class Solution:\n    def numDecodings(self, s: str) -> int:\n        # sua solução aqui\n        pass\n",
            java: "public class Solution {\n    public int numDecodings(String s) {\n        // sua solução aqui\n        return 0;\n    }\n}\n",
        },
        tests: [
            {
                input: '["12"]',
                expectedOutput: "2",
                isPublic: true,
            },
            {
                input: '["226"]',
                expectedOutput: "3",
                isPublic: true,
            },
            {
                input: '["10"]',
                expectedOutput: "1",
                isPublic: true,
            },
            {
                input: '["0"]',
                expectedOutput: "0",
                isPublic: false,
            },
            {
                input: '["27"]',
                expectedOutput: "1",
                isPublic: false,
            },
            {
                input: '["1111"]',
                expectedOutput: "5",
                isPublic: false,
            },
        ],
    },
    {
        title: "Maior Subsequência Crescente",
        topic: "Programação Dinâmica",
        entryPoint: "lengthOfLIS",
        statementBlocks: [
            {
                type: "text",
                value: "Dada uma lista de inteiros `nums`, retorne o comprimento da maior subsequência estritamente crescente.\n\nUma subsequência é obtida removendo zero ou mais elementos de `nums` sem trocar a ordem dos que restam. Ela é estritamente crescente quando cada elemento é maior que o anterior.",
            },
            {
                type: "text",
                value: "Por exemplo, em `nums = [10, 9, 2, 5, 3, 7, 101, 18]`, uma das maiores subsequências crescentes é `[2, 3, 7, 101]`, de comprimento `4`. Os elementos não precisam ser vizinhos na lista original, mas precisam manter a ordem em que aparecem.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `1 <= nums.length <= 2500`\n- `-10^4 <= nums[i] <= 10^4`\n- A subsequência precisa ser estritamente crescente: elementos iguais não podem estar juntos nela.",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[]} nums\n   * @return {number}\n   */\n  lengthOfLIS(nums) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def lengthOfLIS(self, nums: List[int]) -> int:\n        # sua solução aqui\n        pass\n",
            java: "public class Solution {\n    public int lengthOfLIS(int[] nums) {\n        // sua solução aqui\n        return 0;\n    }\n}\n",
        },
        tests: [
            {
                input: "[[10,9,2,5,3,7,101,18]]",
                expectedOutput: "4",
                isPublic: true,
            },
            {
                input: "[[0,1,0,3,2,3]]",
                expectedOutput: "4",
                isPublic: true,
            },
            {
                input: "[[7,7,7,7,7]]",
                expectedOutput: "1",
                isPublic: true,
            },
            {
                input: "[[4,3,2,1]]",
                expectedOutput: "1",
                isPublic: false,
            },
            {
                input: "[[1,3,6,7,9,4,10,5,6]]",
                expectedOutput: "6",
                isPublic: false,
            },
            {
                input: "[[1]]",
                expectedOutput: "1",
                isPublic: false,
            },
        ],
    },
    {
        title: "Soma Mínima do Caminho",
        topic: "Programação Dinâmica · Matriz",
        entryPoint: "minPathSum",
        statementBlocks: [
            {
                type: "text",
                value: "Você recebe uma matriz `grid` de dimensões `m x n` preenchida com números inteiros não negativos. Começando pela célula do canto superior-esquerdo (`grid[0][0]`), você quer chegar até a célula do canto inferior-direito (`grid[m-1][n-1]`).\n\nA cada passo é permitido mover apenas para a célula imediatamente à direita ou imediatamente abaixo da célula atual. O custo de um caminho é a soma dos valores de todas as células por onde ele passa, incluindo a de partida e a de chegada.",
            },
            {
                type: "text",
                value: "Implemente o método `minPathSum`, que recebe `grid` e retorna o menor custo possível entre todos os caminhos válidos do canto superior-esquerdo até o canto inferior-direito.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `m == grid.length`\n- `n == grid[0].length`\n- `1 <= m, n <= 200`\n- `0 <= grid[i][j] <= 200`",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[][]} grid\n   * @return {number}\n   */\n  minPathSum(grid) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def minPathSum(self, grid: List[List[int]]) -> int:\n        # sua solução aqui\n        pass\n",
            java: "public class Solution {\n    public int minPathSum(int[][] grid) {\n        // sua solução aqui\n        return 0;\n    }\n}\n",
        },
        tests: [
            {
                input: "[[[1,3,1],[1,5,1],[4,2,1]]]",
                expectedOutput: "7",
                isPublic: true,
            },
            {
                input: "[[[1,2,3],[4,5,6]]]",
                expectedOutput: "12",
                isPublic: true,
            },
            {
                input: "[[[5]]]",
                expectedOutput: "5",
                isPublic: false,
            },
            {
                input: "[[[1,2,5],[3,2,1]]]",
                expectedOutput: "6",
                isPublic: false,
            },
            {
                input: "[[[1,2,3,4]]]",
                expectedOutput: "10",
                isPublic: false,
            },
            {
                input: "[[[1],[2],[3]]]",
                expectedOutput: "6",
                isPublic: false,
            },
        ],
    },
    {
        title: "Posto de Gasolina",
        topic: "Array · Guloso",
        entryPoint: "canCompleteCircuit",
        statementBlocks: [
            {
                type: "text",
                value: "Há `n` postos de gasolina dispostos em um circuito circular. No posto de índice `i` você pode abastecer `gas[i]` unidades de combustível. Para ir do posto `i` até o próximo posto (`i + 1`) você gasta `cost[i]` unidades de combustível.\n\nVocê começa a viagem com o tanque vazio e escolhe um posto de partida. O objetivo é percorrer o circuito inteiro uma única vez, no sentido dos índices crescentes, retornando ao posto de partida sem que o tanque fique negativo em nenhum trecho.",
            },
            {
                type: "text",
                value: "Implemente o método `canCompleteCircuit`, que recebe as listas `gas` e `cost` e retorna o índice do posto a partir do qual é possível completar a volta inteira. Se não existir nenhum posto de partida que permita concluir o circuito, retorne `-1`. Quando a solução existe, ela é única.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `n == gas.length == cost.length`\n- `1 <= n <= 10^5`\n- `0 <= gas[i], cost[i] <= 10^4`",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[]} gas\n   * @param {number[]} cost\n   * @return {number}\n   */\n  canCompleteCircuit(gas, cost) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def canCompleteCircuit(self, gas: List[int], cost: List[int]) -> int:\n        # sua solução aqui\n        pass\n",
            java: "public class Solution {\n    public int canCompleteCircuit(int[] gas, int[] cost) {\n        // sua solução aqui\n        return 0;\n    }\n}\n",
        },
        tests: [
            {
                input: "[[1,2,3,4,5],[3,4,5,1,2]]",
                expectedOutput: "3",
                isPublic: true,
            },
            {
                input: "[[2,3,4],[3,4,3]]",
                expectedOutput: "-1",
                isPublic: true,
            },
            {
                input: "[[5],[4]]",
                expectedOutput: "0",
                isPublic: false,
            },
            {
                input: "[[2],[2]]",
                expectedOutput: "0",
                isPublic: false,
            },
            {
                input: "[[3,1,1],[1,2,2]]",
                expectedOutput: "0",
                isPublic: false,
            },
            {
                input: "[[5,1,2,3,4],[4,4,1,5,1]]",
                expectedOutput: "4",
                isPublic: false,
            },
        ],
    },
    {
        title: "Ordenar Cores",
        topic: "Array · Dois Ponteiros",
        entryPoint: "sortColors",
        statementBlocks: [
            {
                type: "text",
                value: "Você recebe uma lista `nums` com `n` elementos, na qual cada elemento vale `0`, `1` ou `2`. Esses valores representam, respectivamente, as cores vermelho, branco e azul.\n\nOrdene a lista de modo que todos os elementos de mesma cor fiquem adjacentes, na ordem vermelho, branco e azul: ou seja, todos os `0` primeiro, depois todos os `1` e por fim todos os `2`.",
            },
            {
                type: "text",
                value: "Resolva reorganizando os próprios elementos da lista, sem recorrer a uma rotina de ordenação pronta da linguagem. Ao final, retorne a lista já ordenada.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `1 <= nums.length <= 300`\n- `nums[i]` é `0`, `1` ou `2`",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[]} nums\n   * @return {number[]}\n   */\n  sortColors(nums) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def sortColors(self, nums: List[int]) -> List[int]:\n        # sua solução aqui\n        pass\n",
            java: "public class Solution {\n    public int[] sortColors(int[] nums) {\n        // sua solução aqui\n        return nums;\n    }\n}\n",
        },
        tests: [
            {
                input: "[[2,0,2,1,1,0]]",
                expectedOutput: "[0,0,1,1,2,2]",
                isPublic: true,
            },
            {
                input: "[[2,0,1]]",
                expectedOutput: "[0,1,2]",
                isPublic: true,
            },
            {
                input: "[[0]]",
                expectedOutput: "[0]",
                isPublic: false,
            },
            {
                input: "[[1,1,1]]",
                expectedOutput: "[1,1,1]",
                isPublic: false,
            },
            {
                input: "[[2,2,1,1,0,0]]",
                expectedOutput: "[0,0,1,1,2,2]",
                isPublic: false,
            },
            {
                input: "[[2,0,0,1,2,1,0]]",
                expectedOutput: "[0,0,0,1,1,2,2]",
                isPublic: false,
            },
        ],
    },
    {
        title: "Rotacionar Vetor",
        topic: "Array · Matemática",
        entryPoint: "rotateArray",
        statementBlocks: [
            {
                type: "text",
                value: "Você recebe uma lista de inteiros `nums` e um inteiro não negativo `k`. Rotacione a lista `k` posições para a direita: cada elemento avança `k` casas e os que passam do fim reaparecem no começo.\n\nPor exemplo, rotacionar `[1,2,3,4,5,6,7]` em `k = 3` posições resulta em `[5,6,7,1,2,3,4]`.",
            },
            {
                type: "text",
                value: "Observe que `k` pode ser maior que o tamanho da lista. Nesse caso, girar `k` posições equivale a girar `k` módulo o tamanho da lista. Implemente `rotateArray`, que recebe `nums` e `k` e retorna a lista resultante da rotação.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `1 <= nums.length <= 10^5`\n- `-2^31 <= nums[i] <= 2^31 - 1`\n- `0 <= k <= 10^5`",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[]} nums\n   * @param {number} k\n   * @return {number[]}\n   */\n  rotateArray(nums, k) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def rotateArray(self, nums: List[int], k: int) -> List[int]:\n        # sua solução aqui\n        pass\n",
            java: "public class Solution {\n    public int[] rotateArray(int[] nums, int k) {\n        // sua solução aqui\n        return nums;\n    }\n}\n",
        },
        tests: [
            {
                input: "[[1,2,3,4,5,6,7],3]",
                expectedOutput: "[5,6,7,1,2,3,4]",
                isPublic: true,
            },
            {
                input: "[[-1,-100,3,99],2]",
                expectedOutput: "[3,99,-1,-100]",
                isPublic: true,
            },
            {
                input: "[[1,2],0]",
                expectedOutput: "[1,2]",
                isPublic: false,
            },
            {
                input: "[[1],5]",
                expectedOutput: "[1]",
                isPublic: false,
            },
            {
                input: "[[1,2,3],3]",
                expectedOutput: "[1,2,3]",
                isPublic: false,
            },
            {
                input: "[[1,2,3,4],6]",
                expectedOutput: "[3,4,1,2]",
                isPublic: false,
            },
        ],
    },
    {
        title: "Mínimo em Vetor Rotacionado",
        topic: "Array · Busca Binária",
        entryPoint: "findMin",
        statementBlocks: [
            {
                type: "text",
                value: "Uma lista ordenada em ordem crescente e com elementos distintos foi rotacionada um número desconhecido de vezes para a esquerda antes de chegar até você. Por exemplo, a lista original `[1,2,3,4,5]` poderia virar `[3,4,5,1,2]` (rotacionada duas posições) ou `[4,5,1,2,3]` (rotacionada três posições).\n\nVocê recebe essa lista já rotacionada em `nums` e deve encontrar o menor elemento presente nela.",
            },
            {
                type: "text",
                value: "Implemente o método `findMin`, que recebe `nums` e retorna o menor valor da lista. Procure uma solução eficiente, que aproveite o fato de a lista ser ordenada e rotacionada em vez de simplesmente percorrer todos os elementos.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `1 <= nums.length <= 5000`\n- `-5000 <= nums[i] <= 5000`\n- Todos os valores de `nums` são distintos\n- `nums` é uma rotação de uma sequência ordenada em ordem crescente",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[]} nums\n   * @return {number}\n   */\n  findMin(nums) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def findMin(self, nums: List[int]) -> int:\n        # sua solução aqui\n        pass\n",
            java: "public class Solution {\n    public int findMin(int[] nums) {\n        // sua solução aqui\n        return 0;\n    }\n}\n",
        },
        tests: [
            {
                input: "[[3,4,5,1,2]]",
                expectedOutput: "1",
                isPublic: true,
            },
            {
                input: "[[4,5,6,7,0,1,2]]",
                expectedOutput: "0",
                isPublic: true,
            },
            {
                input: "[[11,13,15,17]]",
                expectedOutput: "11",
                isPublic: false,
            },
            {
                input: "[[2,1]]",
                expectedOutput: "1",
                isPublic: false,
            },
            {
                input: "[[1]]",
                expectedOutput: "1",
                isPublic: false,
            },
            {
                input: "[[-3,-2,-1,-5,-4]]",
                expectedOutput: "-5",
                isPublic: false,
            },
        ],
    },
    {
        title: "Buscar em Matriz 2D",
        topic: "Array · Busca Binária",
        entryPoint: "searchMatrix",
        statementBlocks: [
            {
                type: "text",
                value: "Você recebe uma matriz `matrix` de inteiros com `m` linhas e `n` colunas que obedece a duas propriedades: os valores de cada linha estão em ordem crescente da esquerda para a direita, e o primeiro valor de cada linha é maior que o último valor da linha anterior. Na prática, isso significa que, lendo a matriz linha após linha, obtém-se uma única sequência totalmente ordenada.\n\nImplemente o método `searchMatrix`, que recebe `matrix` e um inteiro `target` e retorna `true` se `target` aparece na matriz e `false` caso contrário.",
            },
            {
                type: "text",
                value: "Aproveite a ordenação para não precisar percorrer todos os elementos: é possível localizar ou descartar `target` com uma busca binária sobre as `m * n` posições, tratando a matriz como um vetor ordenado e alcançando complexidade `O(log(m * n))`.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `1 <= m, n <= 100`\n- `-10^4 <= matrix[i][j] <= 10^4`\n- Cada linha está ordenada em ordem crescente\n- O primeiro elemento de cada linha é maior que o último elemento da linha anterior\n- `-10^4 <= target <= 10^4`",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[][]} matrix\n   * @param {number} target\n   * @return {boolean}\n   */\n  searchMatrix(matrix, target) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:\n        # sua solução aqui\n        pass\n",
            java: "public class Solution {\n    public boolean searchMatrix(int[][] matrix, int target) {\n        // sua solução aqui\n        return false;\n    }\n}\n",
        },
        tests: [
            {
                input: "[[[1,3,5,7],[10,11,16,20],[23,30,34,60]], 3]",
                expectedOutput: "true",
                isPublic: true,
            },
            {
                input: "[[[1,3,5,7],[10,11,16,20],[23,30,34,60]], 13]",
                expectedOutput: "false",
                isPublic: true,
            },
            {
                input: "[[[1]], 1]",
                expectedOutput: "true",
                isPublic: false,
            },
            {
                input: "[[[1]], 2]",
                expectedOutput: "false",
                isPublic: false,
            },
            {
                input: "[[[1,3,5,7],[10,11,16,20],[23,30,34,60]], 60]",
                expectedOutput: "true",
                isPublic: false,
            },
            {
                input: "[[[1,3,5,7],[10,11,16,20],[23,30,34,60]], 61]",
                expectedOutput: "false",
                isPublic: false,
            },
        ],
    },
    {
        title: "Subvetor com Soma K",
        topic: "Array · Hash Table · Soma de Prefixos",
        entryPoint: "subarraySum",
        statementBlocks: [
            {
                type: "text",
                value: "Você recebe uma lista de inteiros `nums` e um inteiro `k`. Conte quantos subvetores contíguos e não vazios de `nums` têm soma exatamente igual a `k`.\n\nUm subvetor contíguo é uma sequência de posições vizinhas de `nums`, definida por um índice inicial e um índice final. Dois subvetores são considerados diferentes quando começam ou terminam em posições diferentes, mesmo que contenham os mesmos valores.",
            },
            {
                type: "text",
                value: "Os valores de `nums` podem ser negativos, zero ou positivos, então a soma de um subvetor não cresce necessariamente à medida que ele se estende. Por isso, deslizar uma janela não resolve o problema: vale a pena acumular as somas de prefixo e guardar quantas vezes cada soma já apareceu, alcançando complexidade `O(n)`.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `1 <= nums.length <= 2 * 10^4`\n- `-1000 <= nums[i] <= 1000`\n- `-10^7 <= k <= 10^7`",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[]} nums\n   * @param {number} k\n   * @return {number}\n   */\n  subarraySum(nums, k) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def subarraySum(self, nums: List[int], k: int) -> int:\n        # sua solução aqui\n        pass\n",
            java: "import java.util.HashMap;\nimport java.util.Map;\n\npublic class Solution {\n    public int subarraySum(int[] nums, int k) {\n        // sua solução aqui\n        return 0;\n    }\n}\n",
        },
        tests: [
            {
                input: "[[1,1,1], 2]",
                expectedOutput: "2",
                isPublic: true,
            },
            {
                input: "[[1,2,3], 3]",
                expectedOutput: "2",
                isPublic: true,
            },
            {
                input: "[[1,-1,0], 0]",
                expectedOutput: "3",
                isPublic: false,
            },
            {
                input: "[[-1,-1,1], 0]",
                expectedOutput: "1",
                isPublic: false,
            },
            {
                input: "[[3,4,7,2,-3,1,4,2], 7]",
                expectedOutput: "4",
                isPublic: false,
            },
            {
                input: "[[1], 0]",
                expectedOutput: "0",
                isPublic: false,
            },
        ],
    },
    {
        title: "Maior Sequência Consecutiva",
        topic: "Array · Hash Table",
        entryPoint: "longestConsecutive",
        statementBlocks: [
            {
                type: "text",
                value: "Dada uma lista de inteiros `nums`, encontre o comprimento da mais longa sequência de números consecutivos que pode ser formada com seus elementos.\n\nUma sequência consecutiva é um conjunto de inteiros que, quando ordenados, avançam de um em um sem lacunas, como `4, 5, 6, 7`. Os elementos não precisam estar em posições vizinhas nem em ordem dentro de `nums`; o que importa é que os valores existam na lista. Valores repetidos contam uma única vez.",
            },
            {
                type: "text",
                value: "Retorne apenas o comprimento dessa maior sequência, e não os elementos que a formam. Se `nums` estiver vazia, o comprimento é `0`. Espera-se uma solução com complexidade `O(n)`, o que descarta ordenar a lista antes de contar.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `0 <= nums.length <= 10^5`\n- `-10^9 <= nums[i] <= 10^9`",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[]} nums\n   * @return {number}\n   */\n  longestConsecutive(nums) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def longestConsecutive(self, nums: List[int]) -> int:\n        # sua solução aqui\n        pass\n",
            java: "import java.util.HashSet;\nimport java.util.Set;\n\npublic class Solution {\n    public int longestConsecutive(int[] nums) {\n        // sua solução aqui\n        return 0;\n    }\n}\n",
        },
        tests: [
            {
                input: "[[100,4,200,1,3,2]]",
                expectedOutput: "4",
                isPublic: true,
            },
            {
                input: "[[0,3,7,2,5,8,4,6,0,1]]",
                expectedOutput: "9",
                isPublic: true,
            },
            {
                input: "[[]]",
                expectedOutput: "0",
                isPublic: false,
            },
            {
                input: "[[1,2,0,1]]",
                expectedOutput: "3",
                isPublic: false,
            },
            {
                input: "[[10]]",
                expectedOutput: "1",
                isPublic: false,
            },
            {
                input: "[[9,1,4,7,3,-1,0,5,8,-1,6]]",
                expectedOutput: "7",
                isPublic: false,
            },
        ],
    },
    {
        title: "Triângulo de Pascal",
        topic: "Array · Programação Dinâmica",
        entryPoint: "generate",
        statementBlocks: [
            {
                type: "text",
                value: "O triângulo de Pascal é uma disposição triangular de números em que a primeira linha contém apenas o valor `1`. Cada linha seguinte começa e termina em `1`, e todo valor interno é a soma dos dois valores imediatamente acima dele, na linha anterior.\n\nImplemente o método `generate`, que recebe um inteiro `numRows` e retorna as primeiras `numRows` linhas do triângulo de Pascal, de cima para baixo. A linha de índice `i` (começando em `0`) contém exatamente `i + 1` números.",
            },
            {
                type: "text",
                value: "Por exemplo, para `numRows = 5`, as linhas geradas são `[1]`, `[1,1]`, `[1,2,1]`, `[1,3,3,1]` e `[1,4,6,4,1]`, devolvidas juntas como uma lista de listas.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `0 <= numRows <= 30`\n- Quando `numRows` for `0`, retorne uma lista vazia",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number} numRows\n   * @return {number[][]}\n   */\n  generate(numRows) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def generate(self, numRows: int) -> List[List[int]]:\n        # sua solução aqui\n        pass\n",
            java: "public class Solution {\n    public int[][] generate(int numRows) {\n        // sua solução aqui\n        return new int[0][];\n    }\n}\n",
        },
        tests: [
            {
                input: "[5]",
                expectedOutput: "[[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]",
                isPublic: true,
            },
            {
                input: "[1]",
                expectedOutput: "[[1]]",
                isPublic: true,
            },
            {
                input: "[2]",
                expectedOutput: "[[1],[1,1]]",
                isPublic: true,
            },
            {
                input: "[0]",
                expectedOutput: "[]",
                isPublic: false,
            },
            {
                input: "[3]",
                expectedOutput: "[[1],[1,1],[1,2,1]]",
                isPublic: false,
            },
            {
                input: "[6]",
                expectedOutput: "[[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1],[1,5,10,10,5,1]]",
                isPublic: false,
            },
        ],
    },
    {
        title: "Intervalos Resumidos",
        topic: "Array",
        entryPoint: "summaryRanges",
        statementBlocks: [
            {
                type: "text",
                value: 'Você recebe uma lista `nums` de inteiros ordenada em ordem crescente e sem valores repetidos. Agrupe os números em intervalos e retorne, em ordem, a menor lista de strings que cobre exatamente todos os elementos de `nums`.\n\nCada intervalo reúne uma sequência maximal de números consecutivos (que avançam de um em um). Um intervalo com dois ou mais números é escrito como "a->b", em que `a` é o primeiro e `b` é o último da sequência. Um número isolado, que não é consecutivo a nenhum outro presente na lista, é escrito apenas como "a".',
            },
            {
                type: "text",
                value: 'Por exemplo, para `nums = [0,1,2,4,5,7]`, os agrupamentos são `0,1,2` (vira "0->2"), `4,5` (vira "4->5") e `7` sozinho (vira "7"), resultando em ["0->2","4->5","7"]. A lista devolvida preserva a ordem crescente da entrada.',
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `0 <= nums.length <= 20`\n- `-2^31 <= nums[i] <= 2^31 - 1`\n- `nums` está ordenada em ordem crescente\n- Todos os valores de `nums` são distintos",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[]} nums\n   * @return {string[]}\n   */\n  summaryRanges(nums) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def summaryRanges(self, nums: List[int]) -> List[str]:\n        # sua solução aqui\n        pass\n",
            java: "public class Solution {\n    public String[] summaryRanges(int[] nums) {\n        // sua solução aqui\n        return new String[0];\n    }\n}\n",
        },
        tests: [
            {
                input: "[[0,1,2,4,5,7]]",
                expectedOutput: '["0->2","4->5","7"]',
                isPublic: true,
            },
            {
                input: "[[0,2,3,4,6,8,9]]",
                expectedOutput: '["0","2->4","6","8->9"]',
                isPublic: true,
            },
            {
                input: "[[]]",
                expectedOutput: "[]",
                isPublic: true,
            },
            {
                input: "[[-1]]",
                expectedOutput: '["-1"]',
                isPublic: false,
            },
            {
                input: "[[1,3,5,7]]",
                expectedOutput: '["1","3","5","7"]',
                isPublic: false,
            },
            {
                input: "[[-5,-4,-3,-1,0]]",
                expectedOutput: '["-5->-3","-1->0"]',
                isPublic: false,
            },
        ],
    },
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
    console.log(`Desafios médios criados: ${criados} (de ${DESAFIOS.length}).`);
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
