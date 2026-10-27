import type { SorteioDetalhe, SorteioPayload } from '../services/sorteios';
import { deDatetimeLocal, paraDatetimeLocal } from './tempo';

export const TITULO_MIN = 3;
export const TITULO_MAX = 120;
export const DESCRICAO_MAX = 2000;
export const MAX_GANHADORES = 3;

export interface FormSorteio {
  titulo: string;
  descricao: string;
  inicio: string;
  fim: string;
}

export const FORM_SORTEIO_VAZIO: FormSorteio = { titulo: '', descricao: '', inicio: '', fim: '' };

export function formDoSorteio(sorteio: SorteioPayload): FormSorteio {
  return {
    titulo: sorteio.titulo,
    descricao: sorteio.descricao,
    inicio: paraDatetimeLocal(sorteio.inicio),
    fim: paraDatetimeLocal(sorteio.fim),
  };
}

export function validarFormSorteio(form: FormSorteio): string | null {
  const titulo = form.titulo.trim();
  if (titulo.length < TITULO_MIN || titulo.length > TITULO_MAX) {
    return `O título precisa ter de ${TITULO_MIN} a ${TITULO_MAX} caracteres.`;
  }
  const descricao = form.descricao.trim();
  if (!descricao) return 'Escreva a descrição do sorteio.';
  if (descricao.length > DESCRICAO_MAX) {
    return `A descrição vai até ${DESCRICAO_MAX} caracteres.`;
  }
  const inicio = new Date(form.inicio).getTime();
  const fim = new Date(form.fim).getTime();
  if (Number.isNaN(inicio) || Number.isNaN(fim)) return 'Informe o início e o fim.';
  if (fim <= inicio) return 'O fim precisa ser depois do início.';
  return null;
}

export function paraPayload(form: FormSorteio): SorteioPayload {
  return {
    titulo: form.titulo.trim(),
    descricao: form.descricao.trim(),
    inicio: deDatetimeLocal(form.inicio),
    fim: deDatetimeLocal(form.fim),
  };
}

const CAMPOS: (keyof FormSorteio)[] = ['titulo', 'descricao', 'inicio', 'fim'];

function camposAlterados(original: FormSorteio, atual: FormSorteio): (keyof FormSorteio)[] {
  return CAMPOS.filter((campo) => atual[campo].trim() !== original[campo].trim());
}

export function mudouAlgo(original: FormSorteio, atual: FormSorteio): boolean {
  return camposAlterados(original, atual).length > 0;
}

// Data intocada não volta: o datetime-local não tem segundos e a regravaria truncada.
export function alteracoes(original: FormSorteio, atual: FormSorteio): Partial<SorteioPayload> {
  const novo = paraPayload(atual);
  const mudancas: Partial<SorteioPayload> = {};
  for (const campo of camposAlterados(original, atual)) mudancas[campo] = novo[campo];
  return mudancas;
}

export function quantosGanhadores(inscritos: number): number {
  return Math.min(MAX_GANHADORES, inscritos);
}

export function podeSortear(sorteio: Pick<SorteioDetalhe, 'situacao' | 'participantes'>): boolean {
  return sorteio.situacao === 'encerrado' && sorteio.participantes.length > 0;
}

export function rotuloInscritos(quantidade: number): string {
  return quantidade === 1 ? '1 inscrito' : `${quantidade} inscritos`;
}
