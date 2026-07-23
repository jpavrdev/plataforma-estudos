const ACCENT_KEY = 'ensina:accent';

// Aplica a cor de destaque do apoiador (nulo volta ao azul padrão do tema).
export function aplicarAccent(cor: string | null | undefined) {
  if (cor) {
    document.documentElement.style.setProperty('--accent', cor);
    localStorage.setItem(ACCENT_KEY, cor);
  } else {
    document.documentElement.style.removeProperty('--accent');
    localStorage.removeItem(ACCENT_KEY);
  }
}

export function accentSalvo(): string | null {
  return localStorage.getItem(ACCENT_KEY);
}

const FUNDO_KEY = 'ensina:fundo';

// Imagem de fundo do app (benefício de apoiador). Nulo remove.
export function aplicarFundo(url: string | null | undefined) {
  if (url) {
    document.documentElement.style.setProperty('--fundo-app', `url("${url}")`);
    localStorage.setItem(FUNDO_KEY, url);
  } else {
    document.documentElement.style.removeProperty('--fundo-app');
    localStorage.removeItem(FUNDO_KEY);
  }
}

export function fundoSalvo(): string | null {
  return localStorage.getItem(FUNDO_KEY);
}

const VEU_KEY = 'ensina:veu';

// Intensidade do véu sobre o fundo (0-100). Nulo volta ao padrão do tema.
export function aplicarVeu(dim: number | null | undefined) {
  if (dim === null || dim === undefined) {
    document.documentElement.style.removeProperty('--fundo-veu');
    localStorage.removeItem(VEU_KEY);
  } else {
    document.documentElement.style.setProperty('--fundo-veu', `${dim}%`);
    localStorage.setItem(VEU_KEY, String(dim));
  }
}

export function veuSalvo(): number | null {
  const v = localStorage.getItem(VEU_KEY);
  return v === null ? null : Number(v);
}
