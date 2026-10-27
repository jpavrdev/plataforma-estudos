// Formata uma data ISO como tempo relativo curto em pt-BR (ex.: "há 2 d").
export function tempoRelativo(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const min = Math.floor((Date.now() - d.getTime()) / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const dias = Math.floor(h / 24);
  if (dias < 30) return `há ${dias} d`;
  return d.toLocaleDateString('pt-BR');
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
