import api from './api';

export interface TermoGlossario {
  id: string;
  term: string;
  definition: string;
}

export async function listarGlossario() {
  const { data } = await api.get<TermoGlossario[]>('/glossary');
  return data;
}

export async function criarTermo(term: string, definition: string) {
  const { data } = await api.post<TermoGlossario>('/glossary', { term, definition });
  return data;
}

export async function atualizarTermo(id: string, term: string, definition: string) {
  const { data } = await api.patch<TermoGlossario>(`/glossary/${id}`, { term, definition });
  return data;
}

export async function excluirTermo(id: string) {
  await api.delete(`/glossary/${id}`);
}
