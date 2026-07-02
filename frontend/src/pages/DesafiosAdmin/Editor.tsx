import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { Plus, Trash } from '../../components/Icons';
import { useToast } from '../../contexts/ToastContext';
import { mensagemErro } from '../../utils/erro';
import {
  adminGetDesafio,
  adminCriarDesafio,
  adminAtualizarDesafio,
  type Bloco,
  type CasoTesteAdmin,
  type DesafioInput,
  type TipoDesafio,
} from '../../services/desafios';

type Dif = 'facil' | 'medio' | 'dificil';

const BLOCOS: { type: string; label: string; placeholder: string }[] = [
  {
    type: 'text',
    label: 'Texto',
    placeholder: 'Escreva o enunciado. Aceita **negrito**, _itálico_ e `código`.',
  },
  { type: 'code', label: 'Código', placeholder: 'Cole um trecho de código' },
  { type: 'quote', label: 'Citação', placeholder: 'Texto da citação' },
];
const BLOCO_LABEL: Record<string, string> = {
  text: 'Texto',
  code: 'Código',
  quote: 'Citação',
  table: 'Tabela',
};
const DIFS: { value: Dif; label: string }[] = [
  { value: 'facil', label: 'Fácil' },
  { value: 'medio', label: 'Médio' },
  { value: 'dificil', label: 'Difícil' },
];

const XP_POR_DIF: Record<Dif, number> = { facil: 50, medio: 80, dificil: 120 };

interface FormState {
  title: string;
  numero: string;
  topic: string;
  kind: TipoDesafio;
  entryPoint: string;
  difficulty: Dif;
  activeDate: string;
  published: boolean;
  blocks: Bloco[];
  starterJs: string;
  starterPy: string;
  tests: CasoTesteAdmin[];
}

const VAZIO: FormState = {
  title: '',
  numero: '',
  topic: '',
  kind: 'stdin',
  entryPoint: '',
  difficulty: 'facil',
  activeDate: '',
  published: false,
  blocks: [{ type: 'text', value: '' }],
  starterJs: '',
  starterPy: '',
  tests: [{ input: '', expectedOutput: '', isPublic: true }],
};

export function DesafioEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { mostrar } = useToast();
  const novo = id === 'novo';
  const [form, setForm] = useState<FormState | null>(novo ? { ...VAZIO } : null);
  const [carregando, setCarregando] = useState(!novo);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (novo) return;
    adminGetDesafio(id!)
      .then((d) => {
        setForm({
          title: d.title,
          numero: d.number != null ? String(d.number) : '',
          topic: d.topic ?? '',
          kind: d.kind,
          entryPoint: d.entryPoint ?? '',
          difficulty: d.difficulty,
          activeDate: d.activeDate ?? '',
          published: d.published,
          blocks: d.statementBlocks.length ? d.statementBlocks : [{ type: 'text', value: '' }],
          starterJs: d.starterCode.javascript ?? '',
          starterPy: d.starterCode.python ?? '',
          tests: d.tests.length ? d.tests : [{ input: '', expectedOutput: '', isPublic: true }],
        });
      })
      .catch(() => setErro('Não foi possível carregar o desafio.'))
      .finally(() => setCarregando(false));
  }, [id, novo]);

  const patch = (campos: Partial<FormState>) => setForm((f) => (f ? { ...f, ...campos } : f));

  // ----- blocos -----
  const addBloco = (type: string) =>
    setForm((f) => (f ? { ...f, blocks: [...f.blocks, { type, value: '' }] } : f));
  const setBloco = (i: number, value: string) =>
    setForm((f) =>
      f ? { ...f, blocks: f.blocks.map((b, j) => (j === i ? { ...b, value } : b)) } : f,
    );
  const removerBloco = (i: number) =>
    setForm((f) => (f ? { ...f, blocks: f.blocks.filter((_, j) => j !== i) } : f));
  const moverBloco = (i: number, dir: -1 | 1) =>
    setForm((f) => {
      if (!f) return f;
      const arr = [...f.blocks];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return f;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...f, blocks: arr };
    });

  // ----- casos de teste -----
  const addTeste = () =>
    setForm((f) =>
      f ? { ...f, tests: [...f.tests, { input: '', expectedOutput: '', isPublic: false }] } : f,
    );
  const setTeste = (i: number, campos: Partial<CasoTesteAdmin>) =>
    setForm((f) =>
      f ? { ...f, tests: f.tests.map((t, j) => (j === i ? { ...t, ...campos } : t)) } : f,
    );
  const removerTeste = (i: number) =>
    setForm((f) => (f ? { ...f, tests: f.tests.filter((_, j) => j !== i) } : f));

  async function salvar() {
    if (!form || salvando) return;
    if (!form.title.trim()) {
      setErro('Dê um título ao desafio.');
      return;
    }
    const tests = form.tests.filter((t) => t.input !== '' || t.expectedOutput !== '');
    if (tests.length === 0) {
      setErro('Adicione ao menos um caso de teste.');
      return;
    }
    if (!tests.some((t) => t.isPublic)) {
      setErro('Marque ao menos um caso como exemplo (público).');
      return;
    }
    const starterCode: DesafioInput['starterCode'] = {};
    if (form.starterJs.trim()) starterCode.javascript = form.starterJs;
    if (form.starterPy.trim()) starterCode.python = form.starterPy;
    if (form.kind === 'function' && !/^[A-Za-z_]\w*$/.test(form.entryPoint.trim())) {
      setErro('Informe o nome do método (ex.: twoSum) para desafios do tipo função.');
      return;
    }
    const payload: DesafioInput = {
      title: form.title.trim(),
      number: form.numero ? Number(form.numero) : null,
      topic: form.topic.trim(),
      kind: form.kind,
      entryPoint: form.kind === 'function' ? form.entryPoint.trim() : '',
      difficulty: form.difficulty,
      activeDate: form.activeDate || null,
      published: form.published,
      statementBlocks: form.blocks.filter((b) => b.value.trim() !== ''),
      starterCode,
      tests,
    };
    setSalvando(true);
    setErro('');
    try {
      if (novo) {
        await adminCriarDesafio(payload);
        mostrar('Desafio criado.');
      } else {
        await adminAtualizarDesafio(id!, payload);
        mostrar('Desafio salvo.');
      }
      navigate('/estudio/desafios');
    } catch (e) {
      setErro(mensagemErro(e, 'Não foi possível salvar o desafio.'));
    } finally {
      setSalvando(false);
    }
  }

  const cabecalho = (
    <header className="topbar studio__bar">
      <div className="studio__brand">
        <Logo variant="solid" size={19} />
        <span className="studio__badge">Estúdio</span>
      </div>
      <span className="studio__divider" />
      <div className="studio__crumb">
        <Link to="/estudio/desafios">Desafios</Link>
        <span>/</span>
        <b>{novo ? 'Novo desafio' : form?.title || 'Editar'}</b>
      </div>
      <div className="topbar__spacer" />
      <button className="btn btn--accent studio__btn" disabled={salvando || !form} onClick={salvar}>
        {salvando ? 'Salvando...' : 'Salvar'}
      </button>
      <Link className="btn btn--ghost studio__btn" to="/estudio/desafios">
        Voltar
      </Link>
    </header>
  );

  if (carregando) {
    return (
      <div className="home">
        {cabecalho}
        <div className="estudio-home">
          <p className="track__desc">Carregando...</p>
        </div>
      </div>
    );
  }
  if (!form) {
    return (
      <div className="home">
        {cabecalho}
        <div className="estudio-home">
          <div className="auth__alert">{erro || 'Desafio não encontrado.'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      {cabecalho}
      <div className="estudio-home des-adm">
        {/* metadados */}
        <div className="studio__section">
          <span className="studio__section-title">Desafio</span>
        </div>
        <div className="des-adm__row">
          <div>
            <label className="studio__label">Título</label>
            <input
              className="estudio-form__input"
              value={form.title}
              placeholder="Ex.: Soma de dois números"
              onChange={(e) => patch({ title: e.target.value })}
            />
          </div>
          <div>
            <label className="studio__label">Número (opcional, automático se vazio)</label>
            <input
              className="estudio-form__input"
              type="number"
              value={form.numero}
              placeholder="Ex.: 142"
              onChange={(e) => patch({ numero: e.target.value })}
            />
          </div>
        </div>
        <label className="studio__label">Tema (separe por " · ")</label>
        <input
          className="estudio-form__input"
          value={form.topic}
          placeholder="Ex.: Array · Hash Table"
          onChange={(e) => patch({ topic: e.target.value })}
        />
        <div className="des-adm__row">
          <div>
            <label className="studio__label">Tipo de desafio</label>
            <select
              className="estudio-form__input"
              value={form.kind}
              onChange={(e) => patch({ kind: e.target.value as TipoDesafio })}
            >
              <option value="stdin">Entrada/saída (lê stdin, imprime stdout)</option>
              <option value="function">Função (implementa um método, estilo LeetCode)</option>
            </select>
          </div>
          <div>
            <label className="studio__label">
              {form.kind === 'function' ? 'Nome do método (entryPoint)' : 'Método (só para função)'}
            </label>
            <input
              className="estudio-form__input"
              value={form.entryPoint}
              placeholder="Ex.: twoSum"
              disabled={form.kind !== 'function'}
              onChange={(e) => patch({ entryPoint: e.target.value })}
            />
          </div>
        </div>
        {form.kind === 'function' && (
          <p className="studio__section-sub">
            No tipo função, os casos de teste guardam os <b>argumentos</b> (array JSON, ex.:{' '}
            <code>[[2,7,11,15], 9]</code>) e o <b>retorno esperado</b> (JSON, ex.:{' '}
            <code>[0,1]</code>
            ). O código inicial deve trazer a assinatura (ex.: uma classe <code>Solution</code>).
          </p>
        )}
        <div className="des-adm__row">
          <div>
            <label className="studio__label">
              Dificuldade (vale {XP_POR_DIF[form.difficulty]} XP ao resolver)
            </label>
            <select
              className="estudio-form__input"
              value={form.difficulty}
              onChange={(e) => patch({ difficulty: e.target.value as Dif })}
            >
              {DIFS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="studio__label">Data do desafio do dia (opcional)</label>
            <input
              className="estudio-form__input"
              type="date"
              value={form.activeDate}
              onChange={(e) => patch({ activeDate: e.target.value })}
            />
          </div>
        </div>
        <label className="sim-adm__check">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => patch({ published: e.target.checked })}
          />
          Publicado (visível para os alunos)
        </label>

        {/* enunciado */}
        <div className="studio__section">
          <span className="studio__section-title">Enunciado</span>
          <span className="studio__pill">{form.blocks.length} blocos</span>
        </div>
        <div className="studio__blocks">
          {form.blocks.map((b, i) => (
            <div key={i} className="block">
              <div className="block__bar">
                <span className={`block__tag block__tag--${b.type}`}>
                  {BLOCO_LABEL[b.type] ?? b.type}
                </span>
                <div className="topbar__spacer" />
                <button className="block__act" onClick={() => moverBloco(i, -1)} aria-label="Subir">
                  ↑
                </button>
                <button className="block__act" onClick={() => moverBloco(i, 1)} aria-label="Descer">
                  ↓
                </button>
                <button className="block__act" onClick={() => removerBloco(i)} aria-label="Excluir">
                  <Trash size={15} />
                </button>
              </div>
              <textarea
                className={`block__edit es-input${b.type === 'code' ? ' block__edit--code' : ''}`}
                value={b.value}
                placeholder={BLOCOS.find((x) => x.type === b.type)?.placeholder ?? 'Conteúdo'}
                onChange={(e) => setBloco(i, e.target.value)}
              />
            </div>
          ))}
        </div>
        <div className="block-palette">
          <div className="block-palette__label">Adicionar bloco</div>
          <div className="block-palette__chips">
            {BLOCOS.map((bt) => (
              <button key={bt.type} className="block-chip" onClick={() => addBloco(bt.type)}>
                {bt.label}
              </button>
            ))}
          </div>
        </div>

        {/* starter code */}
        <div className="studio__section">
          <span className="studio__section-title">Código inicial (opcional)</span>
        </div>
        <p className="studio__section-sub">
          Aparece no editor do aluno como ponto de partida. Deixe em branco para usar o padrão.
        </p>
        <div className="des-adm__row">
          <div>
            <label className="studio__label">JavaScript</label>
            <textarea
              className="block__edit es-input block__edit--code"
              value={form.starterJs}
              placeholder="// leitura da entrada..."
              onChange={(e) => patch({ starterJs: e.target.value })}
            />
          </div>
          <div>
            <label className="studio__label">Python</label>
            <textarea
              className="block__edit es-input block__edit--code"
              value={form.starterPy}
              placeholder="# leitura da entrada..."
              onChange={(e) => patch({ starterPy: e.target.value })}
            />
          </div>
        </div>

        {/* casos de teste */}
        <div className="studio__section">
          <span className="studio__section-title">Casos de teste</span>
          <span className="studio__pill">{form.tests.length}</span>
        </div>
        <p className="studio__section-sub">
          Os públicos aparecem como exemplos no enunciado. Os ocultos só contam na correção. Marque
          ao menos um como exemplo.
        </p>
        <div className="des-adm__tests">
          {form.tests.map((t, i) => (
            <div key={i} className="des-adm__test">
              <div className="des-adm__test-head">
                <span className="des-adm__test-n">Caso {i + 1}</span>
                <label className="des-adm__check">
                  <input
                    type="checkbox"
                    checked={t.isPublic}
                    onChange={(e) => setTeste(i, { isPublic: e.target.checked })}
                  />
                  Exemplo (público)
                </label>
                <div className="topbar__spacer" />
                <button
                  className="block__act"
                  onClick={() => removerTeste(i)}
                  aria-label="Excluir caso"
                >
                  <Trash size={15} />
                </button>
              </div>
              <div className="des-adm__row">
                <div>
                  <label className="studio__label">
                    {form.kind === 'function' ? 'Argumentos (array JSON)' : 'Entrada (stdin)'}
                  </label>
                  <textarea
                    className="block__edit es-input block__edit--code"
                    value={t.input}
                    placeholder={form.kind === 'function' ? '[[2,7,11,15], 9]' : '2 3'}
                    onChange={(e) => setTeste(i, { input: e.target.value })}
                  />
                </div>
                <div>
                  <label className="studio__label">
                    {form.kind === 'function' ? 'Retorno esperado (JSON)' : 'Saída esperada'}
                  </label>
                  <textarea
                    className="block__edit es-input block__edit--code"
                    value={t.expectedOutput}
                    placeholder={form.kind === 'function' ? '[0,1]' : '5'}
                    onChange={(e) => setTeste(i, { expectedOutput: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="block-palette">
          <button className="block-chip" onClick={addTeste}>
            <Plus size={13} /> Adicionar caso
          </button>
        </div>

        {erro && <div className="auth__alert">{erro}</div>}
        <div className="estudio-form__actions">
          <Link className="btn btn--ghost" to="/estudio/desafios">
            Cancelar
          </Link>
          <button className="btn btn--accent" disabled={salvando} onClick={salvar}>
            {salvando ? 'Salvando...' : novo ? 'Criar desafio' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
