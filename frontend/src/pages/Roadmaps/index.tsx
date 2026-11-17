import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/Logo';
import { MobileMenu } from '../../components/MobileMenu';
import { UserMenu } from '../../components/UserMenu';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Flame, ChevronRight, Lock, Play, Star, ChevronDown } from '../../components/Icons';
import { SheetFiltro } from '../../components/SheetFiltro';
import { getInitials } from '../../utils/initials';
import { user } from '../../data/home';
import { useNavPrincipal } from '../../hooks/useNavPrincipal';
import {
  listarRoadmaps,
  alternarFavoritoRoadmap,
  type RoadmapResumo,
  type Nivel,
} from '../../services/roadmaps';

const NIVEL_LABEL: Record<Nivel, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

// Cada nível tem sua cor, como nas trilhas, para dar variedade aos cards.
const LEVEL_HUE: Record<Nivel, string> = {
  iniciante: '#2D6BF5',
  intermediario: '#2E9E6B',
  avancado: '#D9536B',
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
  const nav = useNavPrincipal();

  const displayName = authUser?.name ?? user.name;
  const initials = getInitials(displayName);

  const [roadmaps, setRoadmaps] = useState<RoadmapResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [nivel, setNivel] = useState('');
  const [soFavoritos, setSoFavoritos] = useState(false);
  const [favoritoAlterado, setFavoritoAlterado] = useState<Record<string, boolean>>({});
  const [folhaNivel, setFolhaNivel] = useState(false);

  useEffect(() => {
    listarRoadmaps()
      .then(setRoadmaps)
      .catch(() => setErro('Não foi possível carregar os roadmaps.'))
      .finally(() => setCarregando(false));
  }, []);

  const ehFavorito = (r: RoadmapResumo) => favoritoAlterado[r.id] ?? r.favorito;
  const totalFavoritos = roadmaps.filter(ehFavorito).length;

  // Otimista como nas trilhas: a estrela muda na hora e volta se o servidor recusar.
  async function alternarFavorito(r: RoadmapResumo) {
    const era = ehFavorito(r);
    setFavoritoAlterado((prev) => ({ ...prev, [r.id]: !era }));
    try {
      const res = await alternarFavoritoRoadmap(r.slug);
      setFavoritoAlterado((prev) => ({ ...prev, [r.id]: res.favorito }));
    } catch (err) {
      console.error('Falha ao favoritar o roadmap:', err);
      setFavoritoAlterado((prev) => ({ ...prev, [r.id]: era }));
    }
  }

  const filtrados = roadmaps.filter((r) => {
    if (soFavoritos && !ehFavorito(r)) return false;
    return !nivel || r.level === nivel;
  });
  const filtrosAtivos = !!(nivel || soFavoritos);

  function limparFiltros() {
    setNivel('');
    setSoFavoritos(false);
  }
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
            {nav.map((item) => (
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

        <div className="trilhas-page trilhas-page--roadmaps">
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
              <Link to={`/roadmaps/${continuar.slug}`} className="continue-card__btn">
                <Play size={13} /> Continuar
              </Link>
            </div>
          )}

          <div className="filters">
            <div className="level-pills" role="group" aria-label="Nível">
              {NIVEIS.map((n) => (
                <button
                  key={n.v}
                  type="button"
                  className={`level-pill${nivel === n.v ? ' level-pill--active' : ''}`}
                  aria-pressed={nivel === n.v}
                  onClick={() => setNivel(n.v)}
                >
                  {n.label}
                </button>
              ))}
            </div>

            {/* No celular o nível abre a folha e divide a linha com os favoritos. */}
            <div className="filtro-mobile">
              <button
                type="button"
                className={`filtro-btn${nivel ? ' filtro-btn--on' : ''}`}
                onClick={() => setFolhaNivel(true)}
              >
                <span>{nivel ? (NIVEIS.find((n) => n.v === nivel)?.label ?? 'Nível') : 'Nível'}</span>
                <ChevronDown size={13} />
              </button>
            </div>

            {(totalFavoritos > 0 || soFavoritos) && (
              <button
                type="button"
                className={`fav-pill${soFavoritos ? ' fav-pill--active' : ''}`}
                aria-pressed={soFavoritos}
                onClick={() => setSoFavoritos((v) => !v)}
              >
                <Star size={13} /> Favoritos <span className="fav-pill__n">{totalFavoritos}</span>
              </button>
            )}
            <div className="topbar__spacer" />
            <div className="filters__meta">
              <button
                type="button"
                className={`filters__clear${filtrosAtivos ? '' : ' filters__clear--off'}`}
                tabIndex={filtrosAtivos ? 0 : -1}
                aria-hidden={!filtrosAtivos}
                onClick={limparFiltros}
              >
                <span className="tx-completo">Limpar filtros</span>
                <span className="tx-curto">Limpar</span>
              </button>
              <span className="filters__count">
                {filtrosAtivos ? (
                  <>
                    <b>{filtrados.length}</b> de {roadmaps.length} roadmaps
                  </>
                ) : (
                  <>{filtrados.length} roadmaps</>
                )}
              </span>
            </div>
          </div>

          {carregando && <p className="track__desc">Carregando roadmaps...</p>}
          {erro && <div className="auth__alert">{erro}</div>}
          {!carregando && !erro && filtrados.length === 0 && (
            <p className="track__desc">
              {nivel ? 'Nenhum roadmap com esse nível.' : 'Nenhum roadmap disponível ainda.'}
            </p>
          )}

          <div className="track-grid rm-grid">
            {filtrados.map((r) => {
              const started = r.status !== 'nao_iniciado';
              const hue = LEVEL_HUE[r.level];
              return (
                <div
                  key={r.id}
                  className={`track track--clickable roadmap-card${r.premium ? ' track--locked' : ''}`}
                  style={{ ['--rm-hue']: hue } as CSSProperties}
                >
                  <div className="track__head">
                    <span className="track__icon roadmap-card__icon">
                      {r.premium ? <Lock size={20} /> : glyph(r.name)}
                    </span>
                    <div className="track__meta">
                      <Link to={`/roadmaps/${r.slug}`} className="track__name link-esticado">
                        {r.name}
                      </Link>
                      <div className="track__row">
                        <span className="track__level roadmap-card__level">
                          {NIVEL_LABEL[r.level]}
                        </span>
                        <span className="track__lessons">{r.stagesTotal} estágios</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`track__fav${ehFavorito(r) ? ' track__fav--on' : ''}`}
                      aria-pressed={ehFavorito(r)}
                      aria-label={ehFavorito(r) ? 'Remover dos favoritos' : 'Favoritar'}
                      title={ehFavorito(r) ? 'Remover dos favoritos' : 'Favoritar'}
                      onClick={() => alternarFavorito(r)}
                    >
                      <Star size={15} />
                    </button>
                  </div>
                  <p className="track__desc track__desc--full">{r.description}</p>
                  <div className="progress">
                    <div className="progress__track">
                      <span
                        className="progress__fill"
                        style={{
                          width: `${r.percent}%`,
                          background: started ? hue : 'var(--surface-2)',
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
                      className="track__cta roadmap-card__cta"
                      style={started ? { color: hue } : undefined}
                    >
                      {r.premium ? 'Desbloquear' : CTA[r.status]} <ChevronRight size={15} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <SheetFiltro
            titulo="Nível"
            aberto={folhaNivel}
            aoFechar={() => setFolhaNivel(false)}
            valor={nivel}
            aoEscolher={setNivel}
            opcoes={NIVEIS.map((n) => ({ valor: n.v, label: n.label }))}
          />
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
