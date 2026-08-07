import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/Logo';
import { MobileMenu } from '../../components/MobileMenu';
import { UserMenu } from '../../components/UserMenu';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Flame, Check, ChevronRight, ChevronLeft, Play } from '../../components/Icons';
import { getInitials } from '../../utils/initials';
import { user } from '../../data/home';
import { NAV_PRINCIPAL as NAV } from '../../data/nav';
import {
  concluirEstagio,
  obterRoadmap,
  type RoadmapDetalhe,
  type RoadmapStage,
  type RoadmapRef,
  type RoadmapPhase,
  seguirRoadmap,
  registrarEntradaNoRoadmap,
} from '../../services/roadmaps';
import { obterTrilha } from '../../services/trails';
import { getTrailLang } from '../../utils/trailLang';

const PHASE_LABEL: Record<RoadmapPhase, string> = {
  fundamentos: 'Fundamentos',
  core: 'Core',
  avancado: 'Avançado',
  deploy: 'Deploy',
};

function Ring({ percent }: { percent: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const off = c - (percent / 100) * c;
  return (
    <svg width="76" height="76" viewBox="0 0 76 76" className="rmd-ring">
      <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="6" />
      <circle
        cx="38"
        cy="38"
        r={r}
        fill="none"
        stroke="#fff"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={off}
        transform="rotate(-90 38 38)"
      />
      <text x="38" y="43" textAnchor="middle" fill="#fff" fontSize="17" fontWeight="700">
        {percent}%
      </text>
    </svg>
  );
}

export function RoadmapDetalhe() {
  const { slug } = useParams();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const displayName = authUser?.name ?? user.name;
  const initials = getInitials(displayName);

  const [rm, setRm] = useState<RoadmapDetalhe | null>(null);
  const [confirmando, setConfirmando] = useState<RoadmapStage | null>(null);
  const [concluindo, setConcluindo] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [seguindo, setSeguindo] = useState(false);

  async function marcarComoSeguido() {
    if (!rm || seguindo) return;
    setSeguindo(true);
    try {
      await seguirRoadmap(rm.slug);
    } catch (err) {
      console.error('Falha ao seguir o roadmap.', err);
      setSeguindo(false);
    }
  }

  useEffect(() => {
    if (!slug) return;
    obterRoadmap(slug)
      .then((r) => {
        setRm(r);
        setSeguindo(r.seguindo);
      })
      .catch(() => setErro('Não foi possível carregar o roadmap.'))
      .finally(() => setCarregando(false));
  }, [slug]);

  // Leva ao conteúdo do estágio conforme o tipo do ref.
  async function irParaRef(ref?: RoadmapRef) {
    if (!ref) return;
    // Entrar numa trilha daqui diz, sem adivinhação, qual caminho o aluno segue.
    // É o que faz a sugestão de próxima trilha acertar depois.
    if (slug) void registrarEntradaNoRoadmap(slug);
    if (ref.refType === 'simulado' && ref.slug) return navigate(`/simulados/${ref.slug}`);
    if (ref.refType === 'lesson' && ref.trailId && ref.lessonId) {
      return navigate(`/trilhas/${ref.trailId}/aula/${ref.lessonId}`);
    }
    if (ref.refType === 'challenge') return navigate(`/desafios/${ref.refId}`);
    if ((ref.refType === 'trail' || ref.refType === 'module') && ref.trailId) {
      try {
        const detalhe = await obterTrilha(ref.trailId, getTrailLang(ref.trailId));
        const aulas = detalhe.modules.flatMap((m) => m.lessons);
        const alvo =
          aulas.find((l) => l.state === 'current') ??
          aulas.find((l) => l.state !== 'locked') ??
          aulas[0];
        return navigate(alvo ? `/trilhas/${ref.trailId}/aula/${alvo.id}` : '/trilhas');
      } catch {
        return navigate('/trilhas');
      }
    }
  }

  async function confirmarConclusao() {
    if (!confirmando || !slug || concluindo) return;
    setConcluindo(true);
    try {
      await concluirEstagio(confirmando.id);
      setRm(await obterRoadmap(slug));
      setConfirmando(null);
    } catch (e) {
      console.error('Falha ao concluir estágio:', e);
    } finally {
      setConcluindo(false);
    }
  }

  function estadoDe(s: RoadmapStage): 'done' | 'current' | 'locked' | 'todo' {
    if (s.completed) return 'done';
    if (s.locked) return 'locked';
    if (rm && s.id === rm.currentStageId) return 'current';
    return 'todo';
  }

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
                className={`nav__item${item.label === 'Roadmaps' ? ' nav__item--active' : ''}`}
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

        <div className="rmd">
          <Link to="/roadmaps" className="rmd-back">
            <ChevronLeft size={16} /> Roadmaps
          </Link>

          {carregando && <p className="track__desc">Carregando roadmap...</p>}
          {erro && <div className="auth__alert">{erro}</div>}
          {!carregando && !erro && !rm && <p className="track__desc">Roadmap não encontrado.</p>}

          {rm && (
            <>
              <div className="rmd-hero">
                <div className="rmd-hero__body">
                  <div className="rmd-hero__kicker">Roadmap de carreira</div>
                  <h1 className="rmd-hero__title">{rm.name}</h1>
                  <p className="rmd-hero__desc">{rm.description}</p>
                  {/* Declarar o caminho é o que permite acertar a próxima trilha
                      quando ela vive em vários roadmaps. Sem isso o app adivinha. */}
                  <button
                    type="button"
                    className={`rmd-seguir${seguindo ? ' rmd-seguir--ativo' : ''}`}
                    onClick={marcarComoSeguido}
                    disabled={seguindo}
                  >
                    {seguindo ? 'Você está seguindo este roadmap' : 'Seguir este roadmap'}
                  </button>
                </div>
                <Ring percent={rm.progress.percent} />
              </div>

              <div className="rmd-stages">
                {rm.stages.map((s, i) => {
                  const estado = estadoDe(s);
                  return (
                    <div key={s.id} className={`rmd-stage rmd-stage--${estado}`}>
                      <div className="rmd-stage__rail">
                        <span className="rmd-stage__dot">
                          {estado === 'done' ? <Check size={16} /> : i + 1}
                        </span>
                      </div>
                      <div className="rmd-stage__card">
                        <div className="rmd-stage__top">
                          <span className="rmd-phase">{PHASE_LABEL[s.phase]}</span>
                          <span className="rmd-stage__title">{s.title}</span>
                          <span className={`rmd-stage__badge rmd-stage__badge--${estado}`}>
                            {estado === 'done'
                              ? 'Concluído'
                              : estado === 'locked'
                                ? 'A seguir'
                                : estado === 'current'
                                  ? 'Em andamento'
                                  : 'Disponível'}
                          </span>
                        </div>
                        <p className="rmd-stage__desc">{s.description}</p>
                        <div className="rmd-stage__tags">
                          {s.tags.map((tag) => (
                            <span key={tag} className="chip--outline">
                              {tag}
                            </span>
                          ))}
                        </div>
                        {estado !== 'done' && (
                          <div className="rmd-stage__acoes">
                            <button className="rmd-stage__btn" onClick={() => irParaRef(s.refs[0])}>
                              <Play size={13} />{' '}
                              {estado === 'current' ? 'Continuar estágio' : 'Começar estágio'}
                            </button>
                            <button
                              className="rmd-stage__btn rmd-stage__btn--ghost"
                              onClick={() => setConfirmando(s)}
                            >
                              <Check size={14} /> Concluído
                            </button>
                          </div>
                        )}
                        {estado === 'done' && s.refs[0] && (
                          <button
                            className="rmd-stage__btn rmd-stage__btn--ghost"
                            onClick={() => irParaRef(s.refs[0])}
                          >
                            Revisar <ChevronRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {confirmando && (
        <div className="cmn-overlay">
          <div className="cmn-card">
            <div className="cmn-card__kicker">Concluir estágio</div>
            <h3 className="cmn-card__title">{confirmando.title}</h3>
            <p className="cmn-card__msg">
              O estágio e as trilhas dele ficam marcados como concluídos, mas você não ganha o XP
              das aulas. Se fizer as aulas de verdade depois, o XP delas volta a contar.
            </p>
            <div className="cmn-card__row">
              <button className="btn btn--ghost" onClick={() => setConfirmando(null)}>
                Cancelar
              </button>
              <button
                className="btn btn--accent"
                onClick={confirmarConclusao}
                disabled={concluindo}
              >
                {concluindo ? 'Concluindo...' : 'Concluir mesmo assim'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
