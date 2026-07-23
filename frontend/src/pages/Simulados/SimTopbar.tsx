import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/Logo';
import { MobileMenu } from '../../components/MobileMenu';
import { UserMenu } from '../../components/UserMenu';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Flame } from '../../components/Icons';
import { getInitials } from '../../utils/initials';
import { user as homeUser } from '../../data/home';

import { NAV_PRINCIPAL as NAV } from '../../data/nav';

export function SimTopbar({ active = '/simulados' }: { active?: string }) {
  const { user: authUser } = useAuth();
  const displayName = authUser?.name ?? homeUser.name;

  return (
    <header className="topbar">
      <MobileMenu />
      <Logo variant="solid" size={20} to="/home" />
      <nav className="nav">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`nav__item${item.to === active ? ' nav__item--active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="topbar__spacer" />
      <div className="streak-pill">
        <Flame size={16} /> {authUser?.streak ?? 0}
      </div>
      <ThemeToggle inline />
      <UserMenu
        initials={getInitials(displayName)}
        level={authUser?.level ?? 1}
        name={displayName}
        email={authUser?.email}
      />
    </header>
  );
}
