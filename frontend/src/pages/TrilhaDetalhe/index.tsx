import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/Logo';
import { MobileMenu } from '../../components/MobileMenu';
import { UserMenu } from '../../components/UserMenu';
import { ThemeToggle } from '../../components/ThemeToggle';
import {
  Flame,
  Users,
  BookOpen,
  ClockExam,
  Globe,
  Check,
  Play,
  Eye,
  Lock,
  DocLines,
  ChevronDown,
  Grid4,
} from '../../components/Icons';
import { getInitials } from '../../utils/initials';
import { user } from '../../data/home';
import { NAV_PRINCIPAL as NAV } from '../../data/nav';
import { obterTrilha, avaliarTrilha, type TrailDetail, type LessonRef } from '../../services/trails';

const NIVEL: Record<TrailDetail['trailLevel'], string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

function glyphDoNome(name: string): string {
  const limpo = name.replace(/[^A-Za-zÀ-ú ]/g, '').trim();
  const partes = limpo.split(/\s+/).slice(0, 2);
  return partes.map((p) => p[0]?.toUpperCase() ?? '').join('') || '{}';
}

function formatDur(min: number): string {
  if (min <= 0) return '';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

type Disp = 'done' | 'current' | 'preview' | 'locked';
function dispDe(l: LessonRef): Disp {
  if (l.state === 'done') return 'done';
  if (l.state === 'current') return 'current';
  if (l.preview) return 'preview';
  return 'locked';
}

const STAR_PATH = 'M12 2l3 6.5 7 .9-5 4.8 1.3 7L12 18l-6.3 3.2L7 14.2l-5-4.8 7-.9z';

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <div className="td-stars">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i < value ? 'var(--gold)' : 'var(--border-strong)'}
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </div>
  );
}

function formatNota(n: number | null | undefined): string {
  return (n ?? 0).toFixed(1).replace('.', ',');
}

export function TrilhaDetalhe() {
  const { trailId } = useParams();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const displayName = authUser?.name ?? user.name;
  const initials = getInitials(displayName);

  const [trilha, setTrilha] = useState<TrailDetail | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [abertos, setAbertos] = useState<Set<string>>(new Set());
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!trailId) return;
    setCarregando(true);
    obterTrilha(trailId)
      .then((t) => {
        setTrilha(t);
        setStars(t.myReview?.stars ?? 0);
        setComment(t.myReview?.comment ?? '');
        const atual = t.modules.find((m) => m.lessons.some((l) => l.state === 'current'));
        setAbertos(new Set([(atual ?? t.modules[0])?.id].filter(Boolean) as string[]));
      })
      .catch(() => setErro('Não foi possível carregar a trilha.'))
      .finally(() => setCarregando(false));
  }, [trailId]);

  const stats = useMemo(() => {
    const aulas = trilha?.modules.flatMap((m) => m.lessons) ?? [];
    const total = aulas.length;
    const feitas = aulas.filter((l) => l.state === 'done').length;
    const minutos = aulas.reduce((s, l) => s + (l.durationMin ?? 0), 0);
    const alvo =
      aulas.find((l) => l.state === 'current') ?? aulas.find((l) => l.state !== 'locked') ?? aulas[0];
    const previa = aulas.find((l) => l.preview) ?? alvo;
    return { total, feitas, minutos, alvo, previa, comecado: feitas > 0 };
  }, [trilha]);

  function irParaAula(l: LessonRef, disp: Disp) {
    if (!trilha || disp === 'locked') return;
    navigate(`/trilhas/${trilha.id}/aula/${l.id}`);
  }
  function irPara(l?: LessonRef) {
    if (!trilha || !l) return;
    navigate(`/trilhas/${trilha.id}/aula/${l.id}`);
  }
  function toggle(id: string) {
    setAbertos((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  async function enviarAvaliacao() {
    if (!trailId || stars < 1) return;
    setSalvando(true);
    try {
      await avaliarTrilha(trailId, stars, comment.trim() || null);
      const t = await obterTrilha(trailId);
      setTrilha(t);
    } catch {
      setErro('Não foi possível enviar sua avaliação.');
    } finally {
      setSalvando(false);
    }
  }

  const alunos = trilha?.studentsCount ?? 0;
  const inclui = trilha
    ? [
        { icon: <BookOpen size={15} />, label: `${stats.total} aulas em texto` },
        { icon: <Check size={15} />, label: 'Quiz ao final de cada aula' },
        { icon: <Grid4 size={15} />, label: 'Progresso salvo automaticamente' },
      ]
    : [];

  return (
    <div className="home-shell">
      <div className="home">
        <header className="topbar">
          <MobileMenu />
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

        {carregando && <p className="track__desc" style={{ padding: 24 }}>Carregando trilha...</p>}
        {erro && <div className="auth__alert" style={{ margin: 24 }}>{erro}</div>}
        {!carregando && !erro && !trilha && (
          <p className="track__desc" style={{ padding: 24 }}>Trilha não encontrada.</p>
        )}

        {trilha && (
          <>
            <div className="td-hero">
              <span className="td-hero__glow" />
              <div className="td-hero__inner">
                <div className="td-hero__main">
                  <div className="td-crumb">
                    <Link to="/trilhas" className="td-back">
                      Trilhas
                    </Link>
                    {trilha.category && (
                      <>
                        <span className="td-crumb__sep">/</span>
                        <span>{trilha.category}</span>
                      </>
                    )}
                    <span className="td-crumb__sep">/</span>
                    <span className="td-crumb__cur">{trilha.name}</span>
                  </div>
                  <div className="td-hero__badgerow">
                    <span className="td-hero__glyph">{glyphDoNome(trilha.name)}</span>
                    <span className="td-hero__tag">
                      {trilha.category
                        ? `${trilha.category} · ${NIVEL[trilha.trailLevel]}`
                        : NIVEL[trilha.trailLevel]}
                    </span>
                  </div>
                  <h1 className="td-hero__title">{trilha.name}</h1>
                  <p className="td-hero__desc">{trilha.description}</p>

                  {((trilha.reviewCount ?? 0) > 0 || alunos > 0) && (
                    <div className="td-hero__rating">
                      {(trilha.reviewCount ?? 0) > 0 && (
                        <div className="td-rating">
                          <span className="td-rating__num">{formatNota(trilha.rating)}</span>
                          <Stars value={Math.round(trilha.rating ?? 0)} size={16} />
                          <span className="td-rating__count">({trilha.reviewCount} avaliações)</span>
                        </div>
                      )}
                      {alunos > 0 && (
                        <div className="td-hero__students">
                          <Users size={17} /> <b>{alunos.toLocaleString('pt-BR')}</b> alunos nesta trilha
                        </div>
                      )}
                    </div>
                  )}

                  <div className="td-hero__meta">
                    <span>
                      <BookOpen size={15} /> {stats.total} aulas em texto
                    </span>
                    {stats.minutos > 0 && (
                      <span>
                        <ClockExam size={15} /> ~{formatDur(stats.minutos)} de leitura
                      </span>
                    )}
                    <span>
                      <Globe size={15} /> PT-BR
                    </span>
                  </div>
                </div>

                <div className="td-card">
                  <button className="td-card__preview" onClick={() => irPara(stats.previa)}>
                    <span className="td-card__preview-icon">
                      <DocLines size={26} />
                    </span>
                  </button>
                  <div className="td-card__body">
                    <div className="td-card__price">
                      <b>GRÁTIS</b>
                    </div>
                    <button className="td-card__cta" onClick={() => irPara(stats.alvo)} disabled={!stats.alvo}>
                      {stats.comecado ? 'Continuar trilha' : 'Começar trilha'}
                    </button>
                    <hr className="rule" />
                    <div className="td-card__inc-title">Esta trilha inclui</div>
                    <div className="td-card__inc">
                      {inclui.map((i) => (
                        <div key={i.label} className="td-card__inc-item">
                          <span className="td-card__inc-icon">{i.icon}</span>
                          {i.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="td-body">
              <div className="td-col">
                {trilha.whatYouLearn && trilha.whatYouLearn.length > 0 && (
                  <div className="card">
                    <h3 className="td-h3">O que você vai aprender</h3>
                    <div className="td-learn">
                      {trilha.whatYouLearn.map((l) => (
                        <div key={l} className="td-learn__item">
                          <span className="td-learn__check">
                            <Check size={16} />
                          </span>
                          <span>{l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="td-modules-head">
                    <h3 className="td-h3" style={{ margin: 0 }}>
                      Conteúdo da trilha
                    </h3>
                    <span className="td-modules-meta">
                      {trilha.modules.length} módulos · {stats.total} aulas
                      {stats.minutos > 0 ? ` · ~${formatDur(stats.minutos)} de leitura` : ''}
                    </span>
                  </div>
                  <div className="td-modules">
                    {trilha.modules.map((m) => {
                      const aberto = abertos.has(m.id);
                      const min = m.lessons.reduce((s, l) => s + (l.durationMin ?? 0), 0);
                      return (
                        <div key={m.id} className="td-mod">
                          <button
                            className={`td-mod__head${aberto ? ' td-mod__head--open' : ''}`}
                            onClick={() => toggle(m.id)}
                          >
                            <span className={`td-mod__chev${aberto ? ' td-mod__chev--open' : ''}`}>
                              <ChevronDown size={16} />
                            </span>
                            <span className="td-mod__title">{m.title}</span>
                            <span className="td-mod__meta">
                              {m.lessons.length} aulas{min > 0 ? ` · ~${formatDur(min)}` : ''}
                            </span>
                          </button>
                          {aberto && m.lessons.length > 0 && (
                            <div className="td-mod__lessons">
                              {m.lessons.map((l) => {
                                const disp = dispDe(l);
                                const clicavel = disp !== 'locked';
                                return (
                                  <div
                                    key={l.id}
                                    className={`td-lesson${clicavel ? ' td-lesson--click' : ''}`}
                                    onClick={() => irParaAula(l, disp)}
                                  >
                                    <span className={`td-lesson__icon td-lesson__icon--${disp}`}>
                                      {disp === 'done' ? (
                                        <Check size={15} />
                                      ) : disp === 'current' ? (
                                        <Play size={13} />
                                      ) : disp === 'preview' ? (
                                        <Eye size={15} />
                                      ) : (
                                        <Lock size={13} />
                                      )}
                                    </span>
                                    <span
                                      className={`td-lesson__name${disp === 'locked' ? ' td-lesson__name--locked' : ''}`}
                                    >
                                      {l.title}
                                    </span>
                                    {disp === 'preview' && <span className="td-lesson__preview">prévia</span>}
                                    {l.durationMin ? (
                                      <span className="td-lesson__dur">{l.durationMin} min</span>
                                    ) : null}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {trilha.prerequisites && trilha.prerequisites.length > 0 && (
                  <div className="card">
                    <h3 className="td-h3">Pré-requisitos</h3>
                    <div className="td-reqs">
                      {trilha.prerequisites.map((r) => (
                        <div key={r} className="td-req">
                          <span className="td-req__dot" />
                          {r}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="td-col">
                <div className="card">
                  <div className="td-students">
                    <span className="td-students__icon">
                      <Users size={19} />
                    </span>
                    <div>
                      <div className="td-students__n">{alunos.toLocaleString('pt-BR')}</div>
                      <div className="td-students__l">
                        {alunos === 1 ? 'aluno nesta trilha' : 'alunos nesta trilha'}
                      </div>
                    </div>
                  </div>
                  {alunos === 0 && (
                    <p className="td-empty">Seja o primeiro a fazer esta trilha.</p>
                  )}
                </div>

                <div className="card">
                  <h3 className="td-h3">Avaliações</h3>
                  {(trilha.reviewCount ?? 0) > 0 ? (
                    <div className="td-ratings">
                      <div className="td-ratings__big">
                        <div className="td-ratings__num">{formatNota(trilha.rating)}</div>
                        <Stars value={Math.round(trilha.rating ?? 0)} size={13} />
                        <div className="td-ratings__count">{trilha.reviewCount} avaliações</div>
                      </div>
                      <div className="td-ratings__bars">
                        {(trilha.ratingDistribution ?? []).map((rb) => (
                          <div key={rb.star} className="td-rbar">
                            <span className="td-rbar__star">{rb.star}</span>
                            <div className="td-rbar__track">
                              <span style={{ width: `${rb.pct}%` }} />
                            </div>
                            <span className="td-rbar__pct">{rb.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="td-empty">Ainda não há avaliações. Seja o primeiro a avaliar.</p>
                  )}

                  {trilha.reviews && trilha.reviews.length > 0 && (
                    <>
                      <hr className="rule" />
                      <div className="td-reviews">
                        {trilha.reviews.map((rv, i) => (
                          <div key={i}>
                            <div className="td-review__head">
                              <span className="avatar avatar--sm">{getInitials(rv.name)}</span>
                              <span className="td-review__name">{rv.name}</span>
                              <div className="td-review__stars">
                                <Stars value={rv.stars} size={11} />
                              </div>
                            </div>
                            <div className="td-review__text">{rv.comment}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {trilha.canReview ? (
                    <>
                      <hr className="rule" />
                      <div className="td-form">
                        <div className="td-form__title">
                          {trilha.myReview ? 'Sua avaliação' : 'Avalie esta trilha'}
                        </div>
                        <div className="td-form__stars">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              type="button"
                              className="td-form__star"
                              onClick={() => setStars(n)}
                              aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
                            >
                              <svg
                                width="26"
                                height="26"
                                viewBox="0 0 24 24"
                                fill={n <= stars ? 'var(--gold)' : 'var(--border-strong)'}
                              >
                                <path d={STAR_PATH} />
                              </svg>
                            </button>
                          ))}
                        </div>
                        <textarea
                          className="td-form__text"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Conte como foi a trilha (opcional)"
                          maxLength={1000}
                          rows={3}
                        />
                        <button
                          className="td-form__submit"
                          onClick={enviarAvaliacao}
                          disabled={stars < 1 || salvando}
                        >
                          {salvando
                            ? 'Enviando...'
                            : trilha.myReview
                              ? 'Atualizar avaliação'
                              : 'Enviar avaliação'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <hr className="rule" />
                      <p className="td-empty">Comece a trilha para poder avaliar.</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
