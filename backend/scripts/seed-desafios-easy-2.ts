// Seed dos desafios fáceis (lote 2, formato função). Idempotente por título;
// o número de exibição é atribuído dinamicamente (próximo livre) para não colidir.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-desafios-easy-2.ts
import { db } from "../db.ts";
import { challenges, challengeTests } from "../schema.ts";
import { eq, sql } from "drizzle-orm";

const DESAFIOS = [
    {
        "title": "Anagrama Válido",
        "topic": "String · Tabela Hash",
        "entryPoint": "isAnagram",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Dadas duas strings `s` e `t`, verifique se `t` é um **anagrama** de `s`.\n\nUm anagrama é uma palavra ou frase formada ao reorganizar as letras de outra, usando **todos os caracteres originais exatamente uma vez**. Na prática, `s` e `t` são anagramas quando possuem exatamente os mesmos caracteres, cada um com a mesma quantidade de ocorrências.\n\nImplemente o método `isAnagram`, que retorna `true` se `t` for um anagrama de `s` e `false` caso contrário."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `0 <= s.length, t.length <= 5 * 10^4`\n- `s` e `t` contêm apenas letras minúsculas do alfabeto inglês (`a-z`)\n- Se `s` e `t` tiverem comprimentos diferentes, o resultado é `false`"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {string} s\n   * @param {string} t\n   * @return {boolean}\n   */\n  isAnagram(s, t) {\n    // sua solução aqui\n  }\n}\n",
            "python": "class Solution:\n    def isAnagram(self, s: str, t: str) -> bool:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public boolean isAnagram(String s, String t) {\n        // sua solução aqui\n        return false;\n    }\n}"
        },
        "tests": [
            {
                "input": "[\"anagram\",\"nagaram\"]",
                "expectedOutput": "true",
                "isPublic": true
            },
            {
                "input": "[\"rat\",\"car\"]",
                "expectedOutput": "false",
                "isPublic": true
            },
            {
                "input": "[\"\",\"\"]",
                "expectedOutput": "true",
                "isPublic": false
            },
            {
                "input": "[\"a\",\"a\"]",
                "expectedOutput": "true",
                "isPublic": false
            },
            {
                "input": "[\"a\",\"ab\"]",
                "expectedOutput": "false",
                "isPublic": false
            },
            {
                "input": "[\"ab\",\"ba\"]",
                "expectedOutput": "true",
                "isPublic": false
            },
            {
                "input": "[\"aacc\",\"ccac\"]",
                "expectedOutput": "false",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Palíndromo Válido",
        "topic": "String · Dois Ponteiros",
        "entryPoint": "isPalindrome",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Uma frase é um **palíndromo** se, ao considerar apenas os caracteres **alfanuméricos** e ignorar a diferença entre maiúsculas e minúsculas, ela é lida da mesma forma da esquerda para a direita e da direita para a esquerda.\n\nDada uma string `s`, ignore todos os caracteres que não sejam letras ou dígitos, converta as letras restantes para minúsculas e verifique se o resultado é um palíndromo. Uma string sem nenhum caractere alfanumérico (por exemplo, vazia ou formada apenas por símbolos) é considerada um palíndromo.\n\nImplemente o método `isPalindrome`, que retorna `true` se `s` for um palíndromo e `false` caso contrário."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `0 <= s.length <= 2 * 10^5`\n- `s` contém apenas caracteres ASCII imprimíveis\n- Apenas letras (`a-z`, `A-Z`) e dígitos (`0-9`) são considerados na verificação"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {string} s\n   * @return {boolean}\n   */\n  isPalindrome(s) {\n    // sua solução aqui\n  }\n}\n",
            "python": "class Solution:\n    def isPalindrome(self, s: str) -> bool:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public boolean isPalindrome(String s) {\n        // sua solução aqui\n        return false;\n    }\n}"
        },
        "tests": [
            {
                "input": "[\"A man, a plan, a canal: Panama\"]",
                "expectedOutput": "true",
                "isPublic": true
            },
            {
                "input": "[\"race a car\"]",
                "expectedOutput": "false",
                "isPublic": true
            },
            {
                "input": "[\"\"]",
                "expectedOutput": "true",
                "isPublic": false
            },
            {
                "input": "[\" \"]",
                "expectedOutput": "true",
                "isPublic": false
            },
            {
                "input": "[\"0P\"]",
                "expectedOutput": "false",
                "isPublic": false
            },
            {
                "input": "[\"ab_a\"]",
                "expectedOutput": "true",
                "isPublic": false
            },
            {
                "input": "[\"Aa\"]",
                "expectedOutput": "true",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Prefixo Comum Mais Longo",
        "topic": "String",
        "entryPoint": "longestCommonPrefix",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Escreva uma função para encontrar o **maior prefixo comum** a todas as strings de um vetor `strs`.\n\nO prefixo comum mais longo é a maior sequência de caracteres iniciais que aparece, na mesma ordem, no começo de **todas** as strings do vetor. Se não existir nenhum prefixo em comum, o resultado é uma string vazia `\"\"`.\n\nImplemente o método `longestCommonPrefix`, que retorna o maior prefixo comum a todas as strings de `strs`."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 <= strs.length <= 200`\n- `0 <= strs[i].length <= 200`\n- `strs[i]` contém apenas letras minúsculas do alfabeto inglês\n- Se alguma string for vazia, o prefixo comum será `\"\"`"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {string[]} strs\n   * @return {string}\n   */\n  longestCommonPrefix(strs) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def longestCommonPrefix(self, strs: List[str]) -> str:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public String longestCommonPrefix(String[] strs) {\n        // sua solução aqui\n        return \"\";\n    }\n}"
        },
        "tests": [
            {
                "input": "[[\"flower\",\"flow\",\"flight\"]]",
                "expectedOutput": "\"fl\"",
                "isPublic": true
            },
            {
                "input": "[[\"dog\",\"racecar\",\"car\"]]",
                "expectedOutput": "\"\"",
                "isPublic": true
            },
            {
                "input": "[[\"a\"]]",
                "expectedOutput": "\"a\"",
                "isPublic": false
            },
            {
                "input": "[[\"\"]]",
                "expectedOutput": "\"\"",
                "isPublic": false
            },
            {
                "input": "[[\"abc\",\"abc\",\"abc\"]]",
                "expectedOutput": "\"abc\"",
                "isPublic": false
            },
            {
                "input": "[[\"ab\",\"a\"]]",
                "expectedOutput": "\"a\"",
                "isPublic": false
            },
            {
                "input": "[[\"\",\"b\"]]",
                "expectedOutput": "\"\"",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Busca Binária",
        "topic": "Busca Binária",
        "entryPoint": "search",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Dado um vetor de inteiros `nums` **ordenado em ordem crescente** e um inteiro `target`, escreva uma função que busque `target` em `nums`. Se `target` existir, retorne o seu índice; caso contrário, retorne `-1`.\n\nSeu algoritmo precisa ter complexidade de tempo `O(log n)`.\n\nImplemente o método `search`, que retorna o índice de `target` em `nums`, ou `-1` se ele não estiver presente."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 <= nums.length <= 10^4`\n- `-10^4 < nums[i], target < 10^4`\n- Todos os valores de `nums` são **únicos**\n- `nums` está ordenado em ordem crescente"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[]} nums\n   * @param {number} target\n   * @return {number}\n   */\n  search(nums, target) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def search(self, nums: List[int], target: int) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int search(int[] nums, int target) {\n        // sua solução aqui\n        return -1;\n    }\n}"
        },
        "tests": [
            {
                "input": "[[-1,0,3,5,9,12],9]",
                "expectedOutput": "4",
                "isPublic": true
            },
            {
                "input": "[[-1,0,3,5,9,12],2]",
                "expectedOutput": "-1",
                "isPublic": true
            },
            {
                "input": "[[5],5]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[[5],2]",
                "expectedOutput": "-1",
                "isPublic": false
            },
            {
                "input": "[[2,5],5]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[[-1,0,3,5,9,12],-1]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[[-1,0,3,5,9,12],13]",
                "expectedOutput": "-1",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Posição de Inserção",
        "topic": "Busca Binária · Array",
        "entryPoint": "searchInsert",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Dado um vetor de inteiros `nums` **ordenado em ordem crescente e sem valores repetidos**, e um inteiro `target`, retorne o índice em que `target` é encontrado. Caso ele não esteja presente, retorne o índice em que ele **seria inserido** para que o vetor continue ordenado.\n\nProcure uma solução com complexidade de tempo `O(log n)`.\n\nImplemente o método `searchInsert`, que retorna o índice de `target` em `nums` ou, se ele estiver ausente, a posição de inserção que mantém a ordem crescente."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 <= nums.length <= 10^4`\n- `-10^4 <= nums[i], target <= 10^4`\n- `nums` está ordenado em ordem crescente\n- `nums` não contém valores repetidos"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[]} nums\n   * @param {number} target\n   * @return {number}\n   */\n  searchInsert(nums, target) {\n    // sua solução aqui\n  }\n}\n",
            "python": "from typing import List\n\n\nclass Solution:\n    def searchInsert(self, nums: List[int], target: int) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int searchInsert(int[] nums, int target) {\n        // sua solução aqui\n        return 0;\n    }\n}"
        },
        "tests": [
            {
                "input": "[[1,3,5,6],5]",
                "expectedOutput": "2",
                "isPublic": true
            },
            {
                "input": "[[1,3,5,6],2]",
                "expectedOutput": "1",
                "isPublic": true
            },
            {
                "input": "[[1,3,5,6],7]",
                "expectedOutput": "4",
                "isPublic": false
            },
            {
                "input": "[[1,3,5,6],0]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[[1],0]",
                "expectedOutput": "0",
                "isPublic": false
            },
            {
                "input": "[[1],2]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[[1,3,5,6],1]",
                "expectedOutput": "0",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Raiz Quadrada Inteira",
        "topic": "Matemática · Busca Binária",
        "entryPoint": "mySqrt",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Dado um inteiro não negativo `x`, calcule e retorne a **raiz quadrada inteira** de `x`, ou seja, o maior inteiro `r` tal que `r * r <= x`. Isso equivale ao piso (parte inteira) da raiz quadrada real de `x`.\n\nVocê deve calcular o valor por conta própria (por exemplo, com busca binária ou outra estratégia iterativa). Não use funções prontas de raiz quadrada nem potência com expoente fracionário, como `Math.sqrt`, `math.sqrt`, `math.isqrt` ou `Math.pow(x, 0.5)`.\n\nPor exemplo, para `x = 8` a raiz quadrada real é aproximadamente `2.828`, então o resultado é `2`.\n\nImplemente o método `mySqrt`, que recebe o inteiro `x` e retorna o piso da sua raiz quadrada."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `0 <= x <= 2147483647`\n- Não utilize funções prontas de raiz quadrada (`Math.sqrt`, `math.sqrt`, `math.isqrt`) nem potência com expoente fracionário."
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number} x\n   * @return {number}\n   */\n  mySqrt(x) {\n    // sua solução aqui\n  }\n}\n",
            "python": "class Solution:\n    def mySqrt(self, x: int) -> int:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int mySqrt(int x) {\n        // sua solução aqui\n        return 0;\n    }\n}"
        },
        "tests": [
            {
                "input": "[0]",
                "expectedOutput": "0",
                "isPublic": true
            },
            {
                "input": "[8]",
                "expectedOutput": "2",
                "isPublic": true
            },
            {
                "input": "[1]",
                "expectedOutput": "1",
                "isPublic": false
            },
            {
                "input": "[4]",
                "expectedOutput": "2",
                "isPublic": false
            },
            {
                "input": "[9]",
                "expectedOutput": "3",
                "isPublic": false
            },
            {
                "input": "[100]",
                "expectedOutput": "10",
                "isPublic": false
            },
            {
                "input": "[2147483647]",
                "expectedOutput": "46340",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Número Feliz",
        "topic": "Tabela Hash · Matemática",
        "entryPoint": "isHappy",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Um número é chamado de **feliz** quando, ao repetir o processo a seguir, chegamos ao valor `1`:\n\n- substitua o número pela soma dos quadrados dos seus dígitos;\n- repita o processo com o novo número.\n\nSe o processo entrar em um ciclo que nunca alcança `1`, o número **não** é feliz. Para números que não são felizes esse ciclo sempre se repete, então é preciso detectar quando um valor já visitado reaparece para encerrar o processo.\n\nPor exemplo, para `n = 19`: `1² + 9² = 82`, depois `8² + 2² = 68`, depois `6² + 8² = 100` e por fim `1² + 0² + 0² = 1` — portanto `19` é feliz.\n\nImplemente o método `isHappy`, que recebe o inteiro `n` e retorna `true` se `n` for feliz e `false` caso contrário."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `1 <= n <= 2147483647`"
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number} n\n   * @return {boolean}\n   */\n  isHappy(n) {\n    // sua solução aqui\n  }\n}\n",
            "python": "class Solution:\n    def isHappy(self, n: int) -> bool:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public boolean isHappy(int n) {\n        // sua solução aqui\n        return false;\n    }\n}"
        },
        "tests": [
            {
                "input": "[19]",
                "expectedOutput": "true",
                "isPublic": true
            },
            {
                "input": "[2]",
                "expectedOutput": "false",
                "isPublic": true
            },
            {
                "input": "[1]",
                "expectedOutput": "true",
                "isPublic": false
            },
            {
                "input": "[7]",
                "expectedOutput": "true",
                "isPublic": false
            },
            {
                "input": "[4]",
                "expectedOutput": "false",
                "isPublic": false
            },
            {
                "input": "[116]",
                "expectedOutput": "false",
                "isPublic": false
            },
            {
                "input": "[100]",
                "expectedOutput": "true",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Interseção de Vetores",
        "topic": "Tabela Hash · Array",
        "entryPoint": "intersection",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Dados dois vetores de inteiros `nums1` e `nums2`, retorne a **interseção** entre eles: os valores **distintos** que aparecem nos dois vetores ao mesmo tempo.\n\nCada valor deve aparecer uma única vez no resultado, e o vetor retornado deve estar em **ordem crescente**. Se não houver nenhum elemento em comum, retorne um vetor vazio.\n\nPor exemplo, para `nums1 = [4, 9, 5]` e `nums2 = [9, 4, 9, 8, 4]`, o resultado é `[4, 9]`.\n\nImplemente o método `intersection`, que recebe os vetores `nums1` e `nums2` e retorna a interseção distinta em ordem crescente."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `0 <= nums1.length, nums2.length <= 1000`\n- `-1000 <= nums1[i], nums2[i] <= 1000`\n- O resultado deve conter apenas valores distintos, em ordem crescente."
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {number[]} nums1\n   * @param {number[]} nums2\n   * @return {number[]}\n   */\n  intersection(nums1, nums2) {\n    // sua solução aqui\n  }\n}\n",
            "python": "class Solution:\n    def intersection(self, nums1: list[int], nums2: list[int]) -> list[int]:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public int[] intersection(int[] nums1, int[] nums2) {\n        // sua solução aqui\n        return new int[0];\n    }\n}"
        },
        "tests": [
            {
                "input": "[[1,2,2,1],[2,2]]",
                "expectedOutput": "[2]",
                "isPublic": true
            },
            {
                "input": "[[4,9,5],[9,4,9,8,4]]",
                "expectedOutput": "[4,9]",
                "isPublic": true
            },
            {
                "input": "[[1,2,3],[4,5,6]]",
                "expectedOutput": "[]",
                "isPublic": false
            },
            {
                "input": "[[],[1,2]]",
                "expectedOutput": "[]",
                "isPublic": false
            },
            {
                "input": "[[1],[1]]",
                "expectedOutput": "[1]",
                "isPublic": false
            },
            {
                "input": "[[-3,-1,2],[2,-1,-5]]",
                "expectedOutput": "[-1,2]",
                "isPublic": false
            },
            {
                "input": "[[7,7,7],[7]]",
                "expectedOutput": "[7]",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Nota de Resgate",
        "topic": "Tabela Hash · String",
        "entryPoint": "canConstruct",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Você tem duas strings: `ransomNote` (a nota de resgate) e `magazine` (a revista). Retorne `true` se for possível montar exatamente a `ransomNote` usando apenas as letras disponíveis em `magazine`.\n\nCada letra de `magazine` pode ser usada **no máximo uma vez** na montagem da nota. Em outras palavras, para cada letra a quantidade disponível em `magazine` precisa ser maior ou igual à quantidade exigida pela `ransomNote`.\n\nPor exemplo, com `ransomNote = \"aa\"` e `magazine = \"aab\"` o resultado é `true`, pois há dois `a` disponíveis; já com `magazine = \"ab\"` o resultado seria `false`, pois falta um `a`.\n\nImplemente o método `canConstruct`, que recebe `ransomNote` e `magazine` e retorna `true` se a nota puder ser montada e `false` caso contrário."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `0 <= ransomNote.length, magazine.length <= 100000`\n- `ransomNote` e `magazine` contêm apenas letras minúsculas do alfabeto inglês.\n- Cada letra de `magazine` pode ser usada no máximo uma vez."
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {string} ransomNote\n   * @param {string} magazine\n   * @return {boolean}\n   */\n  canConstruct(ransomNote, magazine) {\n    // sua solução aqui\n  }\n}\n",
            "python": "class Solution:\n    def canConstruct(self, ransomNote: str, magazine: str) -> bool:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public boolean canConstruct(String ransomNote, String magazine) {\n        // sua solução aqui\n        return false;\n    }\n}"
        },
        "tests": [
            {
                "input": "[\"a\",\"b\"]",
                "expectedOutput": "false",
                "isPublic": true
            },
            {
                "input": "[\"aa\",\"aab\"]",
                "expectedOutput": "true",
                "isPublic": true
            },
            {
                "input": "[\"aa\",\"ab\"]",
                "expectedOutput": "false",
                "isPublic": false
            },
            {
                "input": "[\"\",\"abc\"]",
                "expectedOutput": "true",
                "isPublic": false
            },
            {
                "input": "[\"abc\",\"\"]",
                "expectedOutput": "false",
                "isPublic": false
            },
            {
                "input": "[\"aabbcc\",\"abcabc\"]",
                "expectedOutput": "true",
                "isPublic": false
            },
            {
                "input": "[\"ab\",\"ba\"]",
                "expectedOutput": "true",
                "isPublic": false
            }
        ]
    },
    {
        "title": "Strings Isomórficas",
        "topic": "Tabela Hash · String",
        "entryPoint": "isIsomorphic",
        "statementBlocks": [
            {
                "type": "text",
                "value": "Duas strings `s` e `t` são **isomórficas** se for possível substituir os caracteres de `s` para obter `t`, respeitando as regras:\n\n- cada ocorrência de um caractere deve ser sempre substituída pelo mesmo caractere;\n- dois caracteres diferentes nunca podem ser substituídos pelo mesmo caractere;\n- a ordem dos caracteres deve ser preservada.\n\nUm caractere pode mapear para si mesmo. Em outras palavras, deve existir um mapeamento bijetor (um para um) entre os caracteres de `s` e os de `t`.\n\nPor exemplo, `\"egg\"` e `\"add\"` são isomórficas (`e→a`, `g→d`), mas `\"foo\"` e `\"bar\"` não são, pois `o` precisaria mapear para `a` e para `r` ao mesmo tempo.\n\nImplemente o método `isIsomorphic`, que recebe `s` e `t` e retorna `true` se forem isomórficas e `false` caso contrário."
            },
            {
                "type": "text",
                "value": "**Restrições**\n\n- `0 <= s.length <= 50000`\n- `s.length == t.length`\n- `s` e `t` contêm apenas caracteres ASCII imprimíveis."
            }
        ],
        "starterCode": {
            "javascript": "class Solution {\n  /**\n   * @param {string} s\n   * @param {string} t\n   * @return {boolean}\n   */\n  isIsomorphic(s, t) {\n    // sua solução aqui\n  }\n}\n",
            "python": "class Solution:\n    def isIsomorphic(self, s: str, t: str) -> bool:\n        # sua solução aqui\n        pass\n",
            "java": "public class Solution {\n    public boolean isIsomorphic(String s, String t) {\n        // sua solução aqui\n        return false;\n    }\n}"
        },
        "tests": [
            {
                "input": "[\"egg\",\"add\"]",
                "expectedOutput": "true",
                "isPublic": true
            },
            {
                "input": "[\"foo\",\"bar\"]",
                "expectedOutput": "false",
                "isPublic": true
            },
            {
                "input": "[\"paper\",\"title\"]",
                "expectedOutput": "true",
                "isPublic": false
            },
            {
                "input": "[\"badc\",\"baba\"]",
                "expectedOutput": "false",
                "isPublic": false
            },
            {
                "input": "[\"a\",\"a\"]",
                "expectedOutput": "true",
                "isPublic": false
            },
            {
                "input": "[\"ab\",\"aa\"]",
                "expectedOutput": "false",
                "isPublic": false
            },
            {
                "input": "[\"\",\"\"]",
                "expectedOutput": "true",
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
    console.log(`Desafios fáceis (lote 2) criados: ${criados} (de ${DESAFIOS.length}).`);
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
