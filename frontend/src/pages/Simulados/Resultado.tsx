import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Info, BookOpen, Trophy, Target, Redo } from '../../components/Icons';
import type { TentativaEstado, QuestaoSimulado } from '../../services/simulados';

const RING = 352;
const VISIVEIS = 4;

function mesmoConjunto(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const s = new Set(a);
  return b.every((x) => s.has(x));
}
function corretasDe(q: QuestaoSimulado) {
  return q.options.filter((o) => o.isCorrect).map((o) => o.id);
}
function acertou(q: QuestaoSimulado) {
  const corretas = corretasDe(q);
  return corretas.length > 0 && mesmoConjunto(q.selected ?? [], corretas);
}
function textos(q: QuestaoSimulado, ids: string[]) {
  return q.options
    .filter((o) => ids.includes(o.id))
    .map((o) => o.text)
    .join(', ');
}
function faixa(pct: number) {
  if (pct >= 80) return { fg: 'var(--success)', label: 'Forte' };
  if (pct >= 70) return { fg: 'var(--accent)', label: 'Ok' };
  if (pct >= 55) return { fg: 'var(--amber)', label: 'Reforçar' };
  return { fg: 'var(--av-red)', label: 'Frágil' };
}
function formatarTempo(seg: number) {
  const min = Math.round(seg / 60);
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}min` : `${h}h`;
}

export function Resultado({ dados }: { dados: TentativaEstado }) {
  const navigate = useNavigate();
  const [todas, setTodas] = useState(false);
  const isPass = dados.passed === true;
  const score = dados.score ?? 0;
  const passPercent = dados.passPercent ?? 70;
  const gap = Math.max(0, passPercent - score);
  const questions = dados.questions;
  const total = questions.length;
  const acertosVisiveis = questions.filter(acertou).length;
  // Banco atualizado após a tentativa descarta respostas; a folga de 2 absorve o arredondamento.
  const acertosPelaNota = Math.round((score / 100) * total);
  const revisaoParcial = acertosPelaNota - acertosVisiveis >= 2;
  const acertos = revisaoParcial ? acertosPelaNota : acertosVisiveis;
  const erros = total - acertos;
  const erradas = questions.filter(
    (q) => !acertou(q) && (!revisaoParcial || (q.selected ?? []).length > 0),
  );
  const tempo = dados.elapsedSeconds != null ? formatarTempo(dados.elapsedSeconds) : null;

  const porTema = new Map<string, { acertos: number; total: number }>();
  for (const q of questions) {
    const tema = q.topic ?? 'Outros';
    const t = porTema.get(tema) ?? { acertos: 0, total: 0 };
    t.total++;
    if (acertou(q)) t.acertos++;
    porTema.set(tema, t);
  }
  const dominios = [...porTema.entries()]
    .map(([name, v]) => ({ name, pct: v.total ? Math.round((v.acertos / v.total) * 100) : 0 }))
    .sort((a, b) => a.pct - b.pct);
  const maisFragil = dominios[0];

  const mostradas = todas ? erradas : erradas.slice(0, VISIVEIS);
  const ringOffset = Math.round(RING * (1 - score / 100));
  const heroBg = isPass
    ? 'linear-gradient(150deg, var(--success), color-mix(in srgb, var(--success) 52%, #06371f))'
    : 'linear-gradient(150deg, #d9536b, #8a2f42)';
  const titulo = isPass ? 'Você foi aprovado!' : 'Você não foi aprovado desta vez';
  const sub = isPass
    ? 'Você passou da nota de corte. Revise os pontos abaixo pra ficar ainda mais confiante.'
    : `Você ficou a ${gap}% da aprovação. Revise os tópicos abaixo e refaça o simulado. Você está quase lá.`;

  function refazer() {
    navigate(dados.slug ? `/simulados/${dados.slug}` : '/simulados');
  }

  return (
    <div className="sim">
      <div className="res-hero" style={{ background: heroBg }}>
        <span className="res-hero__glow" />
        <div className="res-hero__inner">
          <div className="res-ring">
            <svg
              width="132"
              height="132"
              viewBox="0 0 132 132"
              style={{ transform: 'rotate(-90deg)' }}
            >
              <circle
                cx="66"
                cy="66"
                r="56"
                fill="none"
                stroke="rgba(255,255,255,.22)"
                strokeWidth="12"
              />
              <circle
                cx="66"
                cy="66"
                r="56"
                fill="none"
                stroke="#fff"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={RING}
                strokeDashoffset={ringOffset}
              />
            </svg>
            <div className="res-ring__center">
              <div className="res-ring__pct">{score}%</div>
              <div className="res-ring__cap">sua nota</div>
            </div>
          </div>

          <div className="res-hero__meta">
            <div className="res-badge">
              {isPass ? <Check size={15} /> : <X size={13} />} {isPass ? 'Aprovado' : 'Reprovado'}
            </div>
            <div className="res-hero__title">{titulo}</div>
            <div className="res-hero__sub">{sub}</div>
          </div>

          <div className="res-stats">
            <div className="res-stat">
              <div className="res-stat__v">{acertos}</div>
              <div className="res-stat__l">acertos</div>
            </div>
            <div className="res-stat">
              <div className="res-stat__v">{erros}</div>
              <div className="res-stat__l">erros</div>
            </div>
            <div className="res-stat">
              <div className="res-stat__v">{tempo ?? total}</div>
              <div className="res-stat__l">{tempo ? 'tempo' : 'questões'}</div>
            </div>
          </div>
        </div>
      </div>

      {revisaoParcial && (
        <div className="res-stale">
          <span className="res-stale__icon">
            <Info size={17} />
          </span>
          <div>
            <b>Este simulado foi atualizado depois desta tentativa.</b> As questões que mudaram não
            guardam mais a resposta que você marcou, então a revisão abaixo está incompleta. Sua
            nota de {score}% foi calculada no envio e continua valendo.
          </div>
        </div>
      )}

      <div className="res-grid">
        <div className="sim__col">
          {!revisaoParcial && (
            <div className="card">
              <div className="res-sec__title">Desempenho por domínio</div>
              <div className="res-sec__sub">Veja onde você mandou bem e onde precisa reforçar.</div>
              <div className="res-domains">
                {dominios.map((d) => {
                  const c = faixa(d.pct);
                  return (
                    <div key={d.name}>
                      <div className="res-domain__row">
                        <span className="res-domain__name">{d.name}</span>
                        <span
                          className="res-domain__tag"
                          style={{
                            color: c.fg,
                            background: `color-mix(in srgb, ${c.fg} 12%, transparent)`,
                          }}
                        >
                          {c.label}
                        </span>
                        <span className="res-domain__pct" style={{ color: c.fg }}>
                          {d.pct}%
                        </span>
                      </div>
                      <div className="res-domain__track">
                        <span style={{ width: `${d.pct}%`, background: c.fg }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {erradas.length > 0 && (
            <div className="card">
              <div className="res-review__head">
                <div className="res-sec__title">Onde você errou</div>
                <div className="topbar__spacer" />
                <span className="res-review__count">{erradas.length} questões erradas</span>
              </div>
              <div className="res-sec__sub">
                Estude estes tópicos com atenção: foram os que mais pesaram na sua nota.
              </div>
              <div className="res-wrongs">
                {mostradas.map((q) => (
                  <div key={q.id} className="res-wrong">
                    <div className="res-wrong__meta">
                      <span className="res-wrong__q">Q{q.position}</span>
                      {q.topic && <span className="res-wrong__domain">{q.topic}</span>}
                    </div>
                    <div className="res-wrong__text">{q.statement}</div>
                    <div className="res-wrong__answers">
                      <div className="res-ans res-ans--wrong">
                        <span className="res-ans__icon res-ans__icon--wrong">
                          <X size={12} />
                        </span>
                        <span className="res-ans__label">Sua resposta:</span>
                        <span className="res-ans__val res-ans__val--wrong">
                          {textos(q, q.selected ?? []) || 'em branco'}
                        </span>
                      </div>
                      <div className="res-ans res-ans--right">
                        <span className="res-ans__icon res-ans__icon--right">
                          <Check size={12} />
                        </span>
                        <span className="res-ans__label">Correta:</span>
                        <span className="res-ans__val res-ans__val--right">
                          {textos(q, corretasDe(q))}
                        </span>
                      </div>
                    </div>
                    {q.explanation && (
                      <div className="res-why">
                        <span className="res-why__icon">
                          <Info size={17} />
                        </span>
                        <div>
                          <b>Por que você errou:</b> {q.explanation}
                        </div>
                      </div>
                    )}
                    {q.topic && (
                      <div className="res-study">
                        <span className="res-study__label">Estude:</span>
                        <span className="res-study__chip">
                          <BookOpen size={12} /> {q.topic}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {erradas.length > VISIVEIS && (
                <button className="res-more" onClick={() => setTodas((v) => !v)}>
                  {todas ? 'Mostrar menos' : `Ver todas as ${erradas.length} questões erradas`}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="sim__col">
          <div className="card">
            <div className="res-plan__title">Seu plano de estudo</div>
            <div className="res-plan__sub">
              {isPass
                ? 'Mandou bem. Revise os poucos erros e siga treinando pra manter o nível.'
                : 'Faltou pouco. Foque nestes tópicos e tente de novo em alguns dias.'}
            </div>
            <div className="res-plan">
              {!revisaoParcial && maisFragil && (
                <div className="res-plan-item">
                  <span className="res-plan-item__icon">
                    <BookOpen size={16} />
                  </span>
                  <div>
                    <div className="res-plan-item__t">Estude pelas trilhas</div>
                    <div className="res-plan-item__s">
                      Comece pelo tema mais frágil: {maisFragil.name} ({maisFragil.pct}%)
                    </div>
                  </div>
                </div>
              )}
              <div className="res-plan-item">
                <span className="res-plan-item__icon">
                  <Info size={16} />
                </span>
                <div>
                  <div className="res-plan-item__t">Revise cada questão errada</div>
                  <div className="res-plan-item__s">
                    Leia a explicação e o assunto indicado de cada uma.
                  </div>
                </div>
              </div>
              <div className="res-plan-item">
                <span className="res-plan-item__icon">
                  <Redo size={16} />
                </span>
                <div>
                  <div className="res-plan-item__t">Refaça o simulado</div>
                  <div className="res-plan-item__s">Meça sua evolução daqui a alguns dias.</div>
                </div>
              </div>
            </div>
            <button className="btn btn--accent res-plan__redo" onClick={() => navigate('/trilhas')}>
              <BookOpen size={16} /> Começar plano de estudo
            </button>
            <button className="res-plan__ghost" onClick={refazer}>
              <Redo size={16} /> Refazer simulado
            </button>
          </div>

          <div className={`res-seal res-seal--${isPass ? 'pass' : 'fail'}`}>
            <span className="res-seal__icon">
              {isPass ? <Trophy size={26} /> : <Target size={26} />}
            </span>
            <div>
              <div className="res-seal__t">{isPass ? 'Aprovado!' : 'Continue tentando'}</div>
              <div className="res-seal__s">
                {isPass
                  ? 'Seu desempenho está no nível de aprovação.'
                  : `Faltam ${gap}% para a aprovação.`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
