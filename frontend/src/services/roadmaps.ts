import api from './api';

export type RoadmapStatus = 'nao_iniciado' | 'em_progresso' | 'concluido';
export type RoadmapPhase = 'fundamentos' | 'core' | 'avancado' | 'deploy';
export type Nivel = 'iniciante' | 'intermediario' | 'avancado';

export interface RoadmapResumo {
  id: string;
  slug: string;
  name: string;
  description: string;
  level: Nivel;
  icon: string | null;
  premium: boolean;
  tags: string[];
  stagesTotal: number;
  stagesDone: number;
  percent: number;
  status: RoadmapStatus;
}

export interface RoadmapRef {
  refType: 'trail' | 'module' | 'lesson' | 'simulado' | 'challenge';
  refId: string;
  title: string | null;
  trailId?: string;
  lessonId?: string;
  slug?: string;
  number?: number | null;
}

export interface RoadmapStage {
  id: string;
  phase: RoadmapPhase;
  title: string;
  description: string;
  tags: string[];
  position: number;
  completed: boolean;
  locked: boolean;
  refs: RoadmapRef[];
}

export interface RoadmapDetalhe {
  id: string;
  slug: string;
  name: string;
  description: string;
  level: Nivel;
  icon: string | null;
  premium: boolean;
  progress: { stagesTotal: number; stagesDone: number; percent: number; status: RoadmapStatus };
  currentStageId: string | null;
  /** Se o aluno declarou que segue este roadmap. */
  seguindo: boolean;
  stages: RoadmapStage[];
}

export async function listarRoadmaps() {
  const { data } = await api.get<RoadmapResumo[]>('/roadmaps');
  return data;
}

export async function obterRoadmap(slug: string) {
  const { data } = await api.get<RoadmapDetalhe>(`/roadmaps/${slug}`);
  return data;
}

/** Como o backend escolheu o roadmap da sugestão. Só 'declarado' é certeza:
 *  nos outros dois a tela oferece a troca em vez de afirmar. */
export type OrigemSugestao = 'declarado' | 'inferido' | 'heuristica';

export interface ProximaTrilhaRoadmap {
  roadmap: { slug: string; name: string } | null;
  proximaTrilha: { id: string; name: string; level: Nivel } | null;
  origem?: OrigemSugestao;
  outrosRoadmaps?: { slug: string; name: string }[];
}

export async function proximaTrilhaRoadmap(trailId: string) {
  const { data } = await api.get<ProximaTrilhaRoadmap>(`/roadmaps/proxima-trilha/${trailId}`);
  return data;
}

/** Declara que o aluno segue este roadmap. Idempotente. */
export async function seguirRoadmap(slug: string) {
  await api.post(`/roadmaps/${slug}/seguir`);
}

// ===================== ADMIN (estúdio) =====================

export async function concluirEstagio(stageId: string) {
  const { data } = await api.post(`/roadmap-stages/${stageId}/concluir`);
  return data;
}

export type RefType = RoadmapRef['refType'];

export interface RoadmapAdminItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  level: Nivel;
  icon: string | null;
  position: number;
  premium: boolean;
  published: boolean;
  stagesTotal: number;
}

export interface RoadmapStudioRef {
  id: string;
  refType: RefType;
  refId: string;
  position: number;
  title: string | null;
  trailId?: string;
  slug?: string;
}

export interface RoadmapStudioStage {
  id: string;
  phase: RoadmapPhase;
  title: string;
  description: string;
  tags: string[];
  position: number;
  refs: RoadmapStudioRef[];
}

export interface RoadmapStudio {
  id: string;
  slug: string;
  name: string;
  description: string;
  level: Nivel;
  icon: string | null;
  position: number;
  premium: boolean;
  published: boolean;
  stages: RoadmapStudioStage[];
}

export interface PayloadRoadmap {
  slug?: string;
  name: string;
  description: string;
  level: Nivel;
  icon?: string;
  position?: number;
  premium?: boolean;
  published?: boolean;
}
export type PayloadRoadmapUpdate = Partial<PayloadRoadmap>;

export interface PayloadStage {
  phase: RoadmapPhase;
  title: string;
  description: string;
  tags?: string[];
  position?: number;
}
export type PayloadStageUpdate = Partial<PayloadStage>;

export interface PayloadRef {
  refType: RefType;
  refId: string;
  position?: number;
}

export async function listarRoadmapsAdmin() {
  const { data } = await api.get<RoadmapAdminItem[]>('/studio/roadmaps');
  return data;
}

export async function obterRoadmapStudio(id: string) {
  const { data } = await api.get<RoadmapStudio>(`/studio/roadmaps/${id}`);
  return data;
}

export async function criarRoadmap(payload: PayloadRoadmap) {
  const { data } = await api.post<RoadmapAdminItem>('/roadmaps', payload);
  return data;
}

export async function atualizarRoadmap(id: string, payload: PayloadRoadmapUpdate) {
  const { data } = await api.patch(`/roadmaps/${id}`, payload);
  return data;
}

export async function excluirRoadmap(id: string) {
  await api.delete(`/roadmaps/${id}`);
}

export async function criarEstagio(roadmapId: string, payload: PayloadStage) {
  const { data } = await api.post<RoadmapStudioStage>(`/roadmaps/${roadmapId}/stages`, payload);
  return data;
}

export async function atualizarEstagio(id: string, payload: PayloadStageUpdate) {
  const { data } = await api.patch(`/roadmap-stages/${id}`, payload);
  return data;
}

export async function excluirEstagio(id: string) {
  await api.delete(`/roadmap-stages/${id}`);
}

export async function adicionarRef(stageId: string, payload: PayloadRef) {
  const { data } = await api.post<RoadmapStudioRef>(`/roadmap-stages/${stageId}/refs`, payload);
  return data;
}

export async function removerRef(id: string) {
  await api.delete(`/roadmap-stage-refs/${id}`);
}
