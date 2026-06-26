import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/Logo';
import { UserMenu } from '../../components/UserMenu';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Avatar } from '../../components/Avatar';
import { Flame, Search, Bookmark, Play } from '../../components/Icons';
import { getInitials } from '../../utils/initials';
import {
  user,
  dailyChallenge,
  trilhas,
  week,
  ranking,
  feed,
  MEDALS,
} from '../../data/home';

const NAV = [
  { label: 'Início', to: '/home' },
  { label: 'Trilhas', to: '/trilhas' },
  { label: 'Ranking', to: '/ranking' },
  { label: 'Comunidade', to: '/comunidade' },
];

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="stat">
      <span className="stat__value">{value}</span>
      <span className="stat__label">{label}</span>
    </div>
  );
}

export function Home() {
  const { user: authUser } = useAuth();

  const displayName = authUser?.name ?? user.name;
  const initials = getInitials(displayName);

  return (
    <div className="home-shell">
      <div className="home">
        {/* Topbar */}
        <header className="topbar">
          <Logo variant="solid" size={20} />
          <nav className="nav">
            {NAV.map((item, i) => (
              <Link
                key={item.to}
                to={item.to}
                className={`nav__item${i === 0 ? ' nav__item--active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="topbar__spacer" />
          <div className="searchbar">
            <Search size={16} />
            <span>Buscar exercício…</span>
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

        {/* Corpo */}
        <div className="home__body">
          <main className="home__main">
            {/* Desafio do dia */}
            <section>
              <div className="section-head">
                <h2 className="section-title">Desafio do dia</h2>
                <span className="section-meta">Quarta-feira, 25 de junho</span>
              </div>

              <article className="challenge">
                <div className="challenge__content">
                  <div className="challenge__badges">
                    <span className="tag tag--id">{dailyChallenge.id}</span>
                    <span className="tag tag--success">{dailyChallenge.difficulty}</span>
                    <span className="tag tag--accent">+{dailyChallenge.xp} XP</span>
                    <span className="challenge__bookmark"><Bookmark size={19} /></span>
                  </div>
                  <h3 className="challenge__title">{dailyChallenge.title}</h3>
                  <p className="challenge__desc">{dailyChallenge.description}</p>
                  <div className="challenge__tags">
                    {dailyChallenge.tags.map((t) => (
                      <span key={t} className="chip chip--outline">{t}</span>
                    ))}
                  </div>
                  <hr className="rule" />
                  <div className="challenge__footer">
                    <Stat value={dailyChallenge.acceptance} label="aceitação" />
                    <Stat value={dailyChallenge.solvedToday} label="resolveram hoje" />
                    <Stat value={dailyChallenge.avgTime} label="tempo médio" />
                    <div className="topbar__spacer" />
                    <button className="btn btn--accent"><Play size={13} /> Resolver agora</button>
                  </div>
                </div>
                <aside className="challenge__code">
                  <div className="code-window__dots">
                    <i style={{ background: '#E0655A' }} />
                    <i style={{ background: '#E0A82E' }} />
                    <i style={{ background: '#3DAE6B' }} />
                  </div>
                  <div><span className="tok-accent">function</span> dois(nums, alvo) {'{'}</div>
                  <div className="code-window__indent"><span className="tok-accent">const</span> mapa = {'{}'};</div>
                  <div className="code-window__indent"><span className="tok-accent">for</span> (i <span className="tok-accent">in</span> nums) {'{'}</div>
                  <div className="code-window__comment" style={{ paddingLeft: 28 }}>// seu código aqui</div>
                  <div className="code-window__indent">{'}'}</div>
                  <div>{'}'}</div>
                </aside>
              </article>
            </section>

            {/* Trilhas */}
            <section>
              <div className="section-head">
                <h2 className="section-title">Continue suas trilhas</h2>
                <a className="link" href="#">Ver todas</a>
              </div>
              <div className="trilhas">
                {trilhas.map((t) => (
                  <div key={t.name} className="trilha">
                    <div className="trilha__head">
                      <span
                        className="trilha__icon"
                        style={{
                          color: t.hue,
                          background: `color-mix(in srgb, ${t.hue} 16%, transparent)`,
                        }}
                      >
                        {t.glyph}
                      </span>
                      <div className="trilha__meta">
                        <div className="trilha__name">{t.name}</div>
                        <div className="trilha__sub">{t.sub}</div>
                      </div>
                    </div>
                    <div className="progress">
                      <div className="progress__track">
                        <span className="progress__fill" style={{ width: `${t.pct}%` }} />
                      </div>
                      <span className="progress__pct">{t.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>

          {/* Sidebar */}
          <aside className="home__side">
            {/* Streak */}
            <div className="card">
              <div className="streak">
                <span className="streak__icon"><Flame size={24} /></span>
                <div>
                  <div className="streak__count">{user.streak} dias</div>
                  <div className="streak__label">de streak seguido</div>
                </div>
              </div>
              <div className="week">
                {week.map((d, i) => (
                  <div key={i} className="week__day">
                    <span className={`week__dot${d.on ? ' week__dot--on' : ''}`}>
                      {d.on ? '✓' : ''}
                    </span>
                    <span className="week__letter">{d.d}</span>
                  </div>
                ))}
              </div>
              <p className="streak__note">
                Você está pegando fogo! Resolva o desafio de hoje para manter o streak.
              </p>
            </div>

            {/* Ranking */}
            <div className="card">
              <div className="card__head">
                <h3 className="card__title">Ranking global</h3>
                <a className="link" href="#">Ver tudo</a>
              </div>
              {ranking.map((p) => (
                <div key={p.r} className={`rank-row${p.you ? ' rank-row--you' : ''}`}>
                  <span className="rank-row__pos" style={{ color: MEDALS[p.r] || 'var(--muted)' }}>
                    {p.r}
                  </span>
                  <Avatar
                    initials={p.initials}
                    background={p.you ? 'var(--accent)' : p.color}
                    color={!p.you && p.r === 1 ? '#3a2a00' : '#fff'}
                  />
                  <span className={`rank-row__name${p.you ? ' rank-row__name--you' : ''}`}>
                    {p.name}
                  </span>
                  <span className="rank-row__pts">{p.pts}</span>
                </div>
              ))}
            </div>

            {/* Comunidade */}
            <div className="card">
              <h3 className="card__title card__title--mb">Comunidade</h3>
              <div className="feed">
                {feed.map((f, i) => (
                  <div key={i} className="feed__item">
                    <Avatar initials={f.initials} background={f.color} />
                    <p className="feed__text">
                      <b>{f.name}</b>{' '}
                      <span className="feed__muted">{f.text}</span>{' '}
                      <span className="feed__time">· {f.time}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
