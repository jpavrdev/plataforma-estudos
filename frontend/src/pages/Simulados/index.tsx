import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequisicao } from '../../hooks/useRequisicao';
import { SimTopbar } from './SimTopbar';
import { Search, Play, Info } from '../../components/Icons';
import { listarSimulados, historicoSimulados, type SimuladoResumo } from '../../services/simulados';
import { provedorDe, nomeLimpo, nivelClasse, ORDEM_PROV } from './provedores';

type Melhor = { score: number; passed: boolean };

export function Simulados() {
  const navigate = useNavigate();
  const { dados, carregando } = useRequisicao(
    () =>
      Promise.all([listarSimulados(), historicoSimulados()]).then(([exams, historico]) => ({
        exams,
        historico,
      })),
    [],
  );
  const exams = dados?.exams ?? [];
  const historico = dados?.historico ?? [];

  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<string | null>(null);

  // Melhor tentativa enviada por simulado (maior percentual).
  const melhorPorSlug = useMemo(() => {
    const m: Record<string, Melhor> = {};
    for (const t of historico) {
      if (t.submittedAt == null || t.score == null) continue;
      const atual = m[t.slug];
      if (!atual || t.score > atual.score)
        m[t.slug] = { score: t.score, passed: t.passed === true };
    }
    return m;
  }, [historico]);

  const contagem = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of exams) {
      const p = e.provider ?? 'outros';
      c[p] = (c[p] ?? 0) + 1;
    }
    return c;
  }, [exams]);

  const provedores = useMemo(
    () =>
      Object.keys(contagem).sort(
        (a, b) => (ORDEM_PROV.indexOf(a) + 1 || 99) - (ORDEM_PROV.indexOf(b) + 1 || 99),
      ),
    [contagem],
  );

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return exams.filter((e) => {
      if (filtro && (e.provider ?? 'outros') !== filtro) return false;
      if (!q) return true;
      const prov = provedorDe(e.provider).nome.toLowerCase();
      return (
        e.name.toLowerCase().includes(q) ||
        (e.code ?? '').toLowerCase().includes(q) ||
        prov.includes(q)
      );
    });
  }, [exams, busca, filtro]);

  const aprovados = useMemo(
    () => Object.values(melhorPorSlug).filter((m) => m.passed).length,
    [melhorPorSlug],
  );

  return (
    <div className="home-shell">
      <div className="home">
        <SimTopbar />
        <div className="sim">
          <div className="sim__head">
            <div>
              <h1 className="sim__title">Simulados de certificação</h1>
              <p className="sim__sub">
                Pratique com provas cronometradas no formato oficial e chegue confiante no dia do
                exame.
              </p>
            </div>
            <div className="sim__stats">
              <div className="sim-stat">
                <b>{exams.length}</b>
                <span>simulados</span>
              </div>
              <div className="sim-stat">
                <b>{provedores.length}</b>
                <span>provedores</span>
              </div>
              <div className="sim-stat">
                <b>{aprovados}</b>
                <span>aprovados</span>
              </div>
            </div>
          </div>

          {carregando ? (
            <p className="sim-empty">Carregando simulados...</p>
          ) : exams.length === 0 ? (
            <p className="sim-empty">Nenhum simulado disponível ainda.</p>
          ) : (
            <>
              <div className="sim__toolbar">
                <label className="sim__search">
                  <Search size={16} />
                  <input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar por código, nome ou provedor..."
                  />
                </label>
                <div className="sim__filters">
                  <button
                    className={`sim-pill${filtro === null ? ' sim-pill--active' : ''}`}
                    onClick={() => setFiltro(null)}
                  >
                    Todos <span className="sim-pill__n">{exams.length}</span>
                  </button>
                  {provedores.map((p) => (
                    <button
                      key={p}
                      className={`sim-pill${filtro === p ? ' sim-pill--active' : ''}`}
                      onClick={() => setFiltro(p)}
                    >
                      {provedorDe(p).label} <span className="sim-pill__n">{contagem[p]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="sim__count">
                {filtrados.length} {filtrados.length === 1 ? 'simulado' : 'simulados'}
              </div>

              {filtrados.length === 0 ? (
                <p className="sim-empty">Nenhum simulado encontrado.</p>
              ) : (
                <div className="sim__grid">
                  {filtrados.map((e) => (
                    <CardSimulado
                      key={e.slug}
                      e={e}
                      melhor={melhorPorSlug[e.slug]}
                      onAbrir={() => navigate(`/simulados/${e.slug}`)}
                    />
                  ))}
                </div>
              )}

              <div className="sim__footer">
                <span className="sim__footer-icon">
                  <Info size={18} />
                </span>
                <div>
                  <b>Provas no formato oficial, cronometradas.</b> O relógio inicia ao começar e não
                  para. Ao enviar, você recebe o percentual, a aprovação e a explicação de cada
                  questão.
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CardSimulado({
  e,
  melhor,
  onAbrir,
}: {
  e: SimuladoResumo;
  melhor?: Melhor;
  onAbrir: () => void;
}) {
  const p = provedorDe(e.provider);
  const feito = !!melhor;
  const aprovado = melhor?.passed === true;
  return (
    <div className="simc">
      <div className="simc__top">
        <span className="simc__logo" style={{ background: p.cor }}>
          {p.sigla}
        </span>
        <div className="simc__id">
          <div className="simc__vendor">{p.nome}</div>
          <div className="simc__code">{e.code ?? e.name}</div>
        </div>
        {e.level && (
          <span className={`simc__level simc__level--${nivelClasse(e.level)}`}>{e.level}</span>
        )}
      </div>
      <div className="simc__name">{nomeLimpo(e.name, e.code)}</div>
      <div className="simc__meta">
        <span>
          <b>{e.questionCount}</b> questões
        </span>
        <span>
          <b>{e.durationMinutes}</b> min
        </span>
        <span>
          <b>{e.passPercent}%</b> p/ passar
        </span>
      </div>
      <div className="simc__divider" />
      <div className="simc__status">
        {feito ? (
          <>
            <div className="simc__status-row">
              <span className={`simc__verdict simc__verdict--${aprovado ? 'ok' : 'no'}`}>
                {aprovado ? 'Aprovado' : 'Reprovado'}
              </span>
              <span className="simc__best">melhor {melhor!.score}%</span>
            </div>
            <div className="simc__bar">
              <span
                className={aprovado ? 'simc__bar--ok' : 'simc__bar--no'}
                style={{ width: `${melhor!.score}%` }}
              />
            </div>
          </>
        ) : (
          <div className="simc__notstarted">Não iniciado</div>
        )}
      </div>
      <button className={`simc__btn${feito ? ' simc__btn--redo' : ''}`} onClick={onAbrir}>
        <Play size={13} /> {feito ? 'Refazer' : 'Iniciar'}
      </button>
    </div>
  );
}
