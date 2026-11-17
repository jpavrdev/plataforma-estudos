import { useEffect } from 'react';
import { Check, X } from '../../components/Icons';

export type OpcaoSheet = { valor: string; label: string; contagem?: number };

// Folha que sobe de baixo da tela para escolher provedor ou nível no celular,
// como no mock. No desktop os filtros ficam direto na barra.
export function SheetFiltro({
  titulo,
  aberto,
  aoFechar,
  valor,
  aoEscolher,
  opcoes,
}: {
  titulo: string;
  aberto: boolean;
  aoFechar: () => void;
  valor: string;
  aoEscolher: (valor: string) => void;
  opcoes: OpcaoSheet[];
}) {
  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') aoFechar();
    };
    document.addEventListener('keydown', aoTeclar);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = '';
    };
  }, [aberto, aoFechar]);

  return (
    <>
      <div
        className={`sheet-scrim${aberto ? ' sheet-scrim--on' : ''}`}
        onClick={aoFechar}
        aria-hidden="true"
      />
      <div
        className={`sheet${aberto ? ' sheet--on' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        aria-hidden={!aberto}
      >
        <div className="sheet__handle" />
        <header className="sheet__head">
          <h3>{titulo}</h3>
          <button type="button" className="sheet__close" aria-label="Fechar" onClick={aoFechar}>
            <X size={15} />
          </button>
        </header>
        <div className="sheet__list" role="listbox" aria-label={titulo}>
          {opcoes.map((o) => (
            <button
              key={o.valor}
              type="button"
              role="option"
              aria-selected={o.valor === valor}
              className={`sheet__item${o.valor === valor ? ' sheet__item--sel' : ''}`}
              onClick={() => {
                aoEscolher(o.valor);
                aoFechar();
              }}
            >
              <span>{o.label}</span>
              <span className="sheet__item-meta">
                {o.contagem != null && <span className="sheet__n">{o.contagem}</span>}
                <span className="sheet__radio">{o.valor === valor && <Check size={11} />}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
