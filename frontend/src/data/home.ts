/* Dados de exemplo (mock) da Home. Trocar pela API quando os endpoints existirem. */

export interface CurrentUser {
  name: string;
  initials: string;
  level: number;
  streak: number;
  rank: number;
}

export interface DailyChallenge {
  id: string;
  title: string;
  difficulty: string;
  xp: number;
  tags: string[];
  description: string;
  acceptance: string;
  solvedToday: string;
  avgTime: string;
}

export interface Trilha {
  name: string;
  sub: string;
  pct: number;
  hue: string;
  glyph: string;
}

export interface WeekDay {
  d: string;
  on: boolean;
}

export interface RankingEntry {
  r: number;
  name: string;
  pts: string;
  initials: string;
  color?: string;
  you?: boolean;
}

export interface FeedItem {
  initials: string;
  color: string;
  name: string;
  text: string;
  time: string;
}

export const user: CurrentUser = {
  name: 'Você',
  initials: 'VC',
  level: 7,
  streak: 12,
  rank: 4,
};

export const dailyChallenge: DailyChallenge = {
  id: '#142',
  title: 'Soma de Dois Números',
  difficulty: 'Fácil',
  xp: 50,
  tags: ['Array', 'Hash Table'],
  description:
    'Dado um vetor de inteiros, retorne os índices dos dois números que somam um valor alvo. Cada entrada tem exatamente uma solução.',
  acceptance: '82%',
  solvedToday: '1.240',
  avgTime: '~10 min',
};

export const trilhas: Trilha[] = [
  { name: 'Lógica de Programação', sub: '18 / 24 aulas', pct: 75, hue: '#2D6BF5', glyph: '{}' },
  { name: 'JavaScript Essencial', sub: '27 / 30 aulas', pct: 90, hue: '#E0A82E', glyph: 'JS' },
  { name: 'Estruturas de Dados', sub: '7 / 20 aulas', pct: 35, hue: '#2E9E6B', glyph: '[]' },
  { name: 'Algoritmos', sub: '2 / 20 aulas', pct: 10, hue: '#D9536B', glyph: 'fx' },
];

export const week: WeekDay[] = [
  { d: 'S', on: true },
  { d: 'T', on: true },
  { d: 'Q', on: true },
  { d: 'Q', on: true },
  { d: 'S', on: true },
  { d: 'S', on: false },
  { d: 'D', on: false },
];

export const ranking: RankingEntry[] = [
  { r: 1, name: 'Marina Alves', pts: '4.820', initials: 'MA', color: '#E0A82E' },
  { r: 2, name: 'Lucas Pereira', pts: '4.610', initials: 'LP', color: '#5B8DEF' },
  { r: 3, name: 'Aisha Santos', pts: '4.395', initials: 'AS', color: '#2E9E6B' },
  { r: 4, name: 'Você', pts: '4.120', initials: 'VC', you: true },
  { r: 5, name: 'Bruno Costa', pts: '3.980', initials: 'BC', color: '#D9536B' },
];

export const feed: FeedItem[] = [
  {
    initials: 'MA',
    color: '#E0A82E',
    name: 'Marina',
    text: 'resolveu Soma de Dois Números',
    time: 'agora',
  },
  {
    initials: 'DR',
    color: '#5B8DEF',
    name: 'Diego',
    text: 'alcançou um streak de 30 dias',
    time: '5 min',
  },
  {
    initials: 'AS',
    color: '#2E9E6B',
    name: 'Aisha',
    text: 'completou a trilha Lógica de Programação',
    time: '12 min',
  },
  { initials: 'BC', color: '#D9536B', name: 'Bruno', text: 'subiu para o nível 8', time: '1 h' },
];

export const MEDALS: Record<number, string> = {
  1: 'var(--gold)',
  2: 'var(--silver)',
  3: 'var(--bronze)',
};
