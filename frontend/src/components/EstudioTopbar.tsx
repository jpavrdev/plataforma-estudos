import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { MobileMenu } from './MobileMenu';
import { NAV_ESTUDIO } from '../data/nav';

interface Props {
  crumb?: ReactNode;
  actions?: ReactNode;
  badge?: string;
  nav?: boolean;
}

export function EstudioTopbar({ crumb, actions, badge = 'Estúdio', nav = true }: Props) {
  const { pathname } = useLocation();
  const casa = (to: string) => pathname === to || pathname.startsWith(to + '/');
  const ativo = NAV_ESTUDIO.filter((i) => casa(i.to)).reduce(
    (melhor, i) => (i.to.length > melhor.length ? i.to : melhor),
    '',
  );

  return (
    <header className="topbar studio__bar">
      <MobileMenu items={NAV_ESTUDIO} />
      <div className="studio__brand">
        <Logo variant="solid" size={19} />
        <span className="studio__badge">{badge}</span>
      </div>
      {crumb && (
        <>
          <span className="studio__divider" />
          <div className="studio__crumb">{crumb}</div>
        </>
      )}
      <div className="topbar__spacer" />
      {actions}
      {nav &&
        NAV_ESTUDIO.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`btn btn--ghost studio__btn studio__navbtn${item.to === ativo ? ' studio__btn--active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
    </header>
  );
}
