import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
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
type RangeKey =
  | 'simulados.resultado.rangeStrong'
  | 'simulados.resultado.rangeOk'
  | 'simulados.resultado.rangeReinforce'
  | 'simulados.resultado.rangeFragile';

function faixa(pct: number): { fg: string; chave: RangeKey } {
  if (pct >= 80) return { fg: 'var(--success)', chave: 'simulados.resultado.rangeStrong' };
  if (pct >= 70) return { fg: 'var(--accent)', chave: 'simulados.resultado.rangeOk' };
  if (pct >= 55) return { fg: 'var(--amber)', chave: 'simulados.resultado.rangeReinforce' };
  return { fg: 'var(--av-red)', chave: 'simulados.resultado.rangeFragile' };
}
function formatarTempo(seg: number) {
  const min = Math.round(seg / 60);
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}min` : `${h}h`;
}

type Aba = 'erradas' | 'certas' | 'todas';
type AbaTituloKey =
  | 'simulados.resultado.tabWrongTitle'
  | 'simulados.resultado.tabRightTitle'
  | 'simulados.resultado.tabAllTitle';
const TITULOS: Record<Aba, AbaTituloKey> = {
  erradas: 'simulados.resultado.tabWrongTitle',
  certas: 'simulados.resultado.tabRightTitle',
  todas: 'simulados.resultado.tabAllTitle',
};
type AbaSubKey =
  | 'simulados.resultado.tabWrongSub'
  | 'simulados.resultado.tabRightSub'
  | 'simulados.resultado.tabAllSub';
const SUBTITULOS: Record<Aba, AbaSubKey> = {
  erradas: 'simulados.resultado.tabWrongSub',
  certas: 'simulados.resultado.tabRightSub',
  todas: 'simulados.resultado.tabAllSub',
};

export function Resultado({ dados }: { dados: TentativaEstado }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [todas, setTodas] = useState(false);
  const [aba, setAba] = useState<Aba | null>(null);
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
  const certas = questions.filter(acertou);
  // A revisão abre onde há o que ver: quem gabaritou cai direto nos acertos.
  const abaAtual: Aba = aba ?? (erradas.length > 0 ? 'erradas' : 'certas');
  const revisaveis =
    abaAtual === 'erradas'
      ? erradas
      : abaAtual === 'certas'
        ? certas
        : [...erradas, ...certas].sort((a, b) => a.position - b.position);
  const tempo = dados.elapsedSeconds != null ? formatarTempo(dados.elapsedSeconds) : null;

  const porTema = new Map<string, { acertos: number; total: number }>();
  for (const q of questions) {
    const tema = q.topic ?? t('simulados.resultado.otherTopic');
    const agg = porTema.get(tema) ?? { acertos: 0, total: 0 };
    agg.total++;
    if (acertou(q)) agg.acertos++;
    porTema.set(tema, agg);
  }
  const dominios = [...porTema.entries()]
    .map(([name, v]) => ({ name, pct: v.total ? Math.round((v.acertos / v.total) * 100) : 0 }))
    .sort((a, b) => a.pct - b.pct);
  const maisFragil = dominios[0];

  const mostradas = todas ? revisaveis : revisaveis.slice(0, VISIVEIS);
  function trocarAba(nova: Aba) {
    setAba(nova);
    setTodas(false);
  }
  const ringOffset = Math.round(RING * (1 - score / 100));
  const heroBg = isPass
    ? 'linear-gradient(150deg, var(--success), color-mix(in srgb, var(--success) 52%, #06371f))'
    : 'linear-gradient(150deg, #d9536b, #8a2f42)';
  const titulo = isPass
    ? t('simulados.resultado.passTitle')
    : t('simulados.resultado.failTitle');
  const sub = isPass
    ? t('simulados.resultado.passSub')
    : t('simulados.resultado.failSub', { gap });

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
              <div className="res-ring__cap">{t('simulados.resultado.scoreCap')}</div>
            </div>
          </div>

          <div className="res-hero__meta">
            <div className="res-badge">
              {isPass ? <Check size={15} /> : <X size={13} />}{' '}
              {isPass ? t('simulados.passed') : t('simulados.failed')}
            </div>
            <div className="res-hero__title">{titulo}</div>
            <div className="res-hero__sub">{sub}</div>
          </div>

          <div className="res-stats">
            <div className="res-stat">
              <div className="res-stat__v">{acertos}</div>
              <div className="res-stat__l">{t('simulados.resultado.statHits')}</div>
            </div>
            <div className="res-stat">
              <div className="res-stat__v">{erros}</div>
              <div className="res-stat__l">{t('simulados.resultado.statMisses')}</div>
            </div>
            <div className="res-stat">
              <div className="res-stat__v">{tempo ?? total}</div>
              <div className="res-stat__l">
                {tempo ? t('simulados.resultado.statTime') : t('simulados.questions')}
              </div>
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
            <Trans
              i18nKey="simulados.resultado.stale"
              values={{ score }}
              components={{ b: <b /> }}
            />
          </div>
        </div>
      )}

      <div className="res-grid">
        <div className="sim__col">
          {!revisaoParcial && (
            <div className="card">
              <div className="res-sec__title">{t('simulados.resultado.domainsTitle')}</div>
              <div className="res-sec__sub">{t('simulados.resultado.domainsSub')}</div>
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
                          {t(c.chave)}
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

          {erradas.length + certas.length > 0 && (
            <div className="card">
              <div className="res-review__head">
                <div className="res-sec__title">{t(TITULOS[abaAtual])}</div>
                <div className="topbar__spacer" />
                <span className="res-review__count">
                  {t('simulados.resultado.countQ', { count: revisaveis.length })}
                </span>
              </div>
              <div className="res-sec__sub">{t(SUBTITULOS[abaAtual])}</div>
              <div className="res-review__tabs">
                <button
                  className={`res-tab${abaAtual === 'erradas' ? ' res-tab--on' : ''}`}
                  onClick={() => trocarAba('erradas')}
                >
                  {t('simulados.resultado.tabWrong')}{' '}
                  <span className="res-tab__n">{erradas.length}</span>
                </button>
                <button
                  className={`res-tab${abaAtual === 'certas' ? ' res-tab--on' : ''}`}
                  onClick={() => trocarAba('certas')}
                >
                  {t('simulados.resultado.tabRight')}{' '}
                  <span className="res-tab__n">{certas.length}</span>
                </button>
                <button
                  className={`res-tab${abaAtual === 'todas' ? ' res-tab--on' : ''}`}
                  onClick={() => trocarAba('todas')}
                >
                  {t('simulados.resultado.tabAll')}{' '}
                  <span className="res-tab__n">{erradas.length + certas.length}</span>
                </button>
              </div>
              <div className="res-wrongs">
                {mostradas.map((q) => {
                  const ok = acertou(q);
                  return (
                    <div key={q.id} className={`res-wrong${ok ? ' res-wrong--ok' : ''}`}>
                      <div className="res-wrong__meta">
                        <span className="res-wrong__q">Q{q.position}</span>
                        <span className={`res-wrong__verd res-wrong__verd--${ok ? 'ok' : 'no'}`}>
                          {ok
                            ? t('simulados.resultado.gotIt')
                            : t('simulados.resultado.missed')}
                        </span>
                        {q.topic && <span className="res-wrong__domain">{q.topic}</span>}
                      </div>
                      <div className="res-wrong__text">{q.statement}</div>
                      <div className="res-wrong__answers">
                        {ok ? (
                          <div className="res-ans res-ans--right">
                            <span className="res-ans__icon res-ans__icon--right">
                              <Check size={12} />
                            </span>
                            <span className="res-ans__label">
                              {t('simulados.resultado.yourAnswer')}
                            </span>
                            <span className="res-ans__val res-ans__val--right">
                              {textos(q, q.selected ?? [])}
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className="res-ans res-ans--wrong">
                              <span className="res-ans__icon res-ans__icon--wrong">
                                <X size={12} />
                              </span>
                              <span className="res-ans__label">
                                {t('simulados.resultado.yourAnswer')}
                              </span>
                              <span className="res-ans__val res-ans__val--wrong">
                                {textos(q, q.selected ?? []) || t('simulados.resultado.blank')}
                              </span>
                            </div>
                            <div className="res-ans res-ans--right">
                              <span className="res-ans__icon res-ans__icon--right">
                                <Check size={12} />
                              </span>
                              <span className="res-ans__label">
                                {t('simulados.resultado.correctAnswer')}
                              </span>
                              <span className="res-ans__val res-ans__val--right">
                                {textos(q, corretasDe(q))}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                      {q.explanation && (
                        <div className="res-why">
                          <span className="res-why__icon">
                            <Info size={17} />
                          </span>
                          <div>
                            <b>
                              {ok
                                ? t('simulados.resultado.whyRight')
                                : t('simulados.resultado.whyWrong')}
                            </b>{' '}
                            {q.explanation}
                          </div>
                        </div>
                      )}
                      {!ok && q.topic && (
                        <div className="res-study">
                          <span className="res-study__label">
                            {t('simulados.resultado.study')}
                          </span>
                          <span className="res-study__chip">
                            <BookOpen size={12} /> {q.topic}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {revisaveis.length > VISIVEIS && (
                <button className="res-more" onClick={() => setTodas((v) => !v)}>
                  {todas
                    ? t('simulados.resultado.showLess')
                    : t('simulados.resultado.showAllQ', { count: revisaveis.length })}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="sim__col">
          <div className="card">
            <div className="res-plan__title">{t('simulados.resultado.planTitle')}</div>
            <div className="res-plan__sub">
              {isPass
                ? t('simulados.resultado.planSubPass')
                : t('simulados.resultado.planSubFail')}
            </div>
            <div className="res-plan">
              {!revisaoParcial && maisFragil && (
                <div className="res-plan-item">
                  <span className="res-plan-item__icon">
                    <BookOpen size={16} />
                  </span>
                  <div>
                    <div className="res-plan-item__t">
                      {t('simulados.resultado.planTracksT')}
                    </div>
                    <div className="res-plan-item__s">
                      {t('simulados.resultado.planTracksS', {
                        name: maisFragil.name,
                        pct: maisFragil.pct,
                      })}
                    </div>
                  </div>
                </div>
              )}
              <div className="res-plan-item">
                <span className="res-plan-item__icon">
                  <Info size={16} />
                </span>
                <div>
                  <div className="res-plan-item__t">
                    {t('simulados.resultado.planReviewT')}
                  </div>
                  <div className="res-plan-item__s">
                    {t('simulados.resultado.planReviewS')}
                  </div>
                </div>
              </div>
              <div className="res-plan-item">
                <span className="res-plan-item__icon">
                  <Redo size={16} />
                </span>
                <div>
                  <div className="res-plan-item__t">{t('simulados.resultado.planRedoT')}</div>
                  <div className="res-plan-item__s">{t('simulados.resultado.planRedoS')}</div>
                </div>
              </div>
            </div>
            <button className="btn btn--accent res-plan__redo" onClick={() => navigate('/trilhas')}>
              <BookOpen size={16} /> {t('simulados.resultado.planCta')}
            </button>
            <button className="res-plan__ghost" onClick={refazer}>
              <Redo size={16} /> {t('simulados.resultado.redoExam')}
            </button>
          </div>

          <div className={`res-seal res-seal--${isPass ? 'pass' : 'fail'}`}>
            <span className="res-seal__icon">
              {isPass ? <Trophy size={26} /> : <Target size={26} />}
            </span>
            <div>
              <div className="res-seal__t">
                {isPass ? t('simulados.resultado.sealPass') : t('simulados.resultado.sealFail')}
              </div>
              <div className="res-seal__s">
                {isPass
                  ? t('simulados.resultado.sealPassSub')
                  : t('simulados.resultado.sealFailSub', { gap })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
