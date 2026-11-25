import api from './api';
import type { Cartao } from './flashcards';

export type Nivel = 'estagio' | 'junior' | 'pleno' | 'senior';

export type NivelKey =
  | 'entrevista.stage'
  | 'entrevista.junior'
  | 'entrevista.pleno'
  | 'entrevista.senior';
export type NivelDescriptionKey =
  | 'entrevista.stageDesc'
  | 'entrevista.juniorDesc'
  | 'entrevista.plenoDesc'
  | 'entrevista.seniorDesc';

/** Do mais raso ao mais fundo. A ordem é a mesma do backend, e o corte é cumulativo. */
export const NIVEIS: { valor: Nivel; key: NivelKey; descriptionKey: NivelDescriptionKey }[] = [
  { valor: 'estagio', key: 'entrevista.stage', descriptionKey: 'entrevista.stageDesc' },
  { valor: 'junior', key: 'entrevista.junior', descriptionKey: 'entrevista.juniorDesc' },
  { valor: 'pleno', key: 'entrevista.pleno', descriptionKey: 'entrevista.plenoDesc' },
  { valor: 'senior', key: 'entrevista.senior', descriptionKey: 'entrevista.seniorDesc' },
];

export interface TopicoEntrevista {
  id: string;
  slug: string;
  nome: string;
  /** Perguntas que o tópico tem até o nível escolhido. */
  total: number;
  /** Quantas dessas o aluno já respondeu alguma vez. */
  vistas: number;
}

export interface ResumoEntrevista {
  nivel: Nivel;
  total: number;
  novas: number;
  vistas: number;
}

export async function obterTopicos(nivel: Nivel) {
  const { data } = await api.get<TopicoEntrevista[]>(`/entrevista/topicos?nivel=${nivel}`);
  return data;
}

export async function obterResumo(nivel: Nivel) {
  const { data } = await api.get<ResumoEntrevista>(`/entrevista/resumo?nivel=${nivel}`);
  return data;
}

/**
 * A sessão. Sem tópico escolhido vem de todos, e a ordem é embaralhada pelo
 * servidor: numa entrevista as perguntas não vêm na ordem em que você as estudou.
 */
export async function filaDeEntrevista(nivel: Nivel, topicos: string[], limite: number) {
  const q = new URLSearchParams({ nivel, limite: String(limite) });
  if (topicos.length) q.set('topicos', topicos.join(','));
  const { data } = await api.get<Cartao[]>(`/entrevista/fila?${q.toString()}`);
  return data;
}
