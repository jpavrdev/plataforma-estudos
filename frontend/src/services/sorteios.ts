import api from './api';
import type { Contatos, InscricaoEntrada } from '../utils/contatos';

export interface Participacao {
  contatos: Contatos;
  inscritoEm: string;
  atualizadoEm: string;
}

export interface SorteioAtivo {
  id: string;
  titulo: string;
  descricao: string;
  inicio: string;
  fim: string;
  participacao: Participacao | null;
}

export async function obterSorteioAtivo() {
  const { data } = await api.get<SorteioAtivo | null>('/sorteios/ativo');
  return data;
}

export async function inscreverNoSorteio(id: string, inscricao: InscricaoEntrada) {
  const { data } = await api.put<Participacao>(`/sorteios/${id}/participacao`, inscricao);
  return data;
}

export async function sairDoSorteio(id: string) {
  await api.delete(`/sorteios/${id}/participacao`);
}

export type SituacaoSorteio = 'agendado' | 'aberto' | 'encerrado' | 'sorteado';

export interface SorteioResumo {
  id: string;
  titulo: string;
  inicio: string;
  fim: string;
  sorteadoEm: string | null;
  situacao: SituacaoSorteio;
  participantes: number;
}

export interface Ganhador {
  posicao: number;
  username: string;
  nome: string;
  contatos: Contatos;
}

export interface Inscrito {
  username: string;
  nome: string;
  inscritoEm: string;
  contatos: Contatos | null;
}

export interface SorteioDetalhe extends Omit<SorteioResumo, 'participantes'> {
  descricao: string;
  ganhadores: Ganhador[];
  participantes: Inscrito[];
}

export interface SorteioPayload {
  titulo: string;
  descricao: string;
  inicio: string;
  fim: string;
}

export async function adminListarSorteios() {
  const { data } = await api.get<SorteioResumo[]>('/studio/sorteios');
  return data;
}

export async function adminObterSorteio(id: string) {
  const { data } = await api.get<SorteioDetalhe>(`/studio/sorteios/${id}`);
  return data;
}

export async function adminCriarSorteio(payload: SorteioPayload) {
  await api.post('/sorteios', payload);
}

export async function adminAtualizarSorteio(id: string, payload: Partial<SorteioPayload>) {
  await api.patch(`/sorteios/${id}`, payload);
}

export async function adminExcluirSorteio(id: string) {
  await api.delete(`/sorteios/${id}`);
}

export async function adminSortear(id: string) {
  const { data } = await api.post<SorteioDetalhe>(`/sorteios/${id}/sortear`);
  return data;
}
