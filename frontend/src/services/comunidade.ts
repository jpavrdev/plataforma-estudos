import api from './api';

export type PostKind = 'duvida' | 'solucao' | 'conquista' | 'post';

export type FiltroFeed =
  | 'para-voce'
  | 'recentes'
  | 'em-alta'
  | 'sem-resposta'
  | 'seguindo'
  | 'duvida'
  | 'solucao'
  | 'conquista';

export interface AutorPost {
  name: string;
  username: string | null;
  avatarUrl: string | null;
  level: number;
  apoiador: boolean;
}

export interface FeedPost {
  id: string;
  kind: PostKind;
  content: string;
  code: string | null;
  codeLanguage: string | null;
  imageUrl: string | null;
  createdAt: string;
  tags: string[];
  likes: number;
  comentarios: number;
  curtido: boolean;
  autor: AutorPost;
}

export interface Comentario {
  id: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  likes: number;
  curtido: boolean;
  autor: Omit<AutorPost, 'apoiador'>;
}

export interface PostDetalhe extends FeedPost {
  comentariosLista: Comentario[];
}

export interface BarraLateral {
  topicos: { tag: string; count: number }[];
  discussoes: { id: string; titulo: string; comentarios: number; tag: string | null }[];
  sugestoes: { username: string; name: string; avatarUrl: string | null; level: number; respostas: number }[];
  duvidasAbertas: number;
}

export interface NovoPost {
  kind: PostKind;
  content: string;
  code?: string;
  codeLanguage?: string;
  tags?: string[];
}

export async function obterFeed(filtro: FiltroFeed, tag?: string | null) {
  const { data } = await api.get<FeedPost[]>('/comunidade/feed', { params: { filtro, tag: tag || undefined } });
  return data;
}

export async function obterLateral() {
  const { data } = await api.get<BarraLateral>('/comunidade/lateral');
  return data;
}

export async function publicarPost(dados: NovoPost & { imageUrl?: string }) {
  const { data } = await api.post<{ id: string }>('/comunidade/posts', dados);
  return data;
}

export async function enviarImagem(image: string) {
  const { data } = await api.post<{ url: string }>('/comunidade/imagem', { image });
  return data.url;
}

export async function obterPost(id: string) {
  const { data } = await api.get<PostDetalhe>(`/comunidade/posts/${id}`);
  return data;
}

export async function alternarCurtida(id: string) {
  const { data } = await api.post<{ curtido: boolean; likes: number }>(`/comunidade/posts/${id}/curtir`);
  return data;
}

export async function comentarPost(id: string, content: string, parentId?: string) {
  const { data } = await api.post<{ id: string }>(`/comunidade/posts/${id}/comentarios`, {
    content,
    parentId,
  });
  return data;
}

export async function curtirComentario(id: string) {
  const { data } = await api.post<{ curtido: boolean; likes: number }>(
    `/comunidade/comentarios/${id}/curtir`,
  );
  return data;
}

export async function estadoSeguir(username: string) {
  const { data } = await api.get<{ seguindo: boolean }>(`/comunidade/seguir/${username}`);
  return data.seguindo;
}

export async function seguir(username: string) {
  const { data } = await api.post<{ seguindo: boolean }>(`/comunidade/seguir/${username}`);
  return data;
}

export async function deixarDeSeguir(username: string) {
  const { data } = await api.delete<{ seguindo: boolean }>(`/comunidade/seguir/${username}`);
  return data;
}
