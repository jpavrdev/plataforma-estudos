import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { useRequisicao } from '../../hooks/useRequisicao';
import { Plus, Pencil, Trash, Check, IconeConquista, CHAVES_ICONE } from '../../components/Icons';
import {
  listarTags,
  criarTag,
  atualizarTag,
  excluirTag,
  listarLinguagens,
  criarLinguagem,
  atualizarLinguagem,
  excluirLinguagem,
  listarConquistas,
  criarConquista,
  atualizarConquista,
  excluirConquista,
  listarUsuarios,
  concederConquista,
  revogarConquista,
  holdersConquista,
  type Achievement,
  type CriterioConquista,
  type UsuarioSimples,
  type HolderConquista,
} from '../../services/trails';
import {
  listarGlossario,
  criarTermo,
  atualizarTermo,
  excluirTermo,
  type TermoGlossario,
} from '../../services/glossario';
import { invalidarGlossario } from '../../hooks/useGlossario';
import { ConfirmModal } from '../Simulados/ConfirmModal';

function msgErro(e: unknown): string | undefined {
  return (e as { response?: { data?: { erro?: string } } })?.response?.data?.erro;
}

interface ItemCrud {
  id: string;
  name: string;
}

interface CrudListProps {
  titulo: string;
  descricao: string;
  placeholder: string;
  confirmarExclusao: (item: ItemCrud) => string;
  carregar: () => Promise<ItemCrud[]>;
  criar: (name: string) => Promise<unknown>;
  atualizar: (id: string, name: string) => Promise<unknown>;
  excluir: (id: string) => Promise<unknown>;
}

// Seção genérica de CRUD por nome (usada para Tags e Linguagens).
function CrudList({
  titulo,
  descricao,
  placeholder,
  confirmarExclusao,
  carregar,
  criar,
  atualizar,
  excluir,
}: CrudListProps) {
  const { dados, carregando, erro: falhaCarga, recarregar } = useRequisicao(carregar, []);
  const itens = dados ?? [];
  const [erro, setErro] = useState('');
  const [novo, setNovo] = useState('');
  const [criando, setCriando] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState('');

  async function adicionar() {
    const nome = novo.trim();
    if (!nome || criando) return;
    setCriando(true);
    setErro('');
    try {
      await criar(nome);
      setNovo('');
      recarregar();
    } catch (e) {
      setErro(msgErro(e) ?? 'Não foi possível adicionar.');
    } finally {
      setCriando(false);
    }
  }

  async function salvarEdicao(id: string) {
    const nome = editNome.trim();
    if (!nome) return;
    setErro('');
    try {
      await atualizar(id, nome);
      setEditId(null);
      recarregar();
    } catch (e) {
      setErro(msgErro(e) ?? 'Não foi possível salvar.');
    }
  }

  async function remover(item: ItemCrud) {
    if (!window.confirm(confirmarExclusao(item))) return;
    setErro('');
    try {
      await excluir(item.id);
      recarregar();
    } catch {
      setErro('Não foi possível excluir.');
    }
  }

  return (
    <section style={{ marginBottom: 40 }}>
      <h1 className="estudio-home__title">{titulo}</h1>
      <p className="estudio-home__sub">{descricao}</p>

      <div className="estudio-form" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <input
          className="estudio-form__input"
          style={{ margin: 0, flex: 1 }}
          value={novo}
          placeholder={placeholder}
          onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') adicionar();
          }}
        />
        <button
          className="btn btn--accent"
          style={{ flex: 'none' }}
          disabled={criando || !novo.trim()}
          onClick={adicionar}
        >
          <Plus size={14} /> Adicionar
        </button>
      </div>

      {(erro || falhaCarga) && (
        <div className="auth__alert">{erro || 'Não foi possível carregar a lista.'}</div>
      )}
      {carregando && <p className="track__desc">Carregando...</p>}
      {!carregando && itens.length === 0 && <p className="track__desc">Nada cadastrado ainda.</p>}

      <div className="estudio-home__list">
        {itens.map((item) => (
          <div key={item.id} className="estudio-home__card">
            {editId === item.id ? (
              <input
                className="estudio-form__input"
                style={{ margin: '8px 0 8px 14px', flex: 1 }}
                value={editNome}
                autoFocus
                onChange={(e) => setEditNome(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') salvarEdicao(item.id);
                  if (e.key === 'Escape') setEditId(null);
                }}
              />
            ) : (
              <div className="estudio-home__open" style={{ cursor: 'default' }}>
                <span className="chip--outline">{item.name}</span>
              </div>
            )}
            <div className="estudio-home__actions">
              {editId === item.id ? (
                <>
                  <button
                    className="estudio-home__act"
                    onClick={() => salvarEdicao(item.id)}
                    aria-label="Salvar"
                  >
                    <Check size={15} />
                  </button>
                  <button
                    className="estudio-home__act"
                    onClick={() => setEditId(null)}
                    aria-label="Cancelar"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="estudio-home__act"
                    onClick={() => {
                      setEditId(item.id);
                      setEditNome(item.name);
                    }}
                    aria-label="Editar"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="estudio-home__act estudio-home__act--danger"
                    onClick={() => remover(item)}
                    aria-label="Excluir"
                  >
                    <Trash size={15} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const CRITERIOS: { value: CriterioConquista; label: string }[] = [
  { value: 'lessons_completed', label: 'Aulas concluídas' },
  { value: 'questions_correct', label: 'Questões certas' },
  { value: 'xp_total', label: 'XP total' },
  { value: 'special', label: 'Ocasião especial' },
];
const rotuloCriterio = (c: CriterioConquista) => CRITERIOS.find((x) => x.value === c)?.label ?? c;

const FORM_VAZIO = {
  name: '',
  description: '',
  icon: 'trophy',
  criteriaType: 'lessons_completed' as CriterioConquista,
  threshold: 1,
};

// Painel de concessão manual para conquistas de ocasião especial: escolhe um
// usuário e concede; mostra quem já tem, com opção de revogar.
function ConcederEspecial({
  conquista,
  usuarios,
}: {
  conquista: Achievement;
  usuarios: UsuarioSimples[];
}) {
  const [holders, setHolders] = useState<HolderConquista[]>([]);
  const [sel, setSel] = useState('');
  const [busy, setBusy] = useState(false);

  const carregar = useCallback(() => {
    holdersConquista(conquista.id)
      .then(setHolders)
      .catch((e) => console.error('Falha ao carregar quem tem a conquista', e));
  }, [conquista.id]);
  useEffect(() => {
    carregar();
  }, [carregar]);

  async function conceder() {
    if (!sel || busy) return;
    setBusy(true);
    try {
      await concederConquista(conquista.id, sel);
      setSel('');
      carregar();
    } catch (e) {
      console.error('Falha ao conceder a conquista', e);
    } finally {
      setBusy(false);
    }
  }
  async function revogar(userId: string) {
    setBusy(true);
    try {
      await revogarConquista(conquista.id, userId);
      carregar();
    } catch (e) {
      console.error('Falha ao revogar a conquista', e);
    } finally {
      setBusy(false);
    }
  }

  const donos = new Set(holders.map((h) => h.userId));
  const disponiveis = usuarios.filter((u) => !donos.has(u.id));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 12px 4px' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <select
          className="estudio-form__input"
          style={{ margin: 0, flex: 1 }}
          value={sel}
          onChange={(e) => setSel(e.target.value)}
        >
          <option value="">Conceder a um usuário…</option>
          {disponiveis.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} (@{u.username})
            </option>
          ))}
        </select>
        <button
          className="btn btn--accent"
          style={{ flex: 'none' }}
          disabled={!sel || busy}
          onClick={conceder}
        >
          <Plus size={14} /> Conceder
        </button>
      </div>
      {holders.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {holders.map((h) => (
            <span
              key={h.userId}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '3px 6px 3px 10px',
                borderRadius: 999,
                background: 'var(--surface-2)',
                fontSize: 13,
              }}
            >
              {h.name} (@{h.username})
              <button
                onClick={() => revogar(h.userId)}
                aria-label={`Revogar de ${h.name}`}
                disabled={busy}
                style={{
                  display: 'inline-flex',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-2)',
                  padding: 0,
                }}
              >
                <Trash size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Seção de CRUD das conquistas (campos mais ricos: ícone, critério e valor).
function ConquistasAdmin() {
  const { dados, carregando, erro: falhaCarga, recarregar } = useRequisicao(listarConquistas, []);
  const { dados: usuariosData } = useRequisicao(listarUsuarios, []);
  const usuarios = usuariosData ?? [];
  const itens = dados ?? [];
  const [erro, setErro] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);

  function resetar() {
    setEditId(null);
    setForm(FORM_VAZIO);
  }

  async function salvar() {
    const faltaValor = form.criteriaType !== 'special' && form.threshold < 1;
    if (!form.name.trim() || !form.description.trim() || faltaValor || salvando) return;
    setSalvando(true);
    setErro('');
    try {
      if (editId) await atualizarConquista(editId, form);
      else await criarConquista(form);
      resetar();
      recarregar();
    } catch (e) {
      setErro(msgErro(e) ?? 'Não foi possível salvar a conquista.');
    } finally {
      setSalvando(false);
    }
  }

  function editar(a: Achievement) {
    setEditId(a.id);
    setForm({
      name: a.name,
      description: a.description,
      icon: a.icon,
      criteriaType: a.criteriaType,
      threshold: a.threshold,
    });
  }

  async function remover(a: Achievement) {
    if (
      !window.confirm(
        `Excluir a conquista "${a.name}"? Ela será removida dos perfis que a desbloquearam.`,
      )
    )
      return;
    setErro('');
    try {
      await excluirConquista(a.id);
      if (editId === a.id) resetar();
      recarregar();
    } catch {
      setErro('Não foi possível excluir a conquista.');
    }
  }

  return (
    <section style={{ marginBottom: 40 }}>
      <h1 className="estudio-home__title">Conquistas</h1>
      <p className="estudio-home__sub">
        Desbloqueiam sozinhas quando o aluno atinge o critério (aulas, questões ou XP), ou são
        concedidas à mão em ocasiões especiais (ex.: Bug Finder).
      </p>

      <div className="conq-form">
        <input
          className="estudio-form__input"
          style={{ margin: 0 }}
          value={form.name}
          placeholder="Nome (ex.: Maratonista)"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="estudio-form__input"
          style={{ margin: 0 }}
          value={form.description}
          placeholder="Descrição (ex.: Conclua 10 aulas)"
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="conq-form__row">
          <select
            className="estudio-form__input"
            style={{ margin: 0 }}
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
          >
            {CHAVES_ICONE.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <select
            className="estudio-form__input"
            style={{ margin: 0 }}
            value={form.criteriaType}
            onChange={(e) =>
              setForm({ ...form, criteriaType: e.target.value as CriterioConquista })
            }
          >
            {CRITERIOS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          {form.criteriaType !== 'special' && (
            <input
              className="estudio-form__input"
              style={{ margin: 0, width: 110 }}
              type="number"
              min={1}
              value={form.threshold}
              placeholder="Valor"
              onChange={(e) =>
                setForm({ ...form, threshold: Math.max(1, Number(e.target.value) || 1) })
              }
            />
          )}
          <button
            className="btn btn--accent"
            style={{ flex: 'none' }}
            disabled={salvando || !form.name.trim() || !form.description.trim()}
            onClick={salvar}
          >
            {editId ? (
              <>
                <Check size={14} /> Salvar
              </>
            ) : (
              <>
                <Plus size={14} /> Adicionar
              </>
            )}
          </button>
          {editId && (
            <button className="btn btn--ghost" style={{ flex: 'none' }} onClick={resetar}>
              Cancelar
            </button>
          )}
        </div>
      </div>

      {(erro || falhaCarga) && (
        <div className="auth__alert">{erro || 'Não foi possível carregar as conquistas.'}</div>
      )}
      {carregando && <p className="track__desc">Carregando...</p>}
      {!carregando && itens.length === 0 && (
        <p className="track__desc">Nenhuma conquista cadastrada ainda.</p>
      )}

      <div className="estudio-home__list">
        {itens.map((a) => (
          <div key={a.id}>
            <div className="estudio-home__card">
              <div className="conq-item">
                <span className="conq-item__icon">
                  <IconeConquista chave={a.icon} size={18} />
                </span>
                <div>
                  <div className="conq-item__name">{a.name}</div>
                  <div className="conq-item__sub">
                    {a.description} ·{' '}
                    {a.criteriaType === 'special'
                      ? 'Ocasião especial'
                      : `${rotuloCriterio(a.criteriaType)} ≥ ${a.threshold}`}
                  </div>
                </div>
              </div>
              <div className="estudio-home__actions">
                <button className="estudio-home__act" onClick={() => editar(a)} aria-label="Editar">
                  <Pencil size={15} />
                </button>
                <button
                  className="estudio-home__act estudio-home__act--danger"
                  onClick={() => remover(a)}
                  aria-label="Excluir"
                >
                  <Trash size={15} />
                </button>
              </div>
            </div>
            {a.criteriaType === 'special' && <ConcederEspecial conquista={a} usuarios={usuarios} />}
          </div>
        ))}
      </div>
    </section>
  );
}

const GLOSS_VAZIO = { term: '', definition: '' };

function GlossarioAdmin() {
  const { dados, carregando, erro: falhaCarga, recarregar } = useRequisicao(listarGlossario, []);
  const itens = dados ?? [];
  const [erro, setErro] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(GLOSS_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  function resetar() {
    setEditId(null);
    setForm(GLOSS_VAZIO);
  }

  // Pede confirmação antes de gravar (criação ou edição).
  function pedirConfirmacao() {
    if (!form.term.trim() || !form.definition.trim() || salvando) return;
    setConfirmando(true);
  }

  async function salvar() {
    const term = form.term.trim();
    const definition = form.definition.trim();
    if (!term || !definition || salvando) return;
    setSalvando(true);
    setErro('');
    try {
      if (editId) await atualizarTermo(editId, term, definition);
      else await criarTermo(term, definition);
      invalidarGlossario(); // as aulas rebuscam o glossário atualizado
      setConfirmando(false);
      resetar();
      recarregar();
    } catch (e) {
      setErro(msgErro(e) ?? 'Não foi possível salvar o termo.');
      setConfirmando(false);
    } finally {
      setSalvando(false);
    }
  }

  function editar(t: TermoGlossario) {
    setEditId(t.id);
    setForm({ term: t.term, definition: t.definition });
  }

  async function remover(t: TermoGlossario) {
    if (!window.confirm(`Excluir o termo "${t.term}"?`)) return;
    setErro('');
    try {
      await excluirTermo(t.id);
      invalidarGlossario();
      if (editId === t.id) resetar();
      recarregar();
    } catch {
      setErro('Não foi possível excluir o termo.');
    }
  }

  return (
    <section style={{ marginBottom: 40 }}>
      <h1 className="estudio-home__title">Glossário</h1>
      <p className="estudio-home__sub">
        Termos técnicos que ganham um tooltip com a definição nas aulas (primeira ocorrência por
        parágrafo). O texto casa por palavra inteira e respeitando maiúsculas, ex.: IaaS, CapEx.
      </p>

      <div className="conq-form">
        <input
          className="estudio-form__input"
          style={{ margin: 0 }}
          value={form.term}
          maxLength={60}
          placeholder="Termo (ex.: IaaS)"
          onChange={(e) => setForm({ ...form, term: e.target.value })}
        />
        <textarea
          className="estudio-form__input"
          value={form.definition}
          maxLength={400}
          placeholder="Definição do termo"
          style={{
            margin: 0,
            minHeight: 84,
            padding: '10px 14px',
            lineHeight: 1.5,
            resize: 'vertical',
          }}
          onChange={(e) => setForm({ ...form, definition: e.target.value })}
        />
        <div className="conq-form__row">
          <button
            className="btn btn--accent"
            style={{ flex: 'none' }}
            disabled={salvando || !form.term.trim() || !form.definition.trim()}
            onClick={pedirConfirmacao}
          >
            {editId ? (
              <>
                <Check size={14} /> Salvar
              </>
            ) : (
              <>
                <Plus size={14} /> Adicionar
              </>
            )}
          </button>
          {editId && (
            <button className="btn btn--ghost" style={{ flex: 'none' }} onClick={resetar}>
              Cancelar
            </button>
          )}
        </div>
      </div>

      {(erro || falhaCarga) && (
        <div className="auth__alert">{erro || 'Não foi possível carregar o glossário.'}</div>
      )}
      {carregando && <p className="track__desc">Carregando...</p>}
      {!carregando && itens.length === 0 && (
        <p className="track__desc">Nenhum termo cadastrado ainda.</p>
      )}

      <div className="estudio-home__list">
        {itens.map((t) => (
          <div key={t.id} className="estudio-home__card">
            <div className="conq-item">
              <div>
                <div className="conq-item__name">{t.term}</div>
                <div
                  className="conq-item__sub"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {t.definition}
                </div>
              </div>
            </div>
            <div className="estudio-home__actions">
              <button className="estudio-home__act" onClick={() => editar(t)} aria-label="Editar">
                <Pencil size={15} />
              </button>
              <button
                className="estudio-home__act estudio-home__act--danger"
                onClick={() => remover(t)}
                aria-label="Excluir"
              >
                <Trash size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {confirmando && (
        <ConfirmModal
          title={editId ? 'Salvar alterações?' : 'Adicionar termo?'}
          confirmLabel={editId ? 'Salvar' : 'Adicionar'}
          loading={salvando}
          onConfirm={salvar}
          onCancel={() => setConfirmando(false)}
        >
          {editId
            ? `As alterações no termo "${form.term.trim()}" passarão a valer nas aulas.`
            : `O termo "${form.term.trim()}" será adicionado ao glossário e passará a aparecer nas aulas.`}
        </ConfirmModal>
      )}
    </section>
  );
}

const ABAS_CFG = [
  { key: 'tags', label: 'Tags' },
  { key: 'linguagens', label: 'Linguagens' },
  { key: 'conquistas', label: 'Conquistas' },
  { key: 'glossario', label: 'Glossário' },
] as const;

export function Configuracoes() {
  const [aba, setAba] = useState<(typeof ABAS_CFG)[number]['key']>('tags');
  return (
    <div className="home">
      <header className="topbar studio__bar">
        <div className="studio__brand">
          <Logo variant="solid" size={19} />
          <span className="studio__badge">Configurações</span>
        </div>
        <span className="studio__divider" />
        <div className="studio__crumb">
          <b>Tags, linguagens, conquistas e glossário</b>
        </div>
        <div className="topbar__spacer" />
        <Link className="btn btn--ghost studio__btn" to="/home">
          Voltar ao app
        </Link>
      </header>

      <div className="estudio-home">
        <div className="cfg-tabs">
          {ABAS_CFG.map((a) => (
            <button
              key={a.key}
              className={`cfg-tab${aba === a.key ? ' cfg-tab--active' : ''}`}
              onClick={() => setAba(a.key)}
            >
              {a.label}
            </button>
          ))}
        </div>

        {aba === 'tags' && (
          <CrudList
            titulo="Tags"
            descricao="Categorias para filtrar as trilhas (ex.: Fundamentos, Linguagens, Algoritmos). Você atribui as tags ao criar ou editar uma trilha no Estúdio."
            placeholder="Nome da nova tag"
            confirmarExclusao={(t) =>
              `Excluir a tag "${t.name}"? Ela será removida das trilhas que a usam.`
            }
            carregar={listarTags}
            criar={criarTag}
            atualizar={atualizarTag}
            excluir={excluirTag}
          />
        )}

        {aba === 'linguagens' && (
          <CrudList
            titulo="Linguagens"
            descricao="Conjunto fixo de linguagens que aparecem no perfil. Padronizar evita variações como JS, Javascript e javascript, mantendo os dados limpos para análises."
            placeholder="Nome da nova linguagem"
            confirmarExclusao={(l) =>
              `Excluir a linguagem "${l.name}"? Ela será removida dos perfis que a usam.`
            }
            carregar={listarLinguagens}
            criar={criarLinguagem}
            atualizar={atualizarLinguagem}
            excluir={excluirLinguagem}
          />
        )}

        {aba === 'conquistas' && <ConquistasAdmin />}
        {aba === 'glossario' && <GlossarioAdmin />}
      </div>
    </div>
  );
}
