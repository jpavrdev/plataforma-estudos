import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/Logo';
import { MobileMenu } from '../../components/MobileMenu';
import { UserMenu } from '../../components/UserMenu';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Avatar } from '../../components/Avatar';
import { Flame, Play } from '../../components/Icons';
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
import { getTrailLang } from '../../utils/trailLang';
import { ehCliqueSimples } from '../../utils/cliqueSimples';
import { getDesafioDoDia, type DesafioDetalhe } from '../../services/desafios';
import type { Trail } from '../../data/trails';
import { useNavPrincipal } from '../../hooks/useNavPrincipal';
import { Trans, useTranslation } from 'react-i18next';

const DIF_LABEL: Record<string, 'desafios.diffEasy' | 'desafios.diffMedium' | 'desafios.diffHard'> = {
  facil: 'desafios.diffEasy',
  medio: 'desafios.diffMedium',
  dificil: 'desafios.diffHard',
};

// Trilha sugerida para quem ainda não começou nada. Se ela não existir, a home cai
// na primeira trilha de nível iniciante que encontrar.
const TRILHA_DE_ENTRADA = 'Lógica de Programação';
const CHAVE_DESTAQUE = '@App:primeiroPassoVisto';

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

function dataPorExtenso(language: string): string {
  const s = new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

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
  const { t, i18n } = useTranslation();
  const { user: authUser } = useAuth();
  const nav = useNavPrincipal();

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
        const comProgresso = todas.map((c) => {
          const meu = doUsuario.find((m) => m.id === c.id);
          return { ...c, done: meu?.done ?? 0, lessons: meu?.lessons ?? c.lessons };
        });
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
      const detalhe = await obterTrilha(trailId, getTrailLang(trailId));
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

  // Quem chega sem nenhum progresso cai numa grade de dezenas de trilhas sem saber
  // por onde começar, e dois em cada três cadastros nunca abrem uma aula. Para esses,
  // a home abre com um destino único: a trilha de entrada, direto na primeira aula.
  const semProgresso = !carregando && disponiveis.length > 0 && disponiveis.every((t) => !t.done);
  const trilhaInicial =
    disponiveis.find((t) => t.name === TRILHA_DE_ENTRADA) ??
    disponiveis.find((t) => t.level === 'Iniciante') ??
    null;

  // O véu escurece o resto da home para a atenção cair no bloco. Some no primeiro
  // clique (nele, fora dele ou no Esc) e não volta, para não virar obstáculo de quem
  // só quer olhar a plataforma.
  const [destaque, setDestaque] = useState(() => localStorage.getItem(CHAVE_DESTAQUE) !== '1');

  function fecharDestaque() {
    setDestaque(false);
    localStorage.setItem(CHAVE_DESTAQUE, '1');
  }

  useEffect(() => {
    if (!destaque) return;
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === 'Escape') fecharDestaque();
    }
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [destaque]);

  return (
    <div className="home-shell">
      <div className="home">
        {/* Topbar */}
        <header className="topbar">
          <MobileMenu />
          <Logo variant="solid" size={20} to="/home" />
          <nav className="nav">
            {nav.map((item, i) => (
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
            {/* Primeiro passo de quem ainda não começou */}
            {semProgresso && trilhaInicial && (
              <>
                {destaque && <div className="inicio__veu" onClick={fecharDestaque} />}
                <section className={`inicio${destaque ? ' inicio--destaque' : ''}`}>
                  <span className="inicio__tag">{t('home.firstStepsTag')}</span>
                  <h2 className="inicio__title">{t('home.firstStepsTitle')}</h2>
                  <p className="inicio__desc">
                    <Trans
                      i18nKey="home.firstStepsDesc"
                      values={{ name: trilhaInicial.name, lessons: trilhaInicial.lessons }}
                      components={{ b: <b /> }}
                    />
                  </p>
                  <div className="inicio__acoes">
                    <Link
                      className="inicio__btn"
                      to={`/trilhas/${trilhaInicial.id}`}
                      onClick={fecharDestaque}
                    >
                      {t('home.firstStepsCta')}
                    </Link>
                    <Link className="link" to="/trilhas" onClick={fecharDestaque}>
                      {t('home.firstStepsAlt')}
                    </Link>
                  </div>
                </section>
              </>
            )}

            {/* Desafio do dia */}
            {desafioHoje && (
              <section>
                <div className="section-head">
                  <h2 className="section-title">{t('home.dailyTitle')}</h2>
                  <span className="section-meta">{dataPorExtenso(i18n.language)}</span>
                </div>

                <article className="challenge">
                  <div className="challenge__content">
                    <div className="challenge__badges">
                      {desafioHoje.number != null && (
                        <span className="tag tag--id">{desafioHoje.number}</span>
                      )}
                      <span className="tag tag--success">{t(DIF_LABEL[desafioHoje.difficulty])}</span>
                      <span className="tag tag--accent">+{desafioHoje.xp} XP</span>
                      {desafioHoje.solved && <span className="tag tag--success">{t('home.solvedTag')}</span>}
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
                        <Stat value={`${desafioHoje.acceptance}%`} label={t('home.acceptance')} />
                      )}
                      <div className="topbar__spacer" />
                      <Link className="btn btn--accent" to={`/desafios/${desafioHoje.id}`}>
                        <Play size={13} />{' '}
                        {desafioHoje.solved
                          ? t('desafios.dailyReview')
                          : t('desafios.dailySolveNow')}
                      </Link>
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
                  {mostrandoEmAndamento ? t('home.continueTitle') : t('home.availableTitle')}
                </h2>
                <Link className="link" to="/trilhas">
                  {t('home.seeAllF')}
                </Link>
              </div>
              {carregando ? (
                <p className="track__desc">{t('trilhas.loading')}</p>
              ) : listaTrilhas.length === 0 ? (
                <p className="track__desc">{t('trilhas.empty')}</p>
              ) : (
                <div className="trilhas">
                  {listaTrilhas.map((tr) => {
                    const pct = tr.lessons > 0 ? Math.round((tr.done / tr.lessons) * 100) : 0;
                    return (
                      <div key={tr.id} className="trilha">
                        <div className="trilha__head">
                          <span
                            className="trilha__icon"
                            style={{
                              color: tr.hue,
                              background: `color-mix(in srgb, ${tr.hue} 16%, transparent)`,
                            }}
                          >
                            {tr.glyph}
                          </span>
                          <div className="trilha__meta">
                            <Link
                              to={`/trilhas/${tr.id}`}
                              className="trilha__name link-esticado"
                              onClick={(e) => {
                                // Em andamento, o clique simples pula direto para a próxima aula
                                // (que só se conhece depois de buscar a trilha); ctrl+clique e
                                // botão do meio seguem o href e abrem a trilha em nova guia.
                                if (!mostrandoEmAndamento || !ehCliqueSimples(e)) return;
                                e.preventDefault();
                                abrirTrilha(tr.id);
                              }}
                            >
                              {tr.name}
                            </Link>
                            <div className="trilha__sub">
                              {tr.done > 0
                                ? t('home.lessonsOf', { done: tr.done, total: tr.lessons })
                                : `${t('trilhas.lessonsCount', { count: tr.lessons })} · ${tr.level}`}
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
                  <div className="streak__count">
                    {streakInfo.streak === 1
                      ? t('home.streakDays_one', { count: 1 })
                      : t('home.streakDays_other', { count: streakInfo.streak })}
                  </div>
                  <div className="streak__label">{t('home.streakLabel')}</div>
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
              <p className="streak__note">{t('home.streakNote')}</p>
            </div>

            {/* Ranking */}
            <div className="card">
              <div className="card__head">
                <h3 className="card__title">{t('home.rankingTitle')}</h3>
                <Link className="link" to="/ranking">
                  {t('home.seeAllM')}
                </Link>
              </div>
              {rankingGlobal.length === 0 ? (
                <p className="track__desc">{t('home.rankingEmpty')}</p>
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
              <h3 className="card__title card__title--mb">{t('nav.community')}</h3>
              {feedComunidade.length === 0 ? (
                <p className="track__desc">{t('home.communityEmpty')}</p>
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
                        <span className="feed__muted">
                          {t('home.unlocked', { achievement: f.achievement })}
                        </span>{' '}
                        <span className="feed__time">· {tempoRelativo(f.at, i18n.language)}</span>
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
