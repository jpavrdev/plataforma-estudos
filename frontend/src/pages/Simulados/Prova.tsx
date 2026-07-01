import { useEffect, useMemo, useRef, useState } from 'react';
import { ClockExam, ChevronLeft, ChevronRight, Bookmark } from '../../components/Icons';
import { salvarResposta, enviarTentativa, type TentativaEstado } from '../../services/simulados';

const LETRAS = ['A', 'B', 'C', 'D', 'E', 'F'];

function formatTempo(seg: number) {
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function Prova({ dados, onEnviado }: { dados: TentativaEstado; onEnviado: () => void }) {
  const questions = dados.questions;
  const total = questions.length;
  const [current, setCurrent] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string[]>>(() => {
    const r: Record<string, string[]> = {};
    for (const q of questions) r[q.id] = q.selected ?? [];
    return r;
  });
  const [flags, setFlags] = useState<Set<number>>(new Set());
  const [restante, setRestante] = useState(dados.remainingSeconds);
  const [enviando, setEnviando] = useState(false);
  const enviadoRef = useRef(false);

  const q = questions[current];
  const answeredCount = questions.filter((x) => (respostas[x.id]?.length ?? 0) > 0).length;
  const progress = total ? Math.round((answeredCount / total) * 100) : 0;

  async function persistir(questionId: string, optionIds: string[]) {
    try {
      await salvarResposta(dados.attemptId, questionId, optionIds);
    } catch (e) {
      console.error('Falha ao salvar resposta do simulado', e);
    }
  }

  function marcar(optionId: string) {
    const atual = respostas[q.id] ?? [];
    const novo = q.multiple
      ? atual.includes(optionId)
        ? atual.filter((o) => o !== optionId)
        : [...atual, optionId]
      : [optionId];
    setRespostas((prev) => ({ ...prev, [q.id]: novo }));
    persistir(q.id, novo);
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

  function confirmarEnvio() {
    const faltam = total - answeredCount;
    const msg =
      faltam > 0
        ? `Você deixou ${faltam} questão(ões) em branco. Enviar mesmo assim?`
        : 'Enviar o simulado para correção?';
    if (window.confirm(msg)) enviar();
  }

  // Contagem regressiva a partir do expiresAt (fonte de verdade); auto-envia ao zerar.
  const expiresMs = useMemo(() => new Date(dados.expiresAt).getTime(), [dados.expiresAt]);
  useEffect(() => {
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

  const urgente = restante <= 60;

  return (
    <>
      <div className="exam-bar">
        <span className="exam-bar__logo">
          <ClockExam size={18} />
        </span>
        <div>
          <div className="exam-bar__title">Simulado em andamento</div>
          <div className="exam-bar__sub">{total} questões</div>
        </div>
        <div className="topbar__spacer" />
        <div className="exam-bar__prog">
          <div className="exam-bar__track">
            <span style={{ width: `${progress}%` }} />
          </div>
          <span className="exam-bar__count">
            {answeredCount} / {total}
          </span>
        </div>
        <div className={`exam-bar__timer${urgente ? ' exam-bar__timer--urgent' : ''}`}>
          <ClockExam size={17} />
          <span>{formatTempo(restante)}</span>
        </div>
        <button
          className="btn btn--ghost exam-bar__finish"
          onClick={confirmarEnvio}
          disabled={enviando}
        >
          Finalizar
        </button>
      </div>

      <div className="exam-body">
        <div className="card exam-q">
          <div className="exam-q__meta">
            <span className="exam-q__num">Questão {current + 1}</span>
            {q.multiple && <span className="exam-q__tag">Selecione mais de uma</span>}
            <div className="topbar__spacer" />
            <button
              className={`exam-q__flag${flags.has(current) ? ' exam-q__flag--on' : ''}`}
              onClick={alternarFlag}
            >
              <Bookmark size={16} /> {flags.has(current) ? 'Marcada' : 'Marcar p/ revisar'}
            </button>
          </div>

          <div className="exam-q__text">{q.statement}</div>

          <div className="exam-q__options">
            {q.options.map((o, i) => {
              const on = (respostas[q.id] ?? []).includes(o.id);
              return (
                <button
                  key={o.id}
                  className={`exam-opt${on ? ' exam-opt--on' : ''}`}
                  onClick={() => marcar(o.id)}
                >
                  <span className="exam-opt__badge">{LETRAS[i] ?? i + 1}</span>
                  <span className="exam-opt__label">{o.text}</span>
                </button>
              );
            })}
          </div>

          <div className="exam-q__foot">
            <button
              className="btn btn--ghost exam-q__nav"
              onClick={() => ir(-1)}
              disabled={current === 0}
            >
              <ChevronLeft size={14} /> Anterior
            </button>
            <div className="topbar__spacer" />
            <span className="exam-q__saved">Resposta salva automaticamente</span>
            <button
              className="btn btn--accent exam-q__nav"
              onClick={() => ir(1)}
              disabled={current === total - 1}
            >
              Próxima <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="exam-side">
          <div className="card">
            <div className="exam-nav__title">Navegador</div>
            <div className="exam-nav__grid">
              {questions.map((x, i) => {
                const isCur = i === current;
                const isAns = (respostas[x.id]?.length ?? 0) > 0;
                const isFlag = flags.has(i);
                let cls = 'exam-nav__cell';
                if (isFlag) cls += ' exam-nav__cell--flag';
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
              <div>
                <span className="exam-nav__dot exam-nav__dot--ans" />
                Respondida ({answeredCount})
              </div>
              <div>
                <span className="exam-nav__dot exam-nav__dot--flag" />
                Marcada ({flags.size})
              </div>
              <div>
                <span className="exam-nav__dot exam-nav__dot--none" />
                Em branco ({total - answeredCount})
              </div>
            </div>
          </div>
          <button className="exam-submit" onClick={confirmarEnvio} disabled={enviando}>
            {enviando ? 'Enviando...' : 'Revisar e enviar'}
          </button>
        </div>
      </div>
    </>
  );
}
