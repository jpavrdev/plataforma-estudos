import type { ReactNode } from 'react';
import { Logo } from '../Logo';

interface AuthBrandProps {
  /** Posição dos brilhos decorativos: 'login' (topo-dir/baixo-esq) ou 'register' (topo-esq/baixo-dir). */
  glow?: 'login' | 'register';
  children: ReactNode;
}

const GLOWS = {
  login: ['auth__glow--tr', 'auth__glow--bl'],
  register: ['auth__glow--tl', 'auth__glow--br'],
};

export function AuthBrand({ glow = 'login', children }: AuthBrandProps) {
  return (
    <aside className="auth__brand">
      {GLOWS[glow].map((g) => (
        <span key={g} className={`auth__glow ${g}`} />
      ))}
      <Logo variant="brand" size={21} />
      {children}
    </aside>
  );
}
