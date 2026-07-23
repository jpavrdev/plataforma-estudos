import { useEffect, useMemo, useState } from 'react';
import { EstudioTopbar } from '../../components/EstudioTopbar';
import { adminAssinaturas, type AssinaturasAdminData } from '../../services/apoio';

type Granularidade = 'dia' | 'semana' | 'mes';

const MESES_ABREV = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function nomeDoMes(chave: string) {
  const [ano, mes] = chave.split('-').map(Number);
  return `${MESES_ABREV[mes - 1]} de ${ano}`;
}

// Monta as barras do gráfico a partir da série diária, conforme o recorte pedido.
function montarSerie(
  porDia: { d: string; cents: number }[],
  gran: Granularidade,
  mesSel: string,
): { label: string; cents: number; titulo: string }[] {
  const mapa = new Map(porDia.map((p) => [p.d, p.cents]));
  if (gran === 'mes') {
    const agora = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(agora.getFullYear(), agora.getMonth() - 11 + i, 1);
      const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const cents = porDia
        .filter((p) => p.d.startsWith(chave))
        .reduce((s, p) => s + p.cents, 0);
      return { label: MESES_ABREV[d.getMonth()], cents, titulo: nomeDoMes(chave) };
    });
  }
  const [ano, mes] = mesSel.split('-').map(Number);
  const ultimoDia = new Date(ano, mes, 0).getDate();
  if (gran === 'dia') {
    return Array.from({ length: ultimoDia }, (_, i) => {
      const dia = i + 1;
      const chave = `${mesSel}-${String(dia).padStart(2, '0')}`;
      return {
        label: dia === 1 || dia % 5 === 0 ? String(dia) : '',
        cents: mapa.get(chave) ?? 0,
        titulo: `dia ${dia}`,
      };
    });
  }
  const semanas = [
    [1, 7],
    [8, 14],
    [15, 21],
    [22, 28],
    [29, 31],
  ].filter(([ini]) => ini <= ultimoDia);
  return semanas.map(([ini, fim], i) => {
    const ate = Math.min(fim, ultimoDia);
    let cents = 0;
    for (let dia = ini; dia <= ate; dia++) {
      cents += mapa.get(`${mesSel}-${String(dia).padStart(2, '0')}`) ?? 0;
    }
    return { label: `S${i + 1}`, cents, titulo: `dias ${ini} a ${ate}` };
  });
}

const PLANO: Record<string, string> = {
  mensal: 'Mensal',
  anual: 'Anual',
  pix_auto: 'Pix Automático',
};

const STATUS: Record<string, string> = {
  pendente: 'Pendente',
  ativa: 'Ativa',
  cancelada: 'Cancelada',
};

function dinheiro(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function dataBr(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString('pt-BR') : '-';
}

export function AssinaturasAdmin() {
  const [dados, setDados] = useState<AssinaturasAdminData | null>(null);
  const [erro, setErro] = useState('');
  const [gran, setGran] = useState<Granularidade>('dia');
  const [mesSel, setMesSel] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    adminAssinaturas()
      .then(setDados)
      .catch(() => setErro('Não foi possível carregar as assinaturas.'));
  }, []);

  const mesesDisponiveis = useMemo(() => {
    const atual = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const meses = new Set<string>([atual]);
    for (const p of dados?.porDia ?? []) meses.add(p.d.slice(0, 7));
    return [...meses].sort().reverse();
  }, [dados]);

  const serie = useMemo(
    () => (dados ? montarSerie(dados.porDia, gran, mesSel) : []),
    [dados, gran, mesSel],
  );
  const maxSerie = Math.max(1, ...serie.map((s) => s.cents));
  const totalSerie = serie.reduce((s, b) => s + b.cents, 0);

  return (
    <div className="home">
      <EstudioTopbar crumb={<b>Assinaturas</b>} />

      <div className="estudio-home estudio-home--larga">
        <div className="estudio-home__head">
          <div>
            <h1 className="estudio-home__title">Assinaturas</h1>
            <p className="estudio-home__sub">
              Apoiadores, períodos e o que entrou por dia, semana e mês.
            </p>
          </div>
        </div>

        {erro && <div className="auth__alert">{erro}</div>}
        {!dados && !erro && <p className="track__desc">Carregando...</p>}

        {dados && (
          <>
            <div className="assin-stats">
              <div className="card prg-stat">
                <div className="prg-stat__valor">{dinheiro(dados.totais.hojeCents)}</div>
                <div className="prg-stat__label">recebido hoje</div>
              </div>
              <div className="card prg-stat">
                <div className="prg-stat__valor">{dinheiro(dados.totais.semanaCents)}</div>
                <div className="prg-stat__label">últimos 7 dias</div>
              </div>
              <div className="card prg-stat">
                <div className="prg-stat__valor">{dinheiro(dados.totais.mesCents)}</div>
                <div className="prg-stat__label">últimos 30 dias</div>
              </div>
              <div className="card prg-stat">
                <div className="prg-stat__valor">{dinheiro(dados.totais.totalCents)}</div>
                <div className="prg-stat__label">
                  total ({dados.totais.pagamentos}{' '}
                  {dados.totais.pagamentos === 1 ? 'pagamento' : 'pagamentos'})
                </div>
              </div>
              <div className="card prg-stat">
                <div className="prg-stat__valor">{dados.totais.apoiadoresAtivos}</div>
                <div className="prg-stat__label">
                  {dados.totais.apoiadoresAtivos === 1 ? 'apoiador ativo' : 'apoiadores ativos'}
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 18 }}>
              <div className="assin-graf__head">
                <div>
                  <div className="prg-card__title">Recebimentos</div>
                  <div className="prg-card__sub">
                    {gran === 'mes' ? 'últimos 12 meses' : nomeDoMes(mesSel)}
                  </div>
                </div>
                <div className="assin-graf__controles">
                  {gran !== 'mes' && (
                    <select
                      className="assin-select"
                      value={mesSel}
                      onChange={(e) => setMesSel(e.target.value)}
                    >
                      {mesesDisponiveis.map((m) => (
                        <option key={m} value={m}>
                          {nomeDoMes(m)}
                        </option>
                      ))}
                    </select>
                  )}
                  <div className="prg-periodos">
                    {(
                      [
                        ['dia', 'Dia'],
                        ['semana', 'Semana'],
                        ['mes', 'Mês'],
                      ] as [Granularidade, string][]
                    ).map(([valor, label]) => (
                      <button
                        key={valor}
                        className={`prg-periodo${gran === valor ? ' prg-periodo--on' : ''}`}
                        onClick={() => setGran(valor)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="prg-chart__total">
                  <div className="prg-chart__num">{dinheiro(totalSerie)}</div>
                  <div className="prg-card__sub">no período</div>
                </div>
              </div>
              <div className="prg-bars" style={{ height: 210 }}>
                {serie.map((b, i) => (
                  <div key={i} className="prg-bar" title={`${dinheiro(b.cents)} em ${b.titulo}`}>
                    <div
                      className={`prg-bar__fill${b.cents > 0 ? ' prg-bar__fill--on' : ''}`}
                      style={{ height: `${Math.round((b.cents / maxSerie) * 100)}%` }}
                    />
                    <span className="prg-bar__label">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="prg-card__title prg-card__title--mb">Assinaturas</div>
              {dados.assinaturas.length === 0 ? (
                <p className="track__desc">Nenhuma assinatura ainda.</p>
              ) : (
                <div className="assin-tabela-wrap">
                  <table className="assin-tabela">
                    <thead>
                      <tr>
                        <th>Usuário</th>
                        <th>Plano</th>
                        <th>Status</th>
                        <th>Início</th>
                        <th>Fim</th>
                        <th>Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dados.assinaturas.map((a) => (
                        <tr key={a.id}>
                          <td>
                            <b>{a.name}</b>
                            <span className="assin-email">
                              {a.username ? `@${a.username}` : a.email}
                            </span>
                          </td>
                          <td>{PLANO[a.plan] ?? a.plan}</td>
                          <td>
                            <span className={`assin-status assin-status--${a.status}`}>
                              {STATUS[a.status] ?? a.status}
                            </span>
                          </td>
                          <td>{dataBr(a.paidAt)}</td>
                          <td>{dataBr(a.expiresAt)}</td>
                          <td>{dinheiro(a.amountCents)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
