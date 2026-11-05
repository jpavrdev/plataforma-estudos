import type { ReactNode } from 'react';
import { ThemeToggle } from '../ThemeToggle';
import { LanguageToggle } from '../LanguageToggle';

interface AuthShellProps {
  /** Painel de marca (lado esquerdo). */
  brand: ReactNode;
  /** Conteúdo do formulário (lado direito). */
  children: ReactNode;
}

export function AuthShell({ brand, children }: AuthShellProps) {
  return (
    <div className="auth-shell">
      <div className="auth">
        {brand}
        <section className="auth__panel">
          <LanguageToggle />
          <ThemeToggle />
          {children}
        </section>
      </div>
    </div>
  );
}
