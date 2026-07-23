import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/Logo';
import { MobileMenu } from '../../components/MobileMenu';
import { UserMenu } from '../../components/UserMenu';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Flame, Search, ChevronRight, Lock, Play } from '../../components/Icons';
import { getInitials } from '../../utils/initials';
import { user } from '../../data/home';
import { NAV_PRINCIPAL as NAV } from '../../data/nav';
import { listarRoadmaps, type RoadmapResumo, type Nivel } from '../../services/roadmaps';

const NIVEL_LABEL: Record<Nivel, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

const NIVEIS: { v: string; label: string }[] = [
  { v: '', label: 'Todos' },
  { v: 'iniciante', label: 'Iniciante' },
  { v: 'intermediario', label: 'Intermediário' },
  { v: 'avancado', label: 'Avançado' },
];

function glyph(name: string): string {
  const partes = name
    .replace(/[^A-Za-zÀ-ú ]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2);
  return partes.map((p) => p[0]?.toUpperCase() ?? '').join('') || 'RM';
}

const CTA: Record<RoadmapResumo['status'], string> = {
  nao_iniciado: 'Começar roadmap',
  em_progresso: 'Continuar',
  concluido: 'Revisar',
};

export function Roadmaps() {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const displayName = authUser?.name ?? user.name;
  const initials = getInitials(displayName);

  const [roadmaps, setRoadmaps] = useState<RoadmapResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [nivel, setNivel] = useState('');

  useEffect(() => {
    listarRoadmaps()
      .then(setRoadmaps)
      .catch(() => setErro('Não foi possível carregar os roadmaps.'))
      .finally(() => setCarregando(false));
  }, []);

  const filtrados = roadmaps.filter((r) => !nivel || r.level === nivel);
  const continuar = roadmaps
    .filter((r) => r.status === 'em_progresso')
    .sort((a, b) => b.percent - a.percent)[0];
  const emAndamento = roadmaps.filter((r) => r.status === 'em_progresso').length;
  const concluidos = roadmaps.filter((r) => r.status === 'concluido').length;

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
          <div className="searchbar">
            <Search size={16} />
            <span>Buscar roadmap…</span>
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

        <div className="trilhas-page">
          <div className="trilhas-page__head">
            <div>
              <h1 className="trilhas-page__title">Roadmaps de carreira</h1>
              <p className="trilhas-page__sub">
                Trilhas guiadas do zero à vaga. Escolha um caminho e siga estágio por estágio, no seu
                ritmo.
              </p>
            </div>
            <div className="trilhas-page__stats">
              <Metric value={String(roadmaps.length)} label="roadmaps" />
              <span className="trilhas-page__divider" />
              <Metric value={String(emAndamento)} label="em progresso" accent />
              {concluidos > 0 && (
                <>
                  <span className="trilhas-page__divider" />
                  <Metric value={String(concluidos)} label="concluídos" />
                </>
              )}
            </div>
          </div>

          {continuar && (
            <div className="continue-card">
              <span className="continue-card__glow" />
              <div className="continue-card__body">
                <div className="continue-card__kicker">Continuar de onde parou</div>
                <h2 className="continue-card__title">{continuar.name}</h2>
                <p className="continue-card__next">
                  {continuar.stagesDone} de {continuar.stagesTotal} estágios concluídos
                </p>
                <div className="continue-card__progress">
                  <div className="continue-card__track">
                    <span style={{ width: `${continuar.percent}%` }} />
                  </div>
                  <span className="continue-card__pct">
                    {continuar.percent}% · {continuar.stagesDone}/{continuar.stagesTotal}
                  </span>
                </div>
              </div>
              <button
                className="continue-card__btn"
                onClick={() => navigate(`/roadmaps/${continuar.slug}`)}
              >
                <Play size={13} /> Continuar
              </button>
            </div>
          )}

          <div className="filters">
            <label className="select-filtro">
              <span className="filters__label">Nível</span>
              <select value={nivel} onChange={(e) => setNivel(e.target.value)}>
                {NIVEIS.map((n) => (
                  <option key={n.v} value={n.v}>
                    {n.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="topbar__spacer" />
            <span className="filters__count">{filtrados.length} roadmaps</span>
          </div>

          {carregando && <p className="track__desc">Carregando roadmaps...</p>}
          {erro && <div className="auth__alert">{erro}</div>}
          {!carregando && !erro && filtrados.length === 0 && (
            <p className="track__desc">
              {nivel ? 'Nenhum roadmap com esse nível.' : 'Nenhum roadmap disponível ainda.'}
            </p>
          )}

          <div className="track-grid">
            {filtrados.map((r) => {
              const started = r.status !== 'nao_iniciado';
              return (
                <div
                  key={r.id}
                  className={`track track--clickable${r.premium ? ' track--locked' : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/roadmaps/${r.slug}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') navigate(`/roadmaps/${r.slug}`);
                  }}
                >
                  <div className="track__head">
                    <span
                      className="track__icon"
                      style={{
                        color: 'var(--accent)',
                        background: 'color-mix(in srgb, var(--accent) 16%, transparent)',
                      }}
                    >
                      {r.premium ? <Lock size={20} /> : glyph(r.name)}
                    </span>
                    <div className="track__meta">
                      <div className="track__name">{r.name}</div>
                      <div className="track__row">
                        <span className="track__level" style={{ color: 'var(--accent)' }}>
                          {NIVEL_LABEL[r.level]}
                        </span>
                        <span className="track__lessons">{r.stagesTotal} estágios</span>
                      </div>
                    </div>
                  </div>
                  <p className="track__desc track__desc--full">{r.description}</p>
                  <div className="progress">
                    <div className="progress__track">
                      <span
                        className="progress__fill"
                        style={{
                          width: `${r.percent}%`,
                          background: started ? 'var(--accent)' : 'var(--surface-2)',
                        }}
                      />
                    </div>
                    <span className="progress__pct">{r.percent}%</span>
                  </div>
                  <hr className="rule" />
                  <div className="track__foot">
                    <div className="track__tags">
                      {r.tags.map((tag) => (
                        <span key={tag} className="chip--outline">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span
                      className="track__cta"
                      style={{ color: started ? 'var(--accent)' : 'var(--text)' }}
                    >
                      {r.premium ? 'Desbloquear' : CTA[r.status]} <ChevronRight size={15} />
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
