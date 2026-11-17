import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { DesTopbar } from './DesTopbar';
import {
  Search,
  Play,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
} from '../../components/Icons';
import { Dropdown } from '../../components/Dropdown';
import { SheetFiltro, type OpcaoSheet } from '../../components/SheetFiltro';
import { useRequisicao } from '../../hooks/useRequisicao';
import { Trans, useTranslation } from 'react-i18next';
import { getDesafioDoDia, getDesafios } from '../../services/desafios';
import type { DesafioResumo, StatusDesafio } from '../../services/desafios';

type DiffKey = 'desafios.diffAll' | 'desafios.diffEasy' | 'desafios.diffMedium' | 'desafios.diffHard';

// Difficulties carry a stable value; the label is an i18n key.
const DIFFS: { v: string; label: DiffKey }[] = [
  { v: '', label: 'desafios.diffAll' },
  { v: 'facil', label: 'desafios.diffEasy' },
  { v: 'medio', label: 'desafios.diffMedium' },
  { v: 'dificil', label: 'desafios.diffHard' },
];
const DIF_LABEL: Record<string, DiffKey> = {
  facil: 'desafios.diffEasy',
  medio: 'desafios.diffMedium',
  dificil: 'desafios.diffHard',
};
const DIFF_COLOR: Record<string, string> = {
  facil: 'var(--success)',
  medio: 'var(--amber)',
  dificil: 'var(--av-red)',
};
type StatusKey =
  | 'desafios.statusAll'
  | 'desafios.statusSolved'
  | 'desafios.statusAttempted'
  | 'desafios.statusTodo';

const STATUSES: { key: StatusDesafio | 'all'; label: StatusKey }[] = [
  { key: 'all', label: 'desafios.statusAll' },
  { key: 'solved', label: 'desafios.statusSolved' },
  { key: 'attempted', label: 'desafios.statusAttempted' },
  { key: 'todo', label: 'desafios.statusTodo' },
];
const PAGE_SIZE = 10;
const TEMAS_COLAPSADOS = 8;

function StatusIcon({ status }: { status: StatusDesafio }) {
  if (status === 'solved') {
    return (
      <span className="ch-status ch-status--solved">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M8.5 12.5l2.5 2.5 5-5" />
        </svg>
      </span>
    );
  }
  if (status === 'attempted') {
    return (
      <span className="ch-status ch-status--attempted">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4l2.5 2" />
        </svg>
      </span>
    );
  }
  return (
    <span className="ch-status ch-status--todo">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
      </svg>
    </span>
  );
}

export function Desafios() {
  const { t } = useTranslation();
  const { dados } = useRequisicao(() => Promise.all([getDesafioDoDia(), getDesafios()]), []);
  const daily = dados?.[0] ?? null;
  const lista = dados?.[1];
  const items = useMemo(() => lista?.items ?? [], [lista]);
  const progress = lista?.progress ?? { solved: 0, total: 0, pct: 0, easy: 0, medium: 0, hard: 0 };

  const buscaRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [diff, setDiff] = useState('');
  const [status, setStatus] = useState<StatusDesafio | 'all'>('all');
  const [topic, setTopic] = useState('Todos');
  const [page, setPage] = useState(1);
  const [folha, setFolha] = useState<'tema' | 'dificuldade' | 'status' | null>(null);
  const [temasAbertos, setTemasAbertos] = useState(false);

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

  // Chips de tema derivados dos temas dos desafios (contagem por tema).
  const chips = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of items) {
      for (const t of (c.topic ?? '')
        .split('·')
        .map((s) => s.trim())
        .filter(Boolean)) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
    const arr = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
    return [{ name: 'Todos', count: undefined as number | undefined }, ...arr];
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((c) => {
      const busca = `${c.number ?? ''} ${c.title} ${c.topic ?? ''}`.toLowerCase();
      if (query && !busca.includes(query.toLowerCase())) return false;
      if (diff && c.difficulty !== diff) return false;
      if (status !== 'all' && c.status !== status) return false;
      if (topic !== 'Todos' && !(c.topic ?? '').toLowerCase().includes(topic.toLowerCase()))
        return false;
      return true;
    });
  }, [items, query, diff, status, topic]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const shown = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);
  const reset =
    <T,>(fn: (v: T) => void) =>
    (v: T) => {
      fn(v);
      setPage(1);
    };
  const ringOffset = Math.round(151 * (1 - progress.pct / 100));

  const filtrosAtivos = !!(query.trim() || diff || status !== 'all' || topic !== 'Todos');

  function limparFiltros() {
    setQuery('');
    setDiff('');
    setStatus('all');
    setTopic('Todos');
    setPage(1);
  }

  const totalTemas = chips.length - 1;
  const chipsVisiveis = temasAbertos ? chips : chips.slice(0, TEMAS_COLAPSADOS + 1);

  const opcoesTema: OpcaoSheet[] = chips.map((c) => ({
    valor: c.name === 'Todos' ? '' : c.name,
    label: c.name === 'Todos' ? t('desafios.topicAll') : c.name,
    contagem: c.count ?? items.length,
  }));
  const opcoesDificuldade: OpcaoSheet[] = DIFFS.map((d) => ({ valor: d.v, label: t(d.label) }));
  const opcoesStatus: OpcaoSheet[] = STATUSES.map((s) => ({
    valor: s.key === 'all' ? '' : s.key,
    label: t(s.label),
  }));

  return (
    <div className="home">
      <DesTopbar />
      <div className="ch">
        <div className="ch-head">
          <div>
            <h1 className="ch-title">{t('desafios.title')}</h1>
            <p className="ch-sub">{t('desafios.sub')}</p>
          </div>
          <div className="ch-progress">
            <div className="ch-ring">
              <svg
                width="56"
                height="56"
                viewBox="0 0 56 56"
                style={{ transform: 'rotate(-90deg)' }}
              >
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="var(--surface-2)"
                  strokeWidth="6"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="151"
                  strokeDashoffset={ringOffset}
                />
              </svg>
              <div className="ch-ring__pct">{progress.pct}%</div>
            </div>
            <div>
              <div className="ch-progress__count">
                {progress.solved} <span>{t('desafios.solvedOf', { total: progress.total })}</span>
              </div>
              <div className="ch-progress__legend">
                <span>
                  <i style={{ background: 'var(--success)' }} />
                  {progress.easy} {t('desafios.easy')}
                </span>
                <span>
                  <i style={{ background: 'var(--amber)' }} />
                  {progress.medium} {t('desafios.medium')}
                </span>
                <span>
                  <i style={{ background: 'var(--av-red)' }} />
                  {progress.hard} {t('desafios.hard')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {daily && (
          <div className="ch-daily">
            <span className="ch-daily__glow" />
            <span className="ch-daily__icon">
              <Play size={24} />
            </span>
            <div className="ch-daily__meta">
              <div className="ch-daily__kicker">{t('desafios.dailyKicker')}</div>
              <div className="ch-daily__name">
                {daily.number != null ? `${daily.number}. ` : ''}
                {daily.title}
              </div>
              <div className="ch-daily__sub">
                {t(DIF_LABEL[daily.difficulty])} · +{daily.xp} XP
                {daily.solved ? ` · ${t('desafios.dailySolved')}` : ` · ${t('desafios.dailyDeadline')}`}
              </div>
            </div>
            <Link to={`/desafios/${daily.id}`} className="ch-daily__btn">
              <Play size={13} /> {daily.solved ? t('desafios.dailyReview') : t('desafios.dailySolveNow')}
            </Link>
          </div>
        )}

        <div className="filters">
          <label className="trilhas-search">
            <Search size={16} />
            <input
              ref={buscaRef}
              value={query}
              onChange={(e) => reset(setQuery)(e.target.value)}
              placeholder={t('desafios.searchPlaceholder')}
            />
            {query ? (
              <button
                type="button"
                className="trilhas-search__clear"
                aria-label={t('filters.clearSearch')}
                onClick={() => reset(setQuery)('')}
              >
                <X size={13} />
              </button>
            ) : (
              <kbd className="trilhas-search__kbd">/</kbd>
            )}
          </label>

          <div className="level-pills" role="group" aria-label={t('filters.difficulty')}>
            {DIFFS.map((d) => (
              <button
                key={d.v}
                type="button"
                className={`level-pill${diff === d.v ? ' level-pill--active' : ''}`}
                aria-pressed={diff === d.v}
                onClick={() => reset(setDiff)(d.v)}
              >
                {t(d.label)}
              </button>
            ))}
          </div>

          <div className="filtro-desktop">
            <Dropdown
              ariaLabel={t('filters.status')}
              placeholder={t('filters.status')}
              valor={status === 'all' ? '' : status}
              aoEscolher={(v) => reset(setStatus)((v || 'all') as StatusDesafio | 'all')}
              opcoes={opcoesStatus}
            />
          </div>

          {/* No celular, tema e dificuldade abrem a folha que sobe de baixo. */}
          <div className="filtro-mobile">
            <button
              type="button"
              className={`filtro-btn${topic !== 'Todos' ? ' filtro-btn--on' : ''}`}
              onClick={() => setFolha('tema')}
            >
              <span>{topic !== 'Todos' ? topic : t('filters.topic')}</span>
              <ChevronDown size={13} />
            </button>
          </div>
          <div className="filtro-mobile">
            <button
              type="button"
              className={`filtro-btn${diff ? ' filtro-btn--on' : ''}`}
              onClick={() => setFolha('dificuldade')}
            >
              <span>{diff ? t(DIF_LABEL[diff]) : t('filters.difficulty')}</span>
              <ChevronDown size={13} />
            </button>
          </div>

          <div className="topbar__spacer" />
        </div>

        <div className="fchips">
          {chipsVisiveis.map((c) => (
            <button
              key={c.name}
              className={`fchip${topic === c.name ? ' fchip--active' : ''}`}
              onClick={() => reset(setTopic)(c.name)}
            >
              {c.name === 'Todos' ? t('desafios.topicAll') : c.name}
              {c.count != null && <span className="fchip__n">{c.count}</span>}
            </button>
          ))}
          {totalTemas > TEMAS_COLAPSADOS && (
            <button
              type="button"
              className="fchips__ver"
              onClick={() => setTemasAbertos((v) => !v)}
            >
              {temasAbertos
                ? t('desafios.collapse')
                : t('desafios.seeTopics', { count: totalTemas })}
              <span
                className="fchips__ver-seta"
                style={temasAbertos ? { transform: 'rotate(180deg)' } : undefined}
              >
                <ChevronDown size={13} />
              </span>
            </button>
          )}
        </div>

        <div className="ch-meta">
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
                  i18nKey="desafios.countFiltered"
                  values={{ shown: filtered.length, total: items.length }}
                  components={{ b: <b /> }}
                />
              ) : (
                <>{t('desafios.countAll', { count: items.length })}</>
              )}
            </span>
          </div>
          <div className="filtro-mobile filtro-mobile--status">
            <button
              type="button"
              className={`filtro-btn${status !== 'all' ? ' filtro-btn--on' : ''}`}
              onClick={() => setFolha('status')}
            >
              <span>{status !== 'all' ? t(STATUSES.find((s) => s.key === status)!.label) : t('filters.status')}</span>
              <ChevronDown size={13} />
            </button>
          </div>
        </div>

        <div className="ch-table">
          <div className="ch-table__head">
            <div>{t('desafios.tableStatus')}</div>
            <div>{t('desafios.tableChallenge')}</div>
            <div>{t('desafios.tableTopic')}</div>
            <div>{t('desafios.tableDifficulty')}</div>
            <div className="ch-right">{t('desafios.tableAcceptance')}</div>
            <div className="ch-right">{t('desafios.tableXp')}</div>
          </div>

          {shown.map((c) => (
            <Row key={c.id} c={c} />
          ))}

          {shown.length === 0 && (
            <div className="ch-empty">{t('desafios.empty')}</div>
          )}

          <div className="ch-pager">
            <span className="ch-pager__info">
              {filtered.length === 0
                ? t('desafios.noResults')
                : t('desafios.pagerInfo', {
                    from: (pageSafe - 1) * PAGE_SIZE + 1,
                    to: Math.min(pageSafe * PAGE_SIZE, filtered.length),
                    total: filtered.length,
                  })}
            </span>
            <div className="ch-pager__nav">
              <button
                className="ch-pager__btn"
                disabled={pageSafe <= 1}
                onClick={() => setPage(pageSafe - 1)}
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`ch-pager__num${pageSafe === i + 1 ? ' ch-pager__num--active' : ''}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="ch-pager__btn"
                disabled={pageSafe >= totalPages}
                onClick={() => setPage(pageSafe + 1)}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>

        <SheetFiltro
          titulo={t('filters.topic')}
          aberto={folha === 'tema'}
          aoFechar={() => setFolha(null)}
          valor={topic === 'Todos' ? '' : topic}
          aoEscolher={(v) => reset(setTopic)(v || 'Todos')}
          opcoes={opcoesTema}
          placeholderBusca={t('desafios.searchTopic')}
        />
        <SheetFiltro
          titulo={t('filters.difficulty')}
          aberto={folha === 'dificuldade'}
          aoFechar={() => setFolha(null)}
          valor={diff}
          aoEscolher={(v) => reset(setDiff)(v || '')}
          opcoes={opcoesDificuldade}
        />
        <SheetFiltro
          titulo={t('filters.status')}
          aberto={folha === 'status'}
          aoFechar={() => setFolha(null)}
          valor={status === 'all' ? '' : status}
          aoEscolher={(v) => reset(setStatus)((v || 'all') as StatusDesafio | 'all')}
          opcoes={opcoesStatus}
        />
      </div>
    </div>
  );
}

function Row({ c }: { c: DesafioResumo }) {
  const { t } = useTranslation();
  return (
    <div className={`ch-row${c.isToday ? ' ch-row--daily' : ''}`}>
      <div className="ch-row__status">
        <StatusIcon status={c.status} />
      </div>
      <div className="ch-row__main">
        <div className="ch-row__name-cell">
          {c.number != null && <span className="ch-row__id">{c.number}.</span>}
          <Link
            to={`/desafios/${c.id}`}
            className={`ch-row__name link-esticado${c.status === 'solved' ? ' ch-row__name--done' : ''}`}
          >
            {c.title}
          </Link>
          {c.isToday && <span className="ch-row__today">{t('desafios.today')}</span>}
        </div>
        {/* No celular o tema e a dificuldade viram sublinha do título. */}
        <div className="ch-row__sub">
          {c.topic ?? '—'} ·{' '}
          <span style={{ color: DIFF_COLOR[c.difficulty] }}>{t(DIF_LABEL[c.difficulty])}</span>
        </div>
      </div>
      <div className="ch-row__topic">{c.topic ?? '—'}</div>
      <div className="ch-row__diffcell">
        <span className="ch-row__diff" style={{ color: DIFF_COLOR[c.difficulty] }}>
          {t(DIF_LABEL[c.difficulty])}
        </span>
      </div>
      <div className="ch-row__accept">{c.acceptance == null ? '—' : `${c.acceptance}%`}</div>
      <div className="ch-row__xp">+{c.xp}</div>
    </div>
  );
}
