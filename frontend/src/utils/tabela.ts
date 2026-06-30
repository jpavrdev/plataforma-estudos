// Tabela do Estúdio: o grid é salvo como JSON (matriz de strings) no `value` do
// bloco. A primeira linha é o cabeçalho. Estes helpers convertem entre o JSON e a
// matriz, usados tanto pelo editor quanto pela visualização da aula.

const GRID_PADRAO = [
  ['', ''],
  ['', ''],
];

export function parseGrid(value: string): string[][] {
  try {
    const g = JSON.parse(value);
    if (Array.isArray(g) && g.length > 0 && g.every((r) => Array.isArray(r))) {
      return g.map((r) => r.map((c) => String(c ?? '')));
    }
  } catch (e) {
    console.warn('Tabela com valor inválido, começando vazia', e);
  }
  return GRID_PADRAO.map((r) => [...r]);
}

export const serializeGrid = (grid: string[][]): string => JSON.stringify(grid);
