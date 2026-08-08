import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { ATUALIZADO_EM } from '../../data/legal';

type LegalShellProps = {
  titulo: string;
  resumo: string;
  /** Link para o documento irmão, exibido no rodapé da página. */
  irmao: { to: string; label: string };
  children: ReactNode;
};

/**
 * Casca das páginas de Termos e Política. São páginas públicas: quem chega aqui
 * pode não ter conta, então a barra do topo leva para a landing e não para /home.
 */
export function LegalShell({ titulo, resumo, irmao, children }: LegalShellProps) {
  return (
    <div className="legal">
      <header className="legal__topo">
        <Logo variant="solid" size={18} to="/" />
        <Link className="link" to="/">
          Voltar ao início
        </Link>
      </header>

      <article className="legal__doc">
        <h1>{titulo}</h1>
        <p className="legal__resumo">{resumo}</p>
        <p className="legal__data">Última atualização: {ATUALIZADO_EM}</p>
        {children}
      </article>

      <footer className="legal__rodape">
        <Link className="link" to={irmao.to}>
          {irmao.label}
        </Link>
        <span>© {new Date().getFullYear()} Ensina Dev</span>
      </footer>
    </div>
  );
}
