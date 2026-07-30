import api from './api';

export type Tom = 'bom' | 'atencao' | 'ruim';
export type Prioridade = 'alta' | 'media' | 'baixa';
export type Motor = 'heuristica' | 'ia';

export interface ItemResumo {
  rotulo: string;
  valor: string;
  tom: Tom;
  icone: string;
}

export interface ItemDetalhe {
  rotulo: string;
  icone: string;
  pct: number;
}

export interface Sugestao {
  prioridade: Prioridade;
  titulo: string;
  texto: string;
}

export interface Analise {
  id: string;
  criadaEm: string;
  tituloVaga?: string | null;
  score: number;
  veredito: string;
  descricao: string;
  motor: Motor;
  resumo: ItemResumo[];
  detalhe: ItemDetalhe[];
  encontradas: string[];
  parciais: string[];
  ausentes: string[];
  sugestoes: Sugestao[];
  restantes?: number;
}

export interface StatusCurriculo {
  liberado: boolean;
  usadas: number;
  limite: number;
  restantes: number;
  ia: boolean;
}

export interface ResumoAnalise {
  id: string;
  tituloVaga: string | null;
  score: number;
  veredito: string;
  motor: Motor;
  criadaEm: string;
}

export async function obterStatusCurriculo() {
  const { data } = await api.get<StatusCurriculo>('/curriculo/status');
  return data;
}

export async function analisarCurriculo(entrada: {
  vaga: string;
  tituloVaga?: string;
  pdf: string;
}) {
  const { data } = await api.post<Analise>('/curriculo/analises', entrada);
  return data;
}

export async function listarAnalises() {
  const { data } = await api.get<ResumoAnalise[]>('/curriculo/analises');
  return data;
}

export async function obterAnalise(id: string) {
  const { data } = await api.get<Analise>(`/curriculo/analises/${id}`);
  return data;
}
