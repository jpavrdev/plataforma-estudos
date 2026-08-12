import api from './api';
import type { Cartao } from './flashcards';

export type Nivel = 'estagio' | 'junior' | 'pleno' | 'senior';

/** Do mais raso ao mais fundo. A ordem é a mesma do backend, e o corte é cumulativo. */
export const NIVEIS: { valor: Nivel; rotulo: string; descricao: string }[] = [
  { valor: 'estagio', rotulo: 'Estágio', descricao: 'Fundamentos e vocabulário' },
  { valor: 'junior', rotulo: 'Júnior', descricao: 'Uso no dia a dia e armadilhas' },
  { valor: 'pleno', rotulo: 'Pleno', descricao: 'Design, produção e depuração' },
  { valor: 'senior', rotulo: 'Sênior', descricao: 'Trade-off e decisão técnica' },
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
