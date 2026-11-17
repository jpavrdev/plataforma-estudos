import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Logo } from '../../components/Logo';
import { MobileMenu } from '../../components/MobileMenu';
import { UserMenu } from '../../components/UserMenu';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Flame, Play, ChevronRight, Star, Search, X } from '../../components/Icons';
import { Dropdown } from '../../components/Dropdown';
import { getInitials } from '../../utils/initials';
import { user } from '../../data/home';
import { type Trail, type TrailLevel } from '../../data/trails';
import {
  listarTrilhas,
  listarMinhasTrilhas,
  obterTrilha,
  obterXp,
  listarTags,
  alternarFavoritoTrilha,
  type Tag,
} from '../../services/trails';
import { getTrailLang } from '../../utils/trailLang';
import { ehCliqueSimples } from '../../utils/cliqueSimples';

type TrailComId = Trail & { id: string };

import { useNavPrincipal } from '../../hooks/useNavPrincipal';

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

const NIVEIS: { v: string; label: string }[] = [
  { v: '', label: 'Todos' },
  { v: 'iniciante', label: 'Iniciante' },
  { v: 'intermediario', label: 'Intermediário' },
  { v: 'avancado', label: 'Avançado' },
];

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
  const nav = useNavPrincipal();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const tint = LEVEL_TINT[theme] ?? LEVEL_TINT.light;

  // Abre a trilha indo para a primeira aula disponivel (current, ou a primeira).
  async function abrirTrilha(trailId: string) {
    try {
      const detalhe = await obterTrilha(trailId, getTrailLang(trailId));
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
  const buscaRef = useRef<HTMLInputElement>(null);
  const [nivel, setNivel] = useState('');
  const [categoria, setCategoria] = useState('');
  const [busca, setBusca] = useState('');
  const [soFavoritas, setSoFavoritas] = useState(false);
  const [favoritoAlterado, setFavoritoAlterado] = useState<Record<string, boolean>>({});

  const ehFavorito = (t: TrailComId) => favoritoAlterado[t.id] ?? t.favorito ?? false;
  const totalFavoritas = trilhas.filter(ehFavorito).length;

  // Otimista como nos simulados: a estrela muda na hora e volta se o servidor recusar.
  async function alternarFavorito(t: TrailComId) {
    const era = ehFavorito(t);
    setFavoritoAlterado((prev) => ({ ...prev, [t.id]: !era }));
    try {
      const r = await alternarFavoritoTrilha(t.id);
      setFavoritoAlterado((prev) => ({ ...prev, [t.id]: r.favorito }));
    } catch (err) {
      console.error('Falha ao favoritar a trilha:', err);
      setFavoritoAlterado((prev) => ({ ...prev, [t.id]: era }));
    }
  }

  useEffect(() => {
    async function carregar() {
      try {
        const [doUsuario, stats, tg] = await Promise.all([
          listarMinhasTrilhas(),
          obterXp(),
          listarTags(),
        ]);
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

  useEffect(() => {
    listarTrilhas(nivel || undefined, categoria || undefined)
      .then(setTrilhas)
      .catch(() => setErro('Não foi possível carregar as trilhas.'));
  }, [nivel, categoria]);

  // Card de destaque: a trilha em andamento mais avançada (mas nao concluida).
  const continuar = minhas
    .filter((t) => t.done > 0 && t.done < t.lessons)
    .sort((a, b) => b.done / b.lessons - a.done / a.lessons)[0];

  const aulasConcluidas = minhas.reduce((soma, t) => soma + t.done, 0);
  const emAndamento = minhas.filter((t) => t.done < t.lessons).length;

  const normalizar = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase();
  const termoBusca = normalizar(busca.trim());
  const filtrosAtivos = !!(termoBusca || nivel || categoria || soFavoritas);
  const trilhasFiltradas = trilhas.filter((t) => {
    if (soFavoritas && !ehFavorito(t)) return false;
    if (termoBusca && !normalizar(t.name).includes(termoBusca)) return false;
    return true;
  });

  function limparFiltros() {
    setBusca('');
    setNivel('');
    setCategoria('');
    setSoFavoritas(false);
  }

  // "/" fora de um campo de texto leva o foco para a busca.
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement | null;
      if (e.key !== '/' || /^(input|textarea|select)$/i.test(alvo?.tagName ?? '')) return;
      e.preventDefault();
      buscaRef.current?.focus();
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, []);

  return (
    <div className="home-shell">
      <div className="home">
        {/* Topbar */}
        <header className="topbar">
          <MobileMenu />
          <Logo variant="solid" size={20} to="/home" />
          <nav className="nav">
            {nav.map((item) => (
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

        <div className="trilhas-page trilhas-page--catalog">
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
              <Link
                to={`/trilhas/${continuar.id}`}
                className="continue-card__btn"
                onClick={(e) => {
                  // O clique simples vai direto para a aula atual; em nova guia abre a trilha.
                  if (!ehCliqueSimples(e)) return;
                  e.preventDefault();
                  abrirTrilha(continuar.id);
                }}
              >
                <Play size={13} /> Continuar aula
              </Link>
            </div>
          )}

          {/* Filtros */}
          <div className="filters">
            <label className="trilhas-search">
              <Search size={16} />
              <input
                ref={buscaRef}
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar trilha por nome"
              />
              {busca ? (
                <button
                  type="button"
                  className="trilhas-search__clear"
                  aria-label="Limpar busca"
                  onClick={() => setBusca('')}
                >
                  <X size={13} />
                </button>
              ) : (
                <kbd className="trilhas-search__kbd">/</kbd>
              )}
            </label>

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
            <Dropdown
              ariaLabel="Categoria"
              placeholder="Categoria"
              valor={categoria}
              aoEscolher={setCategoria}
              opcoes={[
                { valor: '', label: 'Todas' },
                ...tagsDisp.map((t) => ({ valor: t.name, label: t.name })),
              ]}
            />
            <div className="filtro-mobile">
              <Dropdown
                ariaLabel="Nível"
                placeholder="Nível"
                valor={nivel}
                aoEscolher={setNivel}
                opcoes={NIVEIS.map((n) => ({ valor: n.v, label: n.label }))}
              />
            </div>

            {(totalFavoritas > 0 || soFavoritas) && (
              <button
                type="button"
                className={`fav-pill${soFavoritas ? ' fav-pill--active' : ''}`}
                aria-pressed={soFavoritas}
                onClick={() => setSoFavoritas((v) => !v)}
              >
                <Star size={13} /> Favoritas <span className="fav-pill__n">{totalFavoritas}</span>
              </button>
            )}
            <div className="topbar__spacer" />
            <div className="filters__meta">
              <button
                type="button"
                className={`filters__clear${filtrosAtivos ? '' : ' filters__clear--off'}`}
                onClick={limparFiltros}
                tabIndex={filtrosAtivos ? 0 : -1}
                aria-hidden={!filtrosAtivos}
              >
                Limpar filtros
              </button>
              <span className="filters__count">
                {filtrosAtivos ? (
                  <>
                    <b>{trilhasFiltradas.length}</b> de {trilhas.length} trilhas
                  </>
                ) : (
                  <>{trilhas.length} trilhas</>
                )}
              </span>
            </div>
          </div>

          {carregando && <p className="track__desc">Carregando trilhas...</p>}
          {erro && <div className="auth__alert">{erro}</div>}
          {!carregando && !erro && trilhasFiltradas.length === 0 && (
            <p className="track__desc">
              {busca
                ? 'Nenhuma trilha encontrada.'
                : nivel || categoria
                  ? 'Nenhuma trilha com esse filtro.'
                  : 'Nenhuma trilha disponível ainda.'}
            </p>
          )}

          {/* Grade */}
          <div className="track-grid trilhas-catalog">
            {trilhasFiltradas.map((catalogo) => {
              // Cruza o catalogo com o progresso do usuario (done vem de /me/trails).
              const progresso = minhas.find((m) => m.id === catalogo.id);
              const t = {
                ...catalogo,
                done: progresso?.done ?? 0,
                lessons: progresso?.lessons ?? catalogo.lessons,
              };
              const pct = t.lessons > 0 ? Math.round((t.done / t.lessons) * 100) : 0;
              const started = t.done > 0;
              const completed = t.done >= t.lessons;
              const lv = tint[t.level];
              return (
                <div key={t.id} className="track track--clickable">
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
                      <Link to={`/trilhas/${t.id}`} className="track__name link-esticado">
                        {t.name}
                      </Link>
                      <div className="track__row">
                        <span className="track__level" style={{ color: lv.fg, background: lv.bg }}>
                          {t.level}
                        </span>
                        <span className="track__lessons">{t.lessons} aulas</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`track__fav${ehFavorito(t) ? ' track__fav--on' : ''}`}
                      aria-pressed={ehFavorito(t)}
                      aria-label={ehFavorito(t) ? 'Remover dos favoritos' : 'Favoritar'}
                      title={ehFavorito(t) ? 'Remover dos favoritos' : 'Favoritar'}
                      onClick={() => alternarFavorito(t)}
                    >
                      <Star size={15} />
                    </button>
                  </div>
                  <TrilhaDesc>{t.desc}</TrilhaDesc>
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

// Descrição do card com "ler mais": mostra o botão só quando o texto passa de 3 linhas,
// e expande apenas este card (estado próprio), sem mexer nos vizinhos.
function TrilhaDesc({ children }: { children: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [truncado, setTruncado] = useState(false);
  const [aberto, setAberto] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || aberto) return;
    const medir = () => setTruncado(el.scrollHeight > el.clientHeight + 1);
    medir();
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, [children, aberto]);

  return (
    <>
      <p ref={ref} className={`track__desc${aberto ? ' track__desc--full' : ''}`}>
        {children}
      </p>
      <div className="track__more-row">
        {(truncado || aberto) && (
          <button type="button" className="track__more" onClick={() => setAberto((v) => !v)}>
            {aberto ? 'Ler menos' : 'Ler mais'}
          </button>
        )}
      </div>
    </>
  );
}
