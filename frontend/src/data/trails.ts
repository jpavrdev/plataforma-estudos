/* Dados de exemplo (mock) das trilhas. Trocar pela API quando os endpoints existirem. */

export type TrailLevel = 'Iniciante' | 'Intermediário' | 'Avançado';

export interface Trail {
  name: string;
  glyph: string;
  hue: string;
  level: TrailLevel;
  lessons: number;
  done: number;
  desc: string;
  tags: string[];
}

export interface ContinueTrail {
  name: string;
  next: string;
  pct: number;
  done: number;
  total: number;
}

export const continuar: ContinueTrail = {
  name: 'Lógica de Programação',
  next: 'Estruturas de repetição: while e for',
  pct: 75,
  done: 18,
  total: 24,
};

export const trilhaFilters = [
  'Todas',
  'Fundamentos',
  'Linguagens',
  'Algoritmos',
  'Back-end',
  'Entrevistas',
];

export const trilhasFull: Trail[] = [
  { name: 'Lógica de Programação', glyph: '{}', hue: '#2D6BF5', level: 'Iniciante', lessons: 24, done: 18, desc: 'Variáveis, condicionais, laços e funções, a base de qualquer linguagem.', tags: ['Fundamentos', 'Lógica'] },
  { name: 'JavaScript Essencial', glyph: 'JS', hue: '#E0A82E', level: 'Iniciante', lessons: 30, done: 27, desc: 'Sintaxe, arrays, objetos e manipulação do DOM na prática.', tags: ['Linguagem', 'Web'] },
  { name: 'Estruturas de Dados', glyph: '[]', hue: '#2E9E6B', level: 'Intermediário', lessons: 20, done: 7, desc: 'Listas, pilhas, filas, árvores e tabelas hash explicadas com código.', tags: ['Algoritmos', 'CS'] },
  { name: 'Algoritmos', glyph: 'fx', hue: '#D9536B', level: 'Avançado', lessons: 20, done: 2, desc: 'Busca, ordenação, recursão e complexidade Big-O do zero.', tags: ['Algoritmos', 'Entrevistas'] },
  { name: 'Python para Iniciantes', glyph: 'Py', hue: '#5B8DEF', level: 'Iniciante', lessons: 26, done: 0, desc: 'Comece a programar com uma das linguagens mais amigáveis.', tags: ['Linguagem'] },
  { name: 'SQL & Bancos de Dados', glyph: 'DB', hue: '#9B6CD6', level: 'Intermediário', lessons: 18, done: 0, desc: 'Modelagem, consultas e joins para guardar e buscar dados.', tags: ['Back-end', 'Dados'] },
];
