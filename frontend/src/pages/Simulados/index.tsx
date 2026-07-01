import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequisicao } from '../../hooks/useRequisicao';
import { SimTopbar } from './SimTopbar';
import { GradCap, Check, Play, Alert, ClockExam, Target, BookOpen } from '../../components/Icons';
import {
  listarSimulados,
  historicoSimulados,
  iniciarTentativa,
  type TentativaHistorico,
} from '../../services/simulados';

function formatData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

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

  const [slug, setSlug] = useState<string | null>(null);
  const [iniciando, setIniciando] = useState(false);
  const selecionado = exams.find((e) => e.slug === slug) ?? exams[0] ?? null;

  async function iniciar() {
    if (!selecionado || iniciando) return;
    setIniciando(true);
    try {
      const t = await iniciarTentativa(selecionado.slug);
      navigate(`/simulados/tentativa/${t.attemptId}`);
    } catch (e) {
      console.error('Falha ao iniciar simulado', e);
      setIniciando(false);
    }
  }

  return (
    <div className="home-shell">
      <div className="home">
        <SimTopbar />
        <div className="sim">
          <div className="sim__head">
            <h1 className="sim__title">Simulados de certificação</h1>
            <p className="sim__sub">
              Pratique com provas cronometradas no formato oficial e chegue confiante no dia do
              exame.
            </p>
          </div>

          {carregando ? (
            <p className="sim-empty">Carregando simulados...</p>
          ) : exams.length === 0 ? (
            <p className="sim-empty">Nenhum simulado disponível ainda.</p>
          ) : (
            <div className="sim__grid">
              <div className="sim__col">
                <div className="sim__exams">
                  {exams.map((e) => (
                    <button
                      key={e.slug}
                      className={`exam-card${e.slug === selecionado?.slug ? ' exam-card--active' : ''}`}
                      onClick={() => setSlug(e.slug)}
                    >
                      {e.slug === selecionado?.slug && (
                        <span className="exam-card__check">
                          <Check size={13} />
                        </span>
                      )}
                      <div className="exam-card__top">
                        <span className="exam-card__logo">
                          <GradCap size={24} />
                        </span>
                        <div>
                          <div className="exam-card__vendor">Certificação</div>
                          <div className="exam-card__code">{e.name}</div>
                        </div>
                      </div>
                      {e.description && <div className="exam-card__name">{e.description}</div>}
                      <div className="exam-card__meta">
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
                    </button>
                  ))}
                </div>

                {selecionado && (
                  <div className="card sim-rules">
                    <div className="sim-rules__title">Como funciona o simulado</div>
                    <div className="sim-rules__sub">
                      Leia antes de começar. O cronômetro inicia assim que você iniciar.
                    </div>
                    <div className="sim-rules__grid">
                      <Regra
                        icon={<ClockExam size={18} />}
                        t={`${selecionado.durationMinutes} minutos`}
                        d="O cronômetro começa ao iniciar e não pausa até enviar."
                      />
                      <Regra
                        icon={<Check size={17} />}
                        t={`${selecionado.questionCount} questões`}
                        d="Múltipla escolha; algumas pedem mais de uma resposta."
                      />
                      <Regra
                        icon={<Target size={17} />}
                        t={`${selecionado.passPercent}% para passar`}
                        d="Cada questão vale igual; múltiplas contam tudo-ou-nada."
                      />
                      <Regra
                        icon={<BookOpen size={17} />}
                        t="Revisão ao final"
                        d="Veja o que errou, o assunto de cada questão e o que revisar."
                      />
                    </div>
                    <div className="sim-warn">
                      <span className="sim-warn__icon">
                        <Alert size={18} />
                      </span>
                      <div>
                        <b>Uma vez iniciado, o cronômetro não para.</b> Se o tempo acabar, o
                        simulado é enviado automaticamente com as respostas marcadas até ali.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="sim__col">
                {selecionado && (
                  <div className="card">
                    <div className="sim-pick__label">Simulado selecionado</div>
                    <div className="sim-pick__head">
                      <span className="exam-card__logo">
                        <GradCap size={22} />
                      </span>
                      <div>
                        <div className="exam-card__vendor">Certificação</div>
                        <div className="sim-pick__code">{selecionado.name}</div>
                      </div>
                    </div>
                    <div className="sim-pick__rows">
                      <Linha
                        icon={<ClockExam size={18} />}
                        label="Duração"
                        value={`${selecionado.durationMinutes} min`}
                      />
                      <Linha
                        icon={<Check size={18} />}
                        label="Questões"
                        value={`${selecionado.questionCount}`}
                      />
                      <Linha
                        icon={<Target size={18} />}
                        label="Aprovação"
                        value={`${selecionado.passPercent}%`}
                      />
                    </div>
                    <button className="sim-start" onClick={iniciar} disabled={iniciando}>
                      <Play size={15} /> {iniciando ? 'Preparando...' : 'Iniciar simulado'}
                    </button>
                    <div className="sim-pick__note">O cronômetro só começa quando você inicia.</div>
                  </div>
                )}

                <div className="card">
                  <div className="sim-attempts__title">Suas últimas tentativas</div>
                  {historico.length === 0 ? (
                    <p className="sim-empty">Você ainda não fez nenhum simulado.</p>
                  ) : (
                    <div className="sim-attempts">
                      {historico.slice(0, 5).map((a) => (
                        <ItemTentativa
                          key={a.attemptId}
                          a={a}
                          onClick={() => navigate(`/simulados/tentativa/${a.attemptId}`)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
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

function Linha({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="sim-pick__row">
      <span className="sim-pick__row-icon">{icon}</span>
      <span className="sim-pick__row-label">{label}</span>
      <span className="sim-pick__row-val">{value}</span>
    </div>
  );
}

function ItemTentativa({ a, onClick }: { a: TentativaHistorico; onClick: () => void }) {
  const enviado = a.submittedAt != null;
  const ok = a.passed === true;
  return (
    <button className="sim-attempt" onClick={onClick}>
      <span className={`sim-attempt__score sim-attempt__score--${ok ? 'ok' : 'no'}`}>
        {enviado ? `${a.score}%` : '—'}
      </span>
      <div className="sim-attempt__id">
        <div className="sim-attempt__exam">{a.simulado}</div>
        <div className="sim-attempt__date">{formatData(a.startedAt)}</div>
      </div>
      <span className={`sim-attempt__verdict sim-attempt__verdict--${ok ? 'ok' : 'no'}`}>
        {enviado ? (ok ? 'Aprovado' : 'Reprovado') : 'Em andamento'}
      </span>
    </button>
  );
}
