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
  // Drill-down: cada nível guarda o conjunto que estava sendo mostrado quando o
  // usuário clicou em "Outras". Voltar é desempilhar.
  const [pilha, setPilha] = useState<{ nome: string; n: number }[][]>([]);

  const base = pilha.length ? pilha[pilha.length - 1] : dados;

  const fatias = useMemo(() => {
    const comAlunos = base.filter((d) => d.n > 0);
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
    if (total === 0) return { lista: [], total: 0, resto: [] };

    let acumulado = 0;
    const circ = 2 * Math.PI * R;
    return {
      total,
      // Guardado para o detalhamento: a fatia de agregação esconde 40 trilhas, e
      // "Outras (40)" sozinho não responde a pergunta óbvia de quais são.
      resto,
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
  }, [base]);

  const ativo = hover != null ? fatias.lista[hover] : null;

  if (fatias.total === 0) {
    return (
      <div className="painel-graf">
        <div className="painel-graf__titulo">Alunos por trilha</div>
        <p className="track__desc">Nenhuma aula concluída ainda.</p>
      </div>
    );
  }

  const nivel = pilha.length;

  return (
    <div className="painel-graf">
      <div className="painel-graf__titulo">
        {nivel > 0 ? (
          <>
            <button
              type="button"
              className="painel-graf__voltar"
              // Volta para a raiz, não um nível: o rótulo é o nome do topo, e
              // fazer ele andar um passo por clique contraria o que ele diz.
              onClick={() => {
                setPilha([]);
                setHover(null);
              }}
            >
              Alunos por trilha
            </button>
            <span className="painel-graf__crumb">
              {' / '}
              {nivel === 1 ? 'demais trilhas' : `demais trilhas, ${nivel}º nível`}
            </span>
          </>
        ) : (
          'Alunos por trilha'
        )}
      </div>
      <div className="painel-graf__leitura">
        {ativo ? (
          <>
            <b>{ativo.n}</b> alunos em {ativo.nome} ({Math.round(ativo.frac * 100)}%)
          </>
        ) : nivel > 0 ? (
          <span>As {base.length} trilhas que estavam agrupadas. Clique no título para voltar</span>
        ) : (
          <span>Alunos com aula concluída em cada trilha. Clique em Outras para abrir o resto</span>
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
              className={`painel-donut__item${f.outras ? ' painel-donut__item--clicavel' : ''}`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onClick={
                f.outras
                  ? () => {
                      setPilha((p) => [...p, fatias.resto]);
                      setHover(null);
                    }
                  : undefined
              }
              role={f.outras ? 'button' : undefined}
              tabIndex={f.outras ? 0 : undefined}
              onKeyDown={
                f.outras
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setPilha((p) => [...p, fatias.resto]);
                        setHover(null);
                      }
                    }
                  : undefined
              }
            >
              <span className="painel-donut__cor" style={{ background: f.cor }} />
              <span className="painel-donut__nome">
                {f.nome}
                {f.outras && <span className="painel-donut__dica"> abrir</span>}
              </span>
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
