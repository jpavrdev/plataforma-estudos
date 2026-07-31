import { useState, useEffect, useCallback, lazy, Suspense, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { UserMenu } from '../../components/UserMenu';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Flame, ChevronLeft, ChevronDown, Play, Check, X, ClockExam } from '../../components/Icons';
import { getInitials } from '../../utils/initials';
import { user as homeUser } from '../../data/home';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { mensagemErro } from '../../utils/erro';
import { BlocosConteudo } from '../../components/BlocosConteudo';
import {
  rodarExemplos,
  submeterDesafio,
  getSolucoesDesafio,
  getComentariosDesafio,
  comentarDesafio,
  excluirComentarioDesafio,
  type DesafioDetalhe,
  type Linguagem,
  type RunResultado,
  type SubmitResultado,
  type SolucaoComunidade,
  type ComentarioDesafio,
} from '../../services/desafios';

const EditorCodigo = lazy(() => import('../../components/EditorCodigo'));

const LINGUAGENS: { id: Linguagem; label: string }[] = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
];
const DIF_LABEL: Record<string, string> = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' };
const TABS = [
  { id: 'enunciado', label: 'Enunciado' },
  { id: 'solucoes', label: 'Soluções' },
  { id: 'discussao', label: 'Discussão' },
] as const;

const STARTER_STDIN: Record<Linguagem, string> = {
  javascript: `const entrada = require('fs').readFileSync(0, 'utf8').trim();
const linhas = entrada.split('\\n');

// Escreva sua solução e imprima o resultado com console.log(...)
`,
  python: `import sys

dados = sys.stdin.read().split()

# Escreva sua solução e imprima o resultado com print(...)
`,
  java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // Escreva sua solução e imprima o resultado com System.out.println(...)
    }
}
`,
};

function starterPadrao(desafio: DesafioDetalhe, lang: Linguagem): string {
  if (desafio.kind !== 'function') return STARTER_STDIN[lang];
  const entry = desafio.entryPoint || 'solve';
  if (lang === 'javascript')
    return `class Solution {
  // Receba os argumentos do caso como parâmetros
  ${entry}() {
    // sua solução aqui
  }
}
`;
  if (lang === 'python')
    return `class Solution:
    # Receba os argumentos do caso como parâmetros
    def ${entry}(self):
        # sua solução aqui
        pass
`;
  return `public class Solution {
    // Declare o método ${entry} com os parâmetros do caso e retorne o resultado
}
`;
}

// Ícones inline para casar com o mockup.
const IconeCodigo = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);
const IconeReset = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 2v6h6" />
    <path d="M3.5 8a9 9 0 1 0 2-3.3L3 8" />
  </svg>
);
const TAB_ICONS: Record<string, ReactNode> = {
  enunciado: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h13l3 3v13H4z" />
      <path d="M8 9h8M8 13h8M8 17h5" />
    </svg>
  ),
  solucoes: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.4 1 2.5h6c0-1.1.4-1.9 1-2.5A6 6 0 0 0 12 3z" />
    </svg>
  ),
  discussao: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
};

function useCronometro() {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  return { secs, fmt: `${mm}:${ss}` };
}

function fmtDuracao(s: number | null | undefined): string | null {
  if (s == null) return null;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}min`;
  return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

function fmtData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export function ResolverDesafio({ desafio }: { desafio: DesafioDetalhe }) {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { mostrar } = useToast();
  const tempo = useCronometro();

  const [aba, setAba] = useState<'enunciado' | 'solucoes' | 'discussao'>('enunciado');
  const [linguagem, setLinguagem] = useState<Linguagem>(
    desafio.minhaSolucao?.language ?? 'javascript',
  );
  const [langAberto, setLangAberto] = useState(false);
  // Quem já resolveu reabre com a própria solução; os demais, com o código inicial.
  const [codigos, setCodigos] = useState<Record<Linguagem, string>>(() => {
    const base = {
      javascript: desafio.starterCode.javascript || starterPadrao(desafio, 'javascript'),
      python: desafio.starterCode.python || starterPadrao(desafio, 'python'),
      java: desafio.starterCode.java || starterPadrao(desafio, 'java'),
    };
    if (desafio.minhaSolucao) base[desafio.minhaSolucao.language] = desafio.minhaSolucao.code;
    return base;
  });
  const [rodando, setRodando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [run, setRun] = useState<RunResultado | null>(null);
  const [submit, setSubmit] = useState<SubmitResultado | null>(null);
  const [casoSel, setCasoSel] = useState(0);
  const [resolvido, setResolvido] = useState(desafio.solved);

  const codigo = codigos[linguagem];
  const setCodigo = (v: string) => setCodigos((c) => ({ ...c, [linguagem]: v }));
  const ocupado = rodando || enviando;

  function resetarCodigo() {
    setCodigo(desafio.starterCode[linguagem] || starterPadrao(desafio, linguagem));
  }

  async function aoRodar() {
    setRodando(true);
    setSubmit(null);
    setCasoSel(0);
    try {
      setRun(await rodarExemplos(desafio.id, linguagem, codigo));
    } catch (e) {
      mostrar(mensagemErro(e, 'Não foi possível executar.'), 'erro');
    } finally {
      setRodando(false);
    }
  }

  async function aoEnviar() {
    setEnviando(true);
    setRun(null);
    try {
      const r = await submeterDesafio(desafio.id, linguagem, codigo, tempo.secs);
      setSubmit(r);
      if (r.passed) {
        setResolvido(true);
        mostrar(r.xpEarned > 0 ? `Solução aceita! +${r.xpEarned} XP` : 'Solução aceita!');
      }
    } catch (e) {
      mostrar(mensagemErro(e, 'Não foi possível enviar.'), 'erro');
    } finally {
      setEnviando(false);
    }
  }

  const displayName = authUser?.name ?? homeUser.name;

  // As restrições (bloco que começa com "Restrições") vão para o fim, depois dos exemplos.
  const ehRestricao = (b: { value: string }) => /^\s*(?:\*\*|#{1,6}\s*)?restri[çc]/i.test(b.value);
  const blocosStatement = desafio.statementBlocks.filter((b) => !ehRestricao(b));
  const blocosRestricoes = desafio.statementBlocks.filter(ehRestricao);

  return (
    <div className="solve">
      <header className="solve-bar">
        <Logo variant="solid" size={19} to="/home" />
        <button className="solve-bar__back" onClick={() => navigate('/desafios')}>
          <ChevronLeft size={16} /> {desafio.isToday ? 'Desafio do dia' : 'Desafios'}
        </button>
        <span className={`solve-pill solve-pill--${desafio.difficulty}`}>
          {DIF_LABEL[desafio.difficulty]}
        </span>
        {resolvido && (
          <span className="solve-pill solve-pill--solved">
            Resolvido
            {fmtDuracao(desafio.minhaSolucao?.durationSeconds)
              ? ` em ${fmtDuracao(desafio.minhaSolucao?.durationSeconds)}`
              : ''}
          </span>
        )}
        <div className="topbar__spacer" />
        <span className="solve-bar__timer">
          <ClockExam size={15} /> {tempo.fmt}
        </span>
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

      <div className="solve-grid">
        {/* Enunciado */}
        <section className="solve-left">
          <div className="solve-tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`solve-tab${aba === t.id ? ' solve-tab--active' : ''}`}
                onClick={() => setAba(t.id)}
              >
                {TAB_ICONS[t.id]} {t.label}
              </button>
            ))}
          </div>

          {aba === 'enunciado' ? (
            <div className="solve-statement">
              <h1 className="solve-title">
                {desafio.number != null ? `${desafio.number}. ` : ''}
                {desafio.title}
              </h1>
              <div className="solve-meta">
                <span className={`solve-pill solve-pill--${desafio.difficulty}`}>
                  {DIF_LABEL[desafio.difficulty]}
                </span>
                <span className="solve-pill solve-pill--xp">+{desafio.xp} XP</span>
                {desafio.acceptance != null && (
                  <span className="solve-meta__accept">{desafio.acceptance}% de aceitação</span>
                )}
                {desafio.topic && <span className="solve-meta__topic">{desafio.topic}</span>}
              </div>

              <BlocosConteudo blocks={blocosStatement} />

              {desafio.exampleTests.length > 0 && (
                <div className="solve-examples">
                  {desafio.exampleTests.map((ex, i) => (
                    <div className="solve-ex" key={i}>
                      <div className="solve-ex__title">Exemplo {i + 1}</div>
                      <div className="solve-ex__box">
                        <div className="solve-ex__line">
                          <span className="solve-ex__k">
                            {desafio.kind === 'function' ? 'Argumentos:' : 'Entrada:'}
                          </span>
                          <span className="solve-ex__v">{ex.input.trim()}</span>
                        </div>
                        <div className="solve-ex__line">
                          <span className="solve-ex__k">
                            {desafio.kind === 'function' ? 'Retorno:' : 'Saída:'}
                          </span>
                          <span className="solve-ex__v">{ex.expectedOutput.trim()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {blocosRestricoes.length > 0 && (
                <div className="solve-restr">
                  <BlocosConteudo blocks={blocosRestricoes} />
                </div>
              )}
            </div>
          ) : aba === 'solucoes' ? (
            <AbaSolucoes desafioId={desafio.id} resolvido={resolvido} />
          ) : (
            <AbaDiscussao desafioId={desafio.id} />
          )}
        </section>

        {/* Editor + resultados */}
        <section className="solve-ide">
          <div className="solve-ide__bar">
            <div className="solve-lang">
              <button
                className="solve-lang__btn"
                onClick={() => setLangAberto((o) => !o)}
                disabled={ocupado}
              >
                <IconeCodigo />
                {LINGUAGENS.find((l) => l.id === linguagem)!.label}
                <ChevronDown size={13} />
              </button>
              {langAberto && (
                <>
                  <div className="solve-lang__scrim" onClick={() => setLangAberto(false)} />
                  <div className="solve-lang__menu">
                    {LINGUAGENS.map((l) => (
                      <button
                        key={l.id}
                        className={`solve-lang__opt${l.id === linguagem ? ' solve-lang__opt--on' : ''}`}
                        onClick={() => {
                          setLinguagem(l.id);
                          setLangAberto(false);
                        }}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="topbar__spacer" />
            <button className="solve-tool" onClick={resetarCodigo} title="Restaurar código inicial">
              <IconeReset />
            </button>
          </div>

          <div className="solve-code">
            <Suspense fallback={<div className="solve-code__loading">Carregando editor...</div>}>
              <EditorCodigo
                value={codigo}
                onChange={setCodigo}
                language={linguagem}
                dark
                height="100%"
              />
            </Suspense>
          </div>

          <div className="solve-out">
            {run && <ResultadoRun run={run} casoSel={casoSel} setCasoSel={setCasoSel} />}
            {submit && <ResultadoSubmit submit={submit} />}
            {!run && !submit && (
              <div className="solve-out__hint">
                Rode os exemplos com <b>Executar</b> ou envie sua solução.
              </div>
            )}
          </div>

          <div className="solve-foot">
            <span className="solve-foot__auto">Salvo automaticamente</span>
            <div className="solve-foot__actions">
              <button className="solve-run" onClick={aoRodar} disabled={ocupado}>
                <Play size={13} /> {rodando ? 'Executando...' : 'Executar'}
              </button>
              <button className="solve-send" onClick={aoEnviar} disabled={ocupado}>
                {enviando ? 'Enviando...' : 'Enviar solução'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ResultadoRun({
  run,
  casoSel,
  setCasoSel,
}: {
  run: RunResultado;
  casoSel: number;
  setCasoSel: (i: number) => void;
}) {
  if (run.compileError) {
    return (
      <div className="solve-out__inner">
        <div className="solve-out__head">
          <span className="solve-verdict solve-verdict--err">
            <X size={16} /> Erro ao executar o código
          </span>
        </div>
        <pre className="solve-io solve-io--err">{run.compileError}</pre>
      </div>
    );
  }
  const todos = run.cases.length > 0 && run.cases.every((c) => c.passed);
  const c = run.cases[casoSel];
  return (
    <div className="solve-out__inner">
      <div className="solve-out__head">
        <span className={`solve-verdict ${todos ? 'solve-verdict--ok' : 'solve-verdict--err'}`}>
          {todos ? <Check size={16} /> : <X size={16} />}
          {todos ? 'Todos os testes passaram' : 'Alguns exemplos falharam'}
        </span>
        <span className="solve-time">Tempo: {run.timeMs}ms</span>
      </div>
      <div className="solve-cases">
        {run.cases.map((cc, i) => (
          <button
            key={i}
            className={`solve-case${i === casoSel ? ' solve-case--active' : ''} ${cc.passed ? 'solve-case--ok' : 'solve-case--fail'}`}
            onClick={() => setCasoSel(i)}
          >
            {cc.passed ? <Check size={13} /> : <X size={13} />} Caso {i + 1}
          </button>
        ))}
      </div>
      {c && (
        <div className="solve-case-detail">
          <div className="solve-ex__line">
            <span className="solve-ex__k">Entrada:</span>
            <span className="solve-ex__v">{c.input.trim()}</span>
          </div>
          <div className="solve-ex__line">
            <span className="solve-ex__k">Esperado:</span>
            <span className="solve-ex__v">{c.expected.trim()}</span>
          </div>
          <div className="solve-ex__line">
            <span className="solve-ex__k">Seu resultado:</span>
            <span className={`solve-ex__v${c.passed ? '' : ' solve-ex__v--err'}`}>
              {c.timedOut ? '(tempo esgotado)' : c.got.trim() || '(vazio)'}
            </span>
          </div>
          {c.stderr && <pre className="solve-io solve-io--err">{c.stderr}</pre>}
        </div>
      )}
    </div>
  );
}

function ResultadoSubmit({ submit }: { submit: SubmitResultado }) {
  const titulo = submit.passed
    ? 'Solução aceita!'
    : submit.status === 'error'
      ? 'Erro de compilação'
      : submit.status === 'timeout'
        ? 'Tempo esgotado'
        : 'Ainda não passou';
  return (
    <div className="solve-out__inner">
      <div className="solve-out__head">
        <span
          className={`solve-verdict ${submit.passed ? 'solve-verdict--ok' : 'solve-verdict--err'}`}
        >
          {submit.passed ? <Check size={16} /> : <X size={16} />}
          {titulo}
        </span>
        <span className="solve-time">Tempo: {submit.timeMs}ms</span>
      </div>
      <div className="solve-out__score">
        {submit.passedCount} de {submit.totalCount} casos
        {submit.xpEarned > 0 && <span className="solve-out__xp">+{submit.xpEarned} XP</span>}
      </div>
      {submit.output && <pre className="solve-io solve-io--err">{submit.output}</pre>}
    </div>
  );
}

function CabecalhoAutor({
  autor,
  quando,
  destaque,
}: {
  autor: SolucaoComunidade['autor'];
  quando: string;
  destaque?: string;
}) {
  return (
    <div className="solve-autor">
      {autor.avatarUrl ? (
        <img className="solve-autor__ava" src={autor.avatarUrl} alt="" />
      ) : (
        <span className="solve-autor__ava solve-autor__ava--ini">{getInitials(autor.name)}</span>
      )}
      <span className="solve-autor__nome">{destaque ?? autor.name}</span>
      <span className="solve-autor__nivel">Lv{autor.level}</span>
      <span className="solve-autor__data">{fmtData(quando)}</span>
    </div>
  );
}

function AbaSolucoes({ desafioId, resolvido }: { desafioId: string; resolvido: boolean }) {
  const [solucoes, setSolucoes] = useState<SolucaoComunidade[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!resolvido) return;
    let ativo = true;
    getSolucoesDesafio(desafioId)
      .then((s) => ativo && setSolucoes(s))
      .catch((e) => ativo && setErro(mensagemErro(e, 'Não foi possível carregar as soluções.')));
    return () => {
      ativo = false;
    };
  }, [desafioId, resolvido]);

  if (!resolvido) {
    return (
      <div className="solve-lock">
        <span className="solve-lock__icone">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </span>
        Resolva o desafio para desbloquear as soluções da comunidade.
      </div>
    );
  }
  if (erro) return <div className="solve-soon">{erro}</div>;
  if (!solucoes) return <div className="solve-soon">Carregando...</div>;
  if (solucoes.length === 0) {
    return <div className="solve-soon">Ainda não há soluções por aqui.</div>;
  }
  return (
    <div className="solve-sols">
      {solucoes.map((s) => (
        <article className={`solve-sol${s.minha ? ' solve-sol--minha' : ''}`} key={s.id}>
          <header className="solve-sol__head">
            <CabecalhoAutor
              autor={s.autor}
              quando={s.createdAt}
              destaque={s.minha ? 'Sua solução' : undefined}
            />
            <span className="solve-sol__lang">
              {LINGUAGENS.find((l) => l.id === s.language)?.label ?? s.language}
            </span>
            {fmtDuracao(s.durationSeconds) && (
              <span className="solve-sol__tempo">
                <ClockExam size={13} /> {fmtDuracao(s.durationSeconds)}
              </span>
            )}
          </header>
          <pre className="solve-sol__code">
            <code>{s.code}</code>
          </pre>
        </article>
      ))}
    </div>
  );
}

function AbaDiscussao({ desafioId }: { desafioId: string }) {
  const { mostrar } = useToast();
  const [comentarios, setComentarios] = useState<ComentarioDesafio[] | null>(null);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setComentarios(await getComentariosDesafio(desafioId));
    } catch (e) {
      console.error('Falha ao carregar comentários do desafio', e);
      setComentarios([]);
    }
  }, [desafioId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function aoComentar() {
    const conteudo = texto.trim();
    if (!conteudo || enviando) return;
    setEnviando(true);
    try {
      await comentarDesafio(desafioId, conteudo);
      setTexto('');
      await carregar();
    } catch (e) {
      mostrar(mensagemErro(e, 'Não foi possível comentar.'), 'erro');
    } finally {
      setEnviando(false);
    }
  }

  async function aoExcluir(id: string) {
    try {
      await excluirComentarioDesafio(id);
      await carregar();
    } catch (e) {
      mostrar(mensagemErro(e, 'Não foi possível excluir o comentário.'), 'erro');
    }
  }

  return (
    <div className="solve-disc">
      <div className="solve-disc__form">
        <textarea
          className="solve-disc__input"
          placeholder="Compartilhe uma dica ou dúvida sobre este desafio (sem colar a solução)."
          value={texto}
          maxLength={1000}
          rows={3}
          onChange={(e) => setTexto(e.target.value)}
        />
        <button className="solve-send" onClick={aoComentar} disabled={enviando || !texto.trim()}>
          {enviando ? 'Enviando...' : 'Comentar'}
        </button>
      </div>
      {!comentarios ? (
        <div className="solve-soon">Carregando...</div>
      ) : comentarios.length === 0 ? (
        <div className="solve-soon">Seja a primeira pessoa a comentar.</div>
      ) : (
        <div className="solve-disc__lista">
          {comentarios.map((c) => (
            <div className="solve-disc__item" key={c.id}>
              <div className="solve-disc__topo">
                <CabecalhoAutor autor={c.autor} quando={c.createdAt} />
                {c.minha && (
                  <button
                    className="solve-disc__excluir"
                    onClick={() => aoExcluir(c.id)}
                    title="Excluir comentário"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <p className="solve-disc__texto">{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
