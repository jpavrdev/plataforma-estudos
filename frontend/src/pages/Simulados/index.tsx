import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRequisicao } from '../../hooks/useRequisicao';
import { Trans, useTranslation } from 'react-i18next';
import { SimTopbar } from './SimTopbar';
import { SheetFiltro, type OpcaoSheet } from '../../components/SheetFiltro';
import { Search, Play, Info, Star, X, ChevronDown } from '../../components/Icons';
import {
  listarSimulados,
  historicoSimulados,
  alternarFavorito,
  type SimuladoResumo,
} from '../../services/simulados';
import {
  provedorDe,
  chaveProvedor,
  nomeLimpo,
  nivelClasse,
  LABEL_NIVEL,
  ORDEM_PROV,
} from './provedores';

type Melhor = { score: number; passed: boolean };

const ORDEM_NIVEL = ['fund', 'assoc', 'prof'];

export function Simulados() {
  const { t } = useTranslation();
  const { dados, carregando } = useRequisicao(
    () =>
      Promise.all([listarSimulados(), historicoSimulados()]).then(([exams, historico]) => ({
        exams,
        historico,
      })),
    [],
  );
  const exams = dados?.exams ?? [];
  const historico = dados?.historico ?? [];

  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<string | null>(null);
  const [nivel, setNivel] = useState('');
  const [soFavoritos, setSoFavoritos] = useState(false);
  const [favoritoAlterado, setFavoritoAlterado] = useState<Record<string, boolean>>({});
  const [folha, setFolha] = useState<'prov' | 'nivel' | null>(null);

  const buscaRef = useRef<HTMLInputElement>(null);

  // "/" foca a busca, igual à tela de trilhas.
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement;
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(alvo.tagName)) {
        e.preventDefault();
        buscaRef.current?.focus();
      }
    };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, []);

  const ehFavorito = (e: SimuladoResumo) => favoritoAlterado[e.slug] ?? e.favorito;
  const totalFavoritos = exams.filter(ehFavorito).length;

  async function toggleFavorito(e: SimuladoResumo) {
    const eraFavorito = ehFavorito(e);
    setFavoritoAlterado((prev) => ({ ...prev, [e.slug]: !eraFavorito }));
    try {
      const r = await alternarFavorito(e.slug);
      setFavoritoAlterado((prev) => ({ ...prev, [e.slug]: r.favorito }));
    } catch (err) {
      console.error('Falha ao favoritar o simulado:', err);
      setFavoritoAlterado((prev) => ({ ...prev, [e.slug]: eraFavorito }));
    }
  }

  // Melhor tentativa enviada por simulado (maior percentual).
  const melhorPorSlug = useMemo(() => {
    const m: Record<string, Melhor> = {};
    for (const t of historico) {
      if (t.submittedAt == null || t.score == null) continue;
      const atual = m[t.slug];
      if (!atual || t.score > atual.score)
        m[t.slug] = { score: t.score, passed: t.passed === true };
    }
    return m;
  }, [historico]);

  const contagem = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of exams) {
      const p = chaveProvedor(e.provider);
      c[p] = (c[p] ?? 0) + 1;
    }
    return c;
  }, [exams]);

  const provedores = useMemo(
    () =>
      Object.keys(contagem).sort(
        (a, b) => (ORDEM_PROV.indexOf(a) + 1 || 99) - (ORDEM_PROV.indexOf(b) + 1 || 99),
      ),
    [contagem],
  );

  const niveis = useMemo(() => {
    const cont: Record<string, number> = {};
    for (const e of exams) {
      if (!e.level) continue;
      const c = nivelClasse(e.level);
      cont[c] = (cont[c] ?? 0) + 1;
    }
    return ORDEM_NIVEL.filter((c) => cont[c]).map((c) => ({
      valor: c,
      label: LABEL_NIVEL[c],
      contagem: cont[c],
    }));
  }, [exams]);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return exams.filter((e) => {
      if (soFavoritos && !(favoritoAlterado[e.slug] ?? e.favorito)) return false;
      if (filtro && chaveProvedor(e.provider) !== filtro) return false;
      if (nivel && nivelClasse(e.level ?? '') !== nivel) return false;
      if (!q) return true;
      const prov = provedorDe(e.provider).nome.toLowerCase();
      return (
        e.name.toLowerCase().includes(q) ||
        (e.code ?? '').toLowerCase().includes(q) ||
        prov.includes(q)
      );
    });
  }, [exams, busca, filtro, nivel, soFavoritos, favoritoAlterado]);

  const filtrosAtivos = !!(busca.trim() || filtro || nivel || soFavoritos);

  function limparFiltros() {
    setBusca('');
    setFiltro(null);
    setNivel('');
    setSoFavoritos(false);
  }

  const aprovados = useMemo(
    () => Object.values(melhorPorSlug).filter((m) => m.passed).length,
    [melhorPorSlug],
  );

  const opcoesProvedor: OpcaoSheet[] = [
    { valor: '', label: t('filters.allM'), contagem: exams.length },
    ...provedores.map((p) => ({
      valor: p,
      label: provedorDe(p).label,
      contagem: contagem[p],
    })),
  ];
  const opcoesNivel: OpcaoSheet[] = [
    { valor: '', label: t('filters.allM'), contagem: exams.length },
    ...niveis.map((n) => ({ ...n, label: t(n.label) })),
  ];

  return (
    <div className="home-shell">
      <div className="home">
        <SimTopbar />
        <div className="sim">
          <div className="sim__head">
            <div>
              <h1 className="sim__title">{t('simulados.title')}</h1>
              <p className="sim__sub">{t('simulados.sub')}</p>
            </div>
            <div className="sim__stats">
              <div className="sim-stat">
                <b>{exams.length}</b>
                <span>{t('simulados.exams')}</span>
              </div>
              <div className="sim-stat">
                <b>{provedores.length}</b>
                <span>{t('simulados.providers')}</span>
              </div>
              <div className="sim-stat">
                <b>{aprovados}</b>
                <span>{t('simulados.passedStat')}</span>
              </div>
            </div>
          </div>

          {carregando ? (
            <p className="sim-empty">{t('simulados.loading')}</p>
          ) : exams.length === 0 ? (
            <p className="sim-empty">{t('simulados.empty')}</p>
          ) : (
            <>
              <div className="filters">
                <label className="trilhas-search">
                  <Search size={16} />
                  <input
                    ref={buscaRef}
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder={t('simulados.searchPlaceholder')}
                  />
                  {busca ? (
                    <button
                      type="button"
                      className="trilhas-search__clear"
                      aria-label={t('filters.clearSearch')}
                      onClick={() => setBusca('')}
                    >
                      <X size={13} />
                    </button>
                  ) : (
                    <kbd className="trilhas-search__kbd">/</kbd>
                  )}
                </label>

                <div className="level-pills">
                  <button
                    type="button"
                    className={`level-pill${nivel === '' ? ' level-pill--active' : ''}`}
                    onClick={() => setNivel('')}
                  >
                    {t('filters.allM')}
                  </button>
                  {niveis.map((n) => (
                    <button
                      key={n.valor}
                      type="button"
                      className={`level-pill${nivel === n.valor ? ' level-pill--active' : ''}`}
                      onClick={() => setNivel(n.valor)}
                    >
                      {t(n.label)}
                    </button>
                  ))}
                </div>

                {/* No celular, nível e provedor viram botões que abrem a folha. */}
                <div className="filtro-mobile">
                  <button
                    type="button"
                    className={`filtro-btn${filtro ? ' filtro-btn--on' : ''}`}
                    onClick={() => setFolha('prov')}
                  >
                    <span>{filtro ? provedorDe(filtro).label : t('filters.provider')}</span>
                    <ChevronDown size={13} />
                  </button>
                </div>
                <div className="filtro-mobile">
                  <button
                    type="button"
                    className={`filtro-btn${nivel ? ' filtro-btn--on' : ''}`}
                    onClick={() => setFolha('nivel')}
                  >
                    <span>{nivel ? t(LABEL_NIVEL[nivel]) : t('filters.level')}</span>
                    <ChevronDown size={13} />
                  </button>
                </div>

                {(totalFavoritos > 0 || soFavoritos) && (
                  <button
                    className={`fav-pill${soFavoritos ? ' fav-pill--active' : ''}`}
                    aria-pressed={soFavoritos}
                    onClick={() => setSoFavoritos((v) => !v)}
                  >
                    <Star size={13} /> {t('simulados.favorites')} <span className="fav-pill__n">{totalFavoritos}</span>
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
                    <span className="tx-completo">{t('filters.clear')}</span>
                    <span className="tx-curto">{t('filters.clearShort')}</span>
                  </button>
                  <span className="filters__count">
                    {filtrosAtivos ? (
                      <Trans
                        i18nKey="simulados.countFiltered"
                        values={{ shown: filtrados.length, total: exams.length }}
                        components={{ b: <b /> }}
                      />
                    ) : (
                      <>{t('simulados.countAll', { count: filtrados.length })}</>
                    )}
                  </span>
                </div>
              </div>

              <div className="fchips">
                <button
                  className={`fchip${filtro === null ? ' fchip--active' : ''}`}
                  onClick={() => setFiltro(null)}
                >
                  {t('filters.allM')} <span className="fchip__n">{exams.length}</span>
                </button>
                {provedores.map((p) => (
                  <button
                    key={p}
                    className={`fchip${filtro === p ? ' fchip--active' : ''}`}
                    onClick={() => setFiltro(p)}
                  >
                    {provedorDe(p).label} <span className="fchip__n">{contagem[p]}</span>
                  </button>
                ))}
              </div>

              {filtrados.length === 0 ? (
                <p className="sim-empty">{t('simulados.emptySearch')}</p>
              ) : (
                <div className="sim__grid">
                  {filtrados.map((e) => (
                    <CardSimulado
                      key={e.slug}
                      e={e}
                      melhor={melhorPorSlug[e.slug]}
                      href={`/simulados/${e.slug}`}
                      favorito={ehFavorito(e)}
                      onFavoritar={() => toggleFavorito(e)}
                    />
                  ))}
                </div>
              )}

              <div className="sim__footer">
                <span className="sim__footer-icon">
                  <Info size={18} />
                </span>
                <div>
                  <b>{t('simulados.footerTitle')}</b> {t('simulados.footerBody')}
                </div>
              </div>

              <SheetFiltro
                titulo={t('filters.provider')}
                aberto={folha === 'prov'}
                aoFechar={() => setFolha(null)}
                valor={filtro ?? ''}
                aoEscolher={(v) => setFiltro(v || null)}
                opcoes={opcoesProvedor}
              />
              <SheetFiltro
                titulo={t('filters.level')}
                aberto={folha === 'nivel'}
                aoFechar={() => setFolha(null)}
                valor={nivel}
                aoEscolher={setNivel}
                opcoes={opcoesNivel}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CardSimulado({
  e,
  melhor,
  href,
  favorito,
  onFavoritar,
}: {
  e: SimuladoResumo;
  melhor?: Melhor;
  href: string;
  favorito: boolean;
  onFavoritar: () => void;
}) {
  const { t } = useTranslation();
  const p = provedorDe(e.provider);
  const feito = !!melhor;
  const aprovado = melhor?.passed === true;
  return (
    <div className="simc">
      <div className="simc__top">
        <span className="simc__logo" style={{ background: p.cor }}>
          {p.sigla}
        </span>
        <div className="simc__id">
          <div className="simc__vendor">{p.nome}</div>
          <div className="simc__code">{e.code ?? e.name}</div>
        </div>
        {e.level && (
          <span className={`simc__level simc__level--${nivelClasse(e.level)}`}>
            {t(LABEL_NIVEL[nivelClasse(e.level)])}
          </span>
        )}
        <button
          type="button"
          className={`simc__fav${favorito ? ' simc__fav--on' : ''}`}
          aria-pressed={favorito}
          aria-label={favorito ? t('filters.unfavorite') : t('filters.favorite')}
          title={favorito ? t('filters.unfavorite') : t('filters.favorite')}
          onClick={onFavoritar}
        >
          <Star size={17} />
        </button>
      </div>
      <div className="simc__name">{nomeLimpo(e.name, e.code)}</div>
      <div className="simc__meta">
        <span>
          <b>{e.questionCount}</b> {t('simulados.questions')}
        </span>
        <span>
          <b>{e.durationMinutes}</b> {t('simulados.min')}
        </span>
        <span>
          <b>{e.passPercent}%</b> {t('simulados.toPass')}
        </span>
      </div>
      <div className="simc__divider" />
      <div className="simc__status">
        {feito ? (
          <>
            <div className="simc__status-row">
              <span className={`simc__verdict simc__verdict--${aprovado ? 'ok' : 'no'}`}>
                {aprovado ? t('simulados.passed') : t('simulados.failed')}
              </span>
              <span className="simc__best">{t('simulados.best', { score: melhor!.score })}</span>
            </div>
            <div className="simc__bar">
              <span
                className={aprovado ? 'simc__bar--ok' : 'simc__bar--no'}
                style={{ width: `${melhor!.score}%` }}
              />
            </div>
          </>
        ) : (
          <div className="simc__notstarted">{t('simulados.notStarted')}</div>
        )}
      </div>
      <Link to={href} className={`simc__btn${feito ? ' simc__btn--redo' : ''}`}>
        <Play size={13} /> {feito ? t('simulados.redo') : t('simulados.start')}
      </Link>
    </div>
  );
}
