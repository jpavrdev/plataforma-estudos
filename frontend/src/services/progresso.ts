import api from './api';

export type PeriodoProgresso = '7' | '30' | '90' | '365' | 'tudo';

export type MetaSemana =
  | { tipo: 'padrao'; valor: number; alvo: number }
  | { tipo: 'aulas'; valor: number; alvo: number; alvoDiario: number }
  | { tipo: 'dias'; valor: number; alvo: number };

export interface ProgressoData {
  hoje: string;
  xpTotal: number;
  level: number;
  streakAtual: number;
  streakRecorde: number;
  periodo: {
    dias: number | null;
    atual: { xp: number; exercicios: number; minutos: number };
    anterior: { xp: number; exercicios: number; minutos: number } | null;
  };
  xpPorDia: { d: string; xp: number }[];
  metaSemana: MetaSemana;
  heatmap: { d: string; n: number }[];
  aulasAno: number;
  dominio: {
    trailId: string;
    name: string;
    trailLevel: 'iniciante' | 'intermediario' | 'avancado';
    acertos: number;
    total: number;
    pct: number;
  }[];
}

export async function obterProgresso(periodo: PeriodoProgresso) {
  const { data } = await api.get<ProgressoData>('/me/progresso', { params: { periodo } });
  return data;
}

export async function definirMetaSemanal(kind: 'aulas' | 'dias', target: number) {
  await api.put('/me/meta-semanal', { kind, target });
}

export async function limparMetaSemanal() {
  await api.delete('/me/meta-semanal');
}
