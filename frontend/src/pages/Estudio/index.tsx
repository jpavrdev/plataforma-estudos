import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { Eye, Trash, Plus, Minus, Check, ChevronRight } from '../../components/Icons';
import { mensagemErro } from '../../utils/erro';
import {
  obterEstudio,
  obterAulaEstudio,
  salvarAulaEstudio,
  criarModulo,
  criarAula,
  excluirAula,
  excluirModulo,
  type StudioTrail,
  type StudioLesson,
  type StudioQuestion,
  type QuestionDifficulty,
  type BlocoTipo,
} from '../../services/trails';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

const BLOCO_TIPOS: { type: BlocoTipo; icon: string; label: string }[] = [
  { type: 'text', icon: '¶', label: 'Texto' },
  { type: 'code', icon: '{}', label: 'Código' },
  { type: 'image', icon: '▣', label: 'Imagem' },
  { type: 'video', icon: '▷', label: 'Vídeo' },
  { type: 'quote', icon: '❝', label: 'Citação' },
];
const BLOCO_LABEL: Record<BlocoTipo, string> = {
  text: 'Texto',
  code: '{ } Código',
  image: 'Imagem',
  video: 'Vídeo',
  quote: 'Citação',
};
const DIFFS: { value: QuestionDifficulty; label: string }[] = [
  { value: 'facil', label: 'Fácil' },
  { value: 'medio', label: 'Médio' },
  { value: 'dificil', label: 'Difícil' },
];

export function Estudio() {
  const { trailId } = useParams();
  const [outline, setOutline] = useState<StudioTrail | null>(null);
  const [selId, setSelId] = useState<string | null>(null);
  const selIdRef = useRef<string | null>(null);
  const [aula, setAula] = useState<StudioLesson | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState('');

  async function carregarAula(id: string) {
    selIdRef.current = id;
    setSelId(id);
    setErro('');
    try {
      setAula(await obterAulaEstudio(id));
      setSalvo(true);
    } catch {
      setErro('Não foi possível carregar a aula.');
    }
  }

  async function carregarOutline(prefer?: string | null) {
    const o = await obterEstudio(trailId!);
    setOutline(o);
    const ids = o.modules.flatMap((m) => m.lessons).map((l) => l.id);
    let alvo: string | null;
    if (prefer && ids.includes(prefer)) alvo = prefer;
    else if (prefer !== null && selIdRef.current && ids.includes(selIdRef.current))
      alvo = selIdRef.current;
    else alvo = ids[0] ?? null;
    if (alvo) await carregarAula(alvo);
    else {
      setAula(null);
      setSelId(null);
      selIdRef.current = null;
    }
  }

  useEffect(() => {
    let ativo = true;
    (async () => {
      setCarregando(true);
      try {
        const o = await obterEstudio(trailId!);
        if (!ativo) return;
        setOutline(o);
        const primeira = o.modules.flatMap((m) => m.lessons)[0]?.id ?? null;
        if (primeira) await carregarAula(primeira);
      } catch {
        if (ativo) setErro('Não foi possível carregar o estúdio.');
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trailId]);

  function sujo() {
    setSalvo(false);
  }

  // ----- mutações estruturais (vão direto ao backend) -----
  async function adicionarModulo() {
    if (!outline) return;
    const nome = window.prompt('Nome do módulo:');
    if (!nome?.trim()) return;
    try {
      await criarModulo(outline.id, nome.trim(), outline.modules.length + 1);
      await carregarOutline();
    } catch {
      setErro('Não foi possível criar o módulo.');
    }
  }

  async function adicionarAula(moduleId: string, qtd: number) {
    try {
      const nova = await criarAula(moduleId, 'Nova aula', qtd + 1);
      await carregarOutline(nova.id);
    } catch {
      setErro('Não foi possível criar a aula.');
    }
  }

  async function excluir() {
    if (!aula) return;
    if (!window.confirm('Excluir esta aula? Essa ação não pode ser desfeita.')) return;
    try {
      await excluirAula(aula.id);
      await carregarOutline(null);
    } catch {
      setErro('Não foi possível excluir a aula.');
    }
  }

  async function removerModulo(moduleId: string) {
    if (
      !window.confirm('Excluir este módulo e todas as suas aulas? Essa ação não pode ser desfeita.')
    )
      return;
    setErro('');
    try {
      await excluirModulo(moduleId);
      await carregarOutline(null);
    } catch {
      setErro('Não foi possível excluir o módulo.');
    }
  }

  async function salvar(novoPublished?: boolean) {
    if (!aula || salvando) return;
    setSalvando(true);
    setErro('');
    try {
      await salvarAulaEstudio(aula.id, {
        title: aula.title,
        contentBlocks: aula.contentBlocks,
        published: novoPublished === undefined ? aula.published : novoPublished,
        questions: aula.questions.map((q) => ({
          statement: q.statement,
          difficulty: q.difficulty,
          options: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
        })),
      });
      await carregarOutline(aula.id);
    } catch (e: unknown) {
      setErro(mensagemErro(e, 'Não foi possível salvar.'));
    } finally {
      setSalvando(false);
    }
  }

  // ----- blocos de conteúdo -----
  function addBloco(type: BlocoTipo) {
    setAula((a) => (a ? { ...a, contentBlocks: [...a.contentBlocks, { type, value: '' }] } : a));
    sujo();
  }
  function setBloco(i: number, value: string) {
    setAula((a) =>
      a
        ? { ...a, contentBlocks: a.contentBlocks.map((b, j) => (j === i ? { ...b, value } : b)) }
        : a,
    );
    sujo();
  }
  function removerBloco(i: number) {
    setAula((a) => (a ? { ...a, contentBlocks: a.contentBlocks.filter((_, j) => j !== i) } : a));
    sujo();
  }
  function moverBloco(i: number, dir: -1 | 1) {
    setAula((a) => {
      if (!a) return a;
      const arr = [...a.contentBlocks];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return a;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...a, contentBlocks: arr };
    });
    sujo();
  }

  // ----- edição local da aula -----
  function setQuestion(qi: number, patch: Partial<StudioQuestion>) {
    setAula((a) =>
      a ? { ...a, questions: a.questions.map((q, i) => (i === qi ? { ...q, ...patch } : q)) } : a,
    );
    sujo();
  }
  function setOption(qi: number, oi: number, patch: Partial<{ text: string; isCorrect: boolean }>) {
    setAula((a) =>
      a
        ? {
            ...a,
            questions: a.questions.map((q, i) =>
              i !== qi
                ? q
                : { ...q, options: q.options.map((o, j) => (j === oi ? { ...o, ...patch } : o)) },
            ),
          }
        : a,
    );
    sujo();
  }
  function marcarCorreta(qi: number, oi: number) {
    setAula((a) =>
      a
        ? {
            ...a,
            questions: a.questions.map((q, i) =>
              i !== qi
                ? q
                : { ...q, options: q.options.map((o, j) => ({ ...o, isCorrect: j === oi })) },
            ),
          }
        : a,
    );
    sujo();
  }
  function adicionarAlternativa(qi: number) {
    setAula((a) =>
      a
        ? {
            ...a,
            questions: a.questions.map((q, i) =>
              i !== qi ? q : { ...q, options: [...q.options, { text: '', isCorrect: false }] },
            ),
          }
        : a,
    );
    sujo();
  }
  function removerAlternativa(qi: number, oi: number) {
    setAula((a) =>
      a
        ? {
            ...a,
            questions: a.questions.map((q, i) =>
              i !== qi ? q : { ...q, options: q.options.filter((_, j) => j !== oi) },
            ),
          }
        : a,
    );
    sujo();
  }
  function adicionarQuestao() {
    setAula((a) =>
      a
        ? {
            ...a,
            questions: [
              ...a.questions,
              {
                statement: '',
                difficulty: 'facil',
                options: [
                  { text: '', isCorrect: true },
                  { text: '', isCorrect: false },
                ],
              },
            ],
          }
        : a,
    );
    sujo();
  }
  function removerQuestao(qi: number) {
    setAula((a) => (a ? { ...a, questions: a.questions.filter((_, i) => i !== qi) } : a));
    sujo();
  }

  const totalMod = outline?.modules.length ?? 0;
  const totalAulas = outline?.modules.reduce((s, m) => s + m.lessons.length, 0) ?? 0;
  const moduloDaAula = aula ? outline?.modules.find((m) => m.id === aula.moduleId) : undefined;
  const faltam = aula ? Math.max(0, 5 - aula.questions.length) : 0;

  return (
    <div className="home">
      <header className="topbar studio__bar">
        <div className="studio__brand">
          <Logo variant="solid" size={19} />
          <span className="studio__badge">Estúdio</span>
        </div>
        <span className="studio__divider" />
        <div className="studio__crumb">
          <Link to="/trilhas">Trilhas</Link>
          <span className="studio__crumb-sep">/</span>
          <b>{outline?.name ?? '...'}</b>
        </div>
        <div className="topbar__spacer" />
        {aula && salvo && (
          <span className="studio__saved">
            <i /> Rascunho salvo
          </span>
        )}
        {aula && (
          <Link className="btn btn--ghost studio__btn" to={`/trilhas/${trailId}/aula/${aula.id}`}>
            <Eye size={15} /> Pré-visualizar
          </Link>
        )}
        <button
          className="btn btn--accent studio__btn"
          disabled={!aula || salvando}
          onClick={() => aula && salvar(!aula.published)}
        >
          {salvando ? 'Salvando...' : aula?.published ? 'Despublicar' : 'Publicar'}
        </button>
      </header>

      {carregando ? (
        <p className="lesson__loading">Carregando estúdio...</p>
      ) : (
        <div className="studio">
          <aside className="studio__nav">
            <div className="studio__nav-head">
              <span className="studio__nav-title">Estrutura do curso</span>
              <span className="studio__nav-count">
                {totalMod} módulos · {totalAulas} aulas
              </span>
            </div>

            {outline?.modules.map((m) => (
              <div key={m.id} className="studio-mod">
                <div className="studio-mod__row" style={{ cursor: 'default' }}>
                  <span className="studio-mod__chev" style={{ transform: 'rotate(90deg)' }}>
                    <ChevronRight size={13} />
                  </span>
                  <span className="studio-mod__num">{m.position}</span>
                  <span className="studio-mod__title">{m.title}</span>
                  <span className="studio-mod__count">{m.lessons.length} aulas</span>
                  <button
                    className="studio-mod__del"
                    onClick={() => removerModulo(m.id)}
                    aria-label="Excluir módulo"
                  >
                    <Trash size={13} />
                  </button>
                </div>
                <div className="studio-mod__lessons">
                  {m.lessons.map((l) => {
                    const estado = l.id === selId ? 'active' : l.published ? 'published' : 'draft';
                    return (
                      <div
                        key={l.id}
                        className={`studio-les studio-les--${estado}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => carregarAula(l.id)}
                      >
                        <span className="studio-les__dot">
                          {l.published ? <Check size={11} /> : null}
                        </span>
                        <span className="studio-les__name">{l.title}</span>
                        {l.id === selId && <span className="studio-les__tag">editando</span>}
                      </div>
                    );
                  })}
                  <button
                    className="studio__add studio__add--ghost"
                    onClick={() => adicionarAula(m.id, m.lessons.length)}
                  >
                    <Plus size={14} /> Adicionar aula
                  </button>
                </div>
              </div>
            ))}

            <button className="studio__add studio__add--dashed" onClick={adicionarModulo}>
              <Plus size={15} /> Adicionar módulo
            </button>
          </aside>

          {aula ? (
            <main className="studio__editor">
              <div className="studio__meta">
                <span className="studio__meta-mod">{moduloDaAula?.title ?? 'Módulo'}</span>
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: 6,
                    color: aula.published ? 'var(--success)' : 'var(--muted)',
                    background: aula.published ? 'var(--success-soft)' : 'var(--surface-2)',
                  }}
                >
                  {aula.published ? 'Publicada' : 'Rascunho'}
                </span>
                <div className="topbar__spacer" />
                <button className="studio__del" onClick={excluir}>
                  <Trash size={14} /> Excluir aula
                </button>
              </div>

              <label className="studio__label">Título da aula</label>
              <div className="studio__title-field">
                <input
                  className="es-input"
                  value={aula.title}
                  onChange={(e) => {
                    setAula({ ...aula, title: e.target.value });
                    sujo();
                  }}
                />
              </div>

              <div className="studio__section">
                <span className="studio__section-title">Conteúdo da aula</span>
                <span className="studio__pill">{aula.contentBlocks.length} blocos</span>
              </div>

              <div className="studio__blocks">
                {aula.contentBlocks.map((b, i) => (
                  <div key={i} className="block">
                    <div className="block__bar">
                      <span className={`block__tag block__tag--${b.type}`}>
                        {BLOCO_LABEL[b.type]}
                      </span>
                      <div className="topbar__spacer" />
                      <button
                        className="block__act"
                        onClick={() => moverBloco(i, -1)}
                        aria-label="Mover para cima"
                      >
                        ↑
                      </button>
                      <button
                        className="block__act"
                        onClick={() => moverBloco(i, 1)}
                        aria-label="Mover para baixo"
                      >
                        ↓
                      </button>
                      <button
                        className="block__act"
                        onClick={() => removerBloco(i)}
                        aria-label="Excluir bloco"
                      >
                        <Trash size={15} />
                      </button>
                    </div>
                    {b.type === 'image' || b.type === 'video' ? (
                      <input
                        className="block__input es-input"
                        value={b.value}
                        placeholder={
                          b.type === 'image'
                            ? 'URL da imagem (https://...)'
                            : 'URL do vídeo (YouTube ou embed)'
                        }
                        onChange={(e) => setBloco(i, e.target.value)}
                      />
                    ) : (
                      <textarea
                        className={`block__edit es-input${b.type === 'code' ? ' block__edit--code' : ''}`}
                        value={b.value}
                        placeholder={
                          b.type === 'code'
                            ? 'Cole o código aqui'
                            : b.type === 'quote'
                              ? 'Texto da citação'
                              : 'Escreva o texto'
                        }
                        onChange={(e) => setBloco(i, e.target.value)}
                      />
                    )}
                  </div>
                ))}
                {aula.contentBlocks.length === 0 && (
                  <p className="studio__section-sub" style={{ margin: 0 }}>
                    Nenhum bloco ainda. Adicione conteúdo abaixo.
                  </p>
                )}
              </div>

              <div className="block-palette">
                <div className="block-palette__label">Adicionar bloco de conteúdo</div>
                <div className="block-palette__chips">
                  {BLOCO_TIPOS.map((bt) => (
                    <button key={bt.type} className="block-chip" onClick={() => addBloco(bt.type)}>
                      <span className="block-chip__icon">{bt.icon}</span> {bt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="studio__section">
                <span className="studio__section-title">Questões da aula</span>
                <span className="studio__pill">{aula.questions.length} de 5</span>
              </div>
              <p className="studio__section-sub">
                Adicione 5 questões — o aluno precisa acertar ao menos 4 para concluir a aula.
              </p>

              <div className="studio__questions">
                {aula.questions.map((q, qi) => (
                  <div key={qi} className="qcard">
                    <div className="qcard__head">
                      <span className="qcard__num">{qi + 1}</span>
                      <span className="qcard__label">Questão {qi + 1}</span>
                      <div className="topbar__spacer" />
                      <select
                        className="qcard__diff"
                        value={q.difficulty}
                        onChange={(e) =>
                          setQuestion(qi, { difficulty: e.target.value as QuestionDifficulty })
                        }
                      >
                        {DIFFS.map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                      <button
                        className="qcard__del"
                        onClick={() => removerQuestao(qi)}
                        aria-label="Excluir questão"
                      >
                        <Trash size={16} />
                      </button>
                    </div>

                    <div className="qcard__field">
                      <input
                        className="es-input"
                        value={q.statement}
                        placeholder="Enunciado da questão"
                        onChange={(e) => setQuestion(qi, { statement: e.target.value })}
                      />
                    </div>

                    <div className="qcard__options">
                      {q.options.map((o, oi) => (
                        <div key={oi} className={`qopt${o.isCorrect ? ' qopt--correct' : ''}`}>
                          <button
                            className="qopt__radio"
                            onClick={() => marcarCorreta(qi, oi)}
                            aria-label="Marcar como correta"
                          >
                            {o.isCorrect ? <Check size={12} /> : null}
                          </button>
                          <span className="qopt__letter">{LETTERS[oi] ?? oi + 1}</span>
                          <input
                            className="es-input"
                            value={o.text}
                            placeholder="Texto da alternativa"
                            onChange={(e) => setOption(qi, oi, { text: e.target.value })}
                          />
                          {o.isCorrect && <span className="qopt__tag">correta</span>}
                          <button
                            className="qopt__remove"
                            onClick={() => removerAlternativa(qi, oi)}
                            aria-label="Remover alternativa"
                          >
                            <Minus size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      className="studio__add studio__add--ghost"
                      onClick={() => adicionarAlternativa(qi)}
                    >
                      <Plus size={14} /> Adicionar alternativa
                    </button>
                  </div>
                ))}
              </div>

              {erro && <div className="auth__alert">{erro}</div>}

              <button
                className="studio__add studio__add--dashed studio__add--lg"
                onClick={adicionarQuestao}
              >
                <Plus size={16} /> Adicionar questão{' '}
                {faltam > 0 && <span className="studio__add-note">· faltam {faltam}</span>}
              </button>

              <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
                <button className="btn btn--ghost" disabled={salvando} onClick={() => salvar()}>
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </main>
          ) : (
            <main className="studio__editor">
              <p className="studio__section-sub">
                Selecione uma aula na esquerda ou adicione uma nova para começar.
              </p>
              {erro && <div className="auth__alert">{erro}</div>}
            </main>
          )}
        </div>
      )}
    </div>
  );
}
