import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/Logo';
import { MobileMenu } from '../../components/MobileMenu';
import { UserMenu } from '../../components/UserMenu';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Flame, Check, Help, Alert, X, ChevronDown, Notebook, Pencil } from '../../components/Icons';
import { LessonNotebook } from '../../components/LessonNotebook';
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
import { listLessonNotes, createNote, type LessonNote } from '../../services/notes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { BlocosConteudo, md, TextoMath } from '../../components/BlocosConteudo';
import { prepararMarkdownComFormulas, opcoesKatex } from '../../utils/katex';
import { getTrailLang } from '../../utils/trailLang';
import {
  proximaTrilhaRoadmap,
  seguirRoadmap,
  type ProximaTrilhaRoadmap,
} from '../../services/roadmaps';
import { contarRevisaoDaTrilha } from '../../services/flashcards';

import { useNavPrincipal } from '../../hooks/useNavPrincipal';

export function Aula() {
  const { trailId, lessonId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user: authUser } = useAuth();
  const nav = useNavPrincipal();
  const displayName = authUser?.name ?? user.name;

  const [trilha, setTrilha] = useState<TrailDetail | null>(null);
  const [aula, setAula] = useState<LessonDetail | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [proximaRoadmap, setProximaRoadmap] = useState<ProximaTrilhaRoadmap | null>(null);
  const [perguntaTrilha, setPerguntaTrilha] = useState(false);
  const [buscandoProxima, setBuscandoProxima] = useState(false);
  const [temRevisao, setTemRevisao] = useState(false);

  // Notebook: the lesson notes live here (both the panel and the in-text
  // highlights read from this list).
  const [notes, setNotes] = useState<LessonNote[]>([]);
  const [notebookOpen, setNotebookOpen] = useState(() => {
    try {
      return localStorage.getItem('notebook-open') !== '0';
    } catch {
      return true;
    }
  });

  function toggleNotebook() {
    setNotebookOpen((open) => {
      try {
        localStorage.setItem('notebook-open', open ? '0' : '1');
      } catch {
        // Without localStorage (private mode/blocked) the preference lasts the session.
      }
      return !open;
    });
  }

  function noteAdded(note: LessonNote) {
    setNotes((current) => [note, ...current]);
  }

  function noteRemoved(id: string) {
    setNotes((current) => current.filter((n) => n.id !== id));
  }

  // Ao concluir a trilha, pergunta se a pessoa quer emendar a próxima do
  // roadmap; trilha fora de roadmap (ou roadmap no fim) segue para a lista.
  async function aoConcluirTrilha() {
    if (buscandoProxima) return;
    setBuscandoProxima(true);
    try {
      const r = proximaRoadmap ?? (await proximaTrilhaRoadmap(trailId!));
      setProximaRoadmap(r);
      if ((r.roadmap && r.proximaTrilha) || temRevisao) {
        setPerguntaTrilha(true);
        return;
      }
    } catch (err) {
      console.error('Falha ao buscar a próxima trilha do roadmap.', err);
    } finally {
      setBuscandoProxima(false);
    }
    navigate('/trilhas');
  }

  // O aluno corrige o palpite: passa a seguir o roadmap que escolheu e a sugestão
  // é recalculada a partir dele, agora com origem declarada.
  async function trocarRoadmap(slug: string) {
    try {
      await seguirRoadmap(slug);
      const r = await proximaTrilhaRoadmap(trailId!);
      setProximaRoadmap(r);
      if (!r.roadmap || !r.proximaTrilha) {
        setPerguntaTrilha(false);
        navigate('/trilhas');
      }
    } catch (err) {
      console.error('Falha ao trocar o roadmap seguido.', err);
    }
  }

  // A contagem vem ao abrir a aula porque o botão de revisar aparece no fim da
  // última, e não dá para descobrir isso só na hora de concluir a trilha.
  useEffect(() => {
    if (!trailId) return;
    let ativo = true;
    contarRevisaoDaTrilha(trailId)
      .then((n) => ativo && setTemRevisao(n > 0))
      .catch((err) => {
        console.error('Falha ao checar os cartões de revisão da trilha.', err);
        if (ativo) setTemRevisao(false);
      });
    return () => {
      ativo = false;
    };
  }, [trailId, lessonId]);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      setCarregando(true);
      setErro(false);
      try {
        const lang = trailId ? getTrailLang(trailId) : undefined;
        const [tr, a, ns] = await Promise.all([
          obterTrilha(trailId!, lang),
          obterAula(lessonId!, lang),
          listLessonNotes(lessonId!).catch((err) => {
            console.error('Failed to load the lesson notebook.', err);
            return [] as LessonNote[];
          }),
        ]);
        if (!ativo) return;
        setTrilha(tr);
        setAula(a);
        setNotes(ns);
      } catch (e: unknown) {
        if (!ativo) return;
        console.error('Falha ao carregar a aula:', e);
        setErro(true);
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
          <MobileMenu />
          <Logo variant="solid" size={20} to="/home" />
          <nav className="nav">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`nav__item${item.to === '/trilhas' ? ' nav__item--active' : ''}`}
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

        {carregando && <p className="lesson__loading">{t('aula.loading')}</p>}
        {erro && !carregando && (
          <div className="lesson__erro">
            <p>{t('aula.loadError')}</p>
            <Link className="btn btn--accent" to="/trilhas">
              {t('aula.backToTracks')}
            </Link>
          </div>
        )}

        {!carregando && !erro && trilha && aula && (
          <div className={`lesson${notebookOpen ? ' lesson--notebook' : ''}`}>
            <SidebarTrilha trilha={trilha} aulaAtualId={aula.id} />
            <ConteudoAula
              trilha={trilha}
              aula={aula}
              notes={notes}
              notebookOpen={notebookOpen}
              onToggleNotebook={toggleNotebook}
              onNoteAdded={noteAdded}
              onConcluir={aoConcluirTrilha}
              onRevisar={temRevisao ? () => navigate(`/revisao?trilha=${trailId}`) : null}
            />
            {notebookOpen && (
              <LessonNotebook
                trailId={trilha.id}
                lessonId={aula.id}
                notes={notes}
                onClose={toggleNotebook}
                onNoteAdded={noteAdded}
                onNoteRemoved={noteRemoved}
              />
            )}
          </div>
        )}

        {perguntaTrilha && (proximaRoadmap?.proximaTrilha || temRevisao) && (
          <div className="solve-next-scrim" onClick={() => setPerguntaTrilha(false)}>
            <div
              className="solve-next"
              role="dialog"
              aria-label={t('aula.doneAria')}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="solve-next__check">
                <Check size={22} />
              </span>
              <h3 className="solve-next__titulo">{t('aula.doneTitle')}</h3>

              {/* Revisar vem antes de emendar a próxima trilha de propósito: é o
                  momento em que o conteúdo ainda está fresco e a revisão custa pouco. */}
              {temRevisao && (
                <button
                  className="solve-next__revisar"
                  onClick={() => navigate(`/revisao?trilha=${trailId}`)}
                >
                  {t('aula.reviewTrack')}
                  <span className="solve-next__revisar-nota">{t('aula.reviewTrackHint')}</span>
                </button>
              )}

              {proximaRoadmap?.roadmap && proximaRoadmap.proximaTrilha && (
                <>
                  <p className="solve-next__sub">
                    {t('aula.nextRoadmapAsk', { name: proximaRoadmap.roadmap.name })}
                  </p>
                  <div className="solve-next__alvo">
                    <span className="solve-next__nome">{proximaRoadmap.proximaTrilha.name}</span>
                    <span className="solve-next__nivel">
                      {rotuloNivel(t, proximaRoadmap.proximaTrilha.level)}
                    </span>
                  </div>
                  {/* Esta trilha vive em mais de um roadmap e o aluno nunca disse qual
                      segue, então a sugestão é um palpite. Melhor admitir e deixar ele
                      corrigir do que mandá-lo para o caminho errado em silêncio. */}
                  {proximaRoadmap.origem !== 'declarado' &&
                    !!proximaRoadmap.outrosRoadmaps?.length && (
                      <div className="solve-next__troca">
                        <span className="solve-next__troca-aviso">{t('aula.switchHint')}</span>
                        {proximaRoadmap.outrosRoadmaps.map((r) => (
                          <button
                            key={r.slug}
                            type="button"
                            className="solve-next__troca-opcao"
                            onClick={() => trocarRoadmap(r.slug)}
                          >
                            {r.name}
                          </button>
                        ))}
                      </div>
                    )}
                </>
              )}

              <div className="solve-next__acoes">
                <button
                  className="solve-next__ficar"
                  onClick={() => {
                    setPerguntaTrilha(false);
                    navigate('/trilhas');
                  }}
                >
                  {proximaRoadmap?.proximaTrilha
                    ? t('common.notNow')
                    : t('aula.backToTracks')}
                </button>
                {proximaRoadmap?.proximaTrilha && (
                  <button
                    className="solve-next__ir"
                    onClick={() => navigate(`/trilhas/${proximaRoadmap.proximaTrilha!.id}`)}
                  >
                    {t('aula.goNext')}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type LevelKey = 'levels.beginner' | 'levels.intermediate' | 'levels.advanced';

const NIVEL_KEY: Record<string, LevelKey> = {
  iniciante: 'levels.beginner',
  intermediario: 'levels.intermediate',
  avancado: 'levels.advanced',
};

// O nível vem da API como valor estável; o rótulo traduzido só existe no catálogo.
function rotuloNivel(t: TFunction, level: string) {
  const chave = NIVEL_KEY[level];
  return chave ? t(chave) : level;
}

function SidebarTrilha({ trilha, aulaAtualId }: { trilha: TrailDetail; aulaAtualId: string }) {
  const { t } = useTranslation();
  const [aberto, setAberto] = useState(false);
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
          <div className="lesson__track-sub">{t('aula.progress', { done: feitas, total, pct })}</div>
        </div>
      </div>
      <div className="lesson__track-bar">
        <span style={{ width: `${pct}%` }} />
      </div>

      {/* No telefone a lista de aulas colapsa, para abrir a aula já mostrar o conteúdo. */}
      <button
        type="button"
        className={`lesson__toggle${aberto ? ' lesson__toggle--aberto' : ''}`}
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
      >
        {t('aula.modulesToggle')}
        <span className="lesson__toggle-chevron">
          <ChevronDown size={16} />
        </span>
      </button>

      <div className={`lesson__modules${aberto ? ' lesson__modules--aberto' : ''}`}>
        {trilha.modules.map((m) => {
          const concluidas = m.lessons.filter((l) => l.state === 'done').length;
          // A API manda todos os módulos e só as aulas publicadas: módulo vazio não está concluído.
          const moduloCompleto = m.lessons.length > 0 && concluidas === m.lessons.length;
          return (
            <div key={m.id} className="lesson__module">
              <div className="lesson__module-title">
                <span>{m.title}</span>
                <span
                  className={`lesson__module-count${moduloCompleto ? ' lesson__module-count--completo' : ''}`}
                  aria-label={t('aula.moduleAria', { done: concluidas, total: m.lessons.length })}
                >
                  {concluidas}/{m.lessons.length}
                </span>
              </div>
              {m.lessons.map((l) => {
                const ativa = l.id === aulaAtualId;
                return (
                  <Link
                    key={l.id}
                    to={`/trilhas/${trilha.id}/aula/${l.id}`}
                    className={`lesson__item lesson__item--${l.state}${ativa ? ' lesson__item--active' : ''}`}
                    onClick={() => setAberto(false)}
                  >
                    <span className="lesson__bullet">
                      {l.state === 'done' ? <Check size={11} /> : null}
                    </span>
                    <span className="lesson__item-name">{l.title}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function ConteudoAula({
  trilha,
  aula,
  notes,
  notebookOpen,
  onToggleNotebook,
  onNoteAdded,
  onConcluir,
  onRevisar,
}: {
  trilha: TrailDetail;
  aula: LessonDetail;
  notes: LessonNote[];
  notebookOpen: boolean;
  onToggleNotebook: () => void;
  onNoteAdded: (note: LessonNote) => void;
  onConcluir: () => void;
  onRevisar: (() => void) | null;
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const contentRef = useRef<HTMLElement | null>(null);
  const [highlightTarget, setHighlightTarget] = useState<{ x: number; y: number; text: string } | null>(
    null,
  );
  const [highlightSaving, setHighlightSaving] = useState(false);
  const todas = trilha.modules.flatMap((m) => m.lessons);
  const idx = todas.findIndex((l) => l.id === aula.id);
  const proxima = idx >= 0 && idx < todas.length - 1 ? todas[idx + 1] : null;
  const irProxima = proxima ? () => navigate(`/trilhas/${trilha.id}/aula/${proxima.id}`) : null;

  // A highlight starts as a text selection inside the lesson. A button shows up
  // next to the selection and saves the quote as a note; the painting of the
  // text itself is reapplied by the effect below.
  function handleSelectionEnd() {
    const sel = window.getSelection();
    const container = contentRef.current;
    if (!sel || sel.isCollapsed || !container || sel.rangeCount === 0) {
      setHighlightTarget(null);
      return;
    }
    const range = sel.getRangeAt(0);
    if (!container.contains(range.commonAncestorContainer)) {
      setHighlightTarget(null);
      return;
    }
    const text = sel.toString().trim();
    if (!text) {
      setHighlightTarget(null);
      return;
    }
    const rect = range.getBoundingClientRect();
    setHighlightTarget({
      x: Math.min(Math.max(rect.left + rect.width / 2, 80), window.innerWidth - 80),
      y: Math.max(rect.top - 46, 12),
      text,
    });
  }

  async function saveHighlight() {
    if (!highlightTarget || highlightSaving) return;
    setHighlightSaving(true);
    try {
      const note = await createNote(aula.id, 'grifo', highlightTarget.text.slice(0, 2000));
      onNoteAdded(note);
      window.getSelection()?.removeAllRanges();
      setHighlightTarget(null);
    } catch (err) {
      console.error('Failed to save the highlight.', err);
    } finally {
      setHighlightSaving(false);
    }
  }

  // Paints the saved highlights onto the lesson text. The quote is matched inside
  // a single text node (the common case of a plain paragraph); when the selection
  // spans inline elements or the content changed, the highlight simply stays in
  // the notebook only.
  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;

    function apply(root: HTMLElement) {
      const quotes = notes.filter((n) => n.kind === 'grifo').map((n) => n.body);
      root.querySelectorAll('mark.notebook-highlight').forEach((m) => {
        const parent = m.parentNode;
        if (!parent) return;
        while (m.firstChild) parent.insertBefore(m.firstChild, m);
        parent.removeChild(m);
        parent.normalize();
      });
      if (quotes.length === 0) return;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const el = node.parentElement;
          // Block code and existing highlight marks stay out of the search.
          if (!el || el.closest('.codeblock, mark.notebook-highlight')) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      });
      const pending = [...quotes];
      let node: Node | null;
      while (pending.length > 0 && (node = walker.nextNode()) !== null) {
        const original = (node as Text).data;
        for (let q = pending.length - 1; q >= 0; q--) {
          const bounds = findTextRange(original, pending[q]);
          if (!bounds) continue;
          try {
            const range = document.createRange();
            range.setStart(node, bounds.start);
            range.setEnd(node, bounds.end);
            const mark = document.createElement('mark');
            mark.className = 'notebook-highlight';
            range.surroundContents(mark);
            pending.splice(q, 1);
          } catch (err) {
            console.error('Failed to paint the highlight onto the content.', err);
            pending.splice(q, 1);
          }
        }
      }
    }

    apply(root);

    // The glossary and the markdown remount the content after the first paint;
    // the highlights are restored when that happens (ignoring the mutations
    // caused by the restoration itself).
    let scheduled: ReturnType<typeof setTimeout> | undefined;
    const observer = new MutationObserver((mutations) => {
      const onlyHighlights = mutations.every((m) =>
        [...m.addedNodes, ...m.removedNodes].every(
          (n) => n instanceof HTMLElement && n.classList.contains('notebook-highlight'),
        ),
      );
      if (onlyHighlights) return;
      clearTimeout(scheduled);
      scheduled = setTimeout(() => apply(root), 50);
    });
    observer.observe(root, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      clearTimeout(scheduled);
    };
  }, [aula.id, notes]);

  return (
    <main className="lesson__content" ref={contentRef} onMouseUp={handleSelectionEnd} onTouchEnd={handleSelectionEnd}>
      <div className="lesson__crumb">
        <span>{trilha.name}</span>
        <span className="lesson__crumb-sep">/</span>
        <span>{aula.title}</span>
        <button
          type="button"
          className={`lesson__notebook-toggle${notebookOpen ? ' lesson__notebook-toggle--active' : ''}`}
          onClick={onToggleNotebook}
          aria-pressed={notebookOpen}
          title={t('aula.notebook.toggleAria')}
        >
          <Notebook size={15} />
          <span>{t('aula.notebook.toggle')}</span>
          {notes.length > 0 && <span className="lesson__notebook-n">{notes.length}</span>}
        </button>
      </div>

      <h1 className="lesson__title">{aula.title}</h1>

      <hr className="rule lesson__rule" />

      {aula.contentBlocks && aula.contentBlocks.length > 0 ? (
        <BlocosConteudo blocks={aula.contentBlocks} />
      ) : aula.content ? (
        <div className="lesson__md">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[[rehypeKatex, opcoesKatex]]}
            components={md}
          >
            {prepararMarkdownComFormulas(aula.content)}
          </ReactMarkdown>
        </div>
      ) : (
        <p className="lesson__p lesson__p--muted">{t('aula.noContent')}</p>
      )}

      {aula.questions.length > 0 ? (
        <Quiz
          aula={aula}
          onConcluir={onConcluir}
          irProxima={irProxima}
          onRevisar={irProxima ? null : onRevisar}
        />
      ) : (
        <div className="lesson__nextbar">
          {irProxima ? (
            <button className="btn btn--accent" onClick={irProxima}>
              {t('aula.nextLesson')}
            </button>
          ) : (
            <>
              {onRevisar && (
                <button className="btn btn--ghost" onClick={onRevisar}>
                  {t('aula.reviewCards')}
                </button>
              )}
              <button className="btn btn--accent" onClick={onConcluir}>
                {t('aula.finishTrack')}
              </button>
            </>
          )}
        </div>
      )}

      {highlightTarget && (
        <button
          type="button"
          className="notebook-fab"
          style={{ left: highlightTarget.x, top: highlightTarget.y }}
          // Focusing on mouse down would steal the selection before the click lands.
          onMouseDown={(e) => e.preventDefault()}
          onClick={saveHighlight}
          disabled={highlightSaving}
        >
          <Pencil size={13} />
          {highlightSaving ? t('common.saving') : t('aula.notebook.highlight')}
        </button>
      )}
    </main>
  );
}

// Matches the quote (with normalized whitespace) against the original node text
// and returns the offsets in the original string, ready for a Range.
function findTextRange(original: string, rawQuote: string): { start: number; end: number } | null {
  const quote = rawQuote.replace(/\s+/g, ' ').trim();
  if (!quote) return null;
  const map: number[] = [];
  let norm = '';
  let inSpace = false;
  for (let i = 0; i < original.length; i++) {
    if (/\s/.test(original[i])) {
      if (inSpace) continue;
      inSpace = true;
      map[norm.length] = i;
      norm += ' ';
    } else {
      inSpace = false;
      map[norm.length] = i;
      norm += original[i];
    }
  }
  const idx = norm.trimStart().indexOf(quote);
  if (idx < 0) return null;
  const normStart = norm.length - norm.trimStart().length;
  const start = map[normStart + idx];
  const end = map[normStart + idx + quote.length - 1];
  return start !== undefined && end !== undefined ? { start, end: end + 1 } : null;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

// Quiz em carrossel: uma questao por vez, com feedback imediato verificado no servidor.
function Quiz({
  aula,
  onConcluir,
  irProxima,
  onRevisar,
}: {
  aula: LessonDetail;
  onConcluir: () => void;
  irProxima: (() => void) | null;
  onRevisar: (() => void) | null;
}) {
  const { t } = useTranslation();
  const total = aula.questions.length;
  const jaConcluida = aula.state === 'done';
  const respondido = total > 0 && aula.questions.every((q) => q.answer);
  const acertosSalvos = aula.questions.filter((q) => q.answer?.isCorrect).length;
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [correctOptionId, setCorrectOptionId] = useState<string | null>(null);
  const [explicacao, setExplicacao] = useState<string | null>(null);
  const [verSolucao, setVerSolucao] = useState(false);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [verificando, setVerificando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<QuizResult | null>(
    respondido
      ? { correct: acertosSalvos, total, passed: jaConcluida, lessonCompleted: jaConcluida }
      : null,
  );
  // A mensagem mora no catálogo: o estado guarda só a chave.
  const [erro, setErro] = useState<'' | 'aula.quiz.submitError' | 'aula.quiz.checkError'>('');
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
      setErro('aula.quiz.submitError');
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
      setExplicacao(r.explanation ?? null);
      setVerSolucao(false);
      setChecked(true);
    } catch {
      setErro('aula.quiz.checkError');
    } finally {
      setVerificando(false);
    }
  }

  // Na última questão não enviamos sozinho: assim a pessoa lê a resolução com calma
  // antes de ir para o resultado. As respostas já estão em `respostas` (uma por questão).
  function verResultado() {
    const answers = aula.questions.map((qq) => ({
      questionId: qq.id,
      optionId: respostas[qq.id],
    }));
    submeterQuiz(answers);
  }

  function avancar() {
    setQIndex((i) => i + 1);
    setSelected(null);
    setChecked(false);
    setWasCorrect(false);
    setCorrectOptionId(null);
    setExplicacao(null);
    setVerSolucao(false);
  }

  function refazer() {
    setQIndex(0);
    setSelected(null);
    setChecked(false);
    setWasCorrect(false);
    setCorrectOptionId(null);
    setExplicacao(null);
    setVerSolucao(false);
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
            {resultado.passed ? t('aula.quiz.passedTitle') : t('aula.quiz.failedTitle')}
          </div>
          <div className="quiz__result-text">
            {resultado.passed ? t('aula.quiz.passedText') : t('aula.quiz.failedText')}
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
              {t('aula.quiz.retry')}
            </button>
            {concluida &&
              (irProxima ? (
                <button className="btn btn--accent" onClick={irProxima}>
                  {t('aula.nextLesson')}
                </button>
              ) : (
                <>
                  {/* Última aula da trilha: revisar aqui é o momento em que o
                      conteúdo todo ainda está fresco. */}
                  {onRevisar && (
                    <button className="btn btn--ghost" onClick={onRevisar}>
                      {t('aula.reviewCards')}
                    </button>
                  )}
                  <button className="btn btn--accent" onClick={onConcluir}>
                    {t('aula.finishTrack')}
                  </button>
                </>
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
          <div className="quiz__title">{t('aula.quiz.title')}</div>
          <div className="quiz__sub">{t('aula.quiz.sub', { count: total })}</div>
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
          <div className="quiz__q-text">
            <TextoMath>{q.statement}</TextoMath>
          </div>
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
              <span className="quiz-opt__label">
                <TextoMath>{o.text}</TextoMath>
              </span>
            </button>
          ))}
        </div>

        {checked && (
          <div className={`quiz__feedback quiz__feedback--${wasCorrect ? 'ok' : 'no'}`}>
            {wasCorrect
              ? t('aula.quiz.correct')
              : t('aula.quiz.wrong', { letter: letraCorreta() })}
          </div>
        )}

        {checked && explicacao && (
          <div className="quiz__solucao">
            <button
              type="button"
              className="quiz__solucao-toggle"
              onClick={() => setVerSolucao((v) => !v)}
            >
              {verSolucao ? t('aula.quiz.hideSolution') : t('aula.quiz.showSolution')}
            </button>
            {verSolucao && (
              <div className="quiz__solucao-corpo lesson__md">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[[rehypeKatex, opcoesKatex]]}
                  components={md}
                >
                  {prepararMarkdownComFormulas(explicacao)}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {erro && <div className="auth__alert">{t(erro)}</div>}

        <div className="quiz__foot">
          <span className="quiz__hint">
            {!checked
              ? t('aula.quiz.hintSelect')
              : isLast
                ? t('aula.quiz.hintLast')
                : t('aula.quiz.hintNext')}
          </span>
          <div className="topbar__spacer" />
          {!checked ? (
            <button
              className="btn btn--accent"
              style={{ opacity: selected == null ? 0.5 : 1 }}
              disabled={selected == null || verificando}
              onClick={verificar}
            >
              {verificando ? t('common.checking') : t('aula.quiz.check')}
            </button>
          ) : isLast ? (
            <button className="btn btn--accent" disabled={enviando} onClick={verResultado}>
              {enviando ? t('common.sending') : t('aula.quiz.seeResult')}
            </button>
          ) : (
            <button className="btn btn--accent" onClick={avancar}>
              {t('aula.quiz.nextQuestion')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
