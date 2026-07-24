// Reduz uma imagem (data URL) a um JPEG com largura máxima e teto de peso,
// baixando a qualidade em degraus até caber. Usado antes de enviar ao servidor.
export async function comprimirImagem(dataUrl: string, maxWidth = 1200, alvoKB = 800): Promise<string> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('Falha ao carregar a imagem'));
    el.src = dataUrl;
  });

  const escala = img.width > maxWidth ? maxWidth / img.width : 1;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * escala);
  canvas.height = Math.round(img.height * escala);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponível');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  let resultado = canvas.toDataURL('image/jpeg', 0.9);
  for (const q of [0.85, 0.8, 0.75, 0.7]) {
    if ((resultado.length * 3) / 4 <= alvoKB * 1024) break;
    resultado = canvas.toDataURL('image/jpeg', q);
  }
  return resultado;
}

export function lerArquivoComoDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo'));
    reader.readAsDataURL(file);
  });
}
