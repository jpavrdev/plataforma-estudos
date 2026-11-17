import { useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRequisicao } from '../../hooks/useRequisicao';
import { Trans, useTranslation } from 'react-i18next';
import { SimTopbar } from './SimTopbar';
import {
  ClockExam,
  Check,
  Target,
  BookOpen,
  Alert,
  Play,
  ChevronLeft,
  ChevronRight,
} from '../../components/Icons';
import {
  listarSimulados,
  historicoSimulados,
  iniciarTentativa,
  opcoesDoSimulado,
  type MontagemTentativa,
  type TentativaHistorico,
} from '../../services/simulados';
import { provedorDe, nomeLimpo, nivelClasse, LABEL_NIVEL } from './provedores';
import { ConfirmModal } from './ConfirmModal';
import { MontarModal } from './MontarModal';

// Date format follows the active language, as decided in the vault note.
function formatData(iso: string, language: string) {
  return new Date(iso).toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function SimuladoBriefing() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { dados, carregando } = useRequisicao(
    () =>
      Promise.all([listarSimulados(), historicoSimulados(), opcoesDoSimulado(slug!)]).then(
        ([exams, historico, opcoes]) => ({ exams, historico, opcoes }),
      ),
    [slug],
  );
  const exam = dados?.exams.find((e) => e.slug === slug) ?? null;
  const opcoes = dados?.opcoes ?? null;
  const tentativas = (dados?.historico ?? []).filter((t) => t.slug === slug);
  const emAndamento = tentativas.find((t) => t.submittedAt == null) ?? null;

  const [iniciando, setIniciando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [montando, setMontando] = useState(false);
  const [praticaInicial, setPraticaInicial] = useState(false);
  const [voltarPara, setVoltarPara] = useState<string | null>(null);

  async function iniciar(montagem?: MontagemTentativa) {
    if (!exam || iniciando) return;
    setIniciando(true);
    try {
      const t = await iniciarTentativa(exam.slug, montagem);
      navigate(`/simulados/tentativa/${t.attemptId}`);
    } catch (e) {
      console.error('Falha ao iniciar simulado', e);
      setIniciando(false);
    }
  }

  const p = exam ? provedorDe(exam.provider) : null;

  // O botão principal aparece duas vezes no celular: dentro do card no desktop
  // e preso no rodapé no celular. Mesma ação e mesmo rótulo nas duas casas.
  const rotuloCta = emAndamento
    ? t('simulados.briefing.backToExam')
    : tentativas.length > 0
      ? t('simulados.briefing.redo')
      : t('simulados.briefing.start');
  const aoClicarCta = () =>
    emAndamento
      ? navigate(`/simulados/tentativa/${emAndamento.attemptId}`)
      : setConfirmando(true);

  return (
    <div className="home-shell">
      <div className="home">
        <SimTopbar />
        <div className="sim sim--brief">
          <button className="sim-back" onClick={() => navigate('/simulados')}>
            <ChevronLeft size={14} /> {t('simulados.briefing.back')}
          </button>

          {carregando ? (
            <p className="sim-empty">Carregando...</p>
          ) : !exam || !p ? (
            <p className="sim-empty">Simulado não encontrado.</p>
          ) : (
            <>
              <header className="sim-brief__head">
                <span className="simc__logo simc__logo--lg" style={{ background: p.cor }}>
                  {p.sigla}
                </span>
                <div className="sim-brief__id">
                  <div className="simc__vendor">{p.nome}</div>
                  <h1 className="sim-brief__code">
                    {exam.code ?? exam.name}
                    {exam.level && (
                      <span
                        className={`simc__level simc__level--${nivelClasse(exam.level)}`}
                      >
                        {t(LABEL_NIVEL[nivelClasse(exam.level)])}
                      </span>
                    )}
                  </h1>
                  <div className="sim-brief__name">{nomeLimpo(exam.name, exam.code)}</div>
                </div>
              </header>

              <div className="sim-brief__grid">
                <div className="card sim-rules">
                  <div className="sim-rules__title">{t('simulados.briefing.rulesTitle')}</div>
                  <div className="sim-rules__sub">{t('simulados.briefing.rulesSub')}</div>
                  <div className="sim-rules__grid">
                    <Regra
                      icon={<ClockExam size={18} />}
                      t={t('simulados.briefing.rulesTimeTitle', { count: exam.durationMinutes })}
                      d={t('simulados.briefing.rulesTime')}
                    />
                    <Regra
                      icon={<Check size={17} />}
                      t={t('simulados.briefing.rulesQuestionsTitle', { count: exam.questionCount })}
                      d={t('simulados.briefing.rulesQuestions')}
                    />
                    <Regra
                      icon={<Target size={17} />}
                      t={t('simulados.briefing.rulesPassTitle', { percent: exam.passPercent })}
                      d={t('simulados.briefing.rulesPass')}
                    />
                    <Regra
                      icon={<BookOpen size={17} />}
                      t={t('simulados.briefing.rulesReviewTitle')}
                      d={t('simulados.briefing.rulesReview')}
                    />
                  </div>

                  <div className="sim-warn">
                    <span className="sim-warn__icon">
                      <Alert size={18} />
                    </span>
                    <div>
                      {emAndamento ? (
                        <Trans
                          i18nKey="simulados.briefing.warnOngoing"
                          components={{ b: <b /> }}
                        />
                      ) : (
                        <Trans i18nKey="simulados.briefing.warnTimer" components={{ b: <b /> }} />
                      )}
                    </div>
                  </div>
                  <button className="sim-start sim-start--card" onClick={aoClicarCta}>
                    <Play size={15} /> {rotuloCta}
                  </button>
                </div>

                <div className="card">
                  <div className="sim-attempts__title">{t('simulados.briefing.attemptsTitle')}</div>
                  {tentativas.length === 0 ? (
                    <p className="sim-empty">{t('simulados.briefing.attemptsEmpty')}</p>
                  ) : (
                    <div className="sim-attempts">
                      {tentativas.slice(0, 6).map((a) => (
                        <ItemTentativa
                          key={a.attemptId}
                          a={a}
                          onClick={() => {
                            if (a.submittedAt == null) setVoltarPara(a.attemptId);
                            else if (a.score != null)
                              navigate(`/simulados/tentativa/${a.attemptId}`);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {!emAndamento && (
                <section className="sim-formas">
                  <h2 className="sim-formas__title">{t('simulados.briefing.otherWays')}</h2>
                  <div className="sim-formas__grid">
                    <button
                      className="card sim-forma"
                      onClick={() => {
                        setPraticaInicial(true);
                        setMontando(true);
                      }}
                    >
                      <span className="sim-forma__txt">
                        <span className="sim-forma__t">{t('simulados.briefing.practiceTitle')}</span>
                        <span className="sim-forma__d">{t('simulados.briefing.practiceDesc')}</span>
                      </span>
                      <ChevronRight size={16} />
                    </button>
                    <button
                      className="card sim-forma"
                      onClick={() => {
                        setPraticaInicial(false);
                        setMontando(true);
                      }}
                    >
                      <span className="sim-forma__txt">
                        <span className="sim-forma__t">{t('simulados.briefing.customTitle')}</span>
                        <span className="sim-forma__d">{t('simulados.briefing.customDesc')}</span>
                      </span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </section>
              )}

              <button className="sim-start sim-start--fixo" onClick={aoClicarCta}>
                <Play size={15} /> {rotuloCta}
              </button>
            </>
          )}

          {montando && opcoes && (
            <MontarModal
              opcoes={opcoes}
              loading={iniciando}
              praticaInicial={praticaInicial}
              onCancel={() => setMontando(false)}
              onIniciar={(montagem) => iniciar(montagem)}
            />
          )}

          {confirmando && exam && (
            <ConfirmModal
              title={t('simulados.briefing.confirmStartTitle')}
              confirmLabel={t('simulados.briefing.confirmStartYes')}
              onConfirm={() => iniciar()}
              onCancel={() => setConfirmando(false)}
              loading={iniciando}
            >
              <Trans
                i18nKey="simulados.briefing.confirmStartBody"
                values={{ minutes: exam.durationMinutes }}
                components={{ b: <b /> }}
              />
            </ConfirmModal>
          )}

          {voltarPara && (
            <ConfirmModal
              title={t('simulados.briefing.ongoingTitle')}
              confirmLabel={t('simulados.briefing.ongoingYes')}
              onConfirm={() => navigate(`/simulados/tentativa/${voltarPara}`)}
              onCancel={() => setVoltarPara(null)}
            >
              {t('simulados.briefing.ongoingBody')}
            </ConfirmModal>
          )}
        </div>
      </div>
    </div>
  );
}

function Regra({ icon, t, d }: { icon: ReactNode; t: string; d: string }) {
  return (
    <div className="sim-rule">
      <span className="sim-rule__icon">{icon}</span>
      <div>
        <div className="sim-rule__t">{t}</div>
        <div className="sim-rule__d">{d}</div>
      </div>
    </div>
  );
}

function ItemTentativa({ a, onClick }: { a: TentativaHistorico; onClick: () => void }) {
  const { t, i18n } = useTranslation();
  const enviado = a.submittedAt != null;
  const cancelada = enviado && a.score == null;
  const ok = a.passed === true;
  const estado = cancelada ? 'cancel' : !enviado ? 'wip' : ok ? 'ok' : 'no';
  const rotulo = cancelada
    ? t('simulados.briefing.attemptCancelled')
    : !enviado
      ? t('simulados.briefing.attemptWip')
      : ok
        ? t('simulados.briefing.attemptOk')
        : t('simulados.briefing.attemptNo');
  return (
    <button className={`sim-attempt${cancelada ? ' sim-attempt--off' : ''}`} onClick={onClick}>
      <span className={`sim-attempt__score sim-attempt__score--${estado}`}>
        {enviado && !cancelada ? `${a.score}%` : '—'}
      </span>
      <div className="sim-attempt__id">
        <div className="sim-attempt__exam">{formatData(a.startedAt, i18n.language)}</div>
        {a.personalizado && (
          <div className="sim-attempt__tag">
            {a.pratica ? t('simulados.briefing.attemptPractice') : t('simulados.briefing.attemptTraining')}{' '}
            · {a.questoes} {t('simulados.briefing.attemptQuestions')}
            {!a.comTempo && !a.pratica && ` · ${t('simulados.briefing.attemptNoTime')}`}
            {a.topicos && a.topicos.length > 0 && ` · ${t('simulados.briefing.attemptTopics', { count: a.topicos.length })}`}
          </div>
        )}
      </div>
      <span className={`sim-attempt__verdict sim-attempt__verdict--${estado}`}>{rotulo}</span>
    </button>
  );
}
