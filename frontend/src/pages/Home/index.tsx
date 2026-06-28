import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/Logo';
import { UserMenu } from '../../components/UserMenu';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Avatar } from '../../components/Avatar';
import { Flame, Search, Bookmark, Play } from '../../components/Icons';
import { getInitials } from '../../utils/initials';
import { tempoRelativo } from '../../utils/tempo';
import {
  user,
  dailyChallenge,
  MEDALS,
} from '../../data/home';
import { listarTrilhas, listarMinhasTrilhas, obterTrilha, obterFeedConquistas, obterRanking, obterStreak, type FeedConquista, type RankingRow, type StreakInfo } from '../../services/trails';
import type { Trail } from '../../data/trails';

const NAV = [
  { label: 'Início', to: '/home' },
  { label: 'Trilhas', to: '/trilhas' },
  { label: 'Ranking', to: '/ranking' },
  { label: 'Comunidade', to: '/comunidade' },
];

const CORES_FEED = ['#2D6BF5', '#E0655A', '#3DAE6B', '#E0A82E', '#8B5CF6'];

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

  const navigate = useNavigate();
  const [emAndamento, setEmAndamento] = useState<(Trail & { id: string })[]>([]);
  const [disponiveis, setDisponiveis] = useState<(Trail & { id: string })[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [feedComunidade, setFeedComunidade] = useState<FeedConquista[]>([]);
  const [rankingGlobal, setRankingGlobal] = useState<RankingRow[]>([]);
  const [streakInfo, setStreakInfo] = useState<StreakInfo>({ streak: 0, week: [] });

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      try {
        const [todas, doUsuario] = await Promise.all([listarTrilhas(), listarMinhasTrilhas()]);
        if (!ativo) return;
        const comProgresso = todas.map((c) => ({
          ...c,
          done: doUsuario.find((m) => m.id === c.id)?.done ?? 0,
        }));
        setEmAndamento(comProgresso.filter((t) => t.done > 0 && t.done < t.lessons));
        setDisponiveis(comProgresso);
      } catch {
        // silencioso: o resto da home continua aparecendo
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    carregar();
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    obterFeedConquistas().then(setFeedComunidade).catch(() => {});
    obterRanking().then((r) => setRankingGlobal(r.rows)).catch(() => {});
    obterStreak().then(setStreakInfo).catch(() => {});
  }, []);

  // Abre a trilha na primeira aula disponivel (a atual, ou a primeira).
  async function abrirTrilha(trailId: string) {
    try {
      const detalhe = await obterTrilha(trailId);
      const aulas = detalhe.modules.flatMap((m) => m.lessons);
      const alvo = aulas.find((l) => l.state === 'current') ?? aulas.find((l) => l.state !== 'locked');
      navigate(alvo ? `/trilhas/${trailId}/aula/${alvo.id}` : '/trilhas');
    } catch {
      navigate('/trilhas');
    }
  }

  const mostrandoEmAndamento = emAndamento.length > 0;
  const listaTrilhas = (mostrandoEmAndamento ? emAndamento : disponiveis).slice(0, 4);

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
            <Flame size={16} /> {streakInfo.streak}
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
                <h2 className="section-title">{mostrandoEmAndamento ? 'Continue suas trilhas' : 'Trilhas disponíveis'}</h2>
                <Link className="link" to="/trilhas">Ver todas</Link>
              </div>
              {carregando ? (
                <p className="track__desc">Carregando trilhas...</p>
              ) : listaTrilhas.length === 0 ? (
                <p className="track__desc">Nenhuma trilha disponível ainda.</p>
              ) : (
                <div className="trilhas">
                  {listaTrilhas.map((t) => {
                    const pct = t.lessons > 0 ? Math.round((t.done / t.lessons) * 100) : 0;
                    return (
                      <div
                        key={t.id}
                        className="trilha"
                        role="button"
                        tabIndex={0}
                        style={{ cursor: 'pointer' }}
                        onClick={() => abrirTrilha(t.id)}
                        onKeyDown={(e) => { if (e.key === 'Enter') abrirTrilha(t.id); }}
                      >
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
                            <div className="trilha__sub">
                              {t.done > 0 ? `${t.done} de ${t.lessons} aulas` : `${t.lessons} aulas · ${t.level}`}
                            </div>
                          </div>
                        </div>
                        <div className="progress">
                          <div className="progress__track">
                            <span className="progress__fill" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="progress__pct">{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </main>

          {/* Sidebar */}
          <aside className="home__side">
            {/* Streak */}
            <div className="card">
              <div className="streak">
                <span className="streak__icon"><Flame size={24} /></span>
                <div>
                  <div className="streak__count">{streakInfo.streak} dias</div>
                  <div className="streak__label">de streak seguido</div>
                </div>
              </div>
              <div className="week">
                {streakInfo.week.map((d, i) => (
                  <div key={i} className="week__day">
                    <span className={`week__dot${d.active ? ' week__dot--on' : ''}`}>
                      {d.active ? '✓' : ''}
                    </span>
                    <span className="week__letter">{d.label}</span>
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
                <Link className="link" to="/ranking">Ver tudo</Link>
              </div>
              {rankingGlobal.length === 0 ? (
                <p className="track__desc">Ranking ainda vazio.</p>
              ) : rankingGlobal.slice(0, 5).map((p) => (
                <div key={p.position} className={`rank-row${p.you ? ' rank-row--you' : ''}`}>
                  <span className="rank-row__pos" style={{ color: MEDALS[p.position] || 'var(--muted)' }}>
                    {p.position}
                  </span>
                  <Avatar
                    initials={getInitials(p.name)}
                    background={p.you ? 'var(--accent)' : CORES_FEED[p.position % CORES_FEED.length]}
                    color={!p.you && p.position === 1 ? '#3a2a00' : '#fff'}
                  />
                  <span className={`rank-row__name${p.you ? ' rank-row__name--you' : ''}`}>
                    {p.name}
                  </span>
                  <span className="rank-row__pts">{p.xp}</span>
                </div>
              ))}
            </div>

            {/* Comunidade */}
            <div className="card">
              <h3 className="card__title card__title--mb">Comunidade</h3>
              {feedComunidade.length === 0 ? (
                <p className="track__desc">Ainda não há conquistas na comunidade.</p>
              ) : (
                <div className="feed">
                  {feedComunidade.map((f, i) => (
                    <div key={i} className="feed__item">
                      <Avatar initials={getInitials(f.name)} background={CORES_FEED[i % CORES_FEED.length]} />
                      <p className="feed__text">
                        <b>{f.name}</b>{' '}
                        <span className="feed__muted">desbloqueou {f.achievement}</span>{' '}
                        <span className="feed__time">· {tempoRelativo(f.at)}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
