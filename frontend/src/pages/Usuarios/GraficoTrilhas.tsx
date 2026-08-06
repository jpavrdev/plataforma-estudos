import { useMemo, useState } from 'react';

// Donut de alunos por trilha: top 5 + "Outras" (paleta categórica fixa validada;
// a fatia de agregação é sempre neutra). Identidade vem da legenda, não só da cor.
const CORES = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)', 'var(--viz-4)', 'var(--viz-5)'];
const COR_OUTRAS = 'var(--muted)';

const TAM = 220;
const R = 82;
const ESPESSURA = 30;
const CENTRO = TAM / 2;

interface Props {
  dados: { nome: string; n: number }[];
}

export function GraficoTrilhas({ dados }: Props) {
  const [hover, setHover] = useState<number | null>(null);

  const fatias = useMemo(() => {
    const comAlunos = dados.filter((d) => d.n > 0);
    const top = comAlunos.slice(0, 5);
    const resto = comAlunos.slice(5);
    const outras = resto.reduce((s, d) => s + d.n, 0);
    const lista = [
      ...top.map((d, i) => ({ nome: d.nome, n: d.n, cor: CORES[i], outras: false })),
      ...(outras > 0
        ? [{ nome: `Outras (${resto.length})`, n: outras, cor: COR_OUTRAS, outras: true }]
        : []),
    ];
    const total = lista.reduce((s, d) => s + d.n, 0);
    if (total === 0) return { lista: [], total: 0 };

    let acumulado = 0;
    const circ = 2 * Math.PI * R;
    return {
      total,
      lista: lista.map((d) => {
        const frac = d.n / total;
        const seg = {
          ...d,
          frac,
          dash: `${Math.max(frac * circ - 2, 0.5)} ${circ}`,
          offset: -acumulado * circ,
        };
        acumulado += frac;
        return seg;
      }),
    };
  }, [dados]);

  const ativo = hover != null ? fatias.lista[hover] : null;

  if (fatias.total === 0) {
    return (
      <div className="painel-graf">
        <div className="painel-graf__titulo">Alunos por trilha</div>
        <p className="track__desc">Nenhuma aula concluída ainda.</p>
      </div>
    );
  }

  return (
    <div className="painel-graf">
      <div className="painel-graf__titulo">Alunos por trilha</div>
      <div className="painel-graf__leitura">
        {ativo ? (
          <>
            <b>{ativo.n}</b> alunos em {ativo.nome} ({Math.round(ativo.frac * 100)}%)
          </>
        ) : (
          <span>Alunos com aula concluída em cada trilha (quem estuda duas conta nas duas)</span>
        )}
      </div>
      <div className="painel-donut">
        <svg viewBox={`0 0 ${TAM} ${TAM}`} className="painel-donut__svg">
          {fatias.lista.map((f, i) => (
            <circle
              key={f.nome}
              className={`painel-donut__fatia${hover != null && hover !== i ? ' is-apagada' : ''}`}
              cx={CENTRO}
              cy={CENTRO}
              r={R}
              fill="none"
              stroke={f.cor}
              strokeWidth={ESPESSURA}
              strokeDasharray={f.dash}
              strokeDashoffset={f.offset}
              transform={`rotate(-90 ${CENTRO} ${CENTRO})`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          ))}
          <text className="painel-donut__num" x={CENTRO} y={CENTRO - 4} textAnchor="middle">
            {fatias.total}
          </text>
          <text className="painel-donut__sub" x={CENTRO} y={CENTRO + 16} textAnchor="middle">
            participações
          </text>
        </svg>
        <ul className="painel-donut__legenda">
          {fatias.lista.map((f, i) => (
            <li
              key={f.nome}
              className="painel-donut__item"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <span className="painel-donut__cor" style={{ background: f.cor }} />
              <span className="painel-donut__nome">{f.nome}</span>
              <span className="painel-donut__valor">
                {f.n} · {Math.round(f.frac * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
