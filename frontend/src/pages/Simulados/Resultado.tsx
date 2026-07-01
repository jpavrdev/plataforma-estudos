import { useNavigate } from 'react-router-dom';
import { Check, X, Info, BookOpen, Trophy, Target, Redo } from '../../components/Icons';
import type { TentativaEstado, QuestaoSimulado } from '../../services/simulados';

const RING = 352;

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

export function Resultado({ dados }: { dados: TentativaEstado }) {
  const navigate = useNavigate();
  const isPass = dados.passed === true;
  const score = dados.score ?? 0;
  const questions = dados.questions;
  const total = questions.length;
  const acertos = questions.filter(acertou).length;
  const erros = total - acertos;
  const erradas = questions.filter((q) => !acertou(q));
  const temas = dados.temasARevisar ?? [];

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

  const ringOffset = Math.round(RING * (1 - score / 100));
  const heroBg = isPass
    ? 'linear-gradient(150deg, var(--success), color-mix(in srgb, var(--success) 52%, #06371f))'
    : 'linear-gradient(150deg, #d9536b, #8a2f42)';
  const titulo = isPass ? 'Aprovado! Mandou bem.' : 'Quase lá.';
  const sub = isPass
    ? 'Você atingiu a nota de corte. Revise os pontos abaixo pra chegar ainda mais confiante.'
    : 'Faltou pouco pra nota de corte. Reforce os temas abaixo e tente de novo.';

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
              <div className="res-stat__v">{total}</div>
              <div className="res-stat__l">questões</div>
            </div>
          </div>
        </div>
      </div>

      <div className="sim__grid">
        <div className="sim__col">
          <div className="card">
            <div className="res-sec__title">Desempenho por tema</div>
            <div className="res-sec__sub">Veja onde você foi bem e onde precisa reforçar.</div>
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

          {erradas.length > 0 && (
            <div className="card">
              <div className="res-review__head">
                <div className="res-sec__title">Revise o que você errou</div>
                <div className="topbar__spacer" />
                <span className="res-review__count">{erros} erradas</span>
              </div>
              <div className="res-sec__sub">
                Confira a resposta certa, o porquê e o assunto de cada questão.
              </div>
              <div className="res-wrongs">
                {erradas.map((q) => (
                  <div key={q.id} className="res-wrong">
                    <div className="res-wrong__meta">
                      <span className="res-wrong__q">Questão {q.position}</span>
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
                          <b>Por quê:</b> {q.explanation}
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
            </div>
          )}
        </div>

        <div className="sim__col">
          <div className="card">
            <div className="res-plan__title">Temas para revisar</div>
            <div className="res-plan__sub">
              {temas.length > 0
                ? 'Priorize os assuntos onde você mais errou.'
                : 'Você não errou nenhum tema. Excelente!'}
            </div>
            {temas.length > 0 && (
              <div className="res-plan">
                {temas.map((t) => (
                  <div key={t.topic} className="res-plan-item">
                    <span className="res-plan-item__icon">
                      <BookOpen size={16} />
                    </span>
                    <div>
                      <div className="res-plan-item__t">{t.topic}</div>
                      <div className="res-plan-item__s">
                        {t.erradas} de {t.total} erradas
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              className="btn btn--accent res-plan__redo"
              onClick={() => navigate('/simulados')}
            >
              <Redo size={16} /> Refazer simulado
            </button>
          </div>

          <div className={`res-seal res-seal--${isPass ? 'pass' : 'fail'}`}>
            <span className="res-seal__icon">
              {isPass ? <Trophy size={26} /> : <Target size={26} />}
            </span>
            <div>
              <div className="res-seal__t">
                {isPass ? 'Pronto pra prova' : 'Continue treinando'}
              </div>
              <div className="res-seal__s">
                {isPass
                  ? 'Seu desempenho está no nível de aprovação.'
                  : 'Cada tentativa te deixa mais perto.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
