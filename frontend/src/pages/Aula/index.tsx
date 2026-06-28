import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/Logo';
import { UserMenu } from '../../components/UserMenu';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Flame, Check, Help, Alert, ChevronRight } from '../../components/Icons';
import { getInitials } from '../../utils/initials';
import { user } from '../../data/home';
import {
  obterTrilha,
  obterAula,
  enviarQuiz,
  type TrailDetail,
  type LessonDetail,
  type QuizResult,
} from '../../services/trails';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

const NAV = [
  { label: 'Início', to: '/home' },
  { label: 'Trilhas', to: '/trilhas' },
  { label: 'Ranking', to: '/ranking' },
  { label: 'Comunidade', to: '/comunidade' },
];

// Converte o markdown da aula usando as classes de estilo que ja existem no projeto.
const md: Components = {
  h1: ({ children }) => <h2 className="lesson__h2">{children}</h2>,
  h2: ({ children }) => <h2 className="lesson__h2">{children}</h2>,
  h3: ({ children }) => <h3 className="lesson__h2" style={{ fontSize: 18 }}>{children}</h3>,
  h4: ({ children }) => <h4 className="lesson__h2" style={{ fontSize: 16 }}>{children}</h4>,
  p: ({ children }) => <p className="lesson__p">{children}</p>,
  ul: ({ children }) => <ul className="lesson__ul">{children}</ul>,
  ol: ({ children }) => <ol className="lesson__ul">{children}</ol>,
  code: ({ children }) => <code className="code-inline">{children}</code>,
  pre: ({ children }) => (
    <div className="codeblock">
      <div className="codeblock__bar">
        <span className="dot" style={{ background: '#ff5f57' }} />
        <span className="dot" style={{ background: '#febc2e' }} />
        <span className="dot" style={{ background: '#28c840' }} />
      </div>
      <pre className="codeblock__code">{children}</pre>
    </div>
  ),
};

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
        const [t, a] = await Promise.all([
          obterTrilha(trailId!),
          obterAula(lessonId!),
        ]);
        if (!ativo) return;
        setTrilha(t);
        setAula(a);
      } catch (err: any) {
        if (!ativo) return;
        setErro(
          err.response?.status === 403
            ? 'Esta aula está bloqueada. Conclua a aula anterior.'
            : 'Não foi possível carregar a aula.',
        );
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    carregar();
    return () => { ativo = false; };
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
          <div className="streak-pill"><Flame size={16} /> {user.streak}</div>
          <ThemeToggle inline />
          <UserMenu
            initials={getInitials(displayName)}
            level={user.level}
            name={displayName}
            email={authUser?.email}
          />
        </header>

        {carregando && <p className="lesson__loading">Carregando aula...</p>}
        {erro && !carregando && (
          <div className="lesson__erro">
            <p>{erro}</p>
            <Link className="btn btn--accent" to={`/trilhas/${trailId}`}>Voltar para a trilha</Link>
          </div>
        )}

        {!carregando && !erro && trilha && aula && (
          <div className="lesson">
            <SidebarTrilha trilha={trilha} aulaAtualId={aula.id} />
            <ConteudoAula
              trilha={trilha}
              aula={aula}
              onConcluir={() => navigate(`/trilhas/${trailId}`)}
            />
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
          <div className="lesson__track-sub">{feitas} de {total} aulas · {pct}%</div>
        </div>
      </div>
      <div className="lesson__track-bar"><span style={{ width: `${pct}%` }} /></div>

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
                <span className="lesson__bullet">{l.state === 'done' ? <Check size={11} /> : null}</span>
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
  trilha, aula, onConcluir,
}: { trilha: TrailDetail; aula: LessonDetail; onConcluir: () => void }) {
  return (
    <main className="lesson__content">
      <div className="lesson__crumb">
        <span>{trilha.name}</span>
        <span className="lesson__crumb-sep">/</span>
        <span>{aula.title}</span>
      </div>

      <h1 className="lesson__title">{aula.title}</h1>

      <hr className="rule lesson__rule" />

      {aula.content
        ? (
          <div className="lesson__md">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>
              {aula.content}
            </ReactMarkdown>
          </div>
        )
        : <p className="lesson__p lesson__p--muted">Esta aula ainda não tem conteúdo escrito.</p>}

      {aula.questions.length > 0 && <Quiz aula={aula} onConcluir={onConcluir} />}
    </main>
  );
}

function Quiz({ aula, onConcluir }: { aula: LessonDetail; onConcluir: () => void }) {
  const total = aula.questions.length;
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<QuizResult | null>(null);
  const [erro, setErro] = useState('');

  const todasRespondidas = aula.questions.every((q) => respostas[q.id]);

  function selecionar(questionId: string, optionId: string) {
    if (resultado) return;
    setRespostas((r) => ({ ...r, [questionId]: optionId }));
  }

  async function enviar() {
    if (!todasRespondidas || enviando) return;
    setEnviando(true);
    setErro('');
    try {
      const answers = aula.questions.map((q) => ({ questionId: q.id, optionId: respostas[q.id] }));
      setResultado(await enviarQuiz(aula.id, answers));
    } catch {
      setErro('Não foi possível enviar o quiz. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  function refazer() {
    setRespostas({});
    setResultado(null);
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
          <div className="quiz__result-title">{resultado.passed ? 'Aula concluída!' : 'Quase lá!'}</div>
          <div className="quiz__result-text">
            {resultado.passed
              ? 'Você dominou o conteúdo e desbloqueou a próxima aula.'
              : 'Você precisa acertar pelo menos 4 questões. Revise o conteúdo e tente de novo.'}
          </div>
          <div className="quiz__score">
            <span className="quiz__score-n" style={{ color: resultado.passed ? 'var(--success)' : 'var(--av-red)' }}>
              {resultado.correct}
            </span>
            <span className="quiz__score-t">/ {resultado.total}</span>
          </div>
          <div className="quiz__result-actions">
            <button className="btn btn--ghost" onClick={refazer}>Refazer quiz</button>
            {resultado.passed && (
              <button className="btn btn--accent" onClick={onConcluir}>Voltar para a trilha</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz">
      <div className="quiz__head">
        <span className="quiz__icon"><Help size={22} /></span>
        <div className="quiz__head-meta">
          <div className="quiz__title">Pratique o que aprendeu</div>
          <div className="quiz__sub">{total} questões · acerte ao menos 4 para concluir a aula</div>
        </div>
      </div>

      {aula.questions.map((q, idx) => (
        <div key={q.id} className="quiz__body">
          <div className="quiz__q">
            <span className="quiz__q-num">{idx + 1}</span>
            <div className="quiz__q-text">{q.statement}</div>
          </div>
          <div className="quiz__options">
            {q.options.map((o) => (
              <button
                key={o.id}
                className={`quiz-opt${respostas[q.id] === o.id ? ' quiz-opt--selected' : ''}`}
                onClick={() => selecionar(q.id, o.id)}
              >
                <span className="quiz-opt__label">{o.text}</span>
                {respostas[q.id] === o.id && <ChevronRight size={14} />}
              </button>
            ))}
          </div>
        </div>
      ))}

      {erro && <div className="auth__alert">{erro}</div>}

      <div className="quiz__foot">
        <span className="quiz__hint">Responda todas as questões e envie.</span>
        <div className="topbar__spacer" />
        <button
          className="btn btn--accent"
          style={{ opacity: todasRespondidas ? 1 : 0.5 }}
          disabled={!todasRespondidas || enviando}
          onClick={enviar}
        >
          {enviando ? 'Enviando...' : 'Enviar respostas'}
        </button>
      </div>
    </div>
  );
}
