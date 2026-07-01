import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Logo } from '../../components/Logo';
import { UserMenu } from '../../components/UserMenu';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Flame, Search, Play, ChevronRight } from '../../components/Icons';
import { getInitials } from '../../utils/initials';
import { user } from '../../data/home';
import { type Trail, type TrailLevel } from '../../data/trails';
import {
  listarTrilhas,
  listarMinhasTrilhas,
  obterTrilha,
  obterXp,
  listarTags,
  type Tag,
} from '../../services/trails';

type TrailComId = Trail & { id: string };

const NAV = [
  { label: 'Início', to: '/home' },
  { label: 'Trilhas', to: '/trilhas' },
  { label: 'Simulados', to: '/simulados' },
  { label: 'Ranking', to: '/ranking' },
  { label: 'Comunidade', to: '/comunidade' },
];

type Tint = { fg: string; bg: string };

const LEVEL_TINT: Record<'light' | 'dark', Record<TrailLevel, Tint>> = {
  light: {
    Iniciante: { fg: '#1C8F5A', bg: '#E5F1EA' },
    Intermediário: { fg: '#B7791F', bg: '#FBF0D8' },
    Avançado: { fg: '#C2410C', bg: '#FBE6D8' },
  },
  dark: {
    Iniciante: { fg: '#46D58F', bg: '#15271E' },
    Intermediário: { fg: '#E0A82E', bg: '#2A2310' },
    Avançado: { fg: '#F08A5D', bg: '#2A1810' },
  },
};

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

export function Trilhas() {
  const { user: authUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const tint = LEVEL_TINT[theme] ?? LEVEL_TINT.light;

  // Abre a trilha indo para a primeira aula disponivel (current, ou a primeira).
  async function abrirTrilha(trailId: string) {
    try {
      const detalhe = await obterTrilha(trailId);
      const aulas = detalhe.modules.flatMap((m) => m.lessons);
      // nunca manda para uma aula bloqueada: prefere a atual, senao a primeira liberada.
      const alvo =
        aulas.find((l) => l.state === 'current') ?? aulas.find((l) => l.state !== 'locked');
      navigate(alvo ? `/trilhas/${trailId}/aula/${alvo.id}` : '/trilhas');
    } catch {
      navigate('/trilhas');
    }
  }

  const displayName = authUser?.name ?? user.name;
  const initials = getInitials(displayName);

  const [trilhas, setTrilhas] = useState<TrailComId[]>([]);
  const [minhas, setMinhas] = useState<TrailComId[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [xp, setXp] = useState(0);
  const [tagsDisp, setTagsDisp] = useState<Tag[]>([]);
  const [filtro, setFiltro] = useState('Todas');

  useEffect(() => {
    async function carregar() {
      try {
        const [todas, doUsuario, stats, tg] = await Promise.all([
          listarTrilhas(),
          listarMinhasTrilhas(),
          obterXp(),
          listarTags(),
        ]);
        setTrilhas(todas);
        setMinhas(doUsuario);
        setXp(stats.xp);
        setTagsDisp(tg);
      } catch {
        setErro('Não foi possível carregar as trilhas.');
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  // Card de destaque: a trilha em andamento mais avançada (mas nao concluida).
  const continuar = minhas
    .filter((t) => t.done > 0 && t.done < t.lessons)
    .sort((a, b) => b.done / b.lessons - a.done / a.lessons)[0];

  const aulasConcluidas = minhas.reduce((soma, t) => soma + t.done, 0);
  const emAndamento = minhas.filter((t) => t.done < t.lessons).length;

  const trilhasFiltradas =
    filtro === 'Todas' ? trilhas : trilhas.filter((t) => t.tags.includes(filtro));

  return (
    <div className="home-shell">
      <div className="home">
        {/* Topbar */}
        <header className="topbar">
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
          <div className="searchbar">
            <Search size={16} />
            <span>Buscar trilha…</span>
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
          {/* Título + stats */}
          <div className="trilhas-page__head">
            <div>
              <h1 className="trilhas-page__title">Trilhas de aprendizado</h1>
              <p className="trilhas-page__sub">
                Aprenda passo a passo, da lógica aos algoritmos. Conclua aulas para subir de nível e
                ganhar XP.
              </p>
            </div>
            <div className="trilhas-page__stats">
              <Metric value={String(emAndamento)} label="em andamento" />
              <span className="trilhas-page__divider" />
              <Metric value={String(aulasConcluidas)} label="aulas concluídas" />
              <span className="trilhas-page__divider" />
              <Metric value={String(xp)} label="XP em trilhas" accent />
            </div>
          </div>

          {/* Continuar (destaque) */}
          {continuar && (
            <div className="continue-card">
              <span className="continue-card__glow" />
              <div className="continue-card__body">
                <div className="continue-card__kicker">Continuar de onde parou</div>
                <h2 className="continue-card__title">{continuar.name}</h2>
                <p className="continue-card__next">
                  {continuar.done} de {continuar.lessons} aulas concluídas
                </p>
                <div className="continue-card__progress">
                  <div className="continue-card__track">
                    <span
                      style={{
                        width: `${Math.round((continuar.done / continuar.lessons) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="continue-card__pct">
                    {Math.round((continuar.done / continuar.lessons) * 100)}% · {continuar.done}/
                    {continuar.lessons}
                  </span>
                </div>
              </div>
              <button className="continue-card__btn" onClick={() => abrirTrilha(continuar.id)}>
                <Play size={13} /> Continuar aula
              </button>
            </div>
          )}

          {/* Filtros */}
          <div className="filters">
            {['Todas', ...tagsDisp.map((t) => t.name)].map((f) => (
              <button
                key={f}
                className={`filter${filtro === f ? ' filter--active' : ''}`}
                onClick={() => setFiltro(f)}
              >
                {f}
              </button>
            ))}
            <div className="topbar__spacer" />
            <span className="filters__count">{trilhasFiltradas.length} trilhas</span>
          </div>

          {carregando && <p className="track__desc">Carregando trilhas...</p>}
          {erro && <div className="auth__alert">{erro}</div>}
          {!carregando && !erro && trilhas.length === 0 && (
            <p className="track__desc">Nenhuma trilha disponível ainda.</p>
          )}

          {/* Grade */}
          <div className="track-grid">
            {trilhasFiltradas.map((catalogo) => {
              // Cruza o catalogo com o progresso do usuario (done vem de /me/trails).
              const progresso = minhas.find((m) => m.id === catalogo.id);
              const t = { ...catalogo, done: progresso?.done ?? 0 };
              const pct = t.lessons > 0 ? Math.round((t.done / t.lessons) * 100) : 0;
              const started = t.done > 0;
              const completed = t.done >= t.lessons;
              const lv = tint[t.level];
              return (
                <div
                  key={t.id}
                  className="track track--clickable"
                  role="button"
                  tabIndex={0}
                  onClick={() => abrirTrilha(t.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') abrirTrilha(t.id);
                  }}
                >
                  <div className="track__head">
                    <span
                      className="track__icon"
                      style={{
                        color: t.hue,
                        background: `color-mix(in srgb, ${t.hue} 16%, transparent)`,
                      }}
                    >
                      {t.glyph}
                    </span>
                    <div className="track__meta">
                      <div className="track__name">{t.name}</div>
                      <div className="track__row">
                        <span className="track__level" style={{ color: lv.fg, background: lv.bg }}>
                          {t.level}
                        </span>
                        <span className="track__lessons">{t.lessons} aulas</span>
                      </div>
                    </div>
                  </div>
                  <p className="track__desc">{t.desc}</p>
                  <div className="progress">
                    <div className="progress__track">
                      <span
                        className="progress__fill"
                        style={{
                          width: `${pct}%`,
                          background: started ? 'var(--accent)' : 'var(--surface-2)',
                        }}
                      />
                    </div>
                    <span className="progress__pct">{pct}%</span>
                  </div>
                  <hr className="rule" />
                  <div className="track__foot">
                    <div className="track__tags">
                      {t.tags.map((tag) => (
                        <span key={tag} className="chip--outline">
                          {tag}
                        </span>
                      ))}
                      {authUser?.role === 'admin' && (
                        <Link
                          to={`/estudio/${t.id}`}
                          className="chip--outline"
                          style={{ textDecoration: 'none' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Editar
                        </Link>
                      )}
                    </div>
                    <span
                      className="track__cta"
                      style={{ color: started ? 'var(--accent)' : 'var(--text)' }}
                    >
                      {completed ? 'Revisar' : started ? 'Continuar' : 'Começar'}{' '}
                      <ChevronRight size={15} />
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
