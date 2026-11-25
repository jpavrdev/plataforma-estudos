import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EstudioTopbar } from '../../components/EstudioTopbar';
import { ChevronRight, Plus, Pencil, Trash } from '../../components/Icons';
import { useRequisicao } from '../../hooks/useRequisicao';
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
import { mensagemErro } from '../../utils/erro';

type TrailComId = Trail & { id: string };

type LevelKey = 'levels.beginner' | 'levels.intermediate' | 'levels.advanced';

const LEVELS: { value: TrailLevelEnum; chave: LevelKey }[] = [
  { value: 'iniciante', chave: 'levels.beginner' },
  { value: 'intermediario', chave: 'levels.intermediate' },
  { value: 'avancado', chave: 'levels.advanced' },
];
const ENUM_DO_NIVEL: Record<string, TrailLevelEnum> = {
  iniciante: 'iniciante',
  intermediario: 'intermediario',
  avancado: 'avancado',
};
const CHAVE_DO_NIVEL: Record<string, LevelKey> = {
  iniciante: 'levels.beginner',
  intermediario: 'levels.intermediate',
  avancado: 'levels.advanced',
};

interface FormState {
  id?: string;
  name: string;
  level: TrailLevelEnum;
  description: string;
  tagIds: string[];
  workloadHours: string;
}

export function EstudioHome() {
  const navigate = useNavigate();
  const { t: t2 } = useTranslation();
  const {
    dados,
    carregando,
    erro: falhaCarga,
    recarregar,
  } = useRequisicao(
    () => Promise.all([listarTrilhas(), listarTags()]).then(([tr, tg]) => ({ tr, tg })),
    [],
  );
  const trilhas: TrailComId[] = dados?.tr ?? [];
  const tagsDisp: Tag[] = dados?.tg ?? [];
  const [erro, setErro] = useState('');
  const [form, setForm] = useState<FormState | null>(null);
  const [salvando, setSalvando] = useState(false);

  function novaTrilha() {
    setErro('');
    setForm({ name: '', level: 'iniciante', description: '', tagIds: [], workloadHours: '' });
  }
  function editarTrilha(t: TrailComId) {
    setErro('');
    const tagIds = tagsDisp.filter((tg) => t.tags.includes(tg.name)).map((tg) => tg.id);
    setForm({
      id: t.id,
      name: t.name,
      level: ENUM_DO_NIVEL[t.level] ?? 'iniciante',
      description: t.desc,
      tagIds,
      workloadHours: t.workloadHours ? String(t.workloadHours) : '',
    });
  }

  async function salvar() {
    if (!form || salvando) return;
    setSalvando(true);
    setErro('');
    try {
      const workloadHours = form.workloadHours ? Number(form.workloadHours) : null;
      if (form.id) {
        await atualizarTrilha(form.id, {
          name: form.name,
          level: form.level,
          description: form.description,
          tagIds: form.tagIds,
          workloadHours,
        });
      } else {
        await criarTrilha({
          name: form.name,
          level: form.level,
          description: form.description,
          tagIds: form.tagIds,
          workloadHours,
        });
      }
      setForm(null);
      recarregar();
    } catch (e: unknown) {
      setErro(mensagemErro(e, t2('estudio.saveError')));
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(t: TrailComId) {
    if (!window.confirm(t2('estudio.deleteConfirm', { name: t.name }))) return;
    setErro('');
    try {
      await excluirTrilha(t.id);
      recarregar();
    } catch {
      setErro(t2('estudio.deleteError'));
    }
  }

  return (
    <div className="home">
      <EstudioTopbar crumb={<b>{t2('estudio.adminCrumb')}</b>} />

      <div className="estudio-home">
        <div className="estudio-home__head">
          <div>
            <h1 className="estudio-home__title">{t2('nav.studioTracks')}</h1>
            <p className="estudio-home__sub">{t2('estudio.homeSub')}</p>
          </div>
          {!form && (
            <button className="btn btn--accent" onClick={novaTrilha}>
              <Plus size={14} /> {t2('estudio.newTrack')}
            </button>
          )}
        </div>

        {form && (
          <div className="estudio-form">
            <div className="estudio-form__title">
              {form.id ? t2('estudio.editTrack') : t2('estudio.newTrack')}
            </div>
            <label className="studio__label">{t2('estudio.nameLabel')}</label>
            <input
              className="estudio-form__input"
              value={form.name}
              placeholder={t2('estudio.namePlaceholder')}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <label className="studio__label">{t2('filters.level')}</label>
            <select
              className="estudio-form__input"
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value as TrailLevelEnum })}
            >
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {t2(l.chave)}
                </option>
              ))}
            </select>
            <label className="studio__label">{t2('estudio.workloadLabel')}</label>
            <input
              className="estudio-form__input"
              type="number"
              min={1}
              max={999}
              value={form.workloadHours}
              placeholder={t2('estudio.workloadPlaceholder')}
              onChange={(e) => setForm({ ...form, workloadHours: e.target.value })}
            />
            <label className="studio__label">{t2('estudio.descLabel')}</label>
            <textarea
              className="estudio-form__input estudio-form__textarea"
              value={form.description}
              placeholder={t2('estudio.descPlaceholder')}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <label className="studio__label">{t2('estudio.tagsLabel')}</label>
            <div className="tag-picker">
              {tagsDisp.length === 0 && (
                <span className="tag-picker__empty">{t2('estudio.tagsEmpty')}</span>
              )}
              {tagsDisp.map((tg) => {
                const ativa = form.tagIds.includes(tg.id);
                return (
                  <button
                    key={tg.id}
                    type="button"
                    className={`tag-pick${ativa ? ' tag-pick--on' : ''}`}
                    onClick={() =>
                      setForm({
                        ...form,
                        tagIds: ativa
                          ? form.tagIds.filter((id) => id !== tg.id)
                          : [...form.tagIds, tg.id],
                      })
                    }
                  >
                    {tg.name}
                  </button>
                );
              })}
            </div>
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
                {salvando ? 'Salvando...' : form.id ? 'Salvar' : 'Criar trilha'}
              </button>
            </div>
          </div>
        )}

        {carregando && <p className="track__desc">{t2('common.loading')}</p>}
        {!form && (erro || falhaCarga) && (
          <div className="auth__alert">{erro || t2('estudio.loadError')}</div>
        )}
        {!carregando && trilhas.length === 0 && !form && (
          <p className="track__desc">{t2('estudio.empty')}</p>
        )}

        <div className="estudio-home__list">
          {trilhas.map((t) => (
            <div key={t.id} className="estudio-home__card">
              <button className="estudio-home__open" onClick={() => navigate(`/estudio/${t.id}`)}>
                <span className="estudio-home__glyph">{t.glyph}</span>
                <div className="estudio-home__meta">
                  <div className="estudio-home__name">{t.name}</div>
                  <div className="estudio-home__info">
                    {t2('estudio.lessonsOf', {
                      count: t.lessons,
                      level: CHAVE_DO_NIVEL[t.level] ? t2(CHAVE_DO_NIVEL[t.level]) : t.level,
                    })}
                  </div>
                </div>
              </button>
              <div className="estudio-home__actions">
                <button
                  className="estudio-home__act"
                  onClick={() => editarTrilha(t)}
                  aria-label="Editar trilha"
                >
                  <Pencil size={15} />
                </button>
                <button
                  className="estudio-home__act estudio-home__act--danger"
                  onClick={() => excluir(t)}
                  aria-label="Excluir trilha"
                >
                  <Trash size={15} />
                </button>
                <button
                  className="estudio-home__act"
                  onClick={() => navigate(`/estudio/${t.id}`)}
                  aria-label="Abrir trilha"
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
