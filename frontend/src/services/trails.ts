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
}

const LEVEL_LABEL: Record<TrailApi['trailLevel'], TrailLevel> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

// Cor de destaque do card derivada do nível (o banco nao guarda cor).
const LEVEL_HUE: Record<TrailLevel, string> = {
  Iniciante: '#2D6BF5',
  'Intermediário': '#2E9E6B',
  'Avançado': '#D9536B',
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
    tags: [level],
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
