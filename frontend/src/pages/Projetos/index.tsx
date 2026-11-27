import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MobileMenu } from '../../components/MobileMenu';
import { Logo } from '../../components/Logo';
import { UserMenu } from '../../components/UserMenu';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Flame, Lock } from '../../components/Icons';
import { useNavPrincipal } from '../../hooks/useNavPrincipal';
import { useAuth, useFeature } from '../../contexts/AuthContext';
import { useSeo } from '../../hooks/useSeo';
import { getInitials } from '../../utils/initials';
// The game stylesheet travels in this page's lazy chunk, not in the shared
// bundle: the territory boundary is real, not just a folder convention.
import '../../styles/game.css';

// Territory of the sprint game: the tab where the student joins a fictional
// team, picks backlog tasks and implements them until the tests pass. For now
// it is the board waiting for the mechanics (real tasks, runner, XP); the
// "projetos-guiados" flag gates it so nobody trips over an empty screen.
export function Projects() {
  const { t } = useTranslation();
  const { user: authUser } = useAuth();
  const nav = useNavPrincipal();
  const enabled = useFeature('projetos-guiados');
  useSeo({ titulo: t('projects.title'), descricao: t('projects.subtitle') });

  if (!enabled) return <Navigate to="/home" replace />;

  const displayName = authUser?.name ?? '';
  const columns = [
    { titleKey: 'projects.colBacklog', cards: 1 },
    { titleKey: 'projects.colDoing', cards: 0 },
    { titleKey: 'projects.colReview', cards: 0 },
    { titleKey: 'projects.colDone', cards: 0 },
  ];

  return (
    <div className="home-shell">
      <div className="home">
        <header className="topbar">
          <MobileMenu />
          <Logo variant="solid" size={20} to="/home" />
          <nav className="nav">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`nav__item${item.to === '/projetos' ? ' nav__item--active' : ''}`}
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
            email={authUser?.email ?? ''}
          />
        </header>

        <div className="game">
          <header className="game__head">
            <div>
              <h1 className="game__title">{t('projects.title')}</h1>
              <p className="game__sub">{t('projects.subtitle')}</p>
            </div>
            <span className="game__badge">{t('projects.badge')}</span>
          </header>

          <div className="game__board">
            {columns.map((column) => (
              <section className="game__col" key={column.titleKey}>
                <header className="game__col-head">
                  <span>{t(column.titleKey)}</span>
                  <span className="game__col-n">{column.cards}</span>
                </header>

                {column.titleKey === 'projects.colBacklog' ? (
                  <>
                    <article className="game__card game__card--locked">
                      <header className="game__card-top">
                        <span className="game__card-tag">Rust · v2</span>
                        <span className="game__card-pts">5 pts</span>
                      </header>
                      <h3 className="game__card-title">{t('projects.teaserTitle')}</h3>
                      <p className="game__card-body">{t('projects.teaserBody')}</p>
                      <footer className="game__card-foot">
                        <Lock size={13} />
                        <span>{t('projects.teaserFoot')}</span>
                      </footer>
                    </article>

                    <article className="game__card game__card--intro">
                      <h3 className="game__card-title">{t('projects.introTitle')}</h3>
                      <p className="game__card-body">{t('projects.introBody')}</p>
                    </article>
                  </>
                ) : (
                  <p className="game__col-empty">{t('projects.emptyColumn')}</p>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
