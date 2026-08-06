import { useMemo, useState } from 'react';

// Registros novos por mês: barras de uma série só (a cor é fixa; o mês identifica).
const W = 1240;
const H = 220;
const PADL = 48;
const PADR = 14;
const PADT = 18;
const PADB = 30;

const fmtMes = (chave: string) => {
  const [ano, mes] = chave.split('-').map(Number);
  const nome = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'short' });
  return nome.replace('.', '');
};

export function GraficoMensal({ cadastros }: { cadastros: { dia: string; n: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const [anoSel, setAnoSel] = useState<string | null>(null);

  const { anos, porMes } = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const c of cadastros) {
      const chave = c.dia.slice(0, 7);
      mapa.set(chave, (mapa.get(chave) ?? 0) + c.n);
    }
    const todos = [...mapa.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([chave, n]) => ({ chave, n }));
    return { anos: [...new Set(todos.map((m) => m.chave.slice(0, 4)))], porMes: todos };
  }, [cadastros]);

  const ano = anoSel ?? anos.at(-1) ?? '';
  const meses = porMes.filter((m) => m.chave.startsWith(ano));

  if (porMes.length === 0) return null;

  const max = Math.max(...meses.map((m) => m.n));
  const areaW = W - PADL - PADR;
  const areaH = H - PADT - PADB;
  const passo = areaW / meses.length;
  const larg = Math.min(72, passo * 0.6);
  const py = (v: number) => PADT + (1 - v / max) * areaH;

  const ticks = Array.from({ length: 3 }, (_, i) => Math.round((max * (i + 1)) / 3));
  const ativo = hover != null ? meses[hover] : null;

  return (
    <div className="painel-graf">
      <div className="painel-graf__head">
        <div className="painel-graf__titulo">Registros por mês</div>
        <div className="painel-graf__periodos">
          {anos.map((a) => (
            <button
              key={a}
              className={`painel-graf__periodo${a === ano ? ' is-ativo' : ''}`}
              onClick={() => {
                setAnoSel(a);
                setHover(null);
              }}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
      <div className="painel-graf__leitura">
        {ativo ? (
          <>
            <b>{ativo.n}</b> novos usuários em {fmtMes(ativo.chave)} de {ano}
          </>
        ) : (
          <span>Quantos usuários novos entraram em cada mês de {ano}</span>
        )}
      </div>
      <svg className="painel-graf__svg" viewBox={`0 0 ${W} ${H}`} onMouseLeave={() => setHover(null)}>
        {ticks.map((v) => (
          <g key={v}>
            <line className="painel-graf__grid" x1={PADL} y1={py(v)} x2={W - PADR} y2={py(v)} />
            <text className="painel-graf__ylab" x={PADL - 8} y={py(v) + 4} textAnchor="end">
              {v}
            </text>
          </g>
        ))}
        {meses.map((m, i) => {
          const x = PADL + i * passo + (passo - larg) / 2;
          const y = py(m.n);
          const alturaBarra = H - PADB - y;
          return (
            <g key={m.chave} onMouseEnter={() => setHover(i)}>
              <rect
                x={PADL + i * passo}
                y={PADT}
                width={passo}
                height={areaH}
                fill="transparent"
              />
              <rect
                className={`painel-barra${hover != null && hover !== i ? ' is-apagada' : ''}`}
                x={x}
                y={y}
                width={larg}
                height={Math.max(alturaBarra, 2)}
                rx="4"
              />
              <text className="painel-barra__valor" x={x + larg / 2} y={y - 6} textAnchor="middle">
                {m.n}
              </text>
              <text className="painel-graf__xlab" x={x + larg / 2} y={H - 8} textAnchor="middle">
                {fmtMes(m.chave)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
