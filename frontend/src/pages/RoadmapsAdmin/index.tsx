import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EstudioTopbar } from '../../components/EstudioTopbar';
import { Plus, Pencil, Trash, ChevronRight, Target } from '../../components/Icons';
import { useRequisicao } from '../../hooks/useRequisicao';
import { mensagemErro } from '../../utils/erro';
import { useToast } from '../../contexts/ToastContext';
import {
  listarRoadmapsAdmin,
  criarRoadmap,
  atualizarRoadmap,
  excluirRoadmap,
  type RoadmapAdminItem,
  type Nivel,
} from '../../services/roadmaps';

const NIVEIS: { v: Nivel; label: string }[] = [
  { v: 'iniciante', label: 'Iniciante' },
  { v: 'intermediario', label: 'Intermediário' },
  { v: 'avancado', label: 'Avançado' },
];

interface FormState {
  id: string;
  slug: string;
  name: string;
  description: string;
  level: Nivel;
  icon: string;
  position: string;
  premium: boolean;
  published: boolean;
  editando: boolean;
}

const NOVO: FormState = {
  id: '',
  slug: '',
  name: '',
  description: '',
  level: 'iniciante',
  icon: '',
  position: '',
  premium: false,
  published: false,
  editando: false,
};

export function RoadmapsAdmin() {
  const navigate = useNavigate();
  const { mostrar } = useToast();
  const { dados, carregando, erro: falhaCarga, recarregar } = useRequisicao(listarRoadmapsAdmin, []);
  const roadmaps = dados ?? [];
  const [form, setForm] = useState<FormState | null>(null);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  function editar(r: RoadmapAdminItem) {
    setErro('');
    setForm({
      id: r.id,
      slug: r.slug,
      name: r.name,
      description: r.description,
      level: r.level,
      icon: r.icon ?? '',
      position: String(r.position),
      premium: r.premium,
      published: r.published,
      editando: true,
    });
  }

  async function salvar() {
    if (!form || salvando) return;
    setSalvando(true);
    setErro('');
    const comuns = {
      name: form.name,
      description: form.description,
      level: form.level,
      icon: form.icon.trim() || undefined,
      premium: form.premium,
      published: form.published,
      ...(form.position.trim() !== '' ? { position: Number(form.position) } : {}),
    };
    try {
      if (form.editando) {
        await atualizarRoadmap(form.id, comuns);
      } else {
        await criarRoadmap({ slug: form.slug.trim() || undefined, ...comuns });
      }
      mostrar(form.editando ? 'Roadmap atualizado.' : 'Roadmap criado.');
      setForm(null);
      recarregar();
    } catch (e: unknown) {
      setErro(mensagemErro(e, 'Não foi possível salvar o roadmap.'));
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(r: RoadmapAdminItem) {
    if (!window.confirm(`Excluir o roadmap "${r.name}" e todos os seus estágios?`)) return;
    setErro('');
    try {
      await excluirRoadmap(r.id);
      mostrar('Roadmap excluído.');
      recarregar();
    } catch (e: unknown) {
      setErro(mensagemErro(e, 'Não foi possível excluir o roadmap.'));
    }
  }

  return (
    <div className="home">
      <EstudioTopbar crumb={<b>Roadmaps</b>} />

      <div className="estudio-home">
        <div className="estudio-home__head">
          <div>
            <h1 className="estudio-home__title">Roadmaps</h1>
            <p className="estudio-home__sub">
              Crie caminhos de carreira e organize seus estágios sobre as trilhas existentes.
            </p>
          </div>
          {!form && (
            <button className="btn btn--accent" onClick={() => setForm({ ...NOVO })}>
              <Plus size={14} /> Novo roadmap
            </button>
          )}
        </div>

        {form && (
          <div className="estudio-form">
            <div className="estudio-form__title">{form.editando ? 'Editar roadmap' : 'Novo roadmap'}</div>
            <label className="studio__label">Nome</label>
            <input
              className="estudio-form__input"
              value={form.name}
              placeholder="Ex.: Back-end"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <label className="studio__label">Slug (identificador na URL)</label>
            <input
              className="estudio-form__input"
              value={form.slug}
              disabled={form.editando}
              placeholder={form.editando ? '' : 'gerado do nome se vazio (ex.: back-end)'}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
            <label className="studio__label">Descrição</label>
            <textarea
              className="estudio-form__input estudio-form__textarea"
              value={form.description}
              placeholder="Do zero à vaga: o que este caminho ensina."
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div className="sim-adm__row">
              <div>
                <label className="studio__label">Nível</label>
                <select
                  className="estudio-form__input"
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value as Nivel })}
                >
                  {NIVEIS.map((n) => (
                    <option key={n.v} value={n.v}>
                      {n.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="studio__label">Posição (ordem)</label>
                <input
                  className="estudio-form__input"
                  type="number"
                  value={form.position}
                  placeholder="auto"
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                />
              </div>
              <div>
                <label className="studio__label">Ícone (opcional)</label>
                <input
                  className="estudio-form__input"
                  value={form.icon}
                  placeholder="ex.: server"
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                />
              </div>
            </div>
            <label className="sim-adm__check">
              <input
                type="checkbox"
                checked={form.premium}
                onChange={(e) => setForm({ ...form, premium: e.target.checked })}
              />
              Premium (bloqueado por assinatura)
            </label>
            <label className="sim-adm__check">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
              />
              Publicado (visível para os alunos)
            </label>
            {erro && <div className="auth__alert">{erro}</div>}
            <div className="estudio-form__actions">
              <button
                className="btn btn--ghost"
                onClick={() => {
                  setForm(null);
                  setErro('');
                }}
              >
                Cancelar
              </button>
              <button className="btn btn--accent" disabled={salvando} onClick={salvar}>
                {salvando ? 'Salvando...' : form.editando ? 'Salvar' : 'Criar roadmap'}
              </button>
            </div>
          </div>
        )}

        {carregando && <p className="track__desc">Carregando...</p>}
        {!form && (erro || falhaCarga) && (
          <div className="auth__alert">{erro || 'Não foi possível carregar os roadmaps.'}</div>
        )}
        {!carregando && roadmaps.length === 0 && !form && (
          <p className="track__desc">Nenhum roadmap cadastrado ainda.</p>
        )}

        <div className="estudio-home__list">
          {roadmaps.map((r) => (
            <div key={r.id} className="estudio-home__card">
              <button
                className="estudio-home__open"
                onClick={() => navigate(`/estudio/roadmaps/${r.id}`)}
              >
                <span className="estudio-home__glyph">
                  <Target size={18} />
                </span>
                <div className="estudio-home__meta">
                  <div className="estudio-home__name">{r.name}</div>
                  <div className="estudio-home__info">
                    {r.stagesTotal} {r.stagesTotal === 1 ? 'estágio' : 'estágios'} ·{' '}
                    {r.published ? 'Publicado' : 'Rascunho'}
                    {r.premium ? ' · Premium' : ''}
                  </div>
                </div>
              </button>
              <div className="estudio-home__actions">
                <button className="estudio-home__act" onClick={() => editar(r)} aria-label="Editar roadmap">
                  <Pencil size={15} />
                </button>
                <button
                  className="estudio-home__act estudio-home__act--danger"
                  onClick={() => excluir(r)}
                  aria-label="Excluir roadmap"
                >
                  <Trash size={15} />
                </button>
                <button
                  className="estudio-home__act"
                  onClick={() => navigate(`/estudio/roadmaps/${r.id}`)}
                  aria-label="Gerenciar estágios"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
