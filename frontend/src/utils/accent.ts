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

// Luminância média do wallpaper atual (0 = escuro, 1 = claro), medida ao aplicar.
let lumWallpaper: number | null = null;
let observadorTema: MutationObserver | null = null;

// Mede a luminância média da imagem via canvas (downscale pra ser barato). Depende
// do CORS liberado no /uploads (o backend manda os headers). Erro devolve null.
function medirLuminancia(url: string): Promise<number | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 24;
        canvas.height = 24;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, 24, 24);
        const { data } = ctx.getImageData(0, 0, 24, 24);
        let soma = 0;
        for (let i = 0; i < data.length; i += 4) {
          soma += (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
        }
        resolve(soma / (data.length / 4));
      } catch (e) {
        console.debug('[fundo] não deu pra medir a luminância', e);
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    // Query própria: força uma entrada de cache com CORS, evitando reaproveitar a
    // imagem já baixada pelo background do CSS (sem CORS), que "tainta" o canvas.
    img.src = url + (url.includes('?') ? '&' : '?') + '_cors=1';
  });
}

// Define a cor do texto "solto" sobre o wallpaper (--texto-fundo). Combina a
// luminância da imagem com o véu (que mistura em direção ao --bg do tema) e o tema:
// fundo efetivo escuro pede texto claro; fundo claro pede texto escuro.
function recalcularContrasteFundo() {
  const root = document.documentElement;
  if (lumWallpaper === null) {
    root.style.removeProperty('--texto-fundo');
    return;
  }
  const veuStr = getComputedStyle(root).getPropertyValue('--fundo-veu').trim();
  const veu = veuStr ? parseFloat(veuStr) / 100 : 0.6; // padrão do CSS
  const lumBg = root.getAttribute('data-theme') === 'dark' ? 0.02 : 0.78; // --bg por tema
  const efetiva = veu * lumBg + (1 - veu) * lumWallpaper;
  root.style.setProperty('--texto-fundo', efetiva < 0.5 ? '#f4f6fb' : '#17131f');
}

// Imagem de fundo do app (benefício de apoiador). Nulo remove.
// A classe tem-fundo liga a troca de cor do texto solto sobre o wallpaper (ver app.css).
export function aplicarFundo(url: string | null | undefined) {
  const root = document.documentElement;
  if (url) {
    root.style.setProperty('--fundo-app', `url("${url}")`);
    root.classList.add('tem-fundo');
    localStorage.setItem(FUNDO_KEY, url);
    // O véu mistura o wallpaper com o --bg do tema, então recalcula ao trocar de tema.
    if (!observadorTema) {
      observadorTema = new MutationObserver(recalcularContrasteFundo);
      observadorTema.observe(root, { attributeFilter: ['data-theme'] });
    }
    medirLuminancia(url).then((l) => {
      lumWallpaper = l;
      recalcularContrasteFundo();
    });
  } else {
    root.style.removeProperty('--fundo-app');
    root.style.removeProperty('--texto-fundo');
    root.classList.remove('tem-fundo');
    lumWallpaper = null;
    observadorTema?.disconnect();
    observadorTema = null;
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
  recalcularContrasteFundo();
}

export function veuSalvo(): number | null {
  const v = localStorage.getItem(VEU_KEY);
  return v === null ? null : Number(v);
}
