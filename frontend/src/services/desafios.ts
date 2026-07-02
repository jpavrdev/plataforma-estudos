import api from './api';

export type Linguagem = 'javascript' | 'python';
export type Dificuldade = 'facil' | 'medio' | 'dificil';
export type StatusDesafio = 'solved' | 'attempted' | 'todo';
export type TipoDesafio = 'stdin' | 'function';

export interface Bloco {
  type: string;
  value: string;
}

export interface ExemploTeste {
  input: string;
  expectedOutput: string;
}

export interface DesafioDetalhe {
  id: string;
  number: number | null;
  title: string;
  topic: string | null;
  statementBlocks: Bloco[];
  difficulty: Dificuldade;
  kind: TipoDesafio;
  entryPoint: string | null;
  xp: number;
  starterCode: Partial<Record<Linguagem, string>>;
  activeDate: string | null;
  isToday: boolean;
  exampleTests: ExemploTeste[];
  acceptance: number | null;
  solved: boolean;
}

export interface DesafioResumo {
  id: string;
  number: number | null;
  title: string;
  topic: string | null;
  difficulty: Dificuldade;
  xp: number;
  acceptance: number | null;
  status: StatusDesafio;
  isToday: boolean;
}

export interface ProgressoDesafios {
  solved: number;
  total: number;
  pct: number;
  easy: number;
  medium: number;
  hard: number;
}

export interface ListaDesafios {
  items: DesafioResumo[];
  progress: ProgressoDesafios;
}

export interface CasoResultado {
  input: string;
  expected: string;
  got: string;
  stderr: string;
  timedOut: boolean;
  passed: boolean;
}

export interface RunResultado {
  compileError: string | null;
  cases: CasoResultado[];
  timeMs: number;
}

export interface SubmitResultado {
  status: 'passed' | 'failed' | 'error' | 'timeout';
  passed: boolean;
  passedCount: number;
  totalCount: number;
  xpEarned: number;
  output: string | null;
  timeMs: number;
}

export async function getDesafioDoDia(): Promise<DesafioDetalhe | null> {
  const { data } = await api.get<DesafioDetalhe | null>('/desafios/hoje');
  return data;
}

export async function getDesafios(): Promise<ListaDesafios> {
  const { data } = await api.get<ListaDesafios>('/desafios');
  return data;
}

export async function getDesafio(id: string): Promise<DesafioDetalhe> {
  const { data } = await api.get<DesafioDetalhe>(`/desafios/${id}`);
  return data;
}

export async function rodarExemplos(
  id: string,
  language: Linguagem,
  code: string,
): Promise<RunResultado> {
  const { data } = await api.post<RunResultado>(`/desafios/${id}/run`, { language, code });
  return data;
}

export async function submeterDesafio(
  id: string,
  language: Linguagem,
  code: string,
): Promise<SubmitResultado> {
  const { data } = await api.post<SubmitResultado>(`/desafios/${id}/submit`, { language, code });
  return data;
}

// ----- admin -----

export interface CasoTesteAdmin {
  id?: string;
  input: string;
  expectedOutput: string;
  isPublic: boolean;
}

export interface DesafioAdmin {
  id: string;
  number: number | null;
  title: string;
  topic: string | null;
  kind: TipoDesafio;
  entryPoint: string | null;
  statementBlocks: Bloco[];
  difficulty: Dificuldade;
  starterCode: Partial<Record<Linguagem, string>>;
  activeDate: string | null;
  published: boolean;
  tests: CasoTesteAdmin[];
}

export interface DesafioAdminResumo {
  id: string;
  number: number | null;
  title: string;
  topic: string | null;
  difficulty: Dificuldade;
  activeDate: string | null;
  published: boolean;
  testes: number;
}

export interface DesafioInput {
  title: string;
  number?: number | null;
  topic: string;
  kind: TipoDesafio;
  entryPoint: string;
  statementBlocks: Bloco[];
  difficulty: Dificuldade;
  starterCode: Partial<Record<Linguagem, string>>;
  activeDate: string | null;
  published: boolean;
  tests: CasoTesteAdmin[];
}

export async function adminListarDesafios(): Promise<DesafioAdminResumo[]> {
  const { data } = await api.get<DesafioAdminResumo[]>('/admin/desafios');
  return data;
}

export async function adminGetDesafio(id: string): Promise<DesafioAdmin> {
  const { data } = await api.get<DesafioAdmin>(`/admin/desafios/${id}`);
  return data;
}

export async function adminCriarDesafio(dados: DesafioInput): Promise<{ id: string }> {
  const { data } = await api.post<{ id: string }>('/desafios', dados);
  return data;
}

export async function adminAtualizarDesafio(id: string, dados: DesafioInput): Promise<void> {
  await api.patch(`/desafios/${id}`, dados);
}

export async function adminExcluirDesafio(id: string): Promise<void> {
  await api.delete(`/desafios/${id}`);
}
