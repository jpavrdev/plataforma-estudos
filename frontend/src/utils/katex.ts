/**
 * Opções do KaTeX usadas em TODA renderização de fórmula do app.
 *
 * O macro do \neq existe por um bug de renderização confirmado em produção. O
 * KaTeX monta esse símbolo com dois caracteres, U+E020 (uma barra que deveria ter
 * largura zero e cair em cima) seguido de U+3D (o igual), contando com a
 * sobreposição. Ela não acontece aqui, e a barra vira um caractere separado à
 * esquerda: a aula escreve "b \neq 0" e o aluno lê "b /= 0". Em alguns pontos a
 * barra some de vez e vira "b = 0", que é o significado oposto.
 *
 * A fonte TEM o glifo correto de ≠ (U+2260); o KaTeX é que não o usa. Apontar
 * direto para ele resolve sem tocar nas 51 aulas, 12 enunciados, 18 alternativas
 * e 30 resoluções que já usam \neq, e passa a valer para todo conteúdo futuro.
 *
 * Os outros símbolos negados (\notin, \nleq, \ngeq, \nsubseteq, \nmid) foram
 * conferidos um a um e renderizam certo, porque têm glifo próprio na fonte AMS.
 */
export const opcoesKatex = {
  macros: {
    '\\neq': '\\mathrel{\\char"2260}',
    '\\ne': '\\mathrel{\\char"2260}',
  },
};
