import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface UserMenuProps {
  initials: string;
  level: number;
  name: string;
  email?: string;
}

export function UserMenu({ initials, level, name, email }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Fecha ao clicar fora ou pressionar Escape
  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function go(path: string) {
    setOpen(false);
    navigate(path);
  }

  async function handleLogout() {
    setOpen(false);
    await logout();
    navigate('/');
  }

  return (
    <div className="user-menu" ref={ref}>
      <button
        type="button"
        className="avatar avatar--lg avatar--ring avatar--button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Abrir menu do usuário"
      >
        {initials}
        <span className="avatar__level">Lv{level}</span>
      </button>

      {open && (
        <div className="user-menu__dropdown" role="menu">
          <div className="user-menu__header">
            <div className="user-menu__name">{name}</div>
            {email && <div className="user-menu__email">{email}</div>}
          </div>
          <div className="user-menu__divider" />
          <button
            type="button"
            role="menuitem"
            className="user-menu__item"
            onClick={() => go('/perfil')}
          >
            Perfil
          </button>
          <button
            type="button"
            role="menuitem"
            className="user-menu__item"
            onClick={() => go('/progresso')}
          >
            Meu progresso
          </button>
          {user?.role === 'admin' && (
            <button
              type="button"
              role="menuitem"
              className="user-menu__item user-menu__item--accent"
              onClick={() => go('/estudio')}
            >
              Estúdio
            </button>
          )}
          {user?.role === 'admin' && (
            <button
              type="button"
              role="menuitem"
              className="user-menu__item"
              onClick={() => go('/configuracoes')}
            >
              Configurações
            </button>
          )}
          <div className="user-menu__divider" />
          <button
            type="button"
            role="menuitem"
            className="user-menu__item user-menu__item--danger"
            onClick={handleLogout}
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
