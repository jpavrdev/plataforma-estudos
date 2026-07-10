import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/Logo';
import { MobileMenu } from '../../components/MobileMenu';
import { UserMenu } from '../../components/UserMenu';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Flame, Check, Lock, ChevronRight, ChevronLeft, Play } from '../../components/Icons';
import { getInitials } from '../../utils/initials';
import { user } from '../../data/home';
import { NAV_PRINCIPAL as NAV } from '../../data/nav';
import { obterRoadmap, type RoadmapDetalhe, type RoadmapStage, type RoadmapRef, type RoadmapPhase } from '../../services/roadmaps';
import { obterTrilha } from '../../services/trails';

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
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!slug) return;
    obterRoadmap(slug)
      .then(setRm)
      .catch(() => setErro('Não foi possível carregar o roadmap.'))
      .finally(() => setCarregando(false));
  }, [slug]);

  // Leva ao conteúdo do estágio conforme o tipo do ref.
  async function irParaRef(ref?: RoadmapRef) {
    if (!ref) return;
    if (ref.refType === 'simulado' && ref.slug) return navigate(`/simulados/${ref.slug}`);
    if (ref.refType === 'lesson' && ref.trailId && ref.lessonId) {
      return navigate(`/trilhas/${ref.trailId}/aula/${ref.lessonId}`);
    }
    if (ref.refType === 'challenge') return navigate(`/desafios/${ref.refId}`);
    if ((ref.refType === 'trail' || ref.refType === 'module') && ref.trailId) {
      try {
        const detalhe = await obterTrilha(ref.trailId);
        const aulas = detalhe.modules.flatMap((m) => m.lessons);
        const alvo =
          aulas.find((l) => l.state === 'current') ?? aulas.find((l) => l.state !== 'locked') ?? aulas[0];
        return navigate(alvo ? `/trilhas/${ref.trailId}/aula/${alvo.id}` : '/trilhas');
      } catch {
        return navigate('/trilhas');
      }
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
          <Logo variant="solid" size={20} />
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
          {!carregando && !erro && !rm && (
            <p className="track__desc">Roadmap não encontrado.</p>
          )}

          {rm && (
            <>
              <div className="rmd-hero">
                <div className="rmd-hero__body">
                  <div className="rmd-hero__kicker">Roadmap de carreira</div>
                  <h1 className="rmd-hero__title">{rm.name}</h1>
                  <p className="rmd-hero__desc">{rm.description}</p>
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
                          {estado === 'done' ? (
                            <Check size={16} />
                          ) : estado === 'locked' ? (
                            <Lock size={14} />
                          ) : (
                            i + 1
                          )}
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
                                ? 'Bloqueado'
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
                        {estado !== 'locked' && estado !== 'done' && (
                          <button className="rmd-stage__btn" onClick={() => irParaRef(s.refs[0])}>
                            <Play size={13} />{' '}
                            {estado === 'current' ? 'Continuar estágio' : 'Começar estágio'}
                          </button>
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
    </div>
  );
}
