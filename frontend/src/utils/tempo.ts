// Formata uma data ISO como tempo relativo curto (ex.: "há 2 min"). O idioma
// entra como parâmetro porque quem chama é que tem o i18n à mão; sem ele,
// mantém o comportamento histórico em pt-BR.
export function tempoRelativo(iso: string, language = 'pt-BR'): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const min = Math.floor((Date.now() - d.getTime()) / 60000);
  const rtf = new Intl.RelativeTimeFormat(language, { numeric: 'always', style: 'narrow' });
  if (min < 1) return language === 'en' ? 'now' : 'agora';
  if (min < 60) return rtf.format(-min, 'minute');
  const h = Math.floor(min / 60);
  if (h < 24) return rtf.format(-h, 'hour');
  const dias = Math.floor(h / 24);
  if (dias < 30) return rtf.format(-dias, 'day');
  return d.toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR');
}

function doisDigitos(n: number): string {
  return String(n).padStart(2, '0');
}

export function paraDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const data = `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`;
  return `${data}T${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}`;
}

// O datetime-local vem sem fuso, e o Date o lê como hora local.
export function deDatetimeLocal(valor: string): string {
  return new Date(valor).toISOString();
}

// Ex.: "31/10/2026, 23:59".
export function dataHoraCurta(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

// Ex.: "31 de outubro de 2026, às 23:59".
export function dataHoraPorExtenso(iso: string): string {
  const d = new Date(iso);
  const dia = d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${dia}, às ${hora}`;
}
