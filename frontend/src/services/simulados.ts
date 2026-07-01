import api from './api';

export interface SimuladoResumo {
  slug: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  questionCount: number;
  passPercent: number;
}

export interface OpcaoSimulado {
  id: string;
  text: string;
  position: number;
  isCorrect?: boolean; // só vem depois de enviar
}

export interface QuestaoSimulado {
  id: string;
  statement: string;
  position: number;
  multiple: boolean;
  options: OpcaoSimulado[];
  selected: string[];
  topic?: string; // só depois de enviar
  explanation?: string | null; // só depois de enviar
}

export interface TemaRevisar {
  topic: string;
  erradas: number;
  total: number;
}

export interface TentativaEstado {
  attemptId: string;
  submitted: boolean;
  expiresAt: string;
  remainingSeconds: number;
  score?: number;
  passed?: boolean;
  temasARevisar?: TemaRevisar[];
  questions: QuestaoSimulado[];
}

export interface ResultadoEnvio {
  acertos: number;
  total: number;
  score: number;
  passed: boolean;
}

export interface TentativaHistorico {
  attemptId: string;
  simulado: string;
  slug: string;
  startedAt: string;
  submittedAt: string | null;
  score: number | null;
  passed: boolean | null;
}

export async function listarSimulados() {
  const { data } = await api.get<SimuladoResumo[]>('/simulados');
  return data;
}

export async function iniciarTentativa(slug: string) {
  const { data } = await api.post<TentativaEstado>(`/simulados/${slug}/attempts`);
  return data;
}

export async function obterTentativa(attemptId: string) {
  const { data } = await api.get<TentativaEstado>(`/simulado-attempts/${attemptId}`);
  return data;
}

export async function salvarResposta(attemptId: string, questionId: string, optionIds: string[]) {
  await api.put(`/simulado-attempts/${attemptId}/answers/${questionId}`, { optionIds });
}

export async function enviarTentativa(attemptId: string) {
  const { data } = await api.post<ResultadoEnvio>(`/simulado-attempts/${attemptId}/submit`);
  return data;
}

export async function historicoSimulados() {
  const { data } = await api.get<TentativaHistorico[]>('/me/simulado-attempts');
  return data;
}
