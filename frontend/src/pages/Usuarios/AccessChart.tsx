import { useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import type { AccessOverview } from '../../services/admin';

const PERIODS = [
  { key: '7d', label: '7D', days: 7 },
  { key: '30d', label: '30D', days: 30 },
  { key: '3m', label: '3M', days: 90 },
  { key: '6m', label: '6M', days: 180 },
] as const;

const W = 1240;
const H = 260;
const PADL = 44;
const PADR = 14;
const PADT = 16;
const PADB = 26;

const fmtDay = (t: number) =>
  new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
const fmtFullDate = (t: number) =>
  new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

// People per day over the visit log: how many came back, and how often. The
// empty days show up as zero on purpose, they are part of the retention story.
export function AccessChart({ accesses }: { accesses: AccessOverview | null }) {
  const [period, setPeriod] = useState<string>('30d');
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const graph = useMemo(() => {
    if (!accesses || accesses.serie.length === 0) return null;
    const chosen = PERIODS.find((p) => p.key === period)!;
    const within = accesses.serie.slice(-chosen.days);
    const maxValue = Math.max(1, ...within.map((d) => d.pessoas));
    const py = (v: number) => PADT + (1 - v / maxValue) * (H - PADT - PADB);
    const plotWidth = W - PADL - PADR;
    const step = plotWidth / within.length;
    const bars = within.map((d, i) => {
      const width = Math.max(3, Math.min(34, step * 0.62));
      const x = PADL + i * step + (step - width) / 2;
      const y = py(d.pessoas);
      return { ...d, t: new Date(`${d.dia}T00:00:00`).getTime(), x, width, y, h: H - PADB - y };
    });
    // Few distinct counts (1 person/day) would repeat tick values; the scale
    // shrinks to 0..max so the baseline label shows up too.
    const nTicks = maxValue <= 2 ? maxValue + 1 : 4;
    const ticks = Array.from({ length: nTicks }, (_, i) => {
      const v = Math.round((maxValue * i) / (nTicks - 1));
      return { v, y: py(v) };
    });
    const nLabels = Math.min(6, Math.max(2, bars.length));
    const xlabels = Array.from(
      { length: nLabels },
      (_, i) => bars[Math.round((i * (bars.length - 1)) / (nLabels - 1))],
    );
    return { bars, ticks, xlabels };
  }, [accesses, period]);

  function onMove(e: ReactMouseEvent) {
    if (!svgRef.current || !graph) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0;
    let dist = Infinity;
    graph.bars.forEach((b, i) => {
      const d = Math.abs(b.x + b.width / 2 - x);
      if (d < dist) {
        dist = d;
        best = i;
      }
    });
    setHover(best);
  }

  const active = hover != null && graph ? graph.bars[hover] : null;
  const summary = accesses?.resumo;

  return (
    <div className="painel-graf">
      <div className="painel-graf__head">
        <div className="painel-graf__titulo">Acessos por dia</div>
        <div className="painel-graf__periodos">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              className={`painel-graf__periodo${period === p.key ? ' is-ativo' : ''}`}
              onClick={() => setPeriod(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {!graph ? (
        <p className="track__desc">
          Sem registros de acesso ainda; o gráfico começa a desenhar a partir do deploy do painel.
        </p>
      ) : (
        <>
          <div className="painel-graf__leitura">
            {active ? (
              <>
                <b>{active.pessoas}</b> {active.pessoas === 1 ? 'pessoa' : 'pessoas'} em{' '}
                {fmtFullDate(active.t)} · {active.visitas} {active.visitas === 1 ? 'visita' : 'visitas'}
              </>
            ) : (
              <span>Passe o mouse para ver quem acessou em cada dia</span>
            )}
          </div>
          <svg
            ref={svgRef}
            className="painel-graf__svg"
            viewBox={`0 0 ${W} ${H}`}
            onMouseMove={onMove}
            onMouseLeave={() => setHover(null)}
          >
            {graph.ticks.map((tk, i) => (
              <g key={`t${i}`}>
                <line className="painel-graf__grid" x1={PADL} y1={tk.y} x2={W - PADR} y2={tk.y} />
                <text className="painel-graf__ylab" x={PADL - 8} y={tk.y + 4} textAnchor="end">
                  {tk.v}
                </text>
              </g>
            ))}
            {graph.bars.map((b, i) => (
              <rect
                key={b.dia}
                className={`painel-graf__bar${hover === i ? ' is-active' : ''}`}
                x={b.x}
                y={b.y}
                width={b.width}
                height={b.h}
              />
            ))}
            {graph.xlabels.map((l) => (
              <text className="painel-graf__xlab" key={l.dia} x={l.x + l.width / 2} y={H - 8} textAnchor="middle">
                {fmtDay(l.t)}
              </text>
            ))}
          </svg>
        </>
      )}

      {summary && (
        <div className="painel-access-summary">
          <div>
            <b>{summary.ativosHoje}</b>
            <span>hoje</span>
          </div>
          <div>
            <b>{summary.ativos7d}</b>
            <span>7 dias</span>
          </div>
          <div>
            <b>{summary.ativos30d}</b>
            <span>30 dias</span>
          </div>
          <div>
            <b>{summary.mediaDiasAtivos}</b>
            <span>média de dias ativos (30d)</span>
          </div>
          <div>
            <b>{summary.novos30d}</b>
            <span>cadastros novos (30d)</span>
          </div>
        </div>
      )}
    </div>
  );
}
