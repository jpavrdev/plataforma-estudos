import api from './api';

// The sprint game engine's client. Payloads are English, like every new API
// surface (screens translate what the student sees).

export type SprintTaskView = {
  id: string;
  position: number;
  trackName: string;
  title: string;
  description: string;
  points: number;
  tag: string;
  status: 'backlog' | 'doing' | 'review' | 'done';
  locked: boolean;
};

export type RankEntry = { position: number; name: string; points: number; you: boolean };

export type SprintData = {
  sprint: {
    id: string;
    number: number;
    product: string;
    summary: string;
    endsAt: string;
    totalTasks: number;
    totalPoints: number;
    delivered: number;
    earned: number;
    over: boolean;
  };
  tasks: SprintTaskView[];
  ranking: RankEntry[];
};

export type SprintTaskDetail = {
  id: string;
  position: number;
  trackName: string;
  title: string;
  description: string;
  points: number;
  tag: string;
  criteria: string[];
  tests: { name: string; ms: number }[];
  starterCode: string;
  code: string;
  status: SprintTaskView['status'];
  sprint: { id: string; number: number; product: string; endsAt: string; totalTasks: number };
};

export async function fetchCurrentSprint(): Promise<SprintData> {
  const { data } = await api.get<SprintData>('/sprints/current');
  return data;
}

export async function fetchSprintTask(taskId: string): Promise<SprintTaskDetail> {
  const { data } = await api.get<SprintTaskDetail>(`/sprints/tasks/${taskId}`);
  return data;
}

export async function saveSprintCode(taskId: string, code: string): Promise<void> {
  await api.post(`/sprints/tasks/${taskId}/code`, { code });
}

export async function claimSprintTask(taskId: string): Promise<void> {
  await api.post(`/sprints/tasks/${taskId}/claim`);
}

export async function returnSprintTask(taskId: string): Promise<void> {
  await api.post(`/sprints/tasks/${taskId}/return`);
}

export async function completeSprintTask(taskId: string): Promise<{
  xpEarned: number;
  points: number;
  ranking: RankEntry[];
}> {
  const { data } = await api.post(`/sprints/tasks/${taskId}/complete`);
  return data;
}
