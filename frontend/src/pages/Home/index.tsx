import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/Logo';
import { UserMenu } from '../../components/UserMenu';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Avatar } from '../../components/Avatar';
import { Flame, Search, Play } from '../../components/Icons';
import { getInitials } from '../../utils/initials';
import { tempoRelativo } from '../../utils/tempo';
import { user, MEDALS } from '../../data/home';
import {
  listarTrilhas,
  listarMinhasTrilhas,
  obterTrilha,
  obterFeedConquistas,
  obterRanking,
  obterStreak,
  type FeedConquista,
  type RankingRow,
  type StreakInfo,
} from '../../services/trails';
import { getDesafioDoDia, type DesafioDetalhe } from '../../services/desafios';
import type { Trail } from '../../data/trails';

const DIF_LABEL: Record<string, string> = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' };

// Resumo em texto puro do enunciado (primeiro bloco de texto, sem marcação).
function resumoEnunciado(blocks: { type: string; value: string }[]): string {
  const texto = blocks.find((b) => b.type === 'text')?.value ?? '';
  const limpo = texto
    .replace(/[*`_#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return limpo.length > 160 ? limpo.slice(0, 157) + '...' : limpo;
}

// Primeiras linhas do código inicial, para a prévia no card.
function previaCodigo(starter: Partial<Record<'javascript' | 'python', string>>): string {
  const code = starter.javascript || starter.python || '';
  return code.split('\n').slice(0, 10).join('\n');
}

function dataPorExtenso(): string {
  const s = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const NAV = [
  { label: 'Início', to: '/home' },
  { label: 'Trilhas', to: '/trilhas' },
  { label: 'Simulados', to: '/simulados' },
  { label: 'Desafios', to: '/desafios' },
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
  const [desafioHoje, setDesafioHoje] = useState<DesafioDetalhe | null>(null);

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
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    obterFeedConquistas()
      .then(setFeedComunidade)
      .catch(() => {});
    obterRanking()
      .then((r) => setRankingGlobal(r.rows))
      .catch(() => {});
    obterStreak()
      .then(setStreakInfo)
      .catch(() => {});
    getDesafioDoDia()
      .then(setDesafioHoje)
      .catch(() => {});
  }, []);

  // Abre a trilha na primeira aula disponivel (a atual, ou a primeira).
  async function abrirTrilha(trailId: string) {
    try {
      const detalhe = await obterTrilha(trailId);
      const aulas = detalhe.modules.flatMap((m) => m.lessons);
      const alvo =
        aulas.find((l) => l.state === 'current') ?? aulas.find((l) => l.state !== 'locked');
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
            <Flame size={16} /> {authUser?.streak ?? 0}
          </div>
          <ThemeToggle inline />
          <UserMenu
            initials={initials}
            level={authUser?.level ?? 1}
            name={displayName}
            email={authUser?.email}
          />
        </header>

        {/* Corpo */}
        <div className="home__body">
          <main className="home__main">
            {/* Desafio do dia */}
            {desafioHoje && (
              <section>
                <div className="section-head">
                  <h2 className="section-title">Desafio do dia</h2>
                  <span className="section-meta">{dataPorExtenso()}</span>
                </div>

                <article className="challenge">
                  <div className="challenge__content">
                    <div className="challenge__badges">
                      {desafioHoje.number != null && (
                        <span className="tag tag--id">{desafioHoje.number}</span>
                      )}
                      <span className="tag tag--success">{DIF_LABEL[desafioHoje.difficulty]}</span>
                      <span className="tag tag--accent">+{desafioHoje.xp} XP</span>
                      {desafioHoje.solved && <span className="tag tag--success">Resolvido</span>}
                    </div>
                    <h3 className="challenge__title">{desafioHoje.title}</h3>
                    <p className="challenge__desc">
                      {resumoEnunciado(desafioHoje.statementBlocks)}
                    </p>
                    <div className="challenge__tags">
                      {(desafioHoje.topic ?? '')
                        .split('·')
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map((t) => (
                          <span key={t} className="chip chip--outline">
                            {t}
                          </span>
                        ))}
                    </div>
                    <hr className="rule" />
                    <div className="challenge__footer">
                      {desafioHoje.acceptance != null && (
                        <Stat value={`${desafioHoje.acceptance}%`} label="aceitação" />
                      )}
                      <div className="topbar__spacer" />
                      <button
                        className="btn btn--accent"
                        onClick={() => navigate(`/desafios/${desafioHoje.id}`)}
                      >
                        <Play size={13} /> {desafioHoje.solved ? 'Revisar' : 'Resolver agora'}
                      </button>
                    </div>
                  </div>
                  <aside className="challenge__code">
                    <div className="code-window__dots">
                      <i style={{ background: '#E0655A' }} />
                      <i style={{ background: '#E0A82E' }} />
                      <i style={{ background: '#3DAE6B' }} />
                    </div>
                    <pre className="challenge__code-pre">
                      {previaCodigo(desafioHoje.starterCode)}
                    </pre>
                  </aside>
                </article>
              </section>
            )}

            {/* Trilhas */}
            <section>
              <div className="section-head">
                <h2 className="section-title">
                  {mostrandoEmAndamento ? 'Continue suas trilhas' : 'Trilhas disponíveis'}
                </h2>
                <Link className="link" to="/trilhas">
                  Ver todas
                </Link>
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
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') abrirTrilha(t.id);
                        }}
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
                              {t.done > 0
                                ? `${t.done} de ${t.lessons} aulas`
                                : `${t.lessons} aulas · ${t.level}`}
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
                <span className="streak__icon">
                  <Flame size={24} />
                </span>
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
                <Link className="link" to="/ranking">
                  Ver tudo
                </Link>
              </div>
              {rankingGlobal.length === 0 ? (
                <p className="track__desc">Ranking ainda vazio.</p>
              ) : (
                rankingGlobal.slice(0, 5).map((p) => (
                  <div key={p.position} className={`rank-row${p.you ? ' rank-row--you' : ''}`}>
                    <span
                      className="rank-row__pos"
                      style={{ color: MEDALS[p.position] || 'var(--muted)' }}
                    >
                      {p.position}
                    </span>
                    <Avatar
                      initials={getInitials(p.name)}
                      background={
                        p.you ? 'var(--accent)' : CORES_FEED[p.position % CORES_FEED.length]
                      }
                      color={!p.you && p.position === 1 ? '#3a2a00' : '#fff'}
                    />
                    <span className={`rank-row__name${p.you ? ' rank-row__name--you' : ''}`}>
                      {p.name}
                    </span>
                    <span className="rank-row__pts">{p.xp}</span>
                  </div>
                ))
              )}
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
                      <Avatar
                        initials={getInitials(f.name)}
                        background={CORES_FEED[i % CORES_FEED.length]}
                      />
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
