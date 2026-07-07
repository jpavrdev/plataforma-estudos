import api from './api';

export interface VisaoGeral {
  usuarios: number;
  perfilCompleto: number;
  social: number;
  novos7d: number;
  novos30d: number;
  ativos7d: number;
  ativos30d: number;
  aulasConcluidas: number;
  simuladosFeitos: number;
  desafiosResolvidos: number;
  trilhas: number;
  aulasTotal: number;
  cadastrosPorDia: { dia: string; n: number }[];
}

export interface UsuarioCrm {
  id: string;
  name: string;
  username: string | null;
  email: string;
  origem: 'email' | 'social';
  criadoEm: string;
  ultimaAtividade: string | null;
  aulas: number;
  trilhas: number;
  simulados: number;
  desafios: number;
  conquistas: number;
  questoesCertas: number;
  xp: number;
}

export async function obterVisaoGeral() {
  const { data } = await api.get<VisaoGeral>('/admin/overview');
  return data;
}

export async function listarUsuariosCrm() {
  const { data } = await api.get<UsuarioCrm[]>('/admin/users');
  return data;
}
