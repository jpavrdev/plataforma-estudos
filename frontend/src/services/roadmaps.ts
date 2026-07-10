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
