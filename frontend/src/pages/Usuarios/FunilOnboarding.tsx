import { useState } from 'react';
import type { VisaoGeral } from '../../services/admin';

type Coorte = VisaoGeral['funilPorAno'][number];
type Modo = 'barras' | 'funil';

// Funil do registro à prática, com dois estilos (barras alinhadas ou funil
// centrado estilo Power BI) e filtro por coorte de ano de cadastro.
export function FunilOnboarding({ porAno }: { porAno: VisaoGeral['funilPorAno'] }) {
  const [anoSel, setAnoSel] = useState<string>('todos');
  const [modo, setModo] = useState<Modo>('barras');
  const [hover, setHover] = useState<number | null>(null);

  const coorte: Omit<Coorte, 'ano'> =
    anoSel === 'todos'
      ? porAno.reduce(
          (acc, f) => ({
            registrados: acc.registrados + f.registrados,
            comUsername: acc.comUsername + f.comUsername,
            concluiuAula: acc.concluiuAula + f.concluiuAula,
            praticou: acc.praticou + f.praticou,
          }),
          { registrados: 0, comUsername: 0, concluiuAula: 0, praticou: 0 },
        )
      : (porAno.find((f) => f.ano === anoSel) ?? {
          registrados: 0,
          comUsername: 0,
          concluiuAula: 0,
          praticou: 0,
        });

  const etapas = [
    { label: 'Registrados', n: coorte.registrados },
    { label: 'Completaram o perfil', n: coorte.comUsername },
    { label: 'Concluíram uma aula', n: coorte.concluiuAula },
    { label: 'Praticaram', n: coorte.praticou },
  ];
  const max = etapas[0].n || 1;
  const ativo = hover != null ? etapas[hover] : null;
  const conversaoDe = (i: number) =>
    i > 0 && etapas[i - 1].n > 0 ? Math.round((etapas[i].n / etapas[i - 1].n) * 100) : null;

  return (
    <div className="painel-graf">
      <div className="painel-graf__head">
        <div className="painel-graf__titulo">Funil de onboarding</div>
        <div className="painel-graf__controles">
          <div className="painel-graf__periodos">
            {(['barras', 'funil'] as Modo[]).map((m) => (
              <button
                key={m}
                className={`painel-graf__periodo${modo === m ? ' is-ativo' : ''}`}
                onClick={() => setModo(m)}
              >
                {m === 'barras' ? 'Barras' : 'Funil'}
              </button>
            ))}
          </div>
          <div className="painel-graf__periodos">
            <button
              className={`painel-graf__periodo${anoSel === 'todos' ? ' is-ativo' : ''}`}
              onClick={() => setAnoSel('todos')}
            >
              Tudo
            </button>
            {porAno.map((f) => (
              <button
                key={f.ano}
                className={`painel-graf__periodo${anoSel === f.ano ? ' is-ativo' : ''}`}
                onClick={() => setAnoSel(f.ano)}
              >
                {f.ano}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="painel-graf__leitura">
        {ativo ? (
          <>
            <b>{ativo.n}</b> na etapa {ativo.label.toLowerCase()} ·{' '}
            {Math.round((ativo.n / max) * 100)}% do topo
            {conversaoDe(hover!) != null && <> ({conversaoDe(hover!)}% da anterior)</>}
          </>
        ) : (
          <span>
            Usuários {anoSel === 'todos' ? 'da base' : `registrados em ${anoSel}`} em cada etapa
            (praticar = desafio ou simulado)
          </span>
        )}
      </div>

      {modo === 'barras' ? (
        <div className="painel-funil">
          {etapas.map((e, i) => {
            const pct = Math.round((e.n / max) * 100);
            const conversao = conversaoDe(i);
            return (
              <div
                key={e.label}
                className="painel-funil__etapa"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                <div className="painel-funil__topo">
                  <span className="painel-funil__label">{e.label}</span>
                  <span className="painel-funil__valor">
                    {e.n} · {pct}%
                    {conversao != null && (
                      <span className="painel-funil__conv"> ({conversao}% da anterior)</span>
                    )}
                  </span>
                </div>
                <div className="painel-funil__barra">
                  <div className="painel-funil__fill" style={{ width: `${Math.max(pct, 1)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="painel-funilbi">
          {etapas.map((e, i) => {
            const pct = Math.max(Math.round((e.n / max) * 100), 3);
            const dentro = pct >= 14;
            return (
              <div
                key={e.label}
                className="painel-funilbi__linha"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                <span className="painel-funilbi__label">{e.label}</span>
                <div className="painel-funilbi__area">
                  <div className="painel-funilbi__bar" style={{ width: `${pct}%` }}>
                    {dentro && <span className="painel-funilbi__valor">{e.n}</span>}
                  </div>
                  {!dentro && <span className="painel-funilbi__valor-fora">{e.n}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
