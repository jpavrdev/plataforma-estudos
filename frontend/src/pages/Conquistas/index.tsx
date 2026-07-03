import { useMemo, type CSSProperties } from 'react';
import { useRequisicao } from '../../hooks/useRequisicao';
import { SimTopbar } from '../Simulados/SimTopbar';
import { BookOpen, Trophy, Lock, Check, IconeConquista } from '../../components/Icons';
import { listarTrilhas, obterMinhasConquistas } from '../../services/trails';
import { listarSimulados, historicoSimulados } from '../../services/simulados';
import { provedorDe, nomeLimpo } from '../Simulados/provedores';

// Um selo por faixa, ganho de forma cumulativa (85% acende bronze e prata).
const TIERS = [
  { key: 'bronze', label: 'Bronze', min: 70, cor: '#c0803f', faixa: '70-79%' },
  { key: 'prata', label: 'Prata', min: 80, cor: '#8b95a7', faixa: '80-89%' },
  { key: 'ouro', label: 'Ouro', min: 90, cor: '#d3a533', faixa: '90-99%' },
  { key: 'diamante', label: 'Diamante', min: 100, cor: '#3bbdf5', faixa: '100%' },
];

function corVar(cor: string): CSSProperties {
  return { ['--cor' as string]: cor } as CSSProperties;
}

export function Conquistas() {
  const { dados, carregando } = useRequisicao(
    () =>
      Promise.all([
        listarTrilhas(),
        listarSimulados(),
        historicoSimulados(),
        obterMinhasConquistas(),
      ]).then(([trilhas, simulados, historico, catalogo]) => ({
        trilhas,
        simulados,
        historico,
        catalogo,
      })),
    [],
  );
  const trilhas = dados?.trilhas ?? [];
  const simulados = dados?.simulados ?? [];
  const historico = dados?.historico ?? [];
  const catalogo = dados?.catalogo ?? [];

  const melhorPorSlug = useMemo(() => {
    const m: Record<string, number> = {};
    for (const t of historico) {
      if (t.submittedAt == null || t.score == null) continue;
      m[t.slug] = Math.max(m[t.slug] ?? 0, t.score);
    }
    return m;
  }, [historico]);

  const trilhasConcluidas = trilhas.filter((t) => t.lessons > 0 && t.done >= t.lessons).length;
  const medalhas = simulados.reduce((acc, s) => {
    const best = melhorPorSlug[s.slug] ?? 0;
    return acc + TIERS.filter((tier) => best >= tier.min).length;
  }, 0);
  const especiaisGanhas = catalogo.filter((c) => c.earned).length;
  const conquistadas = trilhasConcluidas + medalhas + especiaisGanhas;
  const total = trilhas.length + simulados.length * TIERS.length + catalogo.length;

  return (
    <div className="home-shell">
      <div className="home">
        <SimTopbar active="/conquistas" />
        <div className="conq">
          <div className="conq__head">
            <div>
              <h1 className="conq__title">Conquistas</h1>
              <p className="conq__sub">
                Colecione selos concluindo trilhas e sendo aprovado nos simulados. Quanto maior a
                nota, mais raro o selo.
              </p>
            </div>
            <div className="conq__stats">
              <div className="conq-stat">
                <b>{conquistadas}</b>
                <span>conquistadas</span>
              </div>
              <div className="conq-stat">
                <b>{total}</b>
                <span>no total</span>
              </div>
            </div>
          </div>

          {carregando ? (
            <p className="sim-empty">Carregando conquistas...</p>
          ) : (
            <>
              <div className="conq-sec">
                <span className="conq-sec__icon">
                  <BookOpen size={16} />
                </span>
                <span className="conq-sec__title">Conclusão de trilha</span>
                <span className="conq-sec__hint">selo ao completar 100% de uma trilha</span>
              </div>
              {trilhas.length === 0 ? (
                <p className="sim-empty">Nenhuma trilha disponível ainda.</p>
              ) : (
                <div className="conq-trilhas">
                  {trilhas.map((t) => {
                    const feito = t.lessons > 0 && t.done >= t.lessons;
                    const status = feito
                      ? 'Concluída'
                      : t.done === 0
                        ? 'não iniciada'
                        : `${t.done}/${t.lessons} aulas`;
                    return (
                      <div key={t.id} className="conq-badge">
                        <span
                          className={`hex${feito ? '' : ' hex--locked'}`}
                          style={feito ? corVar(t.hue) : undefined}
                        >
                          <span className="hex__in">
                            {feito ? (
                              <>
                                <small>TRILHA</small>
                                <b>{t.glyph}</b>
                              </>
                            ) : (
                              <Lock size={20} />
                            )}
                          </span>
                        </span>
                        <div className="conq-badge__name">{t.name}</div>
                        <div
                          className={`conq-badge__status${feito ? ' conq-badge__status--done' : ''}`}
                        >
                          {status}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="conq-sec">
                <span className="conq-sec__icon">
                  <Trophy size={15} />
                </span>
                <span className="conq-sec__title">Aprovação em simulado</span>
                <span className="conq-sec__hint">selo pela sua melhor nota em cada exame</span>
              </div>
              <div className="conq-legend">
                {TIERS.map((tier) => (
                  <span key={tier.key} className="conq-legend__item">
                    <span
                      className="conq-legend__dot"
                      style={{ borderColor: tier.cor, color: tier.cor }}
                    >
                      {tier.min}
                    </span>
                    <b>{tier.label}</b> {tier.faixa}
                  </span>
                ))}
              </div>
              {simulados.length === 0 ? (
                <p className="sim-empty">Nenhum simulado disponível ainda.</p>
              ) : (
                <div className="conq-sims">
                  {simulados.map((s) => {
                    const best = melhorPorSlug[s.slug] ?? 0;
                    const p = provedorDe(s.provider);
                    return (
                      <div key={s.slug} className="conq-sim">
                        <div className="conq-sim__id">
                          <span className="conq-sim__logo" style={{ background: p.cor }}>
                            {p.sigla}
                          </span>
                          <div>
                            <div className="conq-sim__code">{s.code ?? s.name}</div>
                            <div className="conq-sim__name">{nomeLimpo(s.name, s.code)}</div>
                          </div>
                        </div>
                        <div className="conq-sim__medals">
                          {TIERS.map((tier) => {
                            const ganho = best >= tier.min;
                            return (
                              <div key={tier.key} className="conq-medal">
                                <span
                                  className={`hex hex--sm${ganho ? '' : ' hex--locked'}`}
                                  style={ganho ? corVar(tier.cor) : undefined}
                                >
                                  <span className="hex__in">
                                    {ganho ? (
                                      <>
                                        <small>{p.label.toUpperCase()}</small>
                                        <b>{tier.min}%</b>
                                      </>
                                    ) : (
                                      <Lock size={15} />
                                    )}
                                  </span>
                                </span>
                                <span
                                  className={`conq-medal__label${ganho ? '' : ' conq-medal__label--off'}`}
                                >
                                  {tier.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {catalogo.length > 0 && (
                <>
                  <div className="conq-sec">
                    <span className="conq-sec__icon">
                      <IconeConquista chave="trophy" size={16} />
                    </span>
                    <span className="conq-sec__title">Conquistas especiais</span>
                    <span className="conq-sec__hint">
                      desbloqueadas pelo seu progresso de estudo
                    </span>
                  </div>
                  <div className="conq-catalog">
                    {catalogo.map((c) => (
                      <div key={c.id} className={`conq-cat${c.earned ? '' : ' conq-cat--off'}`}>
                        <span className="conq-cat__icon">
                          <IconeConquista chave={c.icon} size={22} />
                        </span>
                        <div className="conq-cat__body">
                          <div className="conq-cat__name">{c.name}</div>
                          <div className="conq-cat__desc">{c.description}</div>
                        </div>
                        {c.earned && (
                          <span className="conq-cat__check">
                            <Check size={13} />
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
