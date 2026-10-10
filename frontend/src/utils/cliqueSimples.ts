import type { MouseEvent } from 'react';

// Clique comum com o botão esquerdo, sem ctrl/cmd/shift/alt. Os outros (botão do meio,
// ctrl+clique...) devem seguir o href do link para abrir em nova guia.
export function ehCliqueSimples(e: MouseEvent) {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}
