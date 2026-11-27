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

// Detail of the task the prototype opens: the spec the PO wrote, the code the
// student starts from and the test list. The engine will serve this per task.
export interface TaskDetail {
  poAsk: string;
  criteria: string[];
  tests: { name: string; ms: number }[];
  starterCode: string;
  // Line highlighted and error box when the case-insensitive test fails.
  failLine: number;
  failTitle: string;
  failBody: string;
  baseChips: string[];
}

export const TASK_DETAIL: TaskDetail = {
  poAsk: 'Tem gente criando duas contas com o mesmo e-mail. Dá pra barrar isso no cadastro?',
  criteria: [
    'E-mail novo: cria o usuário e responde 201.',
    'E-mail que já existe: responde 409 e não cria de novo.',
    'Maiúsculas não enganam: ANA@x.com e ana@x.com são o mesmo e-mail.',
    'Deu 409? Nada é gravado no banco.',
    'O que as tasks 1 e 2 já faziam continua passando.',
  ],
  tests: [
    { name: 'email_novo_cria_usuario', ms: 9 },
    { name: 'email_repetido_devolve_409', ms: 7 },
    { name: 'maiusculas_nao_enganam', ms: 11 },
    { name: 'conflito_nao_grava_nada', ms: 6 },
    { name: 'tasks_1_e_2_seguem_ok', ms: 23 },
  ],
  starterCode: `// Você continua do ponto em que a task 2 parou.
pub async fn cadastrar(
    State(db): State<Db>,
    Json(dados): Json<NovoUsuario>,
) -> Result<(StatusCode, Json<Criado>), ApiErro> {
    dados.validar()?; // regras da task 1

    if db.existe_email(&dados.email).await? {
        return Err(ApiErro::Conflito("e-mail já cadastrado"));
    }

    let id = db.salvar(&dados).await?; // banco da task 2
    Ok((StatusCode::CREATED, Json(Criado { id })))
}`,
  failLine: 8,
  failTitle: 'esperado 409 · veio 201',
  failBody:
    'ANA@EXEMPLO.COM passou como se fosse um e-mail novo. Volta no 3º item da especificação.',
  baseChips: ['Task 1 · Cadastro', 'Task 2 · Banco'],
};
