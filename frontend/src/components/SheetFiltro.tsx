import { useEffect, useRef, useState } from 'react';
import { Check, Search, X } from './Icons';
import { useTravaFundo } from '../hooks/useTravaFundo';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [busca, setBusca] = useState('');
  // Distância que a folha desceu no gesto de arrastar para fechar. O valor do
  // gesto fica num ref: no touchend o estado ainda pode estar defasado.
  const [arraste, setArraste] = useState(0);
  const arrasteRef = useRef(0);
  const inicioY = useRef<number | null>(null);

  useTravaFundo(aberto);

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') aoFechar();
    };
    document.addEventListener('keydown', aoTeclar);
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      // Ao fechar, a busca interna volta vazia para a próxima abertura.
      setBusca('');
    };
  }, [aberto, aoFechar]);

  // Arrastar a alça ou o cabeçalho para baixo fecha a folha; soltar antes
  // devolve ela ao lugar.
  const aoIniciarArrasto = (e: React.TouchEvent) => {
    inicioY.current = e.touches[0].clientY;
    arrasteRef.current = 0;
  };
  const aoMoverArrasto = (e: React.TouchEvent) => {
    if (inicioY.current == null) return;
    const dy = e.touches[0].clientY - inicioY.current;
    arrasteRef.current = dy > 0 ? dy : 0;
    setArraste(arrasteRef.current);
  };
  const aoSoltarArrasto = () => {
    if (arrasteRef.current > 70) aoFechar();
    arrasteRef.current = 0;
    setArraste(0);
    inicioY.current = null;
  };

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
        style={
          arraste
            ? { transform: `translateY(${arraste}px)`, transition: 'none' }
            : undefined
        }
      >
        <div
          className="sheet__topo"
          onTouchStart={aoIniciarArrasto}
          onTouchMove={aoMoverArrasto}
          onTouchEnd={aoSoltarArrasto}
          onTouchCancel={aoSoltarArrasto}
        >
          <div className="sheet__handle" />
          <header className="sheet__head">
            <h3>{titulo}</h3>
            <button type="button" className="sheet__close" aria-label={t("sheet.close")} onClick={aoFechar}>
              <X size={15} />
            </button>
          </header>
        </div>
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
            <div className="sheet__vazio">{t('sheet.emptySearch')}</div>
          )}
        </div>
      </div>
    </>
  );
}
