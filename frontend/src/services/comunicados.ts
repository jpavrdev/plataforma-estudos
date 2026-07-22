import api from './api';

export type ComunicadoKind = 'aviso' | 'pesquisa';

export interface ComunicadoAtivo {
  id: string;
  kind: ComunicadoKind;
  title: string;
  message: string;
}

export async function obterComunicadoAtivo() {
  const { data } = await api.get<ComunicadoAtivo | null>('/comunicados/ativo');
  return data;
}

export async function responderComunicado(id: string, rating: number, comment?: string) {
  const { data } = await api.post(`/comunicados/${id}/responder`, {
    rating,
    comment: comment || undefined,
  });
  return data;
}

export async function dispensarComunicado(id: string) {
  const { data } = await api.post(`/comunicados/${id}/dispensar`);
  return data;
}

export interface ComunicadoResumo {
  id: string;
  kind: ComunicadoKind;
  title: string;
  message: string;
  published: boolean;
  createdAt: string;
  respondidos: number;
  dispensados: number;
  media: number | null;
}

export interface ComunicadoResultados extends ComunicadoResumo {
  distribuicao: { rating: number; count: number }[];
  respostas: { name: string; rating: number | null; comment: string | null; createdAt: string }[];
}

export interface ComunicadoPayload {
  kind: ComunicadoKind;
  title: string;
  message: string;
  published?: boolean;
}

export async function adminListarComunicados() {
  const { data } = await api.get<ComunicadoResumo[]>('/studio/comunicados');
  return data;
}

export async function adminResultadosComunicado(id: string) {
  const { data } = await api.get<ComunicadoResultados>(`/studio/comunicados/${id}`);
  return data;
}

export async function adminCriarComunicado(payload: ComunicadoPayload) {
  const { data } = await api.post('/comunicados', payload);
  return data;
}

export async function adminAtualizarComunicado(id: string, payload: Partial<ComunicadoPayload>) {
  const { data } = await api.patch(`/comunicados/${id}`, payload);
  return data;
}

export async function adminExcluirComunicado(id: string) {
  await api.delete(`/comunicados/${id}`);
}
