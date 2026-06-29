import api from './api';
import type { Trail, TrailLevel } from '../data/trails';

// Formato cru vindo do backend.
interface TrailApi {
  id: string;
  name: string;
  trailLevel: 'iniciante' | 'intermediario' | 'avancado';
  description: string;
  totalLessons: number;
  completedLessons?: number;
  progress?: number;
  tags?: { id: string; name: string }[];
}

const LEVEL_LABEL: Record<TrailApi['trailLevel'], TrailLevel> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

// Cor de destaque do card derivada do nível (o banco nao guarda cor).
const LEVEL_HUE: Record<TrailLevel, string> = {
  Iniciante: '#2D6BF5',
  Intermediário: '#2E9E6B',
  Avançado: '#D9536B',
};

function glyphDoNome(name: string): string {
  const limpo = name.replace(/[^A-Za-zÀ-ú ]/g, '').trim();
  const partes = limpo.split(/\s+/).slice(0, 2);
  return partes.map((p) => p[0]?.toUpperCase() ?? '').join('') || '{}';
}

function adaptar(t: TrailApi): Trail & { id: string } {
  const level = LEVEL_LABEL[t.trailLevel] ?? 'Iniciante';
  return {
    id: t.id,
    name: t.name,
    glyph: glyphDoNome(t.name),
    hue: LEVEL_HUE[level],
    level,
    lessons: t.totalLessons,
    done: t.completedLessons ?? 0,
    desc: t.description,
    tags: t.tags?.map((tg) => tg.name) ?? [],
  };
}

export async function listarTrilhas() {
  const { data } = await api.get<TrailApi[]>('/trails');
  return data.map(adaptar);
}

export async function listarMinhasTrilhas() {
  const { data } = await api.get<TrailApi[]>('/me/trails');
  return data.map(adaptar);
}

export type LessonState = 'done' | 'current' | 'locked';

export interface LessonRef {
  id: string;
  title: string;
  position: number;
  published?: boolean;
  state: LessonState;
}

export interface ModuleWithLessons {
  id: string;
  title: string;
  position: number;
  lessons: LessonRef[];
}

export interface TrailDetail {
  id: string;
  name: string;
  trailLevel: TrailApi['trailLevel'];
  description: string;
  modules: ModuleWithLessons[];
}

export async function obterTrilha(trailId: string) {
  const { data } = await api.get<TrailDetail>(`/trails/${trailId}`);
  return data;
}

export interface QuizOption {
  id: string;
  text: string;
  position: number;
}
export interface QuizQuestion {
  id: string;
  statement: string;
  position: number;
  options: QuizOption[];
}
export type BlocoTipo = 'text' | 'code' | 'image' | 'video' | 'quote';
export interface Bloco {
  type: BlocoTipo;
  value: string;
}

export interface LessonDetail {
  id: string;
  trailId: string;
  moduleId: string;
  title: string;
  content: string | null;
  contentBlocks: Bloco[] | null;
  state: LessonState;
  questions: QuizQuestion[];
}

export async function obterAula(lessonId: string) {
  const { data } = await api.get<LessonDetail>(`/lessons/${lessonId}`);
  return data;
}

export interface QuizResult {
  correct: number;
  total: number;
  passed: boolean;
  lessonCompleted: boolean;
}

export async function enviarQuiz(
  lessonId: string,
  answers: { questionId: string; optionId: string }[],
) {
  const { data } = await api.post<QuizResult>(`/lessons/${lessonId}/quiz`, { answers });
  return data;
}

export interface CheckResult {
  correct: boolean;
  correctOptionId: string;
}

// Verifica uma unica resposta (feedback imediato do quiz em carrossel). O gabarito
// das outras questoes nao e exposto: o backend so revela a alternativa da questao enviada.
export async function verificarResposta(lessonId: string, questionId: string, optionId: string) {
  const { data } = await api.post<CheckResult>(`/lessons/${lessonId}/quiz/check`, {
    questionId,
    optionId,
  });
  return data;
}

// ===== Estúdio (admin) =====

export type QuestionDifficulty = 'facil' | 'medio' | 'dificil';

export interface StudioLessonRef {
  id: string;
  title: string;
  position: number;
  published: boolean;
}
export interface StudioModule {
  id: string;
  title: string;
  position: number;
  lessons: StudioLessonRef[];
}
export interface StudioTrail {
  id: string;
  name: string;
  modules: StudioModule[];
}

export async function obterEstudio(trailId: string) {
  const { data } = await api.get<StudioTrail>(`/trails/${trailId}/studio`);
  return data;
}

export interface StudioOption {
  id?: string;
  text: string;
  isCorrect: boolean;
}
export interface StudioQuestion {
  id?: string;
  statement: string;
  difficulty: QuestionDifficulty;
  options: StudioOption[];
}
export interface StudioLesson {
  id: string;
  moduleId: string;
  title: string;
  content: string | null;
  contentBlocks: Bloco[];
  published: boolean;
  position: number;
  questions: StudioQuestion[];
}

export async function obterAulaEstudio(lessonId: string) {
  const { data } = await api.get<StudioLesson>(`/lessons/${lessonId}/studio`);
  return data;
}

export interface SalvarAulaPayload {
  title: string;
  contentBlocks: Bloco[];
  published?: boolean;
  questions: {
    statement: string;
    difficulty: QuestionDifficulty;
    options: { text: string; isCorrect: boolean }[];
  }[];
}
export async function salvarAulaEstudio(lessonId: string, payload: SalvarAulaPayload) {
  const { data } = await api.put(`/lessons/${lessonId}/studio`, payload);
  return data;
}

export async function criarModulo(trailId: string, title: string, position: number) {
  const { data } = await api.post<{ id: string }>(`/trails/${trailId}/modules`, {
    title,
    position,
  });
  return data;
}
export async function criarAula(moduleId: string, title: string, position: number) {
  const { data } = await api.post<{ id: string }>(`/modules/${moduleId}/lessons`, {
    title,
    position,
  });
  return data;
}
export async function excluirAula(lessonId: string) {
  await api.delete(`/lessons/${lessonId}`);
}
export async function excluirModulo(moduleId: string) {
  await api.delete(`/modules/${moduleId}`);
}

export type TrailLevelEnum = 'iniciante' | 'intermediario' | 'avancado';

export async function criarTrilha(payload: {
  name: string;
  level: TrailLevelEnum;
  description: string;
  tagIds?: string[];
}) {
  const { data } = await api.post<{ id: string }>('/trails', payload);
  return data;
}
export async function atualizarTrilha(
  id: string,
  payload: { name?: string; level?: TrailLevelEnum; description?: string; tagIds?: string[] },
) {
  const { data } = await api.patch(`/trails/${id}`, payload);
  return data;
}
export async function excluirTrilha(id: string) {
  await api.delete(`/trails/${id}`);
}

export interface XpStats {
  xp: number;
  lessonsCompleted: number;
  questionsCorrect: number;
}
export async function obterXp() {
  const { data } = await api.get<XpStats>('/me/xp');
  return data;
}

// ===== Tags (categorias de trilha) =====

export interface Tag {
  id: string;
  name: string;
}
export async function listarTags() {
  const { data } = await api.get<Tag[]>('/tags');
  return data;
}
export async function criarTag(name: string) {
  const { data } = await api.post<Tag>('/tags', { name });
  return data;
}
export async function atualizarTag(id: string, name: string) {
  const { data } = await api.patch<Tag>(`/tags/${id}`, { name });
  return data;
}
export async function excluirTag(id: string) {
  await api.delete(`/tags/${id}`);
}

// ===== Linguagens (canônicas do perfil) =====

export interface Language {
  id: string;
  name: string;
}
export async function listarLinguagens() {
  const { data } = await api.get<Language[]>('/languages');
  return data;
}
export async function criarLinguagem(name: string) {
  const { data } = await api.post<Language>('/languages', { name });
  return data;
}
export async function atualizarLinguagem(id: string, name: string) {
  const { data } = await api.patch<Language>(`/languages/${id}`, { name });
  return data;
}
export async function excluirLinguagem(id: string) {
  await api.delete(`/languages/${id}`);
}

// ===== Conquistas =====

export type CriterioConquista = 'xp_total' | 'lessons_completed' | 'questions_correct';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteriaType: CriterioConquista;
  threshold: number;
}
export interface MinhaConquista extends Achievement {
  earned: boolean;
  earnedAt: string | null;
}
export interface PayloadConquista {
  name: string;
  description: string;
  icon: string;
  criteriaType: CriterioConquista;
  threshold: number;
}

export async function listarConquistas() {
  const { data } = await api.get<Achievement[]>('/achievements');
  return data;
}
export async function criarConquista(payload: PayloadConquista) {
  const { data } = await api.post<Achievement>('/achievements', payload);
  return data;
}
export async function atualizarConquista(id: string, payload: PayloadConquista) {
  const { data } = await api.patch<Achievement>(`/achievements/${id}`, payload);
  return data;
}
export async function excluirConquista(id: string) {
  await api.delete(`/achievements/${id}`);
}
export async function obterMinhasConquistas() {
  const { data } = await api.get<MinhaConquista[]>('/me/achievements');
  return data;
}

// ===== Atividades recentes =====

export interface Atividade {
  type: string;
  icon: string;
  text: string;
  at: string;
}
export async function obterAtividades() {
  const { data } = await api.get<Atividade[]>('/me/activity');
  return data;
}

// Feed da comunidade: quem desbloqueou cada conquista.
export interface FeedConquista {
  name: string;
  achievement: string;
  icon: string;
  at: string;
}
export async function obterFeedConquistas() {
  const { data } = await api.get<FeedConquista[]>('/community/achievements');
  return data;
}

// Ranking global por XP.
export type RankingPeriodo = 'week' | 'month' | 'all';
export interface RankingRow {
  position: number;
  name: string;
  username: string | null;
  xp: number;
  level: number;
  streak: number;
  delta: number;
  you: boolean;
}
export interface RankingMe {
  position: number;
  username: string | null;
  xp: number;
  totalXp: number;
  level: number;
  streak: number;
  delta: number;
}
export interface RankingResposta {
  me: RankingMe | null;
  rows: RankingRow[];
}
export async function obterRanking(period: RankingPeriodo = 'all') {
  const { data } = await api.get<RankingResposta>('/ranking', { params: { period } });
  return data;
}

// Streak (dias seguidos de estudo) + os últimos 7 dias.
export interface DiaSemana {
  label: string;
  active: boolean;
}
export interface StreakInfo {
  streak: number;
  week: DiaSemana[];
}
export async function obterStreak() {
  const { data } = await api.get<StreakInfo>('/me/streak');
  return data;
}
