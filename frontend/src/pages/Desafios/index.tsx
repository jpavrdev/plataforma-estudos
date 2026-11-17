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
import { getDesafioDoDia, getDesafios } from '../../services/desafios';
import type { DesafioResumo, StatusDesafio } from '../../services/desafios';

const DIFFS = ['Todas', 'Fácil', 'Médio', 'Difícil'];
const DIF_LABEL: Record<string, string> = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' };
const DIFF_COLOR: Record<string, string> = {
  facil: 'var(--success)',
  medio: 'var(--amber)',
  dificil: 'var(--av-red)',
};
const STATUSES: { key: StatusDesafio | 'all'; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'solved', label: 'Resolvidos' },
  { key: 'attempted', label: 'Tentados' },
  { key: 'todo', label: 'Não iniciados' },
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
  const { dados } = useRequisicao(() => Promise.all([getDesafioDoDia(), getDesafios()]), []);
  const daily = dados?.[0] ?? null;
  const lista = dados?.[1];
  const items = useMemo(() => lista?.items ?? [], [lista]);
  const progress = lista?.progress ?? { solved: 0, total: 0, pct: 0, easy: 0, medium: 0, hard: 0 };

  const buscaRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [diff, setDiff] = useState('Todas');
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
      if (diff !== 'Todas' && DIF_LABEL[c.difficulty] !== diff) return false;
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

  const filtrosAtivos = !!(query.trim() || diff !== 'Todas' || status !== 'all' || topic !== 'Todos');

  function limparFiltros() {
    setQuery('');
    setDiff('Todas');
    setStatus('all');
    setTopic('Todos');
    setPage(1);
  }

  const totalTemas = chips.length - 1;
  const chipsVisiveis = temasAbertos ? chips : chips.slice(0, TEMAS_COLAPSADOS + 1);

  const opcoesTema: OpcaoSheet[] = chips.map((t) => ({
    valor: t.name === 'Todos' ? '' : t.name,
    label: t.name,
    contagem: t.count ?? items.length,
  }));
  const opcoesDificuldade: OpcaoSheet[] = [
    { valor: '', label: 'Todas' },
    ...DIFFS.slice(1).map((d) => ({ valor: d, label: d })),
  ];
  const opcoesStatus: OpcaoSheet[] = STATUSES.map((s) => ({
    valor: s.key === 'all' ? '' : s.key,
    label: s.label,
  }));

  return (
    <div className="home">
      <DesTopbar />
      <div className="ch">
        <div className="ch-head">
          <div>
            <h1 className="ch-title">Desafios</h1>
            <p className="ch-sub">
              Pratique com problemas de código no estilo das entrevistas. Um novo desafio todo dia.
            </p>
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
                {progress.solved} <span>/ {progress.total} resolvidos</span>
              </div>
              <div className="ch-progress__legend">
                <span>
                  <i style={{ background: 'var(--success)' }} />
                  {progress.easy} fáceis
                </span>
                <span>
                  <i style={{ background: 'var(--amber)' }} />
                  {progress.medium} médios
                </span>
                <span>
                  <i style={{ background: 'var(--av-red)' }} />
                  {progress.hard} difíceis
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
              <div className="ch-daily__kicker">Desafio do dia · mantém seu streak</div>
              <div className="ch-daily__name">
                {daily.number != null ? `${daily.number}. ` : ''}
                {daily.title}
              </div>
              <div className="ch-daily__sub">
                {DIF_LABEL[daily.difficulty]} · +{daily.xp} XP
                {daily.solved ? ' · resolvido' : ' · resolva antes da meia-noite'}
              </div>
            </div>
            <Link to={`/desafios/${daily.id}`} className="ch-daily__btn">
              <Play size={13} /> {daily.solved ? 'Revisar' : 'Resolver agora'}
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
              placeholder="Buscar desafio por nome ou tema..."
            />
            {query ? (
              <button
                type="button"
                className="trilhas-search__clear"
                aria-label="Limpar busca"
                onClick={() => reset(setQuery)('')}
              >
                <X size={13} />
              </button>
            ) : (
              <kbd className="trilhas-search__kbd">/</kbd>
            )}
          </label>

          <div className="level-pills" role="group" aria-label="Dificuldade">
            {DIFFS.map((d) => (
              <button
                key={d}
                type="button"
                className={`level-pill${diff === d ? ' level-pill--active' : ''}`}
                aria-pressed={diff === d}
                onClick={() => reset(setDiff)(d)}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="filtro-desktop">
            <Dropdown
              ariaLabel="Status"
              placeholder="Status"
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
              <span>{topic !== 'Todos' ? topic : 'Tema'}</span>
              <ChevronDown size={13} />
            </button>
          </div>
          <div className="filtro-mobile">
            <button
              type="button"
              className={`filtro-btn${diff !== 'Todas' ? ' filtro-btn--on' : ''}`}
              onClick={() => setFolha('dificuldade')}
            >
              <span>{diff !== 'Todas' ? diff : 'Dificuldade'}</span>
              <ChevronDown size={13} />
            </button>
          </div>

          <div className="topbar__spacer" />
        </div>

        <div className="fchips">
          {chipsVisiveis.map((t) => (
            <button
              key={t.name}
              className={`fchip${topic === t.name ? ' fchip--active' : ''}`}
              onClick={() => reset(setTopic)(t.name)}
            >
              {t.name}
              {t.count != null && <span className="fchip__n">{t.count}</span>}
            </button>
          ))}
          {totalTemas > TEMAS_COLAPSADOS && (
            <button
              type="button"
              className="fchips__ver"
              onClick={() => setTemasAbertos((v) => !v)}
            >
              {temasAbertos ? 'Recolher' : `Ver os ${totalTemas} temas`}
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
              <span className="tx-completo">Limpar filtros</span>
              <span className="tx-curto">Limpar</span>
            </button>
            <span className="filters__count">
              {filtrosAtivos ? (
                <>
                  <b>{filtered.length}</b> de {items.length} desafios
                </>
              ) : (
                <>
                  {items.length} {items.length === 1 ? 'desafio' : 'desafios'}
                </>
              )}
            </span>
          </div>
          <div className="filtro-mobile filtro-mobile--status">
            <button
              type="button"
              className={`filtro-btn${status !== 'all' ? ' filtro-btn--on' : ''}`}
              onClick={() => setFolha('status')}
            >
              <span>{status !== 'all' ? STATUSES.find((s) => s.key === status)!.label : 'Status'}</span>
              <ChevronDown size={13} />
            </button>
          </div>
        </div>

        <div className="ch-table">
          <div className="ch-table__head">
            <div>Status</div>
            <div>Desafio</div>
            <div>Tema</div>
            <div>Dificuldade</div>
            <div className="ch-right">Aceitação</div>
            <div className="ch-right">XP</div>
          </div>

          {shown.map((c) => (
            <Row key={c.id} c={c} />
          ))}

          {shown.length === 0 && (
            <div className="ch-empty">Nenhum desafio encontrado com esses filtros.</div>
          )}

          <div className="ch-pager">
            <span className="ch-pager__info">
              {filtered.length === 0
                ? 'Nenhum resultado'
                : `Mostrando ${(pageSafe - 1) * PAGE_SIZE + 1}–${Math.min(pageSafe * PAGE_SIZE, filtered.length)} de ${filtered.length} desafios`}
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
          titulo="Tema"
          aberto={folha === 'tema'}
          aoFechar={() => setFolha(null)}
          valor={topic === 'Todos' ? '' : topic}
          aoEscolher={(v) => reset(setTopic)(v || 'Todos')}
          opcoes={opcoesTema}
          placeholderBusca="Buscar tema"
        />
        <SheetFiltro
          titulo="Dificuldade"
          aberto={folha === 'dificuldade'}
          aoFechar={() => setFolha(null)}
          valor={diff === 'Todas' ? '' : diff}
          aoEscolher={(v) => reset(setDiff)(v || 'Todas')}
          opcoes={opcoesDificuldade}
        />
        <SheetFiltro
          titulo="Status"
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
          {c.isToday && <span className="ch-row__today">HOJE</span>}
        </div>
        {/* No celular o tema e a dificuldade viram sublinha do título. */}
        <div className="ch-row__sub">
          {c.topic ?? '—'} ·{' '}
          <span style={{ color: DIFF_COLOR[c.difficulty] }}>{DIF_LABEL[c.difficulty]}</span>
        </div>
      </div>
      <div className="ch-row__topic">{c.topic ?? '—'}</div>
      <div className="ch-row__diffcell">
        <span className="ch-row__diff" style={{ color: DIFF_COLOR[c.difficulty] }}>
          {DIF_LABEL[c.difficulty]}
        </span>
      </div>
      <div className="ch-row__accept">{c.acceptance == null ? '—' : `${c.acceptance}%`}</div>
      <div className="ch-row__xp">+{c.xp}</div>
    </div>
  );
}
