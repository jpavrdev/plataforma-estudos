import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DesTopbar } from './DesTopbar';
import { Search, Play, ChevronLeft, ChevronRight } from '../../components/Icons';
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
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="12" cy="12" r="9" />
      </svg>
    </span>
  );
}

export function Desafios() {
  const navigate = useNavigate();
  const { dados } = useRequisicao(() => Promise.all([getDesafioDoDia(), getDesafios()]), []);
  const daily = dados?.[0] ?? null;
  const lista = dados?.[1];
  const items = useMemo(() => lista?.items ?? [], [lista]);
  const progress = lista?.progress ?? { solved: 0, total: 0, pct: 0, easy: 0, medium: 0, hard: 0 };

  const [query, setQuery] = useState('');
  const [diff, setDiff] = useState('Todas');
  const [status, setStatus] = useState<StatusDesafio | 'all'>('all');
  const [topic, setTopic] = useState('Todos');
  const [page, setPage] = useState(1);

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
            <button className="ch-daily__btn" onClick={() => navigate(`/desafios/${daily.id}`)}>
              <Play size={13} /> {daily.solved ? 'Revisar' : 'Resolver agora'}
            </button>
          </div>
        )}

        <div className="ch-toolbar">
          <label className="ch-search">
            <Search size={16} />
            <input
              value={query}
              onChange={(e) => reset(setQuery)(e.target.value)}
              placeholder="Buscar desafio por nome ou tema…"
            />
          </label>
          <Dropdown
            label="Dificuldade"
            value={diff}
            options={DIFFS}
            onChange={reset(setDiff)}
            allLabel="Todas"
          />
          <Dropdown
            label="Status"
            value={STATUSES.find((s) => s.key === status)!.label}
            options={STATUSES.map((s) => s.label)}
            onChange={(lbl) => reset(setStatus)(STATUSES.find((s) => s.label === lbl)!.key)}
            allLabel="Todos"
          />
        </div>

        <div className="ch-chips">
          {chips.map((t) => (
            <button
              key={t.name}
              className={`ch-chip${topic === t.name ? ' ch-chip--active' : ''}`}
              onClick={() => reset(setTopic)(t.name)}
            >
              {t.name}
              {t.count != null && <span className="ch-chip__count">{t.count}</span>}
            </button>
          ))}
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
            <Row key={c.id} c={c} onOpen={() => navigate(`/desafios/${c.id}`)} />
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
      </div>
    </div>
  );
}

function Row({ c, onOpen }: { c: DesafioResumo; onOpen: () => void }) {
  return (
    <div className={`ch-row${c.isToday ? ' ch-row--daily' : ''}`} onClick={onOpen}>
      <div>
        <StatusIcon status={c.status} />
      </div>
      <div className="ch-row__name-cell">
        {c.number != null && <span className="ch-row__id">{c.number}.</span>}
        <span className={`ch-row__name${c.status === 'solved' ? ' ch-row__name--done' : ''}`}>
          {c.title}
        </span>
        {c.isToday && <span className="ch-row__today">HOJE</span>}
      </div>
      <div className="ch-row__topic">{c.topic ?? '—'}</div>
      <div>
        <span className="ch-row__diff" style={{ color: DIFF_COLOR[c.difficulty] }}>
          {DIF_LABEL[c.difficulty]}
        </span>
      </div>
      <div className="ch-row__accept">{c.acceptance == null ? '—' : `${c.acceptance}%`}</div>
      <div className="ch-row__xp">+{c.xp}</div>
    </div>
  );
}

function Dropdown({
  label,
  value,
  options,
  onChange,
  allLabel,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  allLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const active = value !== allLabel;
  return (
    <div className="ch-dd">
      <button
        className={`ch-dd__btn${active ? ' ch-dd__btn--active' : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        {label}
        {active ? `: ${value}` : ''}
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <>
          <div className="ch-dd__scrim" onClick={() => setOpen(false)} />
          <div className="ch-dd__menu">
            {options.map((o) => (
              <button
                key={o}
                className={`ch-dd__opt${o === value ? ' ch-dd__opt--on' : ''}`}
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                }}
              >
                {o}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
