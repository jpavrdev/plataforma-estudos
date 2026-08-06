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
  usuariosPorTrilha: { nome: string; n: number }[];
  funilPorAno: {
    ano: string;
    registrados: number;
    comUsername: number;
    concluiuAula: number;
    praticou: number;
  }[];
}

export interface UsuarioCrm {
  id: string;
  name: string;
  username: string | null;
  email: string;
  origem: 'email' | 'social';
  provider: string | null;
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

export interface PaginaUsuariosCrm {
  rows: UsuarioCrm[];
  total: number;
}

export async function listarUsuariosCrm(params: {
  busca?: string;
  pagina: number;
  porPagina: number;
  ordenarPor: string;
  direcao: 'asc' | 'desc';
}) {
  const { data } = await api.get<PaginaUsuariosCrm>('/admin/users', {
    params: {
      ...(params.busca ? { q: params.busca } : {}),
      pagina: params.pagina,
      porPagina: params.porPagina,
      ordenarPor: params.ordenarPor,
      direcao: params.direcao,
    },
  });
  return data;
}
