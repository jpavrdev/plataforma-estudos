// Seed dos desafios fáceis (formato função, estilo LeetCode). Idempotente por título;
// o número de exibição é atribuído dinamicamente (próximo livre) para não colidir.
//
// Rodar em dev:  node --env-file=.env scripts/seed-desafios-easy.ts
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend \
//                  node scripts/seed-desafios-easy.ts
import { db } from "../db.ts";
import { challenges, challengeTests } from "../schema.ts";
import { eq, sql } from "drizzle-orm";

const DESAFIOS = [
    {
        title: "Inverter String",
        topic: "String",
        entryPoint: "reverseString",
        statementBlocks: [
            {
                type: "text",
                value: "Dada uma string `s`, inverta a ordem dos seus caracteres e retorne o resultado.\n\nO primeiro caractere de `s` passa a ser o último da string retornada, o segundo passa a ser o penúltimo, e assim por diante. Letras maiúsculas, minúsculas, espaços e sinais de pontuação são preservados exatamente como aparecem. Apenas a posição de cada caractere muda.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `0 ≤ s.length ≤ 10^4`\n- `s` contém apenas caracteres ASCII imprimíveis (letras, números, espaços e pontuação)",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {string} s\n   * @return {string}\n   */\n  reverseString(s) {\n    // sua solução aqui\n  }\n}\n",
            python: "class Solution:\n    def reverseString(self, s: str) -> str:\n        # sua solução aqui\n        pass\n",
        },
        tests: [
            {
                input: '["hello"]',
                expectedOutput: '"olleh"',
                isPublic: true,
            },
            {
                input: '["algoritmo"]',
                expectedOutput: '"omtirogla"',
                isPublic: true,
            },
            {
                input: '[""]',
                expectedOutput: '""',
                isPublic: false,
            },
            {
                input: '["a"]',
                expectedOutput: '"a"',
                isPublic: false,
            },
            {
                input: '["aa bb!!"]',
                expectedOutput: '"!!bb aa"',
                isPublic: false,
            },
        ],
    },
    {
        title: "Número Palíndromo",
        topic: "Matemática",
        entryPoint: "isPalindrome",
        statementBlocks: [
            {
                type: "text",
                value: "Dado um número inteiro `x`, determine se ele é um palíndromo.\n\nUm número é palíndromo quando a sequência de seus dígitos, lida da esquerda para a direita, é idêntica à sequência lida da direita para a esquerda.\n\nNúmeros negativos nunca são palíndromos: o sinal de menos ocupa a primeira posição e não tem correspondente do outro lado, o que quebra a simetria.\n\nImplemente o método `isPalindrome`, que recebe o inteiro `x` e retorna `true` quando ele for um palíndromo e `false` caso contrário.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `-2^31 <= x <= 2^31 - 1`\n- `x` é sempre um número inteiro, podendo ser negativo, zero ou positivo",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number} x\n   * @return {boolean}\n   */\n  isPalindrome(x) {\n    // sua solução aqui\n  }\n}",
            python: "class Solution:\n    def isPalindrome(self, x: int) -> bool:\n        # sua solução aqui\n        pass",
        },
        tests: [
            {
                input: "[121]",
                expectedOutput: "true",
                isPublic: true,
            },
            {
                input: "[123]",
                expectedOutput: "false",
                isPublic: true,
            },
            {
                input: "[-101]",
                expectedOutput: "false",
                isPublic: false,
            },
            {
                input: "[0]",
                expectedOutput: "true",
                isPublic: false,
            },
            {
                input: "[1221]",
                expectedOutput: "true",
                isPublic: false,
            },
        ],
    },
    {
        title: "Fizz Buzz",
        topic: "Matemática · String",
        entryPoint: "fizzBuzz",
        statementBlocks: [
            {
                type: "text",
                value: "Escreva uma função que recebe um inteiro `n` e retorna uma lista de strings com os números de 1 até `n`, substituindo certos valores por palavras específicas conforme a divisibilidade.",
            },
            {
                type: "text",
                value: 'Para cada inteiro `i` no intervalo de 1 até `n`, aplique a regra abaixo:\n\n- Se `i` for divisível por 3 e por 5 ao mesmo tempo, o item da lista deve ser `"FizzBuzz"`.\n- Se `i` for divisível apenas por 3, o item deve ser `"Fizz"`.\n- Se `i` for divisível apenas por 5, o item deve ser `"Buzz"`.\n- Nos demais casos, o item deve ser o próprio número `i` convertido para string.\n\nA lista retornada deve manter a ordem crescente, começando em 1 e terminando em `n`.',
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `0 <= n <= 10^4`\n- O resultado deve conter exatamente `n` elementos.\n- Quando `n` for `0`, a função deve retornar uma lista vazia.",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number} n\n   * @return {string[]}\n   */\n  fizzBuzz(n) {\n    // sua solução aqui\n  }\n}",
            python: "from typing import List\n\n\nclass Solution:\n    def fizzBuzz(self, n: int) -> List[str]:\n        # sua solução aqui\n        pass",
        },
        tests: [
            {
                input: "[15]",
                expectedOutput:
                    '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]',
                isPublic: true,
            },
            {
                input: "[5]",
                expectedOutput: '["1","2","Fizz","4","Buzz"]',
                isPublic: true,
            },
            {
                input: "[0]",
                expectedOutput: "[]",
                isPublic: false,
            },
            {
                input: "[1]",
                expectedOutput: '["1"]',
                isPublic: false,
            },
            {
                input: "[30]",
                expectedOutput:
                    '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz","16","17","Fizz","19","Buzz","Fizz","22","23","Fizz","Buzz","26","Fizz","28","29","FizzBuzz"]',
                isPublic: false,
            },
        ],
    },
    {
        title: "Fibonacci",
        topic: "Recursão · Matemática",
        entryPoint: "fib",
        statementBlocks: [
            {
                type: "text",
                value: "A sequência de Fibonacci começa em `0` e `1`. A partir daí, cada termo é a soma dos dois anteriores: `fib(0) = 0`, `fib(1) = 1` e `fib(n) = fib(n - 1) + fib(n - 2)` para `n ≥ 2`.",
            },
            {
                type: "text",
                value: "Implemente o método `fib`, que recebe um inteiro `n` e devolve o n-ésimo termo dessa sequência.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `0 ≤ n ≤ 30`\n- O resultado cabe em um inteiro comum, sem necessidade de tipos especiais para números grandes.",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number} n\n   * @return {number}\n   */\n  fib(n) {\n    // sua solução aqui\n  }\n}\n",
            python: "class Solution:\n    def fib(self, n: int) -> int:\n        # sua solução aqui\n        pass\n",
        },
        tests: [
            {
                input: "[0]",
                expectedOutput: "0",
                isPublic: true,
            },
            {
                input: "[7]",
                expectedOutput: "13",
                isPublic: true,
            },
            {
                input: "[1]",
                expectedOutput: "1",
                isPublic: false,
            },
            {
                input: "[2]",
                expectedOutput: "1",
                isPublic: false,
            },
            {
                input: "[30]",
                expectedOutput: "832040",
                isPublic: false,
            },
        ],
    },
    {
        title: "Fatorial",
        topic: "Matemática",
        entryPoint: "factorial",
        statementBlocks: [
            {
                type: "text",
                value: "O fatorial de um número inteiro não negativo `n`, escrito como `n!`, é o produto de todos os inteiros de `1` até `n`. Por definição, `0! = 1`.\n\nImplemente uma função que recebe `n` e retorna o valor de `n!`.",
            },
            {
                type: "text",
                value: "**Restrições**\n- `0 <= n <= 12`\n- O valor retornado sempre cabe em um inteiro padrão, sem risco de overflow",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number} n\n   * @return {number}\n   */\n  factorial(n) {\n    // sua solução aqui\n  }\n}",
            python: "class Solution:\n    def factorial(self, n: int) -> int:\n        # sua solução aqui\n        pass",
        },
        tests: [
            {
                input: "[4]",
                expectedOutput: "24",
                isPublic: true,
            },
            {
                input: "[6]",
                expectedOutput: "720",
                isPublic: true,
            },
            {
                input: "[0]",
                expectedOutput: "1",
                isPublic: false,
            },
            {
                input: "[12]",
                expectedOutput: "479001600",
                isPublic: false,
            },
            {
                input: "[1]",
                expectedOutput: "1",
                isPublic: false,
            },
        ],
    },
    {
        title: "Soma do Vetor",
        topic: "Array",
        entryPoint: "sumArray",
        statementBlocks: [
            {
                type: "text",
                value: "Dada uma lista de números inteiros `nums`, retorne a soma de todos os seus elementos.\n\nPercorra `nums` somando cada elemento ao total. Se a lista estiver vazia, o retorno é `0`.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `0 <= nums.length <= 1000`\n- `-1000 <= nums[i] <= 1000`",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[]} nums\n   * @return {number}\n   */\n  sumArray(nums) {\n    // sua solução aqui\n  }\n}",
            python: "from typing import List\n\nclass Solution:\n    def sumArray(self, nums: List[int]) -> int:\n        # sua solução aqui\n        pass",
        },
        tests: [
            {
                input: "[[1,2,3,4,5]]",
                expectedOutput: "15",
                isPublic: true,
            },
            {
                input: "[[10,-2,3]]",
                expectedOutput: "11",
                isPublic: true,
            },
            {
                input: "[[]]",
                expectedOutput: "0",
                isPublic: false,
            },
            {
                input: "[[-5,-10,-1]]",
                expectedOutput: "-16",
                isPublic: false,
            },
            {
                input: "[[4,4,4,4]]",
                expectedOutput: "16",
                isPublic: false,
            },
        ],
    },
    {
        title: "Maior do Vetor",
        topic: "Array",
        entryPoint: "maxArray",
        statementBlocks: [
            {
                type: "text",
                value: "Dada uma lista de inteiros `nums`, garantidamente não vazia, retorne o maior elemento presente nela.",
            },
            {
                type: "text",
                value: "Percorra os valores de `nums` e identifique aquele com o maior valor numérico. Não é necessário ordenar a lista nem remover elementos repetidos, apenas comparar os números entre si e devolver o maior deles.",
            },
            {
                type: "text",
                value: "**Restrições**\n- `1 <= nums.length <= 10^4`\n- `-10^4 <= nums[i] <= 10^4`\n- Todos os elementos de `nums` são números inteiros",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[]} nums\n   * @return {number}\n   */\n  maxArray(nums) {\n    // sua solução aqui\n  }\n}",
            python: "from typing import List\n\nclass Solution:\n    def maxArray(self, nums: List[int]) -> int:\n        # sua solução aqui\n        pass",
        },
        tests: [
            {
                input: "[[3, 1, 4, 1, 5, 9, 2, 6]]",
                expectedOutput: "9",
                isPublic: true,
            },
            {
                input: "[[-8, -3, -15, -1]]",
                expectedOutput: "-1",
                isPublic: true,
            },
            {
                input: "[[42]]",
                expectedOutput: "42",
                isPublic: false,
            },
            {
                input: "[[7, 7, 7, 7, 7]]",
                expectedOutput: "7",
                isPublic: false,
            },
            {
                input: "[[-10000, 10000, 0, 5000, -5000]]",
                expectedOutput: "10000",
                isPublic: false,
            },
        ],
    },
    {
        title: "Contar Vogais",
        topic: "String",
        entryPoint: "countVowels",
        statementBlocks: [
            {
                type: "text",
                value: "Dada uma string `s`, conte quantas vogais ela contém. São vogais as letras `a`, `e`, `i`, `o`, `u`, tanto maiúsculas quanto minúsculas.",
            },
            {
                type: "text",
                value: "Implemente o método `countVowels`, que recebe `s` e retorna um número inteiro com o total de vogais encontradas. Espaços, dígitos, pontuação e consoantes (incluindo `y`) não entram na contagem.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `0 ≤ s.length ≤ 10^4`\n- `s` pode conter letras maiúsculas, minúsculas, espaços, dígitos e sinais de pontuação\n- considera-se vogal apenas `a`, `e`, `i`, `o`, `u`, em qualquer combinação de maiúscula ou minúscula",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {string} s\n   * @return {number}\n   */\n  countVowels(s) {\n    // sua solução aqui\n  }\n}\n",
            python: "class Solution:\n    def countVowels(self, s: str) -> int:\n        # sua solução aqui\n        pass\n",
        },
        tests: [
            {
                input: '["Hello World"]',
                expectedOutput: "3",
                isPublic: true,
            },
            {
                input: '["AEIOU"]',
                expectedOutput: "5",
                isPublic: true,
            },
            {
                input: '[""]',
                expectedOutput: "0",
                isPublic: false,
            },
            {
                input: '["Rhythm"]',
                expectedOutput: "0",
                isPublic: false,
            },
            {
                input: '["aaaaa"]',
                expectedOutput: "5",
                isPublic: false,
            },
        ],
    },
    {
        title: "É Primo",
        topic: "Matemática",
        entryPoint: "isPrime",
        statementBlocks: [
            {
                type: "text",
                value: "Um número primo é um número inteiro maior que 1 que tem exatamente dois divisores positivos: 1 e ele mesmo.\n\nImplemente uma função que recebe um número inteiro `n` e retorna `true` se `n` for primo, ou `false` caso contrário.",
            },
            {
                type: "text",
                value: "Números menores que 2, ou seja, 0, 1 e todos os negativos, nunca são primos. O 2 é o único número primo par; qualquer outro número primo é ímpar.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `-10^9 ≤ n ≤ 10^9`\n- `n` é sempre um número inteiro",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number} n\n   * @return {boolean}\n   */\n  isPrime(n) {\n    // sua solução aqui\n  }\n}\n",
            python: "class Solution:\n    def isPrime(self, n: int) -> bool:\n        # sua solução aqui\n        pass\n",
        },
        tests: [
            {
                input: "[7]",
                expectedOutput: "true",
                isPublic: true,
            },
            {
                input: "[9]",
                expectedOutput: "false",
                isPublic: true,
            },
            {
                input: "[1]",
                expectedOutput: "false",
                isPublic: false,
            },
            {
                input: "[2]",
                expectedOutput: "true",
                isPublic: false,
            },
            {
                input: "[-11]",
                expectedOutput: "false",
                isPublic: false,
            },
        ],
    },
    {
        title: "Máximo Divisor Comum",
        topic: "Matemática",
        entryPoint: "gcd",
        statementBlocks: [
            {
                type: "text",
                value: "Dados dois números inteiros positivos `a` e `b`, calcule o **Máximo Divisor Comum (MDC)** entre eles: o maior número inteiro que divide `a` e `b` ao mesmo tempo, sem deixar resto.",
            },
            {
                type: "text",
                value: "Os divisores de 8 são 1, 2, 4 e 8. Os divisores de 12 são 1, 2, 3, 4, 6 e 12. Os divisores em comum são 1, 2 e 4, e o maior deles é 4, então o MDC de 8 e 12 é 4. Quando `a` e `b` não têm nenhum divisor em comum além de 1, o MDC vale 1.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `1 ≤ a ≤ 10^9`\n- `1 ≤ b ≤ 10^9`\n- `a` e `b` são números inteiros positivos",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number} a\n   * @param {number} b\n   * @return {number}\n   */\n  gcd(a, b) {\n    // sua solução aqui\n  }\n}\n",
            python: "class Solution:\n    def gcd(self, a: int, b: int) -> int:\n        # sua solução aqui\n        pass\n",
        },
        tests: [
            {
                input: "[48, 18]",
                expectedOutput: "6",
                isPublic: true,
            },
            {
                input: "[17, 5]",
                expectedOutput: "1",
                isPublic: true,
            },
            {
                input: "[1, 1]",
                expectedOutput: "1",
                isPublic: false,
            },
            {
                input: "[1000000000, 1000000000]",
                expectedOutput: "1000000000",
                isPublic: false,
            },
            {
                input: "[1000000000, 1]",
                expectedOutput: "1",
                isPublic: false,
            },
        ],
    },
    {
        title: "Parênteses Válidos",
        topic: "String · Pilha",
        entryPoint: "isValid",
        statementBlocks: [
            {
                type: "text",
                value: "Você recebe uma string `s` formada apenas pelos caracteres `(`, `)`, `[`, `]`, `{` e `}`. Sua tarefa é determinar se os símbolos estão corretamente balanceados e aninhados.\n\nA string é válida quando cada símbolo de abertura tem um símbolo de fechamento do mesmo tipo, respeitando a ordem: o fechamento precisa corresponder à abertura mais recente que ainda está pendente. Uma string vazia é válida, já que não há símbolo nenhum para desbalancear.",
            },
            {
                type: "text",
                value: "Uma string é inválida quando um símbolo de fechamento aparece sem abertura correspondente pendente, quando o tipo do fechamento não bate com o tipo da abertura mais recente, ou quando sobra algum símbolo de abertura sem fechamento ao final.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `0 ≤ s.length ≤ 10^4`\n- `s` contém apenas os caracteres `(`, `)`, `[`, `]`, `{` e `}`",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {string} s\n   * @return {boolean}\n   */\n  isValid(s) {\n    // sua solução aqui\n  }\n}\n",
            python: "class Solution:\n    def isValid(self, s: str) -> bool:\n        # sua solução aqui\n        pass\n",
        },
        tests: [
            {
                input: '["()"]',
                expectedOutput: "true",
                isPublic: true,
            },
            {
                input: '["()[]{}"]',
                expectedOutput: "true",
                isPublic: true,
            },
            {
                input: '["(]"]',
                expectedOutput: "false",
                isPublic: false,
            },
            {
                input: '["([)]"]',
                expectedOutput: "false",
                isPublic: false,
            },
            {
                input: '[""]',
                expectedOutput: "true",
                isPublic: false,
            },
        ],
    },
    {
        title: "Número Faltando",
        topic: "Array · Matemática",
        entryPoint: "missingNumber",
        statementBlocks: [
            {
                type: "text",
                value: "Você recebe uma lista `nums` contendo `n` números inteiros distintos, escolhidos dentro do intervalo `[0, n]`. Como esse intervalo tem `n + 1` valores possíveis e a lista guarda apenas `n` deles, sempre existe exatamente um número faltando.\n\nImplemente o método `missingNumber`, que recebe `nums` e devolve o número desse intervalo que não aparece na lista. A lista não vem necessariamente ordenada.",
            },
            {
                type: "text",
                value: "**Restrições**\n- `0 <= nums.length <= 10^4`\n- `0 <= nums[i] <= nums.length`\n- Todos os valores de `nums` são distintos",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[]} nums\n   * @return {number}\n   */\n  missingNumber(nums) {\n    // sua solução aqui\n  }\n}",
            python: "from typing import List\n\n\nclass Solution:\n    def missingNumber(self, nums: List[int]) -> int:\n        # sua solução aqui\n        pass",
        },
        tests: [
            {
                input: "[[3,0,1]]",
                expectedOutput: "2",
                isPublic: true,
            },
            {
                input: "[[9,6,4,2,3,5,7,0,1]]",
                expectedOutput: "8",
                isPublic: true,
            },
            {
                input: "[[]]",
                expectedOutput: "0",
                isPublic: false,
            },
            {
                input: "[[1]]",
                expectedOutput: "0",
                isPublic: false,
            },
            {
                input: "[[4,0,3,2]]",
                expectedOutput: "1",
                isPublic: false,
            },
        ],
    },
    {
        title: "Número Único",
        topic: "Array",
        entryPoint: "singleNumber",
        statementBlocks: [
            {
                type: "text",
                value: "Você recebe um vetor de inteiros `nums` no qual cada valor aparece exatamente duas vezes, com uma única exceção: um elemento aparece apenas uma vez. Encontre e retorne esse elemento que não tem par.",
            },
            {
                type: "text",
                value: "Os dois elementos iguais não precisam estar em posições vizinhas dentro de `nums`, e a lista pode misturar valores positivos, negativos e zero. Como existe sempre exatamente um elemento sem par, a resposta é única.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `1 ≤ nums.length ≤ 3 * 10^4`\n- `nums.length` é sempre ímpar\n- `-3 * 10^4 ≤ nums[i] ≤ 3 * 10^4`\n- Todo elemento aparece exatamente duas vezes, exceto um, que aparece uma única vez",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[]} nums\n   * @return {number}\n   */\n  singleNumber(nums) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def singleNumber(self, nums: List[int]) -> int:\n        # sua solução aqui\n        pass\n",
        },
        tests: [
            {
                input: "[[2,2,1]]",
                expectedOutput: "1",
                isPublic: true,
            },
            {
                input: "[[4,1,2,1,2]]",
                expectedOutput: "4",
                isPublic: true,
            },
            {
                input: "[[-1,-1,-2]]",
                expectedOutput: "-2",
                isPublic: false,
            },
            {
                input: "[[7]]",
                expectedOutput: "7",
                isPublic: false,
            },
            {
                input: "[[0,1,0,1,99,2,2]]",
                expectedOutput: "99",
                isPublic: false,
            },
        ],
    },
    {
        title: "Contém Duplicado",
        topic: "Array · Hash Table",
        entryPoint: "containsDuplicate",
        statementBlocks: [
            {
                type: "text",
                value: "Você recebe uma lista de números inteiros `nums`. Descubra se algum valor aparece mais de uma vez nela.\n\nDois elementos contam como duplicados quando têm o mesmo valor, não importa em que posição estão na lista.",
            },
            {
                type: "text",
                value: "Retorne `true` se `nums` contém pelo menos um valor repetido. Retorne `false` se todos os elementos forem distintos entre si.",
            },
            {
                type: "text",
                value: "**Restrições**\n- `1 <= nums.length <= 10^5`\n- `-10^9 <= nums[i] <= 10^9`",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[]} nums\n   * @return {boolean}\n   */\n  containsDuplicate(nums) {\n    // sua solução aqui\n  }\n}",
            python: "from typing import List\n\n\nclass Solution:\n    def containsDuplicate(self, nums: List[int]) -> bool:\n        # sua solução aqui\n        pass",
        },
        tests: [
            {
                input: "[[1,2,3,1]]",
                expectedOutput: "true",
                isPublic: true,
            },
            {
                input: "[[1,2,3,4]]",
                expectedOutput: "false",
                isPublic: true,
            },
            {
                input: "[[1,1,1,3,3,4,3,2,4,2]]",
                expectedOutput: "true",
                isPublic: false,
            },
            {
                input: "[[-5]]",
                expectedOutput: "false",
                isPublic: false,
            },
            {
                input: "[[-3,-3,0,5]]",
                expectedOutput: "true",
                isPublic: false,
            },
        ],
    },
    {
        title: "Mover Zeros",
        topic: "Array · Dois Ponteiros",
        entryPoint: "moveZeroes",
        statementBlocks: [
            {
                type: "text",
                value: "Você recebe uma lista de inteiros `nums`. Mova todos os elementos iguais a zero para o final da lista, mantendo a ordem relativa dos elementos diferentes de zero exatamente como aparecem na entrada.",
            },
            {
                type: "text",
                value: "A função `moveZeroes` retorna a lista já reorganizada. O tamanho do retorno é sempre igual ao tamanho de `nums`: nenhum elemento é removido, só reordenado dentro da própria lista.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `0 ≤ nums.length ≤ 10^4`\n- `-10^5 ≤ nums[i] ≤ 10^5`",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[]} nums\n   * @return {number[]}\n   */\n  moveZeroes(nums) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def moveZeroes(self, nums: List[int]) -> List[int]:\n        # sua solução aqui\n        pass\n",
        },
        tests: [
            {
                input: "[[0,1,0,3,12]]",
                expectedOutput: "[1,3,12,0,0]",
                isPublic: true,
            },
            {
                input: "[[0,0,1]]",
                expectedOutput: "[1,0,0]",
                isPublic: true,
            },
            {
                input: "[[]]",
                expectedOutput: "[]",
                isPublic: false,
            },
            {
                input: "[[-5,0,-3,0,-1,2]]",
                expectedOutput: "[-5,-3,-1,2,0,0]",
                isPublic: false,
            },
            {
                input: "[[0,0,0,5,0,0,3,0,3,0]]",
                expectedOutput: "[5,3,3,0,0,0,0,0,0,0]",
                isPublic: false,
            },
        ],
    },
    {
        title: "Romano para Inteiro",
        topic: "Hash Table · Matemática",
        entryPoint: "romanToInt",
        statementBlocks: [
            {
                type: "text",
                value: "Um número romano é escrito com os símbolos `I`, `V`, `X`, `L`, `C`, `D` e `M`, cada um associado a um valor fixo:\n\n- `I` vale 1\n- `V` vale 5\n- `X` vale 10\n- `L` vale 50\n- `C` vale 100\n- `D` vale 500\n- `M` vale 1000\n\nOs símbolos costumam aparecer do maior para o menor, e os valores são somados. `XII` vale 12, resultado de `X` + `I` + `I` (10 + 1 + 1). `XXVII` vale 27, resultado de `XX` + `V` + `II` (10 + 10 + 5 + 1 + 1).",
            },
            {
                type: "text",
                value: "Seis combinações fogem dessa regra e representam subtração, não soma:\n\n- `I` antes de `V` ou `X`: `IV` vale 4 e `IX` vale 9\n- `X` antes de `L` ou `C`: `XL` vale 40 e `XC` vale 90\n- `C` antes de `D` ou `M`: `CD` vale 400 e `CM` vale 900\n\nDada uma string `s` com um número romano válido, implemente o método `romanToInt` que retorna o valor inteiro equivalente.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `1 <= s.length <= 15`\n- `s` contém apenas os caracteres `I`, `V`, `X`, `L`, `C`, `D`, `M`\n- `s` representa um número romano válido, com valor entre 1 e 3999",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {string} s\n   * @return {number}\n   */\n  romanToInt(s) {\n    // sua solução aqui\n  }\n}",
            python: "class Solution:\n    def romanToInt(self, s: str) -> int:\n        # sua solução aqui\n        pass",
        },
        tests: [
            {
                input: '["III"]',
                expectedOutput: "3",
                isPublic: true,
            },
            {
                input: '["MCMXCIV"]',
                expectedOutput: "1994",
                isPublic: true,
            },
            {
                input: '["IV"]',
                expectedOutput: "4",
                isPublic: false,
            },
            {
                input: '["I"]',
                expectedOutput: "1",
                isPublic: false,
            },
            {
                input: '["MMMCMXCIX"]',
                expectedOutput: "3999",
                isPublic: false,
            },
        ],
    },
    {
        title: "Tamanho da Última Palavra",
        topic: "String",
        entryPoint: "lengthOfLastWord",
        statementBlocks: [
            {
                type: "text",
                value: "Você recebe uma string `s` composta por letras e espaços, representando uma frase com uma ou mais palavras separadas por espaços em branco. Uma palavra é definida como uma sequência contígua de caracteres diferentes de espaço.\n\nImplemente uma função que retorne o tamanho da última palavra de `s`.",
            },
            {
                type: "text",
                value: "A string `s` pode ter espaços extras no início, entre as palavras ou no final. Ignore esses espaços e conte apenas os caracteres que formam a última palavra.",
            },
            {
                type: "text",
                value: "**Restrições**\n- `1 <= s.length <= 10^4`\n- `s` contém apenas letras do alfabeto inglês (maiúsculas e minúsculas) e o caractere `' '` (espaço)\n- Existe pelo menos uma palavra em `s`",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {string} s\n   * @return {number}\n   */\n  lengthOfLastWord(s) {\n    // sua solução aqui\n  }\n}",
            python: "class Solution:\n    def lengthOfLastWord(self, s: str) -> int:\n        # sua solução aqui\n        pass",
        },
        tests: [
            {
                input: '["Hello World"]',
                expectedOutput: "5",
                isPublic: true,
            },
            {
                input: '["   fly me   to   the moon  "]',
                expectedOutput: "4",
                isPublic: true,
            },
            {
                input: '["a"]',
                expectedOutput: "1",
                isPublic: false,
            },
            {
                input: '["day  "]',
                expectedOutput: "3",
                isPublic: false,
            },
            {
                input: '["code   aaaaaaaaaa"]',
                expectedOutput: "10",
                isPublic: false,
            },
        ],
    },
    {
        title: "Inverter Inteiro",
        topic: "Matemática",
        entryPoint: "reverse",
        statementBlocks: [
            {
                type: "text",
                value: "Dado um número inteiro `x`, devolva esse número com os dígitos invertidos, mantendo o sinal original.",
            },
            {
                type: "text",
                value: "Se `x` for negativo, inverta os dígitos do valor absoluto e aplique o sinal negativo ao resultado final. Zeros que sobram no início do número invertido são descartados, pois um inteiro nunca é escrito com zero à esquerda. Por exemplo, `-900` invertido é `-9`.",
            },
            {
                type: "text",
                value: "Exemplos:\n- `reverse(123)` retorna `321`\n- `reverse(-123)` retorna `-321`\n- `reverse(-900)` retorna `-9`",
            },
            {
                type: "text",
                value: "**Restrições**\n- `-2^31 <= x <= 2^31 - 1`\n- O número resultante da inversão também cabe em um inteiro de 32 bits, então você não precisa tratar overflow.",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number} x\n   * @return {number}\n   */\n  reverse(x) {\n    // sua solução aqui\n  }\n}",
            python: "class Solution:\n    def reverse(self, x: int) -> int:\n        # sua solução aqui\n        pass",
        },
        tests: [
            {
                input: "[123]",
                expectedOutput: "321",
                isPublic: true,
            },
            {
                input: "[-123]",
                expectedOutput: "-321",
                isPublic: true,
            },
            {
                input: "[0]",
                expectedOutput: "0",
                isPublic: false,
            },
            {
                input: "[-900]",
                expectedOutput: "-9",
                isPublic: false,
            },
            {
                input: "[1221]",
                expectedOutput: "1221",
                isPublic: false,
            },
        ],
    },
    {
        title: "Potência de Dois",
        topic: "Matemática · Bits",
        entryPoint: "isPowerOfTwo",
        statementBlocks: [
            {
                type: "text",
                value: "Implemente o método `isPowerOfTwo`, que recebe um número inteiro `n` e informa se ele é uma potência de dois.\n\nUm número é potência de dois quando existe um inteiro `k >= 0` tal que `n = 2^k`. Essa sequência começa em 1, 2, 4, 8, 16, 32, 64 e segue dobrando indefinidamente.\n\nO método retorna `true` quando `n` for uma potência de dois e `false` nos demais casos.",
            },
            {
                type: "text",
                value: "Números menores ou iguais a zero nunca são potências de dois. Nesses casos o método deve retornar `false`, sem exceção.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `-2^31 <= n <= 2^31 - 1`\n- `n` é um número inteiro",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number} n\n   * @return {boolean}\n   */\n  isPowerOfTwo(n) {\n    // sua solução aqui\n  }\n}",
            python: "class Solution:\n    def isPowerOfTwo(self, n: int) -> bool:\n        # sua solução aqui\n        pass",
        },
        tests: [
            {
                input: "[16]",
                expectedOutput: "true",
                isPublic: true,
            },
            {
                input: "[18]",
                expectedOutput: "false",
                isPublic: true,
            },
            {
                input: "[1]",
                expectedOutput: "true",
                isPublic: false,
            },
            {
                input: "[0]",
                expectedOutput: "false",
                isPublic: false,
            },
            {
                input: "[-16]",
                expectedOutput: "false",
                isPublic: false,
            },
        ],
    },
    {
        title: "Subindo Escadas",
        topic: "Recursão · Programação Dinâmica",
        entryPoint: "climbStairs",
        statementBlocks: [
            {
                type: "text",
                value: 'Uma escada tem `n` degraus. Você começa no chão e quer chegar ao topo, podendo subir 1 ou 2 degraus a cada passo.\n\nImplemente `climbStairs(n)`, que retorna quantas sequências distintas de passos levam do chão até o degrau `n`. Duas sequências contam como diferentes quando a ordem dos passos muda: subir "1 depois 2" não é o mesmo que subir "2 depois 1", mesmo as duas terminando no mesmo degrau.',
            },
            {
                type: "text",
                value: "**Restrições**\n- `1 <= n <= 30`\n- O resultado cabe em um inteiro de 32 bits",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number} n\n   * @return {number}\n   */\n  climbStairs(n) {\n    // sua solução aqui\n  }\n}",
            python: "class Solution:\n    def climbStairs(self, n: int) -> int:\n        # sua solução aqui\n        pass",
        },
        tests: [
            {
                input: "[2]",
                expectedOutput: "2",
                isPublic: true,
            },
            {
                input: "[5]",
                expectedOutput: "8",
                isPublic: true,
            },
            {
                input: "[1]",
                expectedOutput: "1",
                isPublic: false,
            },
            {
                input: "[10]",
                expectedOutput: "89",
                isPublic: false,
            },
            {
                input: "[30]",
                expectedOutput: "1346269",
                isPublic: false,
            },
        ],
    },
    {
        title: "Melhor Momento para Comprar e Vender",
        topic: "Array",
        entryPoint: "maxProfit",
        statementBlocks: [
            {
                type: "text",
                value: "Você recebe o histórico de preços de uma ação, representado pela lista `prices`. O valor `prices[i]` é o preço da ação no dia `i`, sendo os dias numerados a partir de zero na ordem em que aparecem na lista.",
            },
            {
                type: "text",
                value: "Encontre o maior lucro possível comprando a ação em um dia e vendendo em um dia posterior. Você pode fazer no máximo uma compra seguida de uma venda, e a venda precisa ocorrer depois do dia da compra.\n\nSe não houver combinação de compra e venda com lucro positivo (incluindo os casos em que `prices` tem menos de dois elementos), retorne `0`.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `0 ≤ prices.length ≤ 10^5`\n- `-10^4 ≤ prices[i] ≤ 10^4`",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[]} prices\n   * @return {number}\n   */\n  maxProfit(prices) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        # sua solução aqui\n        pass\n",
        },
        tests: [
            {
                input: "[[7,1,5,3,6,4]]",
                expectedOutput: "5",
                isPublic: true,
            },
            {
                input: "[[7,6,4,3,1]]",
                expectedOutput: "0",
                isPublic: true,
            },
            {
                input: "[[]]",
                expectedOutput: "0",
                isPublic: false,
            },
            {
                input: "[[-3,-1,-6,-4]]",
                expectedOutput: "2",
                isPublic: false,
            },
            {
                input: "[[4,4]]",
                expectedOutput: "0",
                isPublic: false,
            },
        ],
    },
    {
        title: "Elemento Majoritário",
        topic: "Array",
        entryPoint: "majorityElement",
        statementBlocks: [
            {
                type: "text",
                value: "Dada uma lista de inteiros `nums` de tamanho `n`, o **elemento majoritário** é o valor que aparece mais de `n / 2` vezes.",
            },
            {
                type: "text",
                value: "Implemente o método `majorityElement`, que recebe `nums` e devolve o elemento majoritário. A lista sempre tem um elemento majoritário, então você não precisa tratar o caso em que ele não existe.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `1 ≤ n ≤ 10^4`\n- `-10^9 ≤ nums[i] ≤ 10^9`\n- `nums` sempre contém um elemento majoritário",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[]} nums\n   * @return {number}\n   */\n  majorityElement(nums) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def majorityElement(self, nums: List[int]) -> int:\n        # sua solução aqui\n        pass\n",
        },
        tests: [
            {
                input: "[[3,2,3]]",
                expectedOutput: "3",
                isPublic: true,
            },
            {
                input: "[[2,2,1,1,1,2,2]]",
                expectedOutput: "2",
                isPublic: true,
            },
            {
                input: "[[7]]",
                expectedOutput: "7",
                isPublic: false,
            },
            {
                input: "[[-1,-1,-1,2,2]]",
                expectedOutput: "-1",
                isPublic: false,
            },
            {
                input: "[[5,5,5,5,1,2,3]]",
                expectedOutput: "5",
                isPublic: false,
            },
        ],
    },
    {
        title: "Mais Um",
        topic: "Array · Matemática",
        entryPoint: "plusOne",
        statementBlocks: [
            {
                type: "text",
                value: "Você recebe uma lista de inteiros `digits` que representa um número inteiro não negativo. Cada posição da lista guarda um único dígito, do mais significativo (início) ao menos significativo (fim).",
            },
            {
                type: "text",
                value: "Some `1` ao número representado por `digits` e devolva os dígitos do resultado, na mesma ordem. Se a soma criar um novo dígito mais significativo, a lista retornada deve ter um elemento a mais do que `digits`.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `1 ≤ digits.length ≤ 100`\n- `0 ≤ digits[i] ≤ 9`\n- `digits` não contém zeros à esquerda, exceto quando o número representado é `0`.",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[]} digits\n   * @return {number[]}\n   */\n  plusOne(digits) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def plusOne(self, digits: List[int]) -> List[int]:\n        # sua solução aqui\n        pass\n",
        },
        tests: [
            {
                input: "[[1,2,9]]",
                expectedOutput: "[1,3,0]",
                isPublic: true,
            },
            {
                input: "[[4,3,2,1]]",
                expectedOutput: "[4,3,2,2]",
                isPublic: true,
            },
            {
                input: "[[0]]",
                expectedOutput: "[1]",
                isPublic: false,
            },
            {
                input: "[[9]]",
                expectedOutput: "[1,0]",
                isPublic: false,
            },
            {
                input: "[[9,9,9]]",
                expectedOutput: "[1,0,0,0]",
                isPublic: false,
            },
        ],
    },
    {
        title: "Soma Corrente",
        topic: "Array",
        entryPoint: "runningSum",
        statementBlocks: [
            {
                type: "text",
                value: "Você recebe uma lista de números inteiros `nums`. Sua tarefa é calcular a soma corrente (também chamada de soma acumulada) desses números e devolver o resultado em uma nova lista.",
            },
            {
                type: "text",
                value: "A soma corrente é definida assim: cada posição `i` do resultado guarda a soma de todos os elementos de `nums` desde o início até a posição `i`. Ou seja, `resultado[0] = nums[0]`, `resultado[1] = nums[0] + nums[1]`, e assim por diante até `resultado[n-1] = nums[0] + nums[1] + ... + nums[n-1]`.",
            },
            {
                type: "text",
                value: "**Restrições**\n- `1 <= nums.length <= 1000`\n- `-10^6 <= nums[i] <= 10^6`",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[]} nums\n   * @return {number[]}\n   */\n  runningSum(nums) {\n    // sua solução aqui\n  }\n}",
            python: "from typing import List\n\nclass Solution:\n    def runningSum(self, nums: List[int]) -> List[int]:\n        # sua solução aqui\n        pass",
        },
        tests: [
            {
                input: "[[1,2,3,4]]",
                expectedOutput: "[1,3,6,10]",
                isPublic: true,
            },
            {
                input: "[[1,1,1,1,1]]",
                expectedOutput: "[1,2,3,4,5]",
                isPublic: true,
            },
            {
                input: "[[5]]",
                expectedOutput: "[5]",
                isPublic: false,
            },
            {
                input: "[[-2,3,-4,5]]",
                expectedOutput: "[-2,1,-3,2]",
                isPublic: false,
            },
            {
                input: "[[4,4,4,4]]",
                expectedOutput: "[4,8,12,16]",
                isPublic: false,
            },
        ],
    },
    {
        title: "Somar Dígitos",
        topic: "Matemática",
        entryPoint: "addDigits",
        statementBlocks: [
            {
                type: "text",
                value: "Você recebe um número inteiro não negativo `num`. A tarefa é somar todos os seus dígitos, produzindo um novo número.",
            },
            {
                type: "text",
                value: "Se esse novo número tiver mais de um dígito, repita a soma dos dígitos dele. Continue repetindo o processo até restar um único dígito, que é o valor retornado.",
            },
            {
                type: "text",
                value: "Por exemplo, para `num = 38`: some 3 + 8 = 11. Como 11 tem dois dígitos, some 1 + 1 = 2. O resultado é `2`.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `0 ≤ num ≤ 2^31 - 1`",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number} num\n   * @return {number}\n   */\n  addDigits(num) {\n    // sua solução aqui\n  }\n}\n",
            python: "class Solution:\n    def addDigits(self, num: int) -> int:\n        # sua solução aqui\n        pass\n",
        },
        tests: [
            {
                input: "[38]",
                expectedOutput: "2",
                isPublic: true,
            },
            {
                input: "[0]",
                expectedOutput: "0",
                isPublic: true,
            },
            {
                input: "[9]",
                expectedOutput: "9",
                isPublic: false,
            },
            {
                input: "[12345]",
                expectedOutput: "6",
                isPublic: false,
            },
            {
                input: "[999999999]",
                expectedOutput: "9",
                isPublic: false,
            },
        ],
    },
    {
        title: "Peso de Hamming",
        topic: "Bits",
        entryPoint: "hammingWeight",
        statementBlocks: [
            {
                type: "text",
                value: "Dado um número inteiro não negativo `n`, conte quantos bits com valor `1` aparecem na representação binária de `n`.\n\nEssa contagem é chamada de peso de Hamming (ou popcount) do número: é a quantidade de dígitos 1 quando `n` é escrito em base binária, sem considerar zeros à esquerda.",
            },
            {
                type: "text",
                value: "Implemente o método `hammingWeight`, que recebe `n` como parâmetro e retorna um único número inteiro com o total de bits 1 encontrados.",
            },
            {
                type: "text",
                value: "**Restrições**\n- `0 <= n <= 2^31 - 1`\n- O valor retornado é um número inteiro entre `0` e `31`.",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number} n\n   * @return {number}\n   */\n  hammingWeight(n) {\n    // sua solução aqui\n  }\n}",
            python: "class Solution:\n    def hammingWeight(self, n: int) -> int:\n        # sua solução aqui\n        pass",
        },
        tests: [
            {
                input: "[11]",
                expectedOutput: "3",
                isPublic: true,
            },
            {
                input: "[128]",
                expectedOutput: "1",
                isPublic: true,
            },
            {
                input: "[0]",
                expectedOutput: "0",
                isPublic: false,
            },
            {
                input: "[2147483647]",
                expectedOutput: "31",
                isPublic: false,
            },
            {
                input: "[85]",
                expectedOutput: "4",
                isPublic: false,
            },
        ],
    },
    {
        title: "Quadrados de um Vetor Ordenado",
        topic: "Array · Dois Ponteiros",
        entryPoint: "sortedSquares",
        statementBlocks: [
            {
                type: "text",
                value: "Você recebe a lista `nums`, com inteiros ordenados em ordem crescente (podem existir valores repetidos). Retorne uma nova lista contendo o quadrado de cada elemento de `nums`, também ordenada em ordem crescente.",
            },
            {
                type: "text",
                value: "Como `nums` pode ter números negativos, elevar cada valor ao quadrado muda a relação de ordem entre eles: um número bem negativo vira um quadrado grande. Por isso não dá para simplesmente elevar ao quadrado mantendo a posição original, é preciso reordenar o resultado.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `0 ≤ nums.length ≤ 10^4`\n- `-10^4 ≤ nums[i] ≤ 10^4`\n- `nums` está ordenada em ordem crescente (permite repetição)",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number[]} nums\n   * @return {number[]}\n   */\n  sortedSquares(nums) {\n    // sua solução aqui\n  }\n}\n",
            python: "from typing import List\n\n\nclass Solution:\n    def sortedSquares(self, nums: List[int]) -> List[int]:\n        # sua solução aqui\n        pass\n",
        },
        tests: [
            {
                input: "[[-4,-1,0,3,10]]",
                expectedOutput: "[0,1,9,16,100]",
                isPublic: true,
            },
            {
                input: "[[-7,-3,2,3,11]]",
                expectedOutput: "[4,9,9,49,121]",
                isPublic: true,
            },
            {
                input: "[[]]",
                expectedOutput: "[]",
                isPublic: false,
            },
            {
                input: "[[-5]]",
                expectedOutput: "[25]",
                isPublic: false,
            },
            {
                input: "[[-3,-3,2,2]]",
                expectedOutput: "[4,4,9,9]",
                isPublic: false,
            },
        ],
    },
    {
        title: "Contar Primos",
        topic: "Matemática",
        entryPoint: "countPrimes",
        statementBlocks: [
            {
                type: "text",
                value: "Dado um número inteiro `n`, retorne a quantidade de números primos estritamente menores que `n`.\n\nUm número primo é um inteiro maior que 1 que possui exatamente dois divisores positivos: 1 e ele mesmo.",
            },
            {
                type: "text",
                value: "Os números `0` e `1` não são primos. Se `n` for `0`, `1` ou `2`, a resposta é `0`, pois não existe nenhum primo estritamente menor que esses valores.",
            },
            {
                type: "text",
                value: "**Restrições**\n- `0 <= n <= 10^6`\n- O resultado sempre cabe em um inteiro de 32 bits.",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {number} n\n   * @return {number}\n   */\n  countPrimes(n) {\n    // sua solução aqui\n  }\n}",
            python: "class Solution:\n    def countPrimes(self, n: int) -> int:\n        # sua solução aqui\n        pass",
        },
        tests: [
            {
                input: "[10]",
                expectedOutput: "4",
                isPublic: true,
            },
            {
                input: "[20]",
                expectedOutput: "8",
                isPublic: true,
            },
            {
                input: "[0]",
                expectedOutput: "0",
                isPublic: false,
            },
            {
                input: "[2]",
                expectedOutput: "0",
                isPublic: false,
            },
            {
                input: "[100]",
                expectedOutput: "25",
                isPublic: false,
            },
        ],
    },
    {
        title: "Joias e Pedras",
        topic: "Hash Table · String",
        entryPoint: "numJewelsInStones",
        statementBlocks: [
            {
                type: "text",
                value: 'Você recebe duas strings, `jewels` e `stones`.\n\nCada caractere de `stones` representa uma pedra que você possui. Cada caractere de `jewels` representa um tipo de pedra considerado precioso.\n\nUm caractere de `stones` é joia se ele também aparece em `jewels`. A comparação diferencia maiúsculas de minúsculas, então `"a"` e `"A"` são tipos distintos de pedra.',
            },
            {
                type: "text",
                value: "Retorne o número de caracteres de `stones` que também são caracteres de `jewels`, ou seja, quantas das suas pedras são joias.",
            },
            {
                type: "text",
                value: "**Restrições**\n- `1 <= jewels.length, stones.length <= 50`\n- `jewels` e `stones` contêm apenas letras do alfabeto inglês (maiúsculas e minúsculas)\n- Todos os caracteres de `jewels` são distintos",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {string} jewels\n   * @param {string} stones\n   * @return {number}\n   */\n  numJewelsInStones(jewels, stones) {\n    // sua solução aqui\n  }\n}",
            python: "class Solution:\n    def numJewelsInStones(self, jewels: str, stones: str) -> int:\n        # sua solução aqui\n        pass",
        },
        tests: [
            {
                input: '["aA", "aAAbbbb"]',
                expectedOutput: "3",
                isPublic: true,
            },
            {
                input: '["z", "ZZ"]',
                expectedOutput: "0",
                isPublic: true,
            },
            {
                input: '["a", "a"]',
                expectedOutput: "1",
                isPublic: false,
            },
            {
                input: '["abc", "aabbcc"]',
                expectedOutput: "6",
                isPublic: false,
            },
            {
                input: '["abcdefghijklmnopqrstuvwxyz", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"]',
                expectedOutput: "50",
                isPublic: false,
            },
        ],
    },
    {
        title: "Primeiro Caractere Único",
        topic: "String · Hash Table",
        entryPoint: "firstUniqChar",
        statementBlocks: [
            {
                type: "text",
                value: "Dada uma string `s`, encontre a posição do primeiro caractere que aparece **exatamente uma vez** nela.",
            },
            {
                type: "text",
                value: "Percorra `s` da esquerda para a direita. O resultado é o índice (começando em `0`) do primeiro caractere cuja contagem total de ocorrências em `s` é igual a `1`. Se nenhum caractere for único, retorne `-1`.",
            },
            {
                type: "text",
                value: "**Restrições**\n\n- `1 ≤ s.length ≤ 10^5`\n- `s` contém apenas letras minúsculas do alfabeto inglês (`a` a `z`)",
            },
        ],
        starterCode: {
            javascript:
                "class Solution {\n  /**\n   * @param {string} s\n   * @return {number}\n   */\n  firstUniqChar(s) {\n    // sua solução aqui\n  }\n}\n",
            python: "class Solution:\n    def firstUniqChar(self, s: str) -> int:\n        # sua solução aqui\n        pass\n",
        },
        tests: [
            {
                input: '["leetcode"]',
                expectedOutput: "0",
                isPublic: true,
            },
            {
                input: '["loveleetcode"]',
                expectedOutput: "2",
                isPublic: true,
            },
            {
                input: '["aabb"]',
                expectedOutput: "-1",
                isPublic: false,
            },
            {
                input: '["z"]',
                expectedOutput: "0",
                isPublic: false,
            },
            {
                input: '["abcabcde"]',
                expectedOutput: "6",
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
                difficulty: "facil",
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
    console.log(`Desafios fáceis criados: ${criados} (de ${DESAFIOS.length}).`);
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
