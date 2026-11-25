import { useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import type { Acessos } from '../../services/admin';

const PERIODOS = [
  { chave: '7d', label: '7D', dias: 7 },
  { chave: '30d', label: '30D', dias: 30 },
  { chave: '3m', label: '3M', dias: 90 },
  { chave: '6m', label: '6M', dias: 180 },
] as const;

const W = 1240;
const H = 260;
const PADL = 44;
const PADR = 14;
const PADT = 16;
const PADB = 26;

const fmtDia = (t: number) =>
  new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
const fmtCompleto = (t: number) =>
  new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

// People per day over the visit log: how many came back, and how often. The
// empty days show up as zero on purpose, they are part of the retention story.
export function GraficoAcessos({ acessos }: { acessos: Acessos | null }) {
  const [periodo, setPeriodo] = useState<string>('30d');
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const grafico = useMemo(() => {
    if (!acessos || acessos.serie.length === 0) return null;
    const per = PERIODOS.find((p) => p.chave === periodo)!;
    const dentro = acessos.serie.slice(-per.dias);
    const vmax = Math.max(1, ...dentro.map((d) => d.pessoas));
    const py = (v: number) => PADT + (1 - v / vmax) * (H - PADT - PADB);
    const plotW = W - PADL - PADR;
    const passo = plotW / dentro.length;
    const largura = Math.max(3, Math.min(34, passo * 0.62));
    const barras = dentro.map((d, i) => {
      const x = PADL + i * passo + (passo - largura) / 2;
      const y = py(d.pessoas);
      return { ...d, t: new Date(`${d.dia}T00:00:00`).getTime(), x, y, h: H - PADB - y };
    });
    // Few distinct counts (1 person/day) would repeat tick values; the scale
    // shrinks to 0..vmax so the baseline label shows up too.
    const nTicks = vmax <= 2 ? vmax + 1 : 4;
    const ticks = Array.from({ length: nTicks }, (_, i) => {
      const v = Math.round((vmax * i) / (nTicks - 1));
      return { v, y: py(v) };
    });
    const nLab = Math.min(6, Math.max(2, barras.length));
    const xlabs = Array.from({ length: nLab }, (_, i) => barras[Math.round((i * (barras.length - 1)) / (nLab - 1))]);
    return { barras, ticks, xlabs };
  }, [acessos, periodo]);

  function aoMover(e: ReactMouseEvent) {
    if (!svgRef.current || !grafico) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    let melhor = 0;
    let dist = Infinity;
    grafico.barras.forEach((b, i) => {
      const centro = b.x + (b.h >= 0 ? 8 : 0);
      const d = Math.abs(centro - x);
      if (d < dist) {
        dist = d;
        melhor = i;
      }
    });
    setHover(melhor);
  }

  const ativo = hover != null && grafico ? grafico.barras[hover] : null;
  const r = acessos?.resumo;

  return (
    <div className="painel-graf">
      <div className="painel-graf__head">
        <div className="painel-graf__titulo">Acessos por dia</div>
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
        <p className="track__desc">
          Sem registros de acesso ainda; o gráfico começa a desenhar a partir do deploy do painel.
        </p>
      ) : (
        <>
          <div className="painel-graf__leitura">
            {ativo ? (
              <>
                <b>{ativo.pessoas}</b> {ativo.pessoas === 1 ? 'pessoa' : 'pessoas'} em{' '}
                {fmtCompleto(ativo.t)} · {ativo.visitas} {ativo.visitas === 1 ? 'visita' : 'visitas'}
              </>
            ) : (
              <span>Passe o mouse para ver quem acessou em cada dia</span>
            )}
          </div>
          <svg
            ref={svgRef}
            className="painel-graf__svg"
            viewBox={`0 0 ${W} ${H}`}
            onMouseMove={aoMover}
            onMouseLeave={() => setHover(null)}
          >
            {grafico.ticks.map((tk, i) => (
              <g key={`t${i}`}>
                <line className="painel-graf__grid" x1={PADL} y1={tk.y} x2={W - PADR} y2={tk.y} />
                <text className="painel-graf__ylab" x={PADL - 8} y={tk.y + 4} textAnchor="end">
                  {tk.v}
                </text>
              </g>
            ))}
            {grafico.barras.map((b, i) => (
              <rect
                key={b.dia}
                className={`painel-graf__barra${hover === i ? ' is-ativa' : ''}`}
                x={b.x}
                y={b.y}
                width={Math.max(3, Math.min(34, (W - PADL - PADR) / grafico.barras.length * 0.62))}
                height={b.h}
              />
            ))}
            {grafico.xlabs.map((l) => (
              <text className="painel-graf__xlab" key={l.dia} x={l.x + 8} y={H - 8} textAnchor="middle">
                {fmtDia(l.t)}
              </text>
            ))}
          </svg>
        </>
      )}

      {r && (
        <div className="painel-acessos-resumo">
          <div>
            <b>{r.ativosHoje}</b>
            <span>hoje</span>
          </div>
          <div>
            <b>{r.ativos7d}</b>
            <span>7 dias</span>
          </div>
          <div>
            <b>{r.ativos30d}</b>
            <span>30 dias</span>
          </div>
          <div>
            <b>{r.mediaDiasAtivos}</b>
            <span>média de dias ativos (30d)</span>
          </div>
          <div>
            <b>{r.novos30d}</b>
            <span>cadastros novos (30d)</span>
          </div>
        </div>
      )}
    </div>
  );
}
