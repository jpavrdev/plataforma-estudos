import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { X } from './Icons';
import { useNavPrincipal } from '../hooks/useNavPrincipal';

// Hambúrguer + drawer lateral, visíveis só no telefone (controlados por CSS).
export function MobileMenu({ items }: { items?: { to: string; label: string }[] }) {
  const navPrincipal = useNavPrincipal();
  const itens = items ?? navPrincipal;
  const [aberto, setAberto] = useState(false);
  const { pathname } = useLocation();
  const fechar = () => setAberto(false);
  const casa = (to: string) => pathname === to || pathname.startsWith(to + '/');
  const ativo = itens
    .filter((i) => casa(i.to))
    .reduce((melhor, i) => (i.to.length > melhor.length ? i.to : melhor), '');

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
              <Logo variant="solid" size={18} to="/home" />
              <button className="drawer__close" aria-label="Fechar menu" onClick={fechar}>
                <X size={20} />
              </button>
            </div>
            {itens.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={fechar}
                className={`drawer__item${item.to === ativo ? ' drawer__item--active' : ''}`}
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
