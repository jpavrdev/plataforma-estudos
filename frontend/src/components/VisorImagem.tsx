import { useEffect, useRef } from 'react';
import { X } from './Icons';

interface Props {
  src: string;
  alt: string;
  /** Avatar é recortado em círculo, como aparece no perfil. Capa fica retangular. */
  redondo?: boolean;
  onFechar: () => void;
}

/**
 * Abre uma imagem do perfil em tamanho grande, por cima da página.
 *
 * O gesto é o do Twitter: clicar na foto ou na capa de outra pessoa amplia, e sair
 * é fácil por três caminhos (Escape, clique fora, botão de fechar). O foco vai para
 * o botão ao abrir e volta para o elemento de origem ao fechar, senão quem navega
 * por teclado é jogado para o começo da página.
 */
export function VisorImagem({ src, alt, redondo = false, onFechar }: Props) {
  const fechar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const origem = document.activeElement as HTMLElement | null;
    fechar.current?.focus();

    function tecla(e: KeyboardEvent) {
      if (e.key === 'Escape') onFechar();
    }
    window.addEventListener('keydown', tecla);

    // Com a imagem na frente da tela, rolar a página atrás não faz sentido.
    const antes = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', tecla);
      document.body.style.overflow = antes;
      origem?.focus?.();
    };
  }, [onFechar]);

  return (
    <div className="visor" role="dialog" aria-modal="true" aria-label={alt} onClick={onFechar}>
      <button ref={fechar} className="visor__fechar" onClick={onFechar} aria-label="Fechar">
        <X size={18} />
      </button>
      <img
        className={`visor__img${redondo ? ' visor__img--redondo' : ''}`}
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
