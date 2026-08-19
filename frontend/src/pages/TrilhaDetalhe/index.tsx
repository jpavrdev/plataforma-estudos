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
  DocLines,
  ChevronDown,
  Grid4,
} from '../../components/Icons';
import { getInitials } from '../../utils/initials';
import { user } from '../../data/home';
import { NAV_PRINCIPAL as NAV } from '../../data/nav';
import { obterTrilha, avaliarTrilha, type TrailDetail, type LessonRef } from '../../services/trails';
import {
  statusCertificado,
  emitirCertificado,
  baixarPdfCertificado,
  type CertificadoStatus,
} from '../../services/certificados';
import { getTrailLang, setTrailLang } from '../../utils/trailLang';

const NIVEL: Record<TrailDetail['trailLevel'], string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

const LANG_LABEL: Record<string, string> = {
  javascript: 'JavaScript',
  python: 'Python',
};

function labelLinguagem(code: string): string {
  return LANG_LABEL[code] ?? code.charAt(0).toUpperCase() + code.slice(1);
}

function glyphDoNome(name: string): string {
  const limpo = name.replace(/[^A-Za-zÀ-ú ]/g, '').trim();
  const partes = limpo.split(/\s+/).slice(0, 2);
  return partes.map((p) => p[0]?.toUpperCase() ?? '').join('') || '{}';
}

function cpfValido(cpf: string): boolean {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  for (const tamanho of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) soma += Number(cpf[i]) * (tamanho + 1 - i);
    if (((soma * 10) % 11) % 10 !== Number(cpf[tamanho])) return false;
  }
  return true;
}

function formatDur(min: number): string {
  if (min <= 0) return '';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

type Disp = 'done' | 'current' | 'preview' | 'open';
function dispDe(l: LessonRef): Disp {
  if (l.state === 'done') return 'done';
  if (l.state === 'current') return 'current';
  if (l.preview) return 'preview';
  return 'open';
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

// Por que o certificado não está disponível, na linguagem do aluno. O motivo
// "progresso" só vira aviso depois que ele começou a trilha: antes disso é o óbvio,
// e poluiria o card de quem está só olhando.
function avisoDoCert(
  motivo: NonNullable<CertificadoStatus['motivo']>,
  comecado: boolean,
): string | null {
  if (motivo === 'manual')
    return 'O certificado sai quando as aulas são concluídas com os quizzes.';
  if (motivo === 'carga_horaria') return 'Esta trilha ainda não emite certificado.';
  if (motivo === 'indisponivel') return 'A emissão de certificados está indisponível no momento.';
  return comecado ? 'Conclua todas as aulas da trilha para liberar o certificado.' : null;
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
  const [lang, setLang] = useState<string | undefined>(() =>
    trailId ? getTrailLang(trailId) : undefined,
  );
  const [cert, setCert] = useState<CertificadoStatus | null>(null);
  const [certModal, setCertModal] = useState(false);
  const [certEtapa, setCertEtapa] = useState<'dados' | 'confirmar' | 'pronto'>('dados');
  const [nomeCert, setNomeCert] = useState('');
  const [cpf, setCpf] = useState('');
  const [certErro, setCertErro] = useState('');
  const [emitindo, setEmitindo] = useState(false);

  useEffect(() => {
    if (!trailId) return;
    setCarregando(true);
    obterTrilha(trailId, lang)
      .then((t) => {
        setTrilha(t);
        setStars(t.myReview?.stars ?? 0);
        setComment(t.myReview?.comment ?? '');
        const atual = t.modules.find((m) => m.lessons.some((l) => l.state === 'current'));
        setAbertos(new Set([(atual ?? t.modules[0])?.id].filter(Boolean) as string[]));
      })
      .catch(() => setErro('Não foi possível carregar a trilha.'))
      .finally(() => setCarregando(false));
  }, [trailId, lang]);

  useEffect(() => {
    if (!trailId) return;
    statusCertificado(trailId)
      .then(setCert)
      .catch(() => setCert(null));
  }, [trailId, trilha?.modules]);

  function escolherLinguagem(code: string) {
    if (!trailId || code === trilha?.activeLanguage) return;
    setTrailLang(trailId, code);
    setLang(code);
  }

  function formatarCpf(v: string) {
    const d = v.replace(/\D/g, '').slice(0, 11);
    return d
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
  }

  function abrirModalCertificado() {
    setNomeCert(authUser?.name ?? '');
    setCpf('');
    setCertErro('');
    setCertEtapa('dados');
    setCertModal(true);
  }

  function nomeCompletoValido(v: string) {
    const nome = v.trim().replace(/\s+/g, ' ');
    return nome.length >= 5 && nome.length <= 255 && nome.split(' ').length >= 2;
  }

  function continuarEmissao() {
    if (!nomeCompletoValido(nomeCert)) {
      setCertErro('Informe seu nome completo, com nome e sobrenome.');
      return;
    }
    if (!cpfValido(cpf.replace(/\D/g, ''))) {
      setCertErro('CPF inválido. Confira os 11 dígitos.');
      return;
    }
    setCertErro('');
    setCertEtapa('confirmar');
  }

  async function emitir() {
    if (!trailId || emitindo) return;
    setEmitindo(true);
    setCertErro('');
    try {
      const r = await emitirCertificado(trailId, cpf.replace(/\D/g, ''), nomeCert);
      setCert({ emitido: r, elegivel: false });
      setCertEtapa('pronto');
    } catch (e: unknown) {
      const axiosErro = e as { response?: { data?: { erro?: string } } };
      setCertErro(axiosErro.response?.data?.erro ?? 'Não foi possível emitir o certificado.');
    } finally {
      setEmitindo(false);
    }
  }

  function urlValidacao(code: string) {
    return `${window.location.origin}/certificados/${code}`;
  }

  function linkedinCertUrl(code: string, issuedAt: string) {
    const d = new Date(issuedAt);
    const q = new URLSearchParams({
      startTask: 'CERTIFICATION_NAME',
      name: trilha?.name ?? 'Trilha',
      organizationName: 'Ensina Dev',
      issueYear: String(d.getFullYear()),
      issueMonth: String(d.getMonth() + 1),
      certUrl: urlValidacao(code),
      certId: code,
    });
    return `https://www.linkedin.com/profile/add?${q.toString()}`;
  }

  function xCertUrl(code: string) {
    const q = new URLSearchParams({
      text: `Concluí a trilha ${trilha?.name ?? ''} no Ensina Dev!`,
      url: urlValidacao(code),
    });
    return `https://twitter.com/intent/tweet?${q.toString()}`;
  }

  async function baixarCertificado(code: string) {
    try {
      const blob = await baixarPdfCertificado(code);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificado-${code}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Falha ao baixar o certificado:', e);
    }
  }

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

  function irParaAula(l: LessonRef) {
    if (!trilha) return;
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
  const avisoCert = cert?.motivo ? avisoDoCert(cert.motivo, stats.comecado) : null;
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
          <Logo variant="solid" size={20} to="/home" />
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

                  {trilha.multiLanguage && (trilha.languages?.length ?? 0) > 1 && (
                    <div className="td-langsel">
                      <span className="td-langsel__label">Linguagem</span>
                      <div className="td-langsel__opts">
                        {trilha.languages!.map((code) => (
                          <button
                            key={code}
                            type="button"
                            className={`td-langsel__opt${
                              code === trilha.activeLanguage ? ' td-langsel__opt--on' : ''
                            }`}
                            onClick={() => escolherLinguagem(code)}
                          >
                            {labelLinguagem(code)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
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
                    {cert?.emitido && (
                      <>
                        <button
                          className="td-card__cert"
                          onClick={() => baixarCertificado(cert.emitido!.code)}
                        >
                          Baixar certificado
                        </button>
                        <div className="td-cert-share">
                          <a
                            className="td-cert-share__btn"
                            href={linkedinCertUrl(cert.emitido.code, cert.emitido.issuedAt)}
                            target="_blank"
                            rel="noreferrer noopener"
                          >
                            Adicionar ao LinkedIn
                          </a>
                          <a
                            className="td-cert-share__btn"
                            href={xCertUrl(cert.emitido.code)}
                            target="_blank"
                            rel="noreferrer noopener"
                          >
                            Compartilhar no X
                          </a>
                        </div>
                      </>
                    )}
                    {cert?.elegivel && (
                      <button className="td-card__cert" onClick={abrirModalCertificado}>
                        Baixar certificado
                      </button>
                    )}
                    {/* Todo motivo de não emitir precisa aparecer. Antes só o "manual"
                        tinha aviso, e quem concluía uma trilha sem carga horária definida
                        ficava sem botão e sem explicação nenhuma. */}
                    {avisoCert && <p className="td-card__cert-hint">{avisoCert}</p>}
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
                                return (
                                  <div
                                    key={l.id}
                                    className="td-lesson td-lesson--click"
                                    onClick={() => irParaAula(l)}
                                  >
                                    <span className={`td-lesson__icon td-lesson__icon--${disp}`}>
                                      {disp === 'done' ? (
                                        <Check size={15} />
                                      ) : disp === 'current' ? (
                                        <Play size={13} />
                                      ) : disp === 'preview' ? (
                                        <Eye size={15} />
                                      ) : (
                                        <span className="td-lesson__dot" />
                                      )}
                                    </span>
                                    <span className="td-lesson__name">{l.title}</span>
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

        {certModal && (
          <div className="cmn-overlay">
            <div className="cmn-card">
              <div className="cmn-card__kicker">Certificado</div>

              {certEtapa === 'dados' && (
                <>
                  <h3 className="cmn-card__title">Emitir certificado de conclusão</h3>
                  <p className="cmn-card__msg">
                    Informe seu nome completo e CPF como constam nos seus documentos: os dois saem
                    impressos no certificado, como as faculdades exigem para as horas
                    complementares.
                  </p>
                  <input
                    className="cmn-texto"
                    style={{ resize: 'none' }}
                    value={nomeCert}
                    placeholder="Nome completo"
                    maxLength={255}
                    onChange={(e) => {
                      setNomeCert(e.target.value);
                      setCertErro('');
                    }}
                  />
                  <input
                    className="cmn-texto"
                    style={{ resize: 'none' }}
                    value={cpf}
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                    onChange={(e) => {
                      setCpf(formatarCpf(e.target.value));
                      setCertErro('');
                    }}
                  />
                  {certErro && <p className="td-cert-erro">{certErro}</p>}
                  <div className="cmn-card__row">
                    <button className="btn btn--ghost" onClick={() => setCertModal(false)}>
                      Cancelar
                    </button>
                    <button className="btn btn--accent" onClick={continuarEmissao}>
                      Continuar
                    </button>
                  </div>
                </>
              )}

              {certEtapa === 'confirmar' && (
                <>
                  <h3 className="cmn-card__title">Confira antes de emitir</h3>
                  <div className="td-cert-conf">
                    <div>
                      <span>Nome no certificado</span>
                      <b>{nomeCert.trim().replace(/\s+/g, ' ')}</b>
                    </div>
                    <div>
                      <span>CPF</span>
                      <b>{cpf}</b>
                    </div>
                  </div>
                  <p className="cmn-card__msg">
                    Depois de emitido, o nome e o CPF do certificado não poderão ser alterados.
                    Confira com atenção antes de confirmar.
                  </p>
                  {certErro && <p className="td-cert-erro">{certErro}</p>}
                  <div className="cmn-card__row">
                    <button className="btn btn--ghost" onClick={() => setCertEtapa('dados')}>
                      Voltar
                    </button>
                    <button className="btn btn--accent" onClick={emitir} disabled={emitindo}>
                      {emitindo ? 'Emitindo...' : 'Confirmar e emitir'}
                    </button>
                  </div>
                </>
              )}

              {certEtapa === 'pronto' && cert?.emitido && (
                <>
                  <h3 className="cmn-card__title">Certificado emitido</h3>
                  <p className="cmn-card__msg">
                    Código {cert.emitido.code}. Você pode baixar o PDF de novo quando quiser, aqui
                    na página da trilha.
                  </p>
                  <div className="td-cert-share" style={{ marginBottom: 12 }}>
                    <a
                      className="td-cert-share__btn"
                      href={linkedinCertUrl(cert.emitido.code, cert.emitido.issuedAt)}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      Adicionar ao LinkedIn
                    </a>
                    <a
                      className="td-cert-share__btn"
                      href={xCertUrl(cert.emitido.code)}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      Compartilhar no X
                    </a>
                  </div>
                  <div className="cmn-card__row">
                    <button className="btn btn--ghost" onClick={() => setCertModal(false)}>
                      Fechar
                    </button>
                    <button
                      className="btn btn--accent"
                      onClick={() => baixarCertificado(cert.emitido!.code)}
                    >
                      Baixar PDF
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
