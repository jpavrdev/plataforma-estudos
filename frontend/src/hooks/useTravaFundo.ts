import { useEffect } from 'react';

// Trava o scroll da página enquanto um overlay está aberto. O html para de
// rolar sem mover nada: freeze no body (position fixed + top negativo)
// desloca overlays fixos no iPhone (Safari e Chrome), que aparecem cortados
// ou fora da tela quando a página foi rolada antes de abrir o modal.
export function useTravaFundo(ativo: boolean) {
  useEffect(() => {
    if (!ativo) return;
    const { style } = document.documentElement;
    const prevOverflow = style.overflow;
    const prevOverscroll = style.overscrollBehavior;
    const y = window.scrollY;
    style.overflow = 'hidden';
    style.overscrollBehavior = 'none';
    return () => {
      style.overflow = prevOverflow;
      style.overscrollBehavior = prevOverscroll;
      // O Chrome zera o offset do documento ao esconder o overflow; o
      // WebKit mantém e não precisa voltar a lugar nenhum.
      if (window.scrollY !== y) window.scrollTo(0, y);
    };
  }, [ativo]);
}
