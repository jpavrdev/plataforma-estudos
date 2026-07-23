import { useState, useCallback } from 'react';
import Cropper, { type Area } from 'react-easy-crop';

interface Props {
  image: string; // data URL da imagem escolhida
  aspect: number; // 1 = quadrado (avatar), maior = panorâmico (capa)
  round?: boolean; // recorte redondo (avatar)
  maxWidth?: number; // largura máxima do resultado, para não gerar upload gigante
  alvoKB?: number; // teto de peso: baixa a qualidade em degraus até caber
  titulo: string;
  onConfirm: (dataUrl: string) => void;
  onCancel: () => void;
}

function carregarImagem(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Falha ao carregar a imagem'));
    img.src = src;
  });
}

// Desenha a área recortada num canvas e devolve a data URL (JPEG).
async function recortar(
  src: string,
  area: Area,
  maxWidth: number,
  alvoKB?: number,
): Promise<string> {
  const img = await carregarImagem(src);
  const escala = area.width > maxWidth ? maxWidth / area.width : 1;
  const w = Math.round(area.width * escala);
  const h = Math.round(area.height * escala);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponível');
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, w, h);

  let resultado = canvas.toDataURL('image/jpeg', 0.9);
  if (alvoKB) {
    // Base64 pesa ~4/3 do binário; 0.75 é o piso antes de o olho notar.
    for (const q of [0.85, 0.8, 0.75]) {
      if ((resultado.length * 3) / 4 <= alvoKB * 1024) break;
      resultado = canvas.toDataURL('image/jpeg', q);
    }
  }
  return resultado;
}

export default function ImageCropper({
  image,
  aspect,
  round,
  maxWidth = 1024,
  alvoKB,
  titulo,
  onConfirm,
  onCancel,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [processando, setProcessando] = useState(false);

  const onComplete = useCallback((_: Area, px: Area) => setArea(px), []);

  async function confirmar() {
    if (!area || processando) return;
    setProcessando(true);
    try {
      onConfirm(await recortar(image, area, maxWidth, alvoKB));
    } catch {
      setProcessando(false);
    }
  }

  return (
    <div className="cropper-scrim" onClick={onCancel}>
      <div className="cropper" onClick={(e) => e.stopPropagation()}>
        <div className="cropper__head">{titulo}</div>
        <div className="cropper__area">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={round ? 'round' : 'rect'}
            showGrid={!round}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onComplete}
          />
        </div>
        <div className="cropper__zoom">
          <span>Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </div>
        <div className="cropper__actions">
          <button className="btn btn--ghost" onClick={onCancel} disabled={processando}>
            Cancelar
          </button>
          <button className="btn btn--accent" onClick={confirmar} disabled={processando || !area}>
            {processando ? 'Processando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
