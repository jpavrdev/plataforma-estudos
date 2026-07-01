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

// ===================== ADMIN =====================

export interface SimuladoAdminItem {
  slug: string;
  name: string;
  durationMinutes: number;
  questionCount: number;
  passPercent: number;
  published: boolean;
  questoes: number;
}

export interface QuestaoAdmin {
  id: string;
  statement: string;
  topic: string | null;
  explanation: string | null;
  options: { id: string; text: string; isCorrect: boolean; position: number }[];
}

export interface SimuladoAdminDetalhe {
  slug: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  questionCount: number;
  passPercent: number;
  published: boolean;
  questions: QuestaoAdmin[];
}

export interface PayloadSimulado {
  slug: string;
  name: string;
  description?: string;
  durationMinutes: number;
  questionCount: number;
  passPercent: number;
  published: boolean;
}
export type PayloadSimuladoUpdate = Partial<Omit<PayloadSimulado, 'slug'>>;

export interface PayloadQuestao {
  statement: string;
  topic?: string;
  explanation?: string;
  options: { text: string; isCorrect: boolean }[];
}

export async function listarSimuladosAdmin() {
  const { data } = await api.get<SimuladoAdminItem[]>('/admin/simulados');
  return data;
}

export async function obterSimuladoAdmin(slug: string) {
  const { data } = await api.get<SimuladoAdminDetalhe>(`/admin/simulados/${slug}`);
  return data;
}

export async function criarSimulado(payload: PayloadSimulado) {
  const { data } = await api.post('/simulados', payload);
  return data;
}

export async function atualizarSimulado(slug: string, payload: PayloadSimuladoUpdate) {
  const { data } = await api.patch(`/simulados/${slug}`, payload);
  return data;
}

export async function excluirSimulado(slug: string) {
  await api.delete(`/simulados/${slug}`);
}

export async function criarQuestaoSimulado(slug: string, payload: PayloadQuestao) {
  const { data } = await api.post<{ id: string }>(`/simulados/${slug}/questions`, payload);
  return data;
}

export async function atualizarQuestaoSimulado(id: string, payload: PayloadQuestao) {
  await api.patch(`/simulado-questions/${id}`, payload);
}

export async function excluirQuestaoSimulado(id: string) {
  await api.delete(`/simulado-questions/${id}`);
}

export interface QuestaoSync {
  id?: string;
  statement: string;
  topic?: string;
  explanation?: string;
  options: { text: string; isCorrect: boolean }[];
}

// Salva todas as questões de uma vez, de forma atômica (uma transação no backend).
export async function sincronizarQuestoes(slug: string, questions: QuestaoSync[]) {
  await api.put(`/admin/simulados/${slug}/questions`, { questions });
}
