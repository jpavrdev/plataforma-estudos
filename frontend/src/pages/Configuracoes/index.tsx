import { useState } from 'react';
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
  type Achievement,
  type CriterioConquista,
} from '../../services/trails';

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
];
const rotuloCriterio = (c: CriterioConquista) => CRITERIOS.find((x) => x.value === c)?.label ?? c;

const FORM_VAZIO = {
  name: '',
  description: '',
  icon: 'trophy',
  criteriaType: 'lessons_completed' as CriterioConquista,
  threshold: 1,
};

// Seção de CRUD das conquistas (campos mais ricos: ícone, critério e valor).
function ConquistasAdmin() {
  const { dados, carregando, erro: falhaCarga, recarregar } = useRequisicao(listarConquistas, []);
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
    if (!form.name.trim() || !form.description.trim() || form.threshold < 1 || salvando) return;
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
        Desbloqueiam sozinhas quando o aluno atinge o critério (ex.: concluir 5 aulas, acertar 100
        questões, alcançar 500 XP).
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
          <div key={a.id} className="estudio-home__card">
            <div className="conq-item">
              <span className="conq-item__icon">
                <IconeConquista chave={a.icon} size={18} />
              </span>
              <div>
                <div className="conq-item__name">{a.name}</div>
                <div className="conq-item__sub">
                  {a.description} · {rotuloCriterio(a.criteriaType)} ≥ {a.threshold}
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
        ))}
      </div>
    </section>
  );
}

export function Configuracoes() {
  return (
    <div className="home">
      <header className="topbar studio__bar">
        <div className="studio__brand">
          <Logo variant="solid" size={19} />
          <span className="studio__badge">Configurações</span>
        </div>
        <span className="studio__divider" />
        <div className="studio__crumb">
          <b>Tags, linguagens e conquistas</b>
        </div>
        <div className="topbar__spacer" />
        <Link className="btn btn--ghost studio__btn" to="/home">
          Voltar ao app
        </Link>
      </header>

      <div className="estudio-home">
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

        <ConquistasAdmin />
      </div>
    </div>
  );
}
