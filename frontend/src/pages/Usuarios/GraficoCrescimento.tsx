import { useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';

interface Cadastro {
  dia: string;
  n: number;
}

const DIA = 86400000;
const PERIODOS = [
  { chave: '7d', label: '7D', dias: 7 },
  { chave: '30d', label: '30D', dias: 30 },
  { chave: '3m', label: '3M', dias: 90 },
  { chave: '6m', label: '6M', dias: 180 },
  { chave: '1a', label: '1A', dias: 365 },
  { chave: 'max', label: 'Máx', dias: Infinity },
] as const;

const W = 820;
const H = 240;
const PADL = 44;
const PADR = 14;
const PADT = 16;
const PADB = 26;

const fmtDia = (t: number) =>
  new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
const fmtCompleto = (t: number) =>
  new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

export function GraficoCrescimento({ cadastros }: { cadastros: Cadastro[] }) {
  const [periodo, setPeriodo] = useState<string>('30d');
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const grafico = useMemo(() => {
    if (cadastros.length === 0) return null;
    const ordenado = cadastros.toSorted((a, b) => a.dia.localeCompare(b.dia));
    const cumul = ordenado.reduce<{ t: number; v: number }[]>((arr, c) => {
      const v = (arr.at(-1)?.v ?? 0) + c.n;
      return [...arr, { t: new Date(`${c.dia}T00:00:00`).getTime(), v }];
    }, []);

    const agora = cumul[cumul.length - 1].t;
    const per = PERIODOS.find((p) => p.chave === periodo)!;
    const inicio = per.dias === Infinity ? cumul[0].t - DIA : agora - per.dias * DIA;

    const baseline = cumul.filter((c) => c.t < inicio).at(-1)?.v ?? 0;
    const dentro = cumul.filter((c) => c.t >= inicio);
    const serie = [{ t: inicio, v: baseline }, ...dentro];

    const t0 = serie[0].t;
    const spanT = agora - t0 || 1;
    const vmin = Math.min(...serie.map((s) => s.v));
    const vmax = Math.max(...serie.map((s) => s.v));
    const spanV = vmax - vmin || 1;

    const px = (t: number) => PADL + ((t - t0) / spanT) * (W - PADL - PADR);
    const py = (v: number) => PADT + (1 - (v - vmin) / spanV) * (H - PADT - PADB);
    const pts = serie.map((s) => ({ ...s, x: px(s.t), y: py(s.v) }));

    const linha = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const base = H - PADB;
    const ult = pts[pts.length - 1];
    const area = `${linha} L${ult.x.toFixed(1)},${base} L${pts[0].x.toFixed(1)},${base} Z`;

    const ticks = Array.from({ length: 4 }, (_, i) => {
      const v = Math.round(vmin + (spanV * i) / 3);
      return { v, y: py(v) };
    });
    const nLab = Math.min(5, Math.max(2, pts.length));
    const xlabs = Array.from({ length: nLab }, (_, i) => {
      const p = pts[Math.round((i * (pts.length - 1)) / (nLab - 1))];
      return { t: p.t, x: p.x };
    });

    return { pts, linha, area, ticks, xlabs };
  }, [cadastros, periodo]);

  function aoMover(e: ReactMouseEvent) {
    if (!svgRef.current || !grafico) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    let melhor = 0;
    let dist = Infinity;
    grafico.pts.forEach((p, i) => {
      const d = Math.abs(p.x - x);
      if (d < dist) {
        dist = d;
        melhor = i;
      }
    });
    setHover(melhor);
  }

  const ativo = hover != null && grafico ? grafico.pts[hover] : null;

  return (
    <div className="painel-graf">
      <div className="painel-graf__head">
        <div className="painel-graf__titulo">Usuários ao longo do tempo</div>
        <div className="painel-graf__periodos">
          {PERIODOS.map((p) => (
            <button
              key={p.chave}
              className={`painel-graf__periodo${periodo === p.chave ? ' is-ativo' : ''}`}
              onClick={() => setPeriodo(p.chave)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {!grafico ? (
        <p className="track__desc">Sem cadastros ainda.</p>
      ) : (
        <>
          <div className="painel-graf__leitura">
            {ativo ? (
              <>
                <b>{ativo.v}</b> usuários em {fmtCompleto(ativo.t)}
              </>
            ) : (
              <span>Passe o mouse para ver o total em cada data</span>
            )}
          </div>
          <svg
            ref={svgRef}
            className="painel-graf__svg"
            viewBox={`0 0 ${W} ${H}`}
            onMouseMove={aoMover}
            onMouseLeave={() => setHover(null)}
          >
            <defs>
              <linearGradient id="graf-crescimento" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {grafico.ticks.map((tk) => (
              <g key={tk.v}>
                <line className="painel-graf__grid" x1={PADL} y1={tk.y} x2={W - PADR} y2={tk.y} />
                <text className="painel-graf__ylab" x={PADL - 8} y={tk.y + 4} textAnchor="end">
                  {tk.v}
                </text>
              </g>
            ))}
            <path d={grafico.area} fill="url(#graf-crescimento)" />
            <path className="painel-graf__linha" d={grafico.linha} />
            {grafico.xlabs.map((l) => (
              <text className="painel-graf__xlab" key={l.t} x={l.x} y={H - 8} textAnchor="middle">
                {fmtDia(l.t)}
              </text>
            ))}
            {ativo && (
              <>
                <line
                  className="painel-graf__cross"
                  x1={ativo.x}
                  y1={PADT}
                  x2={ativo.x}
                  y2={H - PADB}
                />
                <circle className="painel-graf__dot" cx={ativo.x} cy={ativo.y} r="4" />
              </>
            )}
          </svg>
        </>
      )}
    </div>
  );
}
