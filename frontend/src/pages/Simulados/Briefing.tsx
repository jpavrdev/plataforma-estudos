import { useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRequisicao } from '../../hooks/useRequisicao';
import { SimTopbar } from './SimTopbar';
import { ClockExam, Check, Target, BookOpen, Alert, Play } from '../../components/Icons';
import {
  listarSimulados,
  historicoSimulados,
  iniciarTentativa,
  type TentativaHistorico,
} from '../../services/simulados';
import { provedorDe, nomeLimpo, nivelClasse } from './provedores';
import { ConfirmModal } from './ConfirmModal';

function formatData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function SimuladoBriefing() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { dados, carregando } = useRequisicao(
    () =>
      Promise.all([listarSimulados(), historicoSimulados()]).then(([exams, historico]) => ({
        exams,
        historico,
      })),
    [],
  );
  const exam = dados?.exams.find((e) => e.slug === slug) ?? null;
  const tentativas = (dados?.historico ?? []).filter((t) => t.slug === slug);
  const [iniciando, setIniciando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [voltarPara, setVoltarPara] = useState<string | null>(null);

  async function iniciar() {
    if (!exam || iniciando) return;
    setIniciando(true);
    try {
      const t = await iniciarTentativa(exam.slug);
      navigate(`/simulados/tentativa/${t.attemptId}`);
    } catch (e) {
      console.error('Falha ao iniciar simulado', e);
      setIniciando(false);
    }
  }

  const p = exam ? provedorDe(exam.provider) : null;

  return (
    <div className="home-shell">
      <div className="home">
        <SimTopbar />
        <div className="sim sim--brief">
          <button className="sim-back" onClick={() => navigate('/simulados')}>
            ← Voltar aos simulados
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
                  <h1 className="sim-brief__code">{exam.code ?? exam.name}</h1>
                  <div className="sim-brief__name">{nomeLimpo(exam.name, exam.code)}</div>
                </div>
                {exam.level && (
                  <span className={`simc__level simc__level--${nivelClasse(exam.level)}`}>
                    {exam.level}
                  </span>
                )}
              </header>

              <div className="sim-brief__grid">
                <div className="card sim-rules">
                  <div className="sim-rules__title">Como funciona o simulado</div>
                  <div className="sim-rules__sub">
                    Leia antes de começar. O cronômetro inicia assim que você iniciar.
                  </div>
                  <div className="sim-rules__grid">
                    <Regra
                      icon={<ClockExam size={18} />}
                      t={`${exam.durationMinutes} minutos`}
                      d="O cronômetro começa ao iniciar e não pausa até enviar."
                    />
                    <Regra
                      icon={<Check size={17} />}
                      t={`${exam.questionCount} questões`}
                      d="Múltipla escolha; algumas pedem mais de uma resposta."
                    />
                    <Regra
                      icon={<Target size={17} />}
                      t={`${exam.passPercent}% para passar`}
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
                      <b>Uma vez iniciado, o cronômetro não para.</b> Se o tempo acabar, o simulado
                      é enviado automaticamente com as respostas marcadas até ali.
                    </div>
                  </div>
                  <button className="sim-start" onClick={() => setConfirmando(true)}>
                    <Play size={15} />{' '}
                    {tentativas.length > 0 ? 'Refazer simulado' : 'Iniciar simulado'}
                  </button>
                </div>

                <div className="card">
                  <div className="sim-attempts__title">Suas últimas tentativas</div>
                  {tentativas.length === 0 ? (
                    <p className="sim-empty">Você ainda não fez este simulado.</p>
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
            </>
          )}

          {confirmando && exam && (
            <ConfirmModal
              title="Iniciar o simulado?"
              confirmLabel="Sim, iniciar"
              onConfirm={iniciar}
              onCancel={() => setConfirmando(false)}
              loading={iniciando}
            >
              Assim que você iniciar, o cronômetro de <b>{exam.durationMinutes} minutos</b> começa a
              contar e não para. Tem certeza que quer começar agora?
            </ConfirmModal>
          )}

          {voltarPara && (
            <ConfirmModal
              title="Tentativa em andamento"
              confirmLabel="Voltar para a prova"
              onConfirm={() => navigate(`/simulados/tentativa/${voltarPara}`)}
              onCancel={() => setVoltarPara(null)}
            >
              Você tem uma tentativa em andamento com o cronômetro rodando. Deseja voltar para ela?
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
  const enviado = a.submittedAt != null;
  const cancelada = enviado && a.score == null;
  const ok = a.passed === true;
  const estado = cancelada ? 'cancel' : !enviado ? 'wip' : ok ? 'ok' : 'no';
  const rotulo = cancelada
    ? 'Cancelada'
    : !enviado
      ? 'Em andamento'
      : ok
        ? 'Aprovado'
        : 'Reprovado';
  return (
    <button className={`sim-attempt${cancelada ? ' sim-attempt--off' : ''}`} onClick={onClick}>
      <span className={`sim-attempt__score sim-attempt__score--${estado}`}>
        {enviado && !cancelada ? `${a.score}%` : '—'}
      </span>
      <div className="sim-attempt__id">
        <div className="sim-attempt__exam">{formatData(a.startedAt)}</div>
      </div>
      <span className={`sim-attempt__verdict sim-attempt__verdict--${estado}`}>{rotulo}</span>
    </button>
  );
}
