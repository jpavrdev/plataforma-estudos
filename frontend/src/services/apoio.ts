import api from './api';

export const ACCENTS = ['#2D6BF5', '#7C3AED', '#DB2777', '#E0532F', '#1C8F5A', '#B7791F'];

export type PlanoAvulso = 'mensal' | 'trimestral' | 'anual';
export type Plano = PlanoAvulso | 'pix_auto';

export interface StatusApoio {
  apoiador: boolean;
  plano: Plano | null;
  expiresAt: string | null;
  cancelada: boolean;
  disponivel: boolean;
  pixAutomatico: boolean;
}

export interface CobrancaPix {
  subscriptionId: string;
  valorCents: number;
  brCode: string;
  brCodeBase64: string;
}

export async function obterStatusApoio() {
  const { data } = await api.get<StatusApoio>('/apoie/status');
  return data;
}

export async function criarCobranca(plan: PlanoAvulso) {
  const { data } = await api.post<CobrancaPix>('/apoie/cobranca', { plan });
  return data;
}

export async function criarAssinaturaRecorrente() {
  const { data } = await api.post<{ url: string }>('/apoie/assinatura');
  return data;
}

export async function definirAccent(accent: string | null) {
  const { data } = await api.patch<{ accent: string | null }>('/me/accent', { accent });
  return data;
}

export async function cancelarApoio() {
  const { data } = await api.delete<{ ok: boolean; expiresAt: string | null; pixAuto: boolean }>(
    '/apoie/assinatura',
  );
  return data;
}

export async function enviarFundo(imageDataUrl: string) {
  const { data } = await api.post<{ backgroundUrl: string | null }>('/me/fundo', {
    image: imageDataUrl,
  });
  return data;
}

export async function removerFundo() {
  const { data } = await api.delete<{ backgroundUrl: string | null }>('/me/fundo');
  return data;
}

export async function definirVeuFundo(dim: number) {
  const { data } = await api.patch<{ backgroundDim: number }>('/me/fundo', { dim });
  return data;
}

export interface AssinaturasAdminData {
  totais: {
    hojeCents: number;
    semanaCents: number;
    mesCents: number;
    totalCents: number;
    apoiadoresAtivos: number;
    pagamentos: number;
  };
  porDia: { d: string; cents: number }[];
  assinaturas: {
    id: string;
    plan: Plano;
    status: 'pendente' | 'ativa' | 'cancelada';
    amountCents: number;
    paidAt: string | null;
    expiresAt: string | null;
    createdAt: string;
    name: string;
    email: string;
    username: string | null;
  }[];
}

export async function adminAssinaturas() {
  const { data } = await api.get<AssinaturasAdminData>('/studio/assinaturas');
  return data;
}
