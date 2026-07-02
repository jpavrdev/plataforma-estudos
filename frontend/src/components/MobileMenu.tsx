import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { X } from './Icons';

const NAV = [
  { label: 'Início', to: '/home' },
  { label: 'Trilhas', to: '/trilhas' },
  { label: 'Simulados', to: '/simulados' },
  { label: 'Desafios', to: '/desafios' },
  { label: 'Ranking', to: '/ranking' },
  { label: 'Comunidade', to: '/comunidade' },
];

// Hambúrguer + drawer lateral, visíveis só no telefone (controlados por CSS).
export function MobileMenu() {
  const [aberto, setAberto] = useState(false);
  const { pathname } = useLocation();
  const fechar = () => setAberto(false);
  const ativo = (to: string) => pathname === to || pathname.startsWith(to + '/');

  return (
    <>
      <button className="hamburguer" aria-label="Abrir menu" onClick={() => setAberto(true)}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {aberto && (
        <>
          <div className="drawer-scrim" onClick={fechar} />
          <nav className="drawer">
            <div className="drawer__head">
              <Logo variant="solid" size={18} />
              <button className="drawer__close" aria-label="Fechar menu" onClick={fechar}>
                <X size={20} />
              </button>
            </div>
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={fechar}
                className={`drawer__item${ativo(item.to) ? ' drawer__item--active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </>
      )}
    </>
  );
}
