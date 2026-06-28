import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { ChevronRight, Plus, Pencil, Trash } from '../../components/Icons';
import {
  listarTrilhas,
  criarTrilha,
  atualizarTrilha,
  excluirTrilha,
  listarTags,
  type TrailLevelEnum,
  type Tag,
} from '../../services/trails';
import type { Trail } from '../../data/trails';

type TrailComId = Trail & { id: string };

const LEVELS: { value: TrailLevelEnum; label: string }[] = [
  { value: 'iniciante', label: 'Iniciante' },
  { value: 'intermediario', label: 'Intermediário' },
  { value: 'avancado', label: 'Avançado' },
];
const LABEL_TO_ENUM: Record<string, TrailLevelEnum> = {
  'Iniciante': 'iniciante',
  'Intermediário': 'intermediario',
  'Avançado': 'avancado',
};

interface FormState {
  id?: string;
  name: string;
  level: TrailLevelEnum;
  description: string;
  tagIds: string[];
}

export function EstudioHome() {
  const navigate = useNavigate();
  const [trilhas, setTrilhas] = useState<TrailComId[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [form, setForm] = useState<FormState | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [tagsDisp, setTagsDisp] = useState<Tag[]>([]);

  async function carregar() {
    try {
      const [tr, tg] = await Promise.all([listarTrilhas(), listarTags()]);
      setTrilhas(tr);
      setTagsDisp(tg);
    } catch {
      setErro('Não foi possível carregar as trilhas.');
    } finally {
      setCarregando(false);
    }
  }
  useEffect(() => { carregar(); }, []);

  function novaTrilha() {
    setErro('');
    setForm({ name: '', level: 'iniciante', description: '', tagIds: [] });
  }
  function editarTrilha(t: TrailComId) {
    setErro('');
    const tagIds = tagsDisp.filter((tg) => t.tags.includes(tg.name)).map((tg) => tg.id);
    setForm({ id: t.id, name: t.name, level: LABEL_TO_ENUM[t.level] ?? 'iniciante', description: t.desc, tagIds });
  }

  async function salvar() {
    if (!form || salvando) return;
    setSalvando(true);
    setErro('');
    try {
      if (form.id) {
        await atualizarTrilha(form.id, { name: form.name, level: form.level, description: form.description, tagIds: form.tagIds });
      } else {
        await criarTrilha({ name: form.name, level: form.level, description: form.description, tagIds: form.tagIds });
      }
      setForm(null);
      await carregar();
    } catch (e: any) {
      setErro(e?.response?.data?.erro ?? 'Não foi possível salvar a trilha.');
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(t: TrailComId) {
    if (!window.confirm(`Excluir a trilha "${t.name}" e tudo dentro dela? Essa ação não pode ser desfeita.`)) return;
    setErro('');
    try {
      await excluirTrilha(t.id);
      await carregar();
    } catch {
      setErro('Não foi possível excluir a trilha.');
    }
  }

  return (
    <div className="home">
      <header className="topbar studio__bar">
        <div className="studio__brand">
          <Logo variant="solid" size={19} />
          <span className="studio__badge">Estúdio</span>
        </div>
        <span className="studio__divider" />
        <div className="studio__crumb"><b>Painel do administrador</b></div>
        <div className="topbar__spacer" />
        <Link className="btn btn--ghost studio__btn" to="/home">Voltar ao app</Link>
      </header>

      <div className="estudio-home">
        <div className="estudio-home__head">
          <div>
            <h1 className="estudio-home__title">Trilhas</h1>
            <p className="estudio-home__sub">Escolha uma trilha para editar, ou crie uma nova.</p>
          </div>
          {!form && (
            <button className="btn btn--accent" onClick={novaTrilha}><Plus size={14} /> Nova trilha</button>
          )}
        </div>

        {form && (
          <div className="estudio-form">
            <div className="estudio-form__title">{form.id ? 'Editar trilha' : 'Nova trilha'}</div>
            <label className="studio__label">Nome</label>
            <input
              className="estudio-form__input"
              value={form.name}
              placeholder="Ex.: Lógica de Programação"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <label className="studio__label">Nível</label>
            <select
              className="estudio-form__input"
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value as TrailLevelEnum })}
            >
              {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
            <label className="studio__label">Descrição</label>
            <textarea
              className="estudio-form__input estudio-form__textarea"
              value={form.description}
              placeholder="Descrição da trilha (mínimo 10 caracteres)"
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <label className="studio__label">Tags</label>
            <div className="tag-picker">
              {tagsDisp.length === 0 && <span className="tag-picker__empty">Nenhuma tag ainda. Crie em Configurações.</span>}
              {tagsDisp.map((tg) => {
                const ativa = form.tagIds.includes(tg.id);
                return (
                  <button
                    key={tg.id}
                    type="button"
                    className={`tag-pick${ativa ? ' tag-pick--on' : ''}`}
                    onClick={() => setForm({
                      ...form,
                      tagIds: ativa ? form.tagIds.filter((id) => id !== tg.id) : [...form.tagIds, tg.id],
                    })}
                  >
                    {tg.name}
                  </button>
                );
              })}
            </div>
            {erro && <div className="auth__alert">{erro}</div>}
            <div className="estudio-form__actions">
              <button className="btn btn--ghost" onClick={() => { setForm(null); setErro(''); }}>Cancelar</button>
              <button className="btn btn--accent" disabled={salvando} onClick={salvar}>
                {salvando ? 'Salvando...' : form.id ? 'Salvar' : 'Criar trilha'}
              </button>
            </div>
          </div>
        )}

        {carregando && <p className="track__desc">Carregando...</p>}
        {!form && erro && <div className="auth__alert">{erro}</div>}
        {!carregando && trilhas.length === 0 && !form && (
          <p className="track__desc">Nenhuma trilha cadastrada ainda.</p>
        )}

        <div className="estudio-home__list">
          {trilhas.map((t) => (
            <div key={t.id} className="estudio-home__card">
              <button className="estudio-home__open" onClick={() => navigate(`/estudio/${t.id}`)}>
                <span className="estudio-home__glyph">{t.glyph}</span>
                <div className="estudio-home__meta">
                  <div className="estudio-home__name">{t.name}</div>
                  <div className="estudio-home__info">{t.lessons} aulas · {t.level}</div>
                </div>
              </button>
              <div className="estudio-home__actions">
                <button className="estudio-home__act" onClick={() => editarTrilha(t)} aria-label="Editar trilha"><Pencil size={15} /></button>
                <button className="estudio-home__act estudio-home__act--danger" onClick={() => excluir(t)} aria-label="Excluir trilha"><Trash size={15} /></button>
                <button className="estudio-home__act" onClick={() => navigate(`/estudio/${t.id}`)} aria-label="Abrir trilha"><ChevronRight size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
