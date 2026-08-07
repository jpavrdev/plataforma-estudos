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
  // Mês aberto no detalhamento por dia. O dado diário já chega neste componente,
  // que apenas o agregava por mês, então descer ao dia não custa requisição nova.
  const [mesAberto, setMesAberto] = useState<string | null>(null);

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

  // No detalhamento, a série passa a ser os dias do mês escolhido. Dias sem
  // cadastro entram com zero: sem isso o gráfico mente sobre a distribuição,
  // encostando dias distantes como se fossem consecutivos.
  const dias = mesAberto
    ? (() => {
        const [a, m] = mesAberto.split('-').map(Number);
        const qtd = new Date(a, m, 0).getDate();
        const mapa = new Map(cadastros.map((c) => [c.dia, c.n]));
        return Array.from({ length: qtd }, (_, i) => {
          const chave = `${mesAberto}-${String(i + 1).padStart(2, '0')}`;
          return { chave, n: mapa.get(chave) ?? 0 };
        });
      })()
    : null;

  const serie = dias ?? meses;

  if (porMes.length === 0) return null;

  const max = Math.max(...serie.map((m) => m.n), 1);
  const areaW = W - PADL - PADR;
  const areaH = H - PADT - PADB;
  const passo = areaW / serie.length;
  const larg = Math.min(72, passo * 0.6);
  const py = (v: number) => PADT + (1 - v / max) * areaH;

  const ticks = Array.from({ length: 3 }, (_, i) => Math.round((max * (i + 1)) / 3));
  const ativo = hover != null ? serie[hover] : null;

  return (
    <div className="painel-graf">
      <div className="painel-graf__head">
        <div className="painel-graf__titulo">
          {mesAberto ? (
            <>
              <button
                type="button"
                className="painel-graf__voltar"
                onClick={() => {
                  setMesAberto(null);
                  setHover(null);
                }}
              >
                Registros por mês
              </button>
              <span className="painel-graf__crumb">
                {' '}
                / {fmtMes(mesAberto)} de {ano}, por dia
              </span>
            </>
          ) : (
            'Registros por mês'
          )}
        </div>
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
          mesAberto ? (
            <>
              <b>{ativo.n}</b> {ativo.n === 1 ? 'novo usuário' : 'novos usuários'} em{' '}
              {Number(ativo.chave.slice(-2))} de {fmtMes(mesAberto)}
            </>
          ) : (
            <>
              <b>{ativo.n}</b> novos usuários em {fmtMes(ativo.chave)} de {ano}
            </>
          )
        ) : mesAberto ? (
          <span>
            Dia a dia de {fmtMes(mesAberto)} de {ano}. Clique no título para voltar
          </span>
        ) : (
          <span>
            Quantos usuários novos entraram em cada mês de {ano}. Clique num mês para ver por dia
          </span>
        )}
      </div>
      <svg
        className="painel-graf__svg"
        viewBox={`0 0 ${W} ${H}`}
        onMouseLeave={() => setHover(null)}
      >
        {ticks.map((v) => (
          <g key={v}>
            <line className="painel-graf__grid" x1={PADL} y1={py(v)} x2={W - PADR} y2={py(v)} />
            <text className="painel-graf__ylab" x={PADL - 8} y={py(v) + 4} textAnchor="end">
              {v}
            </text>
          </g>
        ))}
        {serie.map((m, i) => {
          const x = PADL + i * passo + (passo - larg) / 2;
          const y = py(m.n);
          const alturaBarra = H - PADB - y;
          return (
            <g
              key={m.chave}
              onMouseEnter={() => setHover(i)}
              className={!mesAberto ? 'painel-barra__grupo--clicavel' : undefined}
              onClick={
                mesAberto
                  ? undefined
                  : () => {
                      setMesAberto(m.chave);
                      setHover(null);
                    }
              }
            >
              <rect x={PADL + i * passo} y={PADT} width={passo} height={areaH} fill="transparent" />
              <rect
                className={`painel-barra${hover != null && hover !== i ? ' is-apagada' : ''}`}
                x={x}
                y={y}
                width={larg}
                height={Math.max(alturaBarra, 2)}
                rx="4"
              />
              {(!mesAberto || m.n > 0) && (
                <text
                  className="painel-barra__valor"
                  x={x + larg / 2}
                  y={y - 6}
                  textAnchor="middle"
                >
                  {m.n}
                </text>
              )}
              {/* No detalhamento são até 31 barras: rotular todas vira borrão, então
                  só os múltiplos de 5 e o primeiro dia ganham rótulo. */}
              {(!mesAberto || i === 0 || (i + 1) % 5 === 0) && (
                <text className="painel-graf__xlab" x={x + larg / 2} y={H - 8} textAnchor="middle">
                  {mesAberto ? Number(m.chave.slice(-2)) : fmtMes(m.chave)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
