// Linguagem escolhida numa trilha multi-linguagem (ex.: Lógica em JS ou Python).
// Guardada por trilha para a página da aula reabrir no mesmo track sem depender da navegação.
const chave = (trailId: string) => `ensina:trail-lang:${trailId}`;

export function getTrailLang(trailId: string): string | undefined {
  return localStorage.getItem(chave(trailId)) ?? undefined;
}

export function setTrailLang(trailId: string, lang: string) {
  localStorage.setItem(chave(trailId), lang);
}
