// Sprint fixture: placeholder data in the shape the backend will serve once
// the sprint engine exists (tasks with status, deadline, ranking). Swapping
// this for a fetch must not touch the screen components.

export type TaskStatus = 'backlog' | 'doing' | 'review' | 'done';

export interface SprintTask {
  id: string;
  // Short name shown on the HUD track node.
  trackName: string;
  title: string;
  description: string;
  points: number;
  tag: string;
  status: TaskStatus;
  locked: boolean;
}

export interface RankRow {
  position: number;
  name: string;
  points: number;
  you?: boolean;
  climbed?: number;
}

export const SPRINT = {
  number: 1,
  product: 'API de cadastro',
  summary:
    'Um produto que cresce task por task: o que você entrega vira a base da próxima.',
  // Two days and change from mount, like the reference prototype.
  deadlineOffsetMs: (2 * 24 + 14) * 3_600_000 + 32 * 60_000 + 7_000,
  totalPoints: 21,
};

export const RANKING: RankRow[] = [
  { position: 1, name: 'marina.dev', points: 16 },
  { position: 2, name: 'joaopedro', points: 13 },
  { position: 12, name: 'Você', points: 8, you: true, climbed: 2 },
];

export function initialTasks(): SprintTask[] {
  return [
    {
      id: 't1',
      trackName: 'Cadastro',
      title: 'Implementar endpoint de cadastro',
      description: 'Receber os dados, validar o que chega e devolver a resposta certa pra cada caso.',
      points: 5,
      tag: 'RUST · V2',
      status: 'done',
      locked: false,
    },
    {
      id: 't2',
      trackName: 'Banco',
      title: 'Guardar o usuário no banco',
      description: 'Salvar quem passou na validação e devolver o id criado.',
      points: 3,
      tag: 'RUST · V2',
      status: 'review',
      locked: false,
    },
    {
      id: 't3',
      trackName: 'E-mail',
      title: 'Barrar e-mail repetido',
      description: 'Se o e-mail já existe, responder 409 em vez de criar de novo.',
      points: 3,
      tag: 'RUST · V2',
      status: 'backlog',
      locked: false,
    },
    {
      id: 't4',
      trackName: 'Hash',
      title: 'Proteger a senha com hash',
      description: 'Guardar a senha protegida com salt, nunca em texto puro.',
      points: 5,
      tag: 'RUST · V2',
      status: 'backlog',
      locked: true,
    },
    {
      id: 't5',
      trackName: 'Login',
      title: 'Endpoint de login',
      description: 'Autenticar quem já tem conta e devolver a sessão.',
      points: 5,
      tag: 'RUST · V2',
      status: 'backlog',
      locked: true,
    },
  ];
}

// Tasks that left the student's hands already count as delivered on the track.
export function deliveredCount(tasks: SprintTask[]): number {
  return tasks.filter((t) => t.status === 'review' || t.status === 'done').length;
}

export function trackStatus(task: SprintTask): 'done' | 'review' | 'current' | 'locked' {
  if (task.status === 'done') return 'done';
  if (task.status === 'review') return 'review';
  return task.locked ? 'locked' : 'current';
}
