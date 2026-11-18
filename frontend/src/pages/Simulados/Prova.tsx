import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import {
  ClockExam,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Bookmark,
  Check,
  X,
} from '../../components/Icons';
import {
  salvarResposta,
  enviarTentativa,
  conferirQuestao,
  type TentativaEstado,
  type QuestaoSimulado,
} from '../../services/simulados';
import { ConfirmModal } from './ConfirmModal';

const LETRAS = ['A', 'B', 'C', 'D', 'E', 'F'];

function formatTempo(seg: number) {
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// O que a tela guarda de uma questão já conferida no modo de prática.
type Conferida = {
  corretas: string[];
  correta: boolean;
  explanation: string | null;
  topic: string | null;
};

// Questão conferida antes de recarregar a página já volta do servidor com o
// gabarito, então a tela remonta o estado a partir dela.
function conferidaDe(q: QuestaoSimulado): Conferida {
  const corretas = q.options.filter((o) => o.isCorrect).map((o) => o.id);
  const marcadas = q.selected ?? [];
  return {
    corretas,
    correta:
      corretas.length > 0 &&
      corretas.length === marcadas.length &&
      corretas.every((c) => marcadas.includes(c)),
    explanation: q.explanation ?? null,
    topic: q.topic ?? null,
  };
}

export function Prova({ dados, onEnviado }: { dados: TentativaEstado; onEnviado: () => void }) {
  const { t } = useTranslation();
  const questions = dados.questions;
  const total = questions.length;
  const pratica = dados.pratica === true;
  const [current, setCurrent] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string[]>>(() => {
    const r: Record<string, string[]> = {};
    for (const q of questions) r[q.id] = q.selected ?? [];
    return r;
  });
  const [conferidas, setConferidas] = useState<Record<string, Conferida>>(() => {
    const c: Record<string, Conferida> = {};
    for (const q of questions) if (q.revealed) c[q.id] = conferidaDe(q);
    return c;
  });
  const [conferindo, setConferindo] = useState(false);
  const [flags, setFlags] = useState<Set<number>>(new Set());
  const [restante, setRestante] = useState(dados.remainingSeconds);
  const [enviando, setEnviando] = useState(false);
  // Navegador recolhido por padrão no telefone (65 células ocupam a tela toda).
  const [navAberto, setNavAberto] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const enviadoRef = useRef(false);

  const q = questions[current];
  const conferida = conferidas[q.id] ?? null;
  const answeredCount = questions.filter((x) => (respostas[x.id]?.length ?? 0) > 0).length;
  const conferidasCount = Object.keys(conferidas).length;
  const acertosPratica = Object.values(conferidas).filter((c) => c.correta).length;
  const progress = total ? Math.round((answeredCount / total) * 100) : 0;

  async function persistir(questionId: string, optionIds: string[]) {
    try {
      await salvarResposta(dados.attemptId, questionId, optionIds);
    } catch (e) {
      console.error('Falha ao salvar resposta do simulado', e);
    }
  }

  function marcar(optionId: string) {
    // Questão conferida não muda mais de resposta: o servidor recusa, e deixar
    // clicar daria a impressão de que mudou.
    if (conferida) return;
    const atual = respostas[q.id] ?? [];
    const novo = q.multiple
      ? atual.includes(optionId)
        ? atual.filter((o) => o !== optionId)
        : [...atual, optionId]
      : [optionId];
    setRespostas((prev) => ({ ...prev, [q.id]: novo }));
    persistir(q.id, novo);
  }

  async function conferir() {
    if (conferindo || conferida) return;
    setConferindo(true);
    try {
      const r = await conferirQuestao(dados.attemptId, q.id);
      setConferidas((prev) => ({
        ...prev,
        [q.id]: {
          corretas: r.corretas,
          correta: r.correta,
          explanation: r.explanation,
          topic: r.topic,
        },
      }));
    } catch (e) {
      console.error('Falha ao conferir a questão', e);
    } finally {
      setConferindo(false);
    }
  }

  function alternarFlag() {
    setFlags((f) => {
      const n = new Set(f);
      if (n.has(current)) n.delete(current);
      else n.add(current);
      return n;
    });
  }

  const ir = (d: number) => setCurrent((c) => Math.max(0, Math.min(total - 1, c + d)));

  async function enviar() {
    if (enviadoRef.current) return;
    enviadoRef.current = true;
    setEnviando(true);
    try {
      await enviarTentativa(dados.attemptId);
      onEnviado();
    } catch (e) {
      console.error('Falha ao enviar o simulado', e);
      enviadoRef.current = false;
      setEnviando(false);
    }
  }

  const faltam = total - answeredCount;

  function confirmarEnvio() {
    setConfirmando(true);
  }

  // Contagem regressiva a partir do expiresAt (fonte de verdade); auto-envia ao zerar.
  // Sem expiresAt o aluno escolheu treinar sem cronômetro (ou está na prática).
  const expiresMs = useMemo(
    () => (dados.expiresAt ? new Date(dados.expiresAt).getTime() : null),
    [dados.expiresAt],
  );
  useEffect(() => {
    if (expiresMs === null) return;
    const tick = () => {
      const s = Math.max(0, Math.round((expiresMs - Date.now()) / 1000));
      setRestante(s);
      if (s <= 0) enviar();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresMs]);

  const semTempo = expiresMs === null;
  const urgente = !semTempo && restante !== null && restante <= 60;
  const semResposta = (respostas[q.id]?.length ?? 0) === 0;

  return (
    <>
      <div className="exam-bar">
        <span className="exam-bar__logo">
          <ClockExam size={18} />
        </span>
        <div className="exam-bar__id">
          <div className="exam-bar__title">
            {pratica ? t('simulados.briefing.practiceTitle') : t('simulados.prova.ongoingTitle')}
          </div>
          <div className="exam-bar__sub">
            {pratica
              ? t('simulados.prova.practiceSub', { count: total })
              : t('simulados.questions', { count: total })}
          </div>
        </div>
        <div className="topbar__spacer" />
        {pratica && conferidasCount > 0 && (
          <div className="exam-bar__placar">
            <Check size={14} />{' '}
            {t('simulados.prova.score', { correct: acertosPratica, checked: conferidasCount })}
          </div>
        )}
        <div className="exam-bar__prog">
          <div className="exam-bar__track">
            <span style={{ width: `${progress}%` }} />
          </div>
          <span className="exam-bar__count">
            {answeredCount} / {total}
          </span>
        </div>
        {!semTempo && (
          <div className={`exam-bar__timer${urgente ? ' exam-bar__timer--urgent' : ''}`}>
            <ClockExam size={17} />
            <span>{formatTempo(restante ?? 0)}</span>
          </div>
        )}
        <button
          className="btn btn--ghost exam-bar__finish"
          onClick={confirmarEnvio}
          disabled={enviando}
        >
          {t('simulados.prova.finish')}
        </button>
      </div>

      <div className="exam-body">
        <div className="card exam-q">
          <div className="exam-q__meta">
            <span className="exam-q__num">{t('simulados.prova.question', { number: current + 1 })}</span>
            {q.multiple && <span className="exam-q__tag">{t('simulados.prova.multiTag')}</span>}
            <div className="topbar__spacer" />
            <button
              className={`exam-q__flag${flags.has(current) ? ' exam-q__flag--on' : ''}`}
              onClick={alternarFlag}
            >
              <Bookmark size={16} />{' '}
              {flags.has(current)
                ? t('simulados.prova.flagSet')
                : t('simulados.prova.flagUnset')}
            </button>
          </div>

          <div className="exam-q__text">{q.statement}</div>

          <div className="exam-q__options">
            {q.options.map((o, i) => {
              const on = (respostas[q.id] ?? []).includes(o.id);
              let cls = 'exam-opt';
              if (conferida) {
                if (conferida.corretas.includes(o.id)) cls += ' exam-opt--ok';
                else if (on) cls += ' exam-opt--no';
                cls += ' exam-opt--lock';
              } else if (on) {
                cls += ' exam-opt--on';
              }
              return (
                <button key={o.id} className={cls} onClick={() => marcar(o.id)}>
                  <span className="exam-opt__badge">{LETRAS[i] ?? i + 1}</span>
                  <span className="exam-opt__label">{o.text}</span>
                  {conferida && on && (
                    <span className="exam-opt__sua">{t('simulados.prova.yourAnswer')}</span>
                  )}
                </button>
              );
            })}
          </div>

          {conferida && (
            <div className={`exam-feedback exam-feedback--${conferida.correta ? 'ok' : 'no'}`}>
              <span className="exam-feedback__icon">
                {conferida.correta ? <Check size={14} /> : <X size={12} />}
              </span>
              <div>
                <b>
                  {conferida.correta
                    ? t('simulados.prova.feedbackOk')
                    : t('simulados.prova.feedbackNo')}
                </b>
                {conferida.explanation ? ` ${conferida.explanation}` : ''}
                {conferida.topic && <span className="exam-feedback__topic">{conferida.topic}</span>}
              </div>
            </div>
          )}

          <div className="exam-q__foot">
            <button
              className="btn btn--ghost exam-q__nav"
              onClick={() => ir(-1)}
              disabled={current === 0}
            >
              <ChevronLeft size={14} /> {t('simulados.prova.previous')}
            </button>
            <div className="topbar__spacer" />
            {pratica ? (
              conferida ? (
                <span className="exam-q__saved">{t('simulados.prova.checkedQ')}</span>
              ) : (
                <button
                  className="btn btn--ghost exam-q__nav exam-q__conferir"
                  onClick={conferir}
                  disabled={semResposta || conferindo}
                >
                  {conferindo
                    ? t('common.checking')
                    : t('simulados.prova.check')}
                </button>
              )
            ) : (
              <span className="exam-q__saved">{t('simulados.prova.savedAuto')}</span>
            )}
            <button
              className="btn btn--accent exam-q__nav"
              onClick={() => ir(1)}
              disabled={current === total - 1}
            >
              {t('simulados.prova.next')} <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="exam-side">
          <div className="card">
            <button
              className="exam-nav__title"
              onClick={() => setNavAberto((v) => !v)}
              aria-expanded={navAberto}
            >
              <span>{t('simulados.prova.browser')}</span>
              <span className="exam-nav__resumo">
                {answeredCount}/{total}
              </span>
              <span className={`exam-nav__chev${navAberto ? ' exam-nav__chev--open' : ''}`}>
                <ChevronDown size={16} />
              </span>
            </button>
            <div className={`exam-nav__body${navAberto ? ' exam-nav__body--open' : ''}`}>
              <div className="exam-nav__grid">
                {questions.map((x, i) => {
                  const isCur = i === current;
                  const isAns = (respostas[x.id]?.length ?? 0) > 0;
                  const isFlag = flags.has(i);
                  const c = conferidas[x.id];
                  let cls = 'exam-nav__cell';
                  if (c) cls += c.correta ? ' exam-nav__cell--ok' : ' exam-nav__cell--no';
                  else if (isFlag) cls += ' exam-nav__cell--flag';
                  else if (isAns) cls += ' exam-nav__cell--ans';
                  if (isCur) cls += ' exam-nav__cell--cur';
                  return (
                    <button key={x.id} className={cls} onClick={() => setCurrent(i)}>
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <div className="exam-nav__legend">
                {pratica ? (
                  <>
                    <div>
                      <span className="exam-nav__dot exam-nav__dot--ok" />
                      {t('simulados.prova.legendOk', { count: acertosPratica })}
                    </div>
                    <div>
                      <span className="exam-nav__dot exam-nav__dot--no" />
                      {t('simulados.prova.legendNo', { count: conferidasCount - acertosPratica })}
                    </div>
                    <div>
                      <span className="exam-nav__dot exam-nav__dot--none" />
                      {t('simulados.prova.legendTodo', { count: total - conferidasCount })}
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="exam-nav__dot exam-nav__dot--ans" />
                      {t('simulados.prova.legendAns', { count: answeredCount })}
                    </div>
                    <div>
                      <span className="exam-nav__dot exam-nav__dot--flag" />
                      {t('simulados.prova.legendFlag', { count: flags.size })}
                    </div>
                    <div>
                      <span className="exam-nav__dot exam-nav__dot--none" />
                      {t('simulados.prova.legendBlank', { count: total - answeredCount })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <button className="exam-submit" onClick={confirmarEnvio} disabled={enviando}>
            {enviando
              ? t('common.sending')
              : pratica
                ? t('simulados.prova.seeResult')
                : t('simulados.prova.reviewSubmit')}
          </button>
        </div>
      </div>

      {confirmando && (
        <ConfirmModal
          title={
            pratica
              ? t('simulados.prova.confirmPracticeTitle')
              : t('simulados.prova.confirmExamTitle')
          }
          confirmLabel={
            enviando
              ? t('common.sending')
              : pratica
                ? t('simulados.prova.confirmPracticeYes')
                : t('simulados.prova.confirmExamYes')
          }
          loading={enviando}
          onConfirm={enviar}
          onCancel={() => setConfirmando(false)}
        >
          {faltam > 0 ? (
            <>
              <Trans
                i18nKey="simulados.prova.blankPrefix"
                count={faltam}
                values={{ count: faltam }}
                components={{ b: <b /> }}
              />{' '}
              {t('simulados.prova.blankSuffix', {
                acao: pratica
                  ? t('simulados.prova.actionEnd')
                  : t('simulados.prova.actionSend'),
              })}
            </>
          ) : pratica ? (
            t('simulados.prova.allPractice')
          ) : (
            t('simulados.prova.allExam')
          )}
        </ConfirmModal>
      )}
    </>
  );
}
