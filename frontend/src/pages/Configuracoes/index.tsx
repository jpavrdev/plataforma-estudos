import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { Plus, Pencil, Trash, Check } from '../../components/Icons';
import { listarTags, criarTag, atualizarTag, excluirTag, type Tag } from '../../services/trails';

export function Configuracoes() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [novo, setNovo] = useState('');
  const [criando, setCriando] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState('');

  async function carregar() {
    try {
      setTags(await listarTags());
    } catch {
      setErro('Não foi possível carregar as tags.');
    } finally {
      setCarregando(false);
    }
  }
  useEffect(() => { carregar(); }, []);

  async function adicionar() {
    const nome = novo.trim();
    if (!nome || criando) return;
    setCriando(true);
    setErro('');
    try {
      await criarTag(nome);
      setNovo('');
      await carregar();
    } catch (e: any) {
      setErro(e?.response?.data?.erro ?? 'Não foi possível criar a tag.');
    } finally {
      setCriando(false);
    }
  }

  async function salvarEdicao(id: string) {
    const nome = editNome.trim();
    if (!nome) return;
    setErro('');
    try {
      await atualizarTag(id, nome);
      setEditId(null);
      await carregar();
    } catch (e: any) {
      setErro(e?.response?.data?.erro ?? 'Não foi possível salvar a tag.');
    }
  }

  async function excluir(t: Tag) {
    if (!window.confirm(`Excluir a tag "${t.name}"? Ela será removida das trilhas que a usam.`)) return;
    setErro('');
    try {
      await excluirTag(t.id);
      await carregar();
    } catch {
      setErro('Não foi possível excluir a tag.');
    }
  }

  return (
    <div className="home">
      <header className="topbar studio__bar">
        <div className="studio__brand">
          <Logo variant="solid" size={19} />
          <span className="studio__badge">Configurações</span>
        </div>
        <span className="studio__divider" />
        <div className="studio__crumb"><b>Tags de trilhas</b></div>
        <div className="topbar__spacer" />
        <Link className="btn btn--ghost studio__btn" to="/home">Voltar ao app</Link>
      </header>

      <div className="estudio-home">
        <h1 className="estudio-home__title">Tags</h1>
        <p className="estudio-home__sub">
          Categorias para filtrar as trilhas (ex.: Fundamentos, Linguagens, Algoritmos). Você atribui as tags ao criar ou editar uma trilha no Estúdio.
        </p>

        <div className="estudio-form" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            className="estudio-form__input"
            style={{ margin: 0, flex: 1 }}
            value={novo}
            placeholder="Nome da nova tag"
            onChange={(e) => setNovo(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') adicionar(); }}
          />
          <button className="btn btn--accent" style={{ flex: 'none' }} disabled={criando || !novo.trim()} onClick={adicionar}>
            <Plus size={14} /> Adicionar
          </button>
        </div>

        {erro && <div className="auth__alert">{erro}</div>}
        {carregando && <p className="track__desc">Carregando...</p>}
        {!carregando && tags.length === 0 && <p className="track__desc">Nenhuma tag cadastrada ainda.</p>}

        <div className="estudio-home__list">
          {tags.map((t) => (
            <div key={t.id} className="estudio-home__card">
              {editId === t.id ? (
                <input
                  className="estudio-form__input"
                  style={{ margin: '8px 0 8px 14px', flex: 1 }}
                  value={editNome}
                  autoFocus
                  onChange={(e) => setEditNome(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') salvarEdicao(t.id);
                    if (e.key === 'Escape') setEditId(null);
                  }}
                />
              ) : (
                <div className="estudio-home__open" style={{ cursor: 'default' }}>
                  <span className="chip--outline">{t.name}</span>
                </div>
              )}
              <div className="estudio-home__actions">
                {editId === t.id ? (
                  <>
                    <button className="estudio-home__act" onClick={() => salvarEdicao(t.id)} aria-label="Salvar"><Check size={15} /></button>
                    <button className="estudio-home__act" onClick={() => setEditId(null)} aria-label="Cancelar">✕</button>
                  </>
                ) : (
                  <>
                    <button className="estudio-home__act" onClick={() => { setEditId(t.id); setEditNome(t.name); }} aria-label="Editar tag"><Pencil size={15} /></button>
                    <button className="estudio-home__act estudio-home__act--danger" onClick={() => excluir(t)} aria-label="Excluir tag"><Trash size={15} /></button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
