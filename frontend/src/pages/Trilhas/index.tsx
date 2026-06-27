import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Logo } from '../../components/Logo';
import { UserMenu } from '../../components/UserMenu';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Flame, Search, Play, ChevronRight } from '../../components/Icons';
import { getInitials } from '../../utils/initials';
import { user } from '../../data/home';
import {
  trilhasFull,
  trilhaFilters,
  continuar,
  type TrailLevel,
} from '../../data/trails';

const NAV = [
  { label: 'Início', to: '/home' },
  { label: 'Trilhas', to: '/trilhas' },
  { label: 'Ranking', to: '/ranking' },
  { label: 'Comunidade', to: '/comunidade' },
];

type Tint = { fg: string; bg: string };

const LEVEL_TINT: Record<'light' | 'dark', Record<TrailLevel, Tint>> = {
  light: {
    Iniciante: { fg: '#1C8F5A', bg: '#E5F1EA' },
    'Intermediário': { fg: '#B7791F', bg: '#FBF0D8' },
    'Avançado': { fg: '#C2410C', bg: '#FBE6D8' },
  },
  dark: {
    Iniciante: { fg: '#46D58F', bg: '#15271E' },
    'Intermediário': { fg: '#E0A82E', bg: '#2A2310' },
    'Avançado': { fg: '#F08A5D', bg: '#2A1810' },
  },
};

function Metric({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="metric">
      <div className="metric__value" style={accent ? { color: 'var(--accent)' } : undefined}>
        {value}
      </div>
      <div className="metric__label">{label}</div>
    </div>
  );
}

export function Trilhas() {
  const { user: authUser } = useAuth();
  const { theme } = useTheme();
  const tint = LEVEL_TINT[theme] ?? LEVEL_TINT.light;

  const displayName = authUser?.name ?? user.name;
  const initials = getInitials(displayName);

  return (
    <div className="home-shell">
      <div className="home">
        {/* Topbar */}
        <header className="topbar">
          <Logo variant="solid" size={20} />
          <nav className="nav">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`nav__item${item.label === 'Trilhas' ? ' nav__item--active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="topbar__spacer" />
          <div className="searchbar">
            <Search size={16} />
            <span>Buscar trilha…</span>
          </div>
          <div className="streak-pill">
            <Flame size={16} /> {user.streak}
          </div>
          <ThemeToggle inline />
          <UserMenu
            initials={initials}
            level={user.level}
            name={displayName}
            email={authUser?.email}
          />
        </header>

        <div className="trilhas-page">
          {/* Título + stats */}
          <div className="trilhas-page__head">
            <div>
              <h1 className="trilhas-page__title">Trilhas de aprendizado</h1>
              <p className="trilhas-page__sub">
                Aprenda passo a passo, da lógica aos algoritmos. Conclua aulas para
                subir de nível e ganhar XP.
              </p>
            </div>
            <div className="trilhas-page__stats">
              <Metric value="3" label="em andamento" />
              <span className="trilhas-page__divider" />
              <Metric value="54" label="aulas concluídas" />
              <span className="trilhas-page__divider" />
              <Metric value="2.640" label="XP em trilhas" accent />
            </div>
          </div>

          {/* Continuar (destaque) */}
          <div className="continue-card">
            <span className="continue-card__glow" />
            <div className="continue-card__body">
              <div className="continue-card__kicker">Continuar de onde parou</div>
              <h2 className="continue-card__title">{continuar.name}</h2>
              <p className="continue-card__next">
                Próxima aula · <b>{continuar.next}</b>
              </p>
              <div className="continue-card__progress">
                <div className="continue-card__track">
                  <span style={{ width: `${continuar.pct}%` }} />
                </div>
                <span className="continue-card__pct">
                  {continuar.pct}% · {continuar.done}/{continuar.total}
                </span>
              </div>
            </div>
            <button className="continue-card__btn">
              <Play size={13} /> Continuar aula
            </button>
          </div>

          {/* Filtros */}
          <div className="filters">
            {trilhaFilters.map((f, i) => (
              <button key={f} className={`filter${i === 0 ? ' filter--active' : ''}`}>
                {f}
              </button>
            ))}
            <div className="topbar__spacer" />
            <span className="filters__count">{trilhasFull.length} trilhas</span>
          </div>

          {/* Grade */}
          <div className="track-grid">
            {trilhasFull.map((t) => {
              const pct = Math.round((t.done / t.lessons) * 100);
              const started = t.done > 0;
              const completed = t.done >= t.lessons;
              const lv = tint[t.level];
              return (
                <div key={t.name} className="track">
                  <div className="track__head">
                    <span
                      className="track__icon"
                      style={{
                        color: t.hue,
                        background: `color-mix(in srgb, ${t.hue} 16%, transparent)`,
                      }}
                    >
                      {t.glyph}
                    </span>
                    <div className="track__meta">
                      <div className="track__name">{t.name}</div>
                      <div className="track__row">
                        <span className="track__level" style={{ color: lv.fg, background: lv.bg }}>
                          {t.level}
                        </span>
                        <span className="track__lessons">{t.lessons} aulas</span>
                      </div>
                    </div>
                  </div>
                  <p className="track__desc">{t.desc}</p>
                  <div className="progress">
                    <div className="progress__track">
                      <span
                        className="progress__fill"
                        style={{
                          width: `${pct}%`,
                          background: started ? 'var(--accent)' : 'var(--surface-2)',
                        }}
                      />
                    </div>
                    <span className="progress__pct">{pct}%</span>
                  </div>
                  <hr className="rule" />
                  <div className="track__foot">
                    <div className="track__tags">
                      {t.tags.map((tag) => (
                        <span key={tag} className="chip--outline">{tag}</span>
                      ))}
                    </div>
                    <span
                      className="track__cta"
                      style={{ color: started ? 'var(--accent)' : 'var(--text)' }}
                    >
                      {completed ? 'Revisar' : started ? 'Continuar' : 'Começar'}{' '}
                      <ChevronRight size={15} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
