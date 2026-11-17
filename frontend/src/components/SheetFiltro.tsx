import { useEffect, useState } from 'react';
import { Check, Search, X } from './Icons';

export type OpcaoSheet = { valor: string; label: string; contagem?: number };

// Folha que sobe de baixo da tela para escolher um filtro no celular, como nos
// mocks de trilhas e simulados. No desktop os filtros ficam direto na barra.
export function SheetFiltro({
  titulo,
  aberto,
  aoFechar,
  valor,
  aoEscolher,
  opcoes,
  placeholderBusca,
}: {
  titulo: string;
  aberto: boolean;
  aoFechar: () => void;
  valor: string;
  aoEscolher: (valor: string) => void;
  opcoes: OpcaoSheet[];
  // Com a lista longa (temas dos desafios) a folha ganha um campo de busca.
  placeholderBusca?: string;
}) {
  const [busca, setBusca] = useState('');

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
      // Ao fechar, a busca interna volta vazia para a próxima abertura.
      setBusca('');
    };
  }, [aberto, aoFechar]);

  const q = busca.trim().toLowerCase();
  const visiveis = q ? opcoes.filter((o) => o.label.toLowerCase().includes(q)) : opcoes;

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
        {placeholderBusca && (
          <label className="sheet__busca">
            <Search size={15} />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder={placeholderBusca}
            />
          </label>
        )}
        <div className="sheet__list" role="listbox" aria-label={titulo}>
          {visiveis.map((o) => (
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
          {visiveis.length === 0 && (
            <div className="sheet__vazio">Nada encontrado com essa busca.</div>
          )}
        </div>
      </div>
    </>
  );
}
