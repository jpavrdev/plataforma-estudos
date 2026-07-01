import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { Plus, Pencil, Trash, ChevronRight, GradCap } from '../../components/Icons';
import { useRequisicao } from '../../hooks/useRequisicao';
import { mensagemErro } from '../../utils/erro';
import { useToast } from '../../contexts/ToastContext';
import {
  listarSimuladosAdmin,
  obterSimuladoAdmin,
  criarSimulado,
  atualizarSimulado,
  excluirSimulado,
  type SimuladoAdminItem,
} from '../../services/simulados';

interface FormState {
  slug: string;
  name: string;
  description: string;
  durationMinutes: number;
  questionCount: number;
  passPercent: number;
  published: boolean;
  editando: boolean;
}

const NOVO: FormState = {
  slug: '',
  name: '',
  description: '',
  durationMinutes: 90,
  questionCount: 65,
  passPercent: 70,
  published: false,
  editando: false,
};

export function SimuladosAdmin() {
  const navigate = useNavigate();
  const { mostrar } = useToast();
  const {
    dados,
    carregando,
    erro: falhaCarga,
    recarregar,
  } = useRequisicao(listarSimuladosAdmin, []);
  const simulados = dados ?? [];
  const [form, setForm] = useState<FormState | null>(null);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function editar(item: SimuladoAdminItem) {
    setErro('');
    try {
      const s = await obterSimuladoAdmin(item.slug);
      setForm({
        slug: s.slug,
        name: s.name,
        description: s.description ?? '',
        durationMinutes: s.durationMinutes,
        questionCount: s.questionCount,
        passPercent: s.passPercent,
        published: s.published,
        editando: true,
      });
    } catch {
      setErro('Não foi possível carregar o simulado.');
    }
  }

  async function salvar() {
    if (!form || salvando) return;
    setSalvando(true);
    setErro('');
    const payload = {
      name: form.name,
      description: form.description || undefined,
      durationMinutes: form.durationMinutes,
      questionCount: form.questionCount,
      passPercent: form.passPercent,
      published: form.published,
    };
    try {
      if (form.editando) {
        await atualizarSimulado(form.slug, payload);
      } else {
        await criarSimulado({ slug: form.slug, ...payload });
      }
      mostrar(form.editando ? 'Simulado atualizado.' : 'Simulado criado.');
      setForm(null);
      recarregar();
    } catch (e: unknown) {
      setErro(mensagemErro(e, 'Não foi possível salvar o simulado.'));
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(item: SimuladoAdminItem) {
    if (!window.confirm(`Excluir o simulado "${item.name}" e todas as suas questões e tentativas?`))
      return;
    setErro('');
    try {
      await excluirSimulado(item.slug);
      mostrar('Simulado excluído.');
      recarregar();
    } catch {
      setErro('Não foi possível excluir o simulado.');
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
        <div className="studio__crumb">
          <b>Simulados</b>
        </div>
        <div className="topbar__spacer" />
        <Link className="btn btn--ghost studio__btn" to="/estudio">
          Trilhas
        </Link>
        <Link className="btn btn--ghost studio__btn" to="/home">
          Voltar ao app
        </Link>
      </header>

      <div className="estudio-home">
        <div className="estudio-home__head">
          <div>
            <h1 className="estudio-home__title">Simulados</h1>
            <p className="estudio-home__sub">Crie e edite provas e suas questões.</p>
          </div>
          {!form && (
            <button className="btn btn--accent" onClick={() => setForm({ ...NOVO })}>
              <Plus size={14} /> Novo simulado
            </button>
          )}
        </div>

        {form && (
          <div className="estudio-form">
            <div className="estudio-form__title">
              {form.editando ? 'Editar simulado' : 'Novo simulado'}
            </div>
            <label className="studio__label">Slug (identificador na URL)</label>
            <input
              className="estudio-form__input"
              value={form.slug}
              disabled={form.editando}
              placeholder="ex.: aws-cloud-practitioner"
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
            <label className="studio__label">Nome</label>
            <input
              className="estudio-form__input"
              value={form.name}
              placeholder="Ex.: AWS Certified Cloud Practitioner"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <label className="studio__label">Descrição</label>
            <textarea
              className="estudio-form__input estudio-form__textarea"
              value={form.description}
              placeholder="Descrição do simulado"
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div className="sim-adm__row">
              <div>
                <label className="studio__label">Duração (min)</label>
                <input
                  className="estudio-form__input"
                  type="number"
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="studio__label">Nº de questões</label>
                <input
                  className="estudio-form__input"
                  type="number"
                  value={form.questionCount}
                  onChange={(e) => setForm({ ...form, questionCount: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="studio__label">Corte (%)</label>
                <input
                  className="estudio-form__input"
                  type="number"
                  value={form.passPercent}
                  onChange={(e) => setForm({ ...form, passPercent: Number(e.target.value) })}
                />
              </div>
            </div>
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
                {salvando ? 'Salvando...' : form.editando ? 'Salvar' : 'Criar simulado'}
              </button>
            </div>
          </div>
        )}

        {carregando && <p className="track__desc">Carregando...</p>}
        {!form && (erro || falhaCarga) && (
          <div className="auth__alert">{erro || 'Não foi possível carregar os simulados.'}</div>
        )}
        {!carregando && simulados.length === 0 && !form && (
          <p className="track__desc">Nenhum simulado cadastrado ainda.</p>
        )}

        <div className="estudio-home__list">
          {simulados.map((s) => (
            <div key={s.slug} className="estudio-home__card">
              <button
                className="estudio-home__open"
                onClick={() => navigate(`/estudio/simulados/${s.slug}`)}
              >
                <span className="estudio-home__glyph">
                  <GradCap size={18} />
                </span>
                <div className="estudio-home__meta">
                  <div className="estudio-home__name">{s.name}</div>
                  <div className="estudio-home__info">
                    {s.questoes} questões · {s.published ? 'Publicado' : 'Rascunho'}
                  </div>
                </div>
              </button>
              <div className="estudio-home__actions">
                <button
                  className="estudio-home__act"
                  onClick={() => editar(s)}
                  aria-label="Editar simulado"
                >
                  <Pencil size={15} />
                </button>
                <button
                  className="estudio-home__act estudio-home__act--danger"
                  onClick={() => excluir(s)}
                  aria-label="Excluir simulado"
                >
                  <Trash size={15} />
                </button>
                <button
                  className="estudio-home__act"
                  onClick={() => navigate(`/estudio/simulados/${s.slug}`)}
                  aria-label="Editar questões"
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
