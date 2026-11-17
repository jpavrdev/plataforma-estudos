import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from './Icons';

export type OpcaoDropdown = { valor: string; label: string };

// Dropdown no desenho dos pills da tela de trilhas. O <select> nativo não deixa
// estilizar a caixa que abre nem animá-la; este aqui acompanha o resto do design.
export function Dropdown({
  valor,
  opcoes,
  placeholder,
  aoEscolher,
  ariaLabel,
}: {
  valor: string;
  opcoes: OpcaoDropdown[];
  placeholder: string;
  aoEscolher: (valor: string) => void;
  ariaLabel: string;
}) {
  const [aberto, setAberto] = useState(false);
  const raizRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const fecharFora = (e: MouseEvent) => {
      if (!raizRef.current?.contains(e.target as Node)) setAberto(false);
    };
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAberto(false);
    };
    document.addEventListener('mousedown', fecharFora);
    document.addEventListener('keydown', aoTeclar);
    return () => {
      document.removeEventListener('mousedown', fecharFora);
      document.removeEventListener('keydown', aoTeclar);
    };
  }, [aberto]);

  // Valor vazio é o "sem filtro": mostra o placeholder (Categoria, Nível) no
  // lugar do rótulo da opção "Todas", como nos mocks.
  const selecionada = valor ? opcoes.find((o) => o.valor === valor) : undefined;

  return (
    <div className="dropdown" ref={raizRef}>
      <button
        type="button"
        className="dropdown__gatilho"
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-label={ariaLabel}
        onClick={() => setAberto((v) => !v)}
      >
        <span className={selecionada ? '' : 'dropdown__rotulo--vazio'}>{selecionada?.label ?? placeholder}</span>
        <span className="dropdown__seta">
          <ChevronDown size={12} />
        </span>
      </button>
      <div
        className={`dropdown__menu${aberto ? ' dropdown__menu--aberto' : ''}`}
        role="listbox"
        aria-label={ariaLabel}
      >
        {opcoes.map((o) => (
          <button
            key={o.valor}
            type="button"
            role="option"
            aria-selected={o.valor === valor}
            className={`dropdown__item${o.valor === valor ? ' dropdown__item--sel' : ''}`}
            onClick={() => {
              aoEscolher(o.valor);
              setAberto(false);
            }}
          >
            {o.label}
            {o.valor === valor && <Check size={13} />}
          </button>
        ))}
      </div>
    </div>
  );
}
