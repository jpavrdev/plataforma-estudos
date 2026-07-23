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
  workloadHours?: number | null;
}

export const trilhaFilters = [
  'Todas',
  'Fundamentos',
  'Linguagens',
  'Algoritmos',
  'Back-end',
  'Entrevistas',
];
