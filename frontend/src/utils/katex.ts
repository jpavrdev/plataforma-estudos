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

/**
 * Põe os `$$` de uma fórmula de bloco em linhas próprias, que é o único formato
 * que o remark-math trata como fórmula de display.
 *
 * O remark-math é mais estrito que o resto do ecossistema: `$$x=1$$` numa linha
 * só vira nó `inlineMath`, e só `$$` / fórmula / `$$` em três linhas vira nó
 * `math`. Como o KaTeX renderiza inline em textstyle, a fórmula sai pequena,
 * alinhada à esquerda e com as frações aninhadas espremidas a ponto de os
 * expoentes colidirem.
 *
 * Todo o conteúdo de matemática foi autorado na forma de uma linha, que é como
 * GitHub, Obsidian e Jupyter aceitam: 245 aulas em 8 trilhas. Normalizar aqui
 * conserta as 245 de uma vez, vale para o conteúdo futuro e não depende de quem
 * autora conhecer a exigência do parser.
 *
 * Cerca de código é respeitada: `$$` dentro de ``` fica intacto. Indentação de 4
 * espaços ou mais também é pulada, porque ali a linha já era bloco de código.
 */
export function normalizarFormulasEmBloco(texto: string): string {
  if (!texto.includes('$$')) return texto;

  let emCerca = false;
  return texto
    .split('\n')
    .map((linha) => {
      if (/^\s*(```|~~~)/.test(linha)) {
        emCerca = !emCerca;
        return linha;
      }
      if (emCerca) return linha;

      const achou = /^( {0,3})\$\$(.+?)\$\$[ \t]*$/.exec(linha);
      return achou ? `${achou[1]}$$\n${achou[2]}\n${achou[1]}$$` : linha;
    })
    .join('\n');
}
