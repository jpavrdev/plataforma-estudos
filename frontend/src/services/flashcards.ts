import api from './api';

export type Resposta = 'errei' | 'dificil' | 'intermediaria' | 'facil';

export interface Cartao {
  id: string;
  frente: string;
  verso: string;
  origem: 'flashcard' | 'glossario';
  trilha: string | null;
  aula: string | null;
  trilhaId: string | null;
  aulaId: string | null;
}

export interface ResumoFlashcards {
  vencidos: number;
  total: number;
  dominados: number;
}

export interface Baralho {
  id: string;
  nome: string;
  vencidos: number;
  total: number;
}

export interface Baralhos {
  trilhas: Baralho[];
  glossario: { vencidos: number; total: number };
}

export interface Estatisticas {
  respostas: number;
  acertos: number;
  taxaAcerto: number;
  porResposta: Record<Resposta, number>;
  diasAtivos: number;
  porDia: { dia: string; n: number }[];
  emAprendizado: number;
  dominados: number;
  estabilidadeMedia: number;
  tempoTipicoMs: number;
  tempoTotalMs: number;
}

export interface SessaoRevisao {
  inicio: string;
  fim: string;
  cartas: number;
  porResposta: Record<Resposta, number>;
  conteudos: string[];
  duracaoMs: number;
  tempoRespondendoMs: number;
}

export async function resumoFlashcards() {
  const { data } = await api.get<ResumoFlashcards>('/flashcards/resumo');
  return data;
}

/**
 * Sem seleção vem o baralho inteiro; com seleção, só as trilhas escolhidas. Sem
 * limite vem tudo o que venceu, e a sessão só acaba quando a fila acabar.
 */
export async function filaDoDia(
  selecao?: { trilhas?: string[]; glossario?: boolean },
  limite?: number | null,
) {
  const q = new URLSearchParams();
  if (limite) q.set('limite', String(limite));
  if (selecao?.trilhas?.length) q.set('trilhas', selecao.trilhas.join(','));
  if (selecao?.glossario) q.set('glossario', '1');
  const { data } = await api.get<Cartao[]>(`/flashcards/fila?${q.toString()}`);
  return data;
}

export async function obterBaralhos() {
  const { data } = await api.get<Baralhos>('/flashcards/baralhos');
  return data;
}

export async function obterEstatisticas() {
  const { data } = await api.get<Estatisticas>('/flashcards/estatisticas');
  return data;
}

export async function obterHistorico() {
  const { data } = await api.get<SessaoRevisao[]>('/flashcards/historico');
  return data;
}

/** Revisão da trilha inteira, oferecida ao concluí-la. Ignora a agenda de propósito. */
export async function revisaoDaTrilha(trailId: string) {
  const { data } = await api.get<Cartao[]>(`/flashcards/trilha/${trailId}`);
  return data;
}

/** Só o número, para decidir se a chamada de revisão aparece no fim da aula. */
export async function contarRevisaoDaTrilha(trailId: string) {
  const { data } = await api.get<{ total: number }>(`/flashcards/trilha/${trailId}/contagem`);
  return data.total;
}

export async function responderCartao(
  id: string,
  origem: Cartao['origem'],
  resposta: Resposta,
  tempoMs?: number,
) {
  const { data } = await api.post<{ intervaloDias: number }>(`/flashcards/${id}/responder`, {
    origem,
    resposta,
    tempoMs,
  });
  return data;
}
