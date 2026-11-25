import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EstudioTopbar } from '../../components/EstudioTopbar';
import { Link, useParams } from 'react-router-dom';
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
import { parseGrid, serializeGrid } from '../../utils/tabela';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

type BlocoKey =
  | 'estudio.blockText'
  | 'estudio.blockCode'
  | 'estudio.blockImage'
  | 'estudio.blockVideo'
  | 'estudio.blockQuote'
  | 'estudio.blockTable'
  | 'estudio.blockTerminal';
type DiffKey = 'desafios.diffEasy' | 'desafios.diffMedium' | 'desafios.diffHard';

const BLOCO_TIPOS: { type: BlocoTipo; icon: string; chave: BlocoKey }[] = [
  { type: 'text', icon: '¶', chave: 'estudio.blockText' },
  { type: 'code', icon: '{}', chave: 'estudio.blockCode' },
  { type: 'image', icon: '▣', chave: 'estudio.blockImage' },
  { type: 'video', icon: '▷', chave: 'estudio.blockVideo' },
  { type: 'quote', icon: '❝', chave: 'estudio.blockQuote' },
  { type: 'table', icon: '▦', chave: 'estudio.blockTable' },
  { type: 'terminal', icon: '>_', chave: 'estudio.blockTerminal' },
];
const BLOCO_CHAVE: Record<BlocoTipo, BlocoKey> = {
  text: 'estudio.blockText',
  code: 'estudio.blockCode',
  image: 'estudio.blockImage',
  video: 'estudio.blockVideo',
  quote: 'estudio.blockQuote',
  table: 'estudio.blockTable',
  terminal: 'estudio.blockTerminal',
};
const DIFFS: { value: QuestionDifficulty; chave: DiffKey }[] = [
  { value: 'facil', chave: 'desafios.diffEasy' },
  { value: 'medio', chave: 'desafios.diffMedium' },
  { value: 'dificil', chave: 'desafios.diffHard' },
];

export function Estudio() {
  const { trailId } = useParams();
  const { t } = useTranslation();
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
      setErro(t('estudio.lessonLoadError'));
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
        if (ativo) setErro(t('estudio.studioLoadError'));
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
    const nome = window.prompt(t('estudio.moduleNamePrompt'));
    if (!nome?.trim()) return;
    try {
      await criarModulo(outline.id, nome.trim(), outline.modules.length + 1);
      await carregarOutline();
    } catch {
      setErro(t('estudio.moduleCreateError'));
    }
  }

  async function adicionarAula(moduleId: string, qtd: number) {
    try {
      const nova = await criarAula(moduleId, 'Nova aula', qtd + 1);
      await carregarOutline(nova.id);
    } catch {
      setErro(t('estudio.lessonCreateError'));
    }
  }

  async function excluir() {
    if (!aula) return;
    if (!window.confirm(t('estudio.deleteLessonConfirm'))) return;
    try {
      await excluirAula(aula.id);
      await carregarOutline(null);
    } catch {
      setErro(t('estudio.lessonDeleteError'));
    }
  }

  async function removerModulo(moduleId: string) {
    if (!window.confirm(t('estudio.moduleDeleteConfirm'))) return;
    setErro('');
    try {
      await excluirModulo(moduleId);
      await carregarOutline(null);
    } catch {
      setErro(t('estudio.moduleDeleteError'));
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
      setErro(mensagemErro(e, t('estudio.saveLessonError')));
    } finally {
      setSalvando(false);
    }
  }

  // ----- blocos de conteúdo -----
  function addBloco(type: BlocoTipo) {
    // Tabela começa com um grid 2x2 (1ª linha = cabeçalho); os demais começam vazios.
    const value =
      type === 'table'
        ? serializeGrid([
            ['', ''],
            ['', ''],
          ])
        : '';
    setAula((a) => (a ? { ...a, contentBlocks: [...a.contentBlocks, { type, value }] } : a));
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
      <EstudioTopbar
        nav={false}
        crumb={
          <>
            <Link to="/trilhas">{t('nav.studioTracks')}</Link>
            <span className="studio__crumb-sep">/</span>
            <b>{outline?.name ?? '...'}</b>
          </>
        }
        actions={
          <>
            {aula && salvo && (
              <span className="studio__saved">
                <i /> {t('estudio.saved')}
              </span>
            )}
            {aula && (
              <Link
                className="btn btn--ghost studio__btn"
                to={`/trilhas/${trailId}/aula/${aula.id}`}
              >
                <Eye size={15} /> {t('estudio.preview')}
              </Link>
            )}
            <button
              className="btn btn--accent studio__btn"
              disabled={!aula || salvando}
              onClick={() => aula && salvar(!aula.published)}
            >
              {salvando
                ? t('common.saving')
                : aula?.published
                  ? t('estudio.unpublish')
                  : t('estudio.publish')}
            </button>
          </>
        }
      />

      {carregando ? (
        <p className="lesson__loading">{t('estudio.loading')}</p>
      ) : (
        <div className="studio">
          <aside className="studio__nav">
            <div className="studio__nav-head">
              <span className="studio__nav-title">{t('estudio.structure')}</span>
              <span className="studio__nav-count">
                {t('estudio.structureCount', { mod: totalMod, aulas: totalAulas })}
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
                  <span className="studio-mod__count">
                    {t('estudio.lessonsShort', { count: m.lessons.length })}
                  </span>
                  <button
                    className="studio-mod__del"
                    onClick={() => removerModulo(m.id)}
                    aria-label={t('estudio.deleteModuleAria')}
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
                        {l.id === selId && <span className="studio-les__tag">{t('estudio.editing')}</span>}
                      </div>
                    );
                  })}
                  <button
                    className="studio__add studio__add--ghost"
                    onClick={() => adicionarAula(m.id, m.lessons.length)}
                  >
                    <Plus size={14} /> {t('estudio.addLesson')}
                  </button>
                </div>
              </div>
            ))}

            <button className="studio__add studio__add--dashed" onClick={adicionarModulo}>
              <Plus size={15} /> {t('estudio.addModule')}
            </button>
          </aside>

          {aula ? (
            <main className="studio__editor">
              <div className="studio__meta">
                <span className="studio__meta-mod">
                  {moduloDaAula?.title ?? t('estudio.moduleFallback')}
                </span>
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
                  {aula.published ? t('estudio.publishedTag') : t('estudio.draftTag')}
                </span>
                <div className="topbar__spacer" />
                <button className="studio__del" onClick={excluir}>
                  <Trash size={14} /> {t('estudio.deleteLesson')}
                </button>
              </div>

              <label className="studio__label">{t('estudio.titleLabel')}</label>
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
                <span className="studio__section-title">{t('estudio.contentTitle')}</span>
                <span className="studio__pill">
                  {t('estudio.blocksCount', { count: aula.contentBlocks.length })}
                </span>
              </div>

              <div className="studio__blocks">
                {aula.contentBlocks.map((b, i) => (
                  <div key={i} className="block">
                    <div className="block__bar">
                      <span className={`block__tag block__tag--${b.type}`}>
                        {t(BLOCO_CHAVE[b.type])}
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
                    {b.type === 'terminal' ? (
                      <p className="studio__section-sub" style={{ margin: 0 }}>
                        {t('estudio.terminalHint')}
                      </p>
                    ) : b.type === 'table' ? (
                      <TabelaEditor value={b.value} onChange={(v) => setBloco(i, v)} />
                    ) : b.type === 'image' || b.type === 'video' ? (
                      <input
                        className="block__input es-input"
                        value={b.value}
                        placeholder={
                          b.type === 'image' ? t('estudio.imageUrl') : t('estudio.videoUrl')
                        }
                        onChange={(e) => setBloco(i, e.target.value)}
                      />
                    ) : (
                      <textarea
                        className={`block__edit es-input${b.type === 'code' ? ' block__edit--code' : ''}`}
                        value={b.value}
                        placeholder={
                          b.type === 'code'
                            ? t('estudio.codePlaceholder')
                            : b.type === 'quote'
                              ? t('estudio.quotePlaceholder')
                              : t('estudio.textPlaceholder')
                        }
                        onChange={(e) => setBloco(i, e.target.value)}
                      />
                    )}
                  </div>
                ))}
                {aula.contentBlocks.length === 0 && (
                  <p className="studio__section-sub" style={{ margin: 0 }}>
                    {t('estudio.noBlocks')}
                  </p>
                )}
              </div>

              <div className="block-palette">
                <div className="block-palette__label">{t('estudio.paletteLabel')}</div>
                <div className="block-palette__chips">
                  {BLOCO_TIPOS.map((bt) => (
                    <button key={bt.type} className="block-chip" onClick={() => addBloco(bt.type)}>
                      <span className="block-chip__icon">{bt.icon}</span> {t(bt.chave)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="studio__section">
                <span className="studio__section-title">{t('estudio.questionsTitle')}</span>
                <span className="studio__pill">
                  {t('estudio.questionsCount', { count: aula.questions.length })}
                </span>
              </div>
              <p className="studio__section-sub">{t('estudio.questionsHint')}</p>

              <div className="studio__questions">
                {aula.questions.map((q, qi) => (
                  <div key={qi} className="qcard">
                    <div className="qcard__head">
                      <span className="qcard__num">{qi + 1}</span>
                      <span className="qcard__label">
                        {t('estudio.questionLabel', { number: qi + 1 })}
                      </span>
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
                            {t(d.chave)}
                          </option>
                        ))}
                      </select>
                      <button
                        className="qcard__del"
                        onClick={() => removerQuestao(qi)}
                        aria-label={t('estudio.deleteQuestionAria')}
                      >
                        <Trash size={16} />
                      </button>
                    </div>

                    <div className="qcard__field">
                      <input
                        className="es-input"
                        value={q.statement}
                        placeholder={t('estudio.statementPlaceholder')}
                        onChange={(e) => setQuestion(qi, { statement: e.target.value })}
                      />
                    </div>

                    <div className="qcard__options">
                      {q.options.map((o, oi) => (
                        <div key={oi} className={`qopt${o.isCorrect ? ' qopt--correct' : ''}`}>
                          <button
                            className="qopt__radio"
                            onClick={() => marcarCorreta(qi, oi)}
                            aria-label={t('estudio.markCorrectAria')}
                          >
                            {o.isCorrect ? <Check size={12} /> : null}
                          </button>
                          <span className="qopt__letter">{LETTERS[oi] ?? oi + 1}</span>
                          <input
                            className="es-input"
                            value={o.text}
                            placeholder={t('estudio.optionPlaceholder')}
                            onChange={(e) => setOption(qi, oi, { text: e.target.value })}
                          />
                          {o.isCorrect && (
                            <span className="qopt__tag">{t('estudio.correctTag')}</span>
                          )}
                          <button
                            className="qopt__remove"
                            onClick={() => removerAlternativa(qi, oi)}
                            aria-label={t('estudio.removeOptionAria')}
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
                      <Plus size={14} /> {t('estudio.addOption')}
                    </button>
                  </div>
                ))}
              </div>

              {erro && <div className="auth__alert">{erro}</div>}

              <button
                className="studio__add studio__add--dashed studio__add--lg"
                onClick={adicionarQuestao}
              >
                <Plus size={16} /> {t('estudio.addQuestion')}{' '}
                {faltam > 0 && (
                  <span className="studio__add-note">
                    {t('estudio.missingNote', { count: faltam })}
                  </span>
                )}
              </button>

              <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
                <button className="btn btn--ghost" disabled={salvando} onClick={() => salvar()}>
                  {salvando ? t('common.saving') : t('estudio.save')}
                </button>
              </div>
            </main>
          ) : (
            <main className="studio__editor">
              <p className="studio__section-sub">{t('estudio.pickLesson')}</p>
              {erro && <div className="auth__alert">{erro}</div>}
            </main>
          )}
        </div>
      )}
    </div>
  );
}

// Editor de tabela: grid de inputs com controles para adicionar/remover linhas e
// colunas. A 1ª linha é o cabeçalho. Salva como JSON no value do bloco.
function TabelaEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useTranslation();
  const grid = parseGrid(value);
  const cols = grid[0]?.length ?? 0;

  const setCell = (r: number, c: number, v: string) =>
    onChange(
      serializeGrid(
        grid.map((row, ri) => (ri === r ? row.map((cell, ci) => (ci === c ? v : cell)) : row)),
      ),
    );
  const addLinha = () => onChange(serializeGrid([...grid, Array(cols).fill('')]));
  const removerLinha = () => {
    if (grid.length > 1) onChange(serializeGrid(grid.slice(0, -1)));
  };
  const addColuna = () => onChange(serializeGrid(grid.map((row) => [...row, ''])));
  const removerColuna = () => {
    if (cols > 1) onChange(serializeGrid(grid.map((row) => row.slice(0, -1))));
  };

  return (
    <div className="tbl-edit">
      <div
        className="tbl-edit__grid"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(90px, 1fr))` }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <input
              key={`${r}-${c}`}
              className={`tbl-edit__cell${r === 0 ? ' tbl-edit__cell--head' : ''}`}
              value={cell}
              placeholder={r === 0 ? t('estudio.headerPlaceholder') : ''}
              onChange={(e) => setCell(r, c, e.target.value)}
            />
          )),
        )}
      </div>
      <div className="tbl-edit__controls">
        <span className="tbl-edit__hint">
          {t('estudio.rows', { count: grid.length })} × {t('estudio.cols', { count: cols })} ·{' '}
          {t('estudio.headerNote')}
        </span>
        <div className="tbl-edit__actions">
          <button type="button" className="tbl-edit__btn" onClick={removerColuna}>
            {t('estudio.minusCol')}
          </button>
          <button type="button" className="tbl-edit__btn" onClick={addColuna}>
            {t('estudio.plusCol')}
          </button>
          <button type="button" className="tbl-edit__btn" onClick={removerLinha}>
            {t('estudio.minusRow')}
          </button>
          <button type="button" className="tbl-edit__btn" onClick={addLinha}>
            {t('estudio.plusRow')}
          </button>
        </div>
      </div>
    </div>
  );
}
