import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/Logo';
import { UserMenu } from '../../components/UserMenu';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Flame, Check, Help, Alert, X } from '../../components/Icons';
import { getInitials } from '../../utils/initials';
import { user } from '../../data/home';
import {
  obterTrilha,
  obterAula,
  enviarQuiz,
  verificarResposta,
  type TrailDetail,
  type LessonDetail,
  type QuizResult,
} from '../../services/trails';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { statusErro } from '../../utils/erro';
import { BlocosConteudo, md } from '../../components/BlocosConteudo';

const NAV = [
  { label: 'Início', to: '/home' },
  { label: 'Trilhas', to: '/trilhas' },
  { label: 'Desafios', to: '/desafios' },
  { label: 'Ranking', to: '/ranking' },
  { label: 'Comunidade', to: '/comunidade' },
];

export function Aula() {
  const { trailId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const displayName = authUser?.name ?? user.name;

  const [trilha, setTrilha] = useState<TrailDetail | null>(null);
  const [aula, setAula] = useState<LessonDetail | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      setCarregando(true);
      setErro('');
      try {
        const [t, a] = await Promise.all([obterTrilha(trailId!), obterAula(lessonId!)]);
        if (!ativo) return;
        setTrilha(t);
        setAula(a);
      } catch (e: unknown) {
        if (!ativo) return;
        setErro(
          statusErro(e) === 403
            ? 'Esta aula está bloqueada. Conclua a aula anterior.'
            : 'Não foi possível carregar a aula.',
        );
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    carregar();
    return () => {
      ativo = false;
    };
  }, [trailId, lessonId]);

  return (
    <div className="home-shell">
      <div className="home">
        <header className="topbar">
          <Logo variant="solid" size={20} />
          <nav className="nav">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`nav__item${item.label === 'Trilhas' ? ' nav__item--active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="topbar__spacer" />
          <div className="streak-pill">
            <Flame size={16} /> {authUser?.streak ?? 0}
          </div>
          <ThemeToggle inline />
          <UserMenu
            initials={getInitials(displayName)}
            level={authUser?.level ?? 1}
            name={displayName}
            email={authUser?.email}
          />
        </header>

        {carregando && <p className="lesson__loading">Carregando aula...</p>}
        {erro && !carregando && (
          <div className="lesson__erro">
            <p>{erro}</p>
            <Link className="btn btn--accent" to="/trilhas">
              Voltar para as trilhas
            </Link>
          </div>
        )}

        {!carregando && !erro && trilha && aula && (
          <div className="lesson">
            <SidebarTrilha trilha={trilha} aulaAtualId={aula.id} />
            <ConteudoAula trilha={trilha} aula={aula} onConcluir={() => navigate('/trilhas')} />
          </div>
        )}
      </div>
    </div>
  );
}

function SidebarTrilha({ trilha, aulaAtualId }: { trilha: TrailDetail; aulaAtualId: string }) {
  const todas = trilha.modules.flatMap((m) => m.lessons);
  const feitas = todas.filter((l) => l.state === 'done').length;
  const total = todas.length;
  const pct = total > 0 ? Math.round((feitas / total) * 100) : 0;

  return (
    <aside className="lesson__nav">
      <div className="lesson__track">
        <span className="lesson__track-icon">{'{}'}</span>
        <div className="lesson__track-meta">
          <div className="lesson__track-name">{trilha.name}</div>
          <div className="lesson__track-sub">
            {feitas} de {total} aulas · {pct}%
          </div>
        </div>
      </div>
      <div className="lesson__track-bar">
        <span style={{ width: `${pct}%` }} />
      </div>

      {trilha.modules.map((m) => (
        <div key={m.id} className="lesson__module">
          <div className="lesson__module-title">{m.title}</div>
          {m.lessons.map((l) => {
            const estado = l.id === aulaAtualId ? 'current' : l.state;
            return (
              <Link
                key={l.id}
                to={`/trilhas/${trilha.id}/aula/${l.id}`}
                className={`lesson__item lesson__item--${estado}${l.state === 'locked' ? ' lesson__item--disabled' : ''}`}
              >
                <span className="lesson__bullet">
                  {l.state === 'done' ? <Check size={11} /> : null}
                </span>
                <span className="lesson__item-name">{l.title}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </aside>
  );
}

function ConteudoAula({
  trilha,
  aula,
  onConcluir,
}: {
  trilha: TrailDetail;
  aula: LessonDetail;
  onConcluir: () => void;
}) {
  const navigate = useNavigate();
  const todas = trilha.modules.flatMap((m) => m.lessons);
  const idx = todas.findIndex((l) => l.id === aula.id);
  const proxima = idx >= 0 && idx < todas.length - 1 ? todas[idx + 1] : null;
  const irProxima = proxima ? () => navigate(`/trilhas/${trilha.id}/aula/${proxima.id}`) : null;

  return (
    <main className="lesson__content">
      <div className="lesson__crumb">
        <span>{trilha.name}</span>
        <span className="lesson__crumb-sep">/</span>
        <span>{aula.title}</span>
      </div>

      <h1 className="lesson__title">{aula.title}</h1>

      <hr className="rule lesson__rule" />

      {aula.contentBlocks && aula.contentBlocks.length > 0 ? (
        <BlocosConteudo blocks={aula.contentBlocks} />
      ) : aula.content ? (
        <div className="lesson__md">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>
            {aula.content}
          </ReactMarkdown>
        </div>
      ) : (
        <p className="lesson__p lesson__p--muted">Esta aula ainda não tem conteúdo escrito.</p>
      )}

      {aula.questions.length > 0 ? (
        <Quiz aula={aula} onConcluir={onConcluir} irProxima={irProxima} />
      ) : (
        <div className="lesson__nextbar">
          {irProxima ? (
            <button className="btn btn--accent" onClick={irProxima}>
              Próxima aula
            </button>
          ) : (
            <button className="btn btn--accent" onClick={onConcluir}>
              Concluir trilha
            </button>
          )}
        </div>
      )}
    </main>
  );
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

// Quiz em carrossel: uma questao por vez, com feedback imediato verificado no servidor.
function Quiz({
  aula,
  onConcluir,
  irProxima,
}: {
  aula: LessonDetail;
  onConcluir: () => void;
  irProxima: (() => void) | null;
}) {
  const total = aula.questions.length;
  const jaConcluida = aula.state === 'done';
  const respondido = total > 0 && aula.questions.every((q) => q.answer);
  const acertosSalvos = aula.questions.filter((q) => q.answer?.isCorrect).length;
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [correctOptionId, setCorrectOptionId] = useState<string | null>(null);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [verificando, setVerificando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<QuizResult | null>(
    respondido
      ? { correct: acertosSalvos, total, passed: jaConcluida, lessonCompleted: jaConcluida }
      : null,
  );
  const [erro, setErro] = useState('');
  // Uma vez concluída (agora ou numa visita anterior), refazer e errar não volta a bloquear.
  const [concluida, setConcluida] = useState(jaConcluida);

  const q = aula.questions[qIndex];
  const isLast = qIndex >= total - 1;

  function selecionar(optionId: string) {
    if (checked) return;
    setSelected(optionId);
  }

  async function submeterQuiz(answers: { questionId: string; optionId: string }[]) {
    if (enviando) return;
    setEnviando(true);
    setErro('');
    try {
      const r = await enviarQuiz(aula.id, answers);
      setResultado(r);
      if (r.passed) setConcluida(true);
    } catch {
      setErro('Não foi possível enviar o quiz. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  async function verificar() {
    if (selected == null || checked || verificando) return;
    setVerificando(true);
    setErro('');
    try {
      const r = await verificarResposta(aula.id, q.id, selected);
      setWasCorrect(r.correct);
      setCorrectOptionId(r.correctOptionId);
      setRespostas((prev) => ({ ...prev, [q.id]: selected }));
      setChecked(true);
      // Na última questão o resultado sai sozinho; só damos um tempo para ver o feedback.
      if (isLast) {
        const answers = aula.questions.map((qq) => ({
          questionId: qq.id,
          optionId: qq.id === q.id ? selected : respostas[qq.id],
        }));
        setTimeout(() => submeterQuiz(answers), 1200);
      }
    } catch {
      setErro('Não foi possível verificar a resposta. Tente novamente.');
    } finally {
      setVerificando(false);
    }
  }

  function avancar() {
    setQIndex((i) => i + 1);
    setSelected(null);
    setChecked(false);
    setWasCorrect(false);
    setCorrectOptionId(null);
  }

  function refazer() {
    setQIndex(0);
    setSelected(null);
    setChecked(false);
    setWasCorrect(false);
    setCorrectOptionId(null);
    setRespostas({});
    setResultado(null);
    setErro('');
  }

  function classeOpcao(optionId: string) {
    if (!checked) return `quiz-opt${selected === optionId ? ' quiz-opt--selected' : ''}`;
    if (optionId === correctOptionId) return 'quiz-opt quiz-opt--correct';
    if (optionId === selected) return 'quiz-opt quiz-opt--wrong';
    return 'quiz-opt quiz-opt--dim';
  }

  function badge(optionId: string, i: number) {
    if (checked && optionId === correctOptionId) return <Check size={13} />;
    if (checked && optionId === selected) return <X size={12} />;
    return LETTERS[i] ?? String(i + 1);
  }

  function letraCorreta() {
    const idx = q.options.findIndex((o) => o.id === correctOptionId);
    return LETTERS[idx] ?? '';
  }

  if (resultado) {
    return (
      <div className="quiz">
        <div className="quiz__result">
          <span
            className="quiz__result-badge"
            style={{ background: resultado.passed ? 'var(--success)' : 'var(--av-red)' }}
          >
            {resultado.passed ? <Check size={34} /> : <Alert size={34} />}
          </span>
          <div className="quiz__result-title">
            {resultado.passed ? 'Aula concluída!' : 'Quase lá!'}
          </div>
          <div className="quiz__result-text">
            {resultado.passed
              ? 'Você dominou o conteúdo e desbloqueou a próxima aula.'
              : 'Você precisa acertar pelo menos 4 questões. Revise o conteúdo e tente de novo.'}
          </div>
          <div className="quiz__score">
            <span
              className="quiz__score-n"
              style={{ color: resultado.passed ? 'var(--success)' : 'var(--av-red)' }}
            >
              {resultado.correct}
            </span>
            <span className="quiz__score-t">/ {resultado.total}</span>
          </div>
          <div className="quiz__result-actions">
            <button className="btn btn--ghost" onClick={refazer}>
              Refazer quiz
            </button>
            {concluida &&
              (irProxima ? (
                <button className="btn btn--accent" onClick={irProxima}>
                  Próxima aula
                </button>
              ) : (
                <button className="btn btn--accent" onClick={onConcluir}>
                  Concluir trilha
                </button>
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz">
      <div className="quiz__head">
        <span className="quiz__icon">
          <Help size={22} />
        </span>
        <div className="quiz__head-meta">
          <div className="quiz__title">Pratique o que aprendeu</div>
          <div className="quiz__sub">{total} questões · acerte ao menos 4 para concluir a aula</div>
        </div>
        <span className="quiz__counter">
          {qIndex + 1} / {total}
        </span>
      </div>

      <div className="quiz__dots">
        {aula.questions.map((qq, i) => {
          let cls = 'quiz__dot';
          if (i < qIndex || (i === qIndex && checked)) cls += ' quiz__dot--done';
          else if (i === qIndex) cls += ' quiz__dot--current';
          return <span key={qq.id} className={cls} />;
        })}
      </div>

      <div className="quiz__body">
        <div className="quiz__q">
          <span className="quiz__q-num">{qIndex + 1}</span>
          <div className="quiz__q-text">{q.statement}</div>
        </div>

        <div className="quiz__options">
          {q.options.map((o, i) => (
            <button
              key={o.id}
              className={classeOpcao(o.id)}
              onClick={() => selecionar(o.id)}
              disabled={checked}
            >
              <span className="quiz-opt__badge">{badge(o.id, i)}</span>
              <span className="quiz-opt__label">{o.text}</span>
            </button>
          ))}
        </div>

        {checked && (
          <div className={`quiz__feedback quiz__feedback--${wasCorrect ? 'ok' : 'no'}`}>
            {wasCorrect
              ? 'Correto! Mandou muito bem.'
              : `Quase! A resposta certa é a alternativa ${letraCorreta()}.`}
          </div>
        )}

        {erro && <div className="auth__alert">{erro}</div>}

        <div className="quiz__foot">
          <span className="quiz__hint">
            {!checked
              ? 'Selecione uma alternativa e verifique.'
              : isLast
                ? 'Calculando seu resultado...'
                : 'Siga para a próxima questão.'}
          </span>
          <div className="topbar__spacer" />
          {!checked ? (
            <button
              className="btn btn--accent"
              style={{ opacity: selected == null ? 0.5 : 1 }}
              disabled={selected == null || verificando}
              onClick={verificar}
            >
              {verificando ? 'Verificando...' : 'Verificar resposta'}
            </button>
          ) : isLast ? (
            <button className="btn btn--accent" disabled>
              Calculando resultado...
            </button>
          ) : (
            <button className="btn btn--accent" onClick={avancar}>
              Próxima questão
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
