import { useEffect } from 'react';

// Trava o scroll da página enquanto um overlay está aberto. No navegador do
// celular o scroll nativo começa no touchstart e os touchmove chegam não
// canceláveis, então nem overflow hidden nem preventDefault seguram: o fix é
// congelar o body (position fixed com compensação do scroll) e devolver a
// posição ao fechar.
export function useTravaFundo(ativo: boolean) {
  useEffect(() => {
    if (!ativo) return;
    const y = window.scrollY;
    const { style } = document.body;
    style.position = 'fixed';
    style.top = `-${y}px`;
    style.left = '0';
    style.right = '0';
    style.width = '100%';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      style.position = '';
      style.top = '';
      style.left = '';
      style.right = '';
      style.width = '';
      window.scrollTo(0, y);
    };
  }, [ativo]);
}
