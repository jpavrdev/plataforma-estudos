import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo } from './Logo';
import { MobileMenu } from './MobileMenu';
import { NAV_ESTUDIO } from '../data/nav';

interface Props {
  crumb?: ReactNode;
  actions?: ReactNode;
  badge?: string;
  nav?: boolean;
}

export function EstudioTopbar({ crumb, actions, badge, nav = true }: Props) {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const itens = NAV_ESTUDIO.map((i) => ({ to: i.to, label: t(i.key) }));
  const casa = (to: string) => pathname === to || pathname.startsWith(to + '/');
  const ativo = NAV_ESTUDIO.filter((i) => casa(i.to)).reduce(
    (melhor, i) => (i.to.length > melhor.length ? i.to : melhor),
    '',
  );

  return (
    <header className="topbar studio__bar">
      <MobileMenu items={itens} />
      <div className="studio__brand">
        <Logo variant="solid" size={19} to="/home" />
        <span className="studio__badge">{badge ?? t('estudio.badge')}</span>
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
        itens.map((item) => (
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
