import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EstudioTopbar } from '../../components/EstudioTopbar';
import { Plus, Pencil, Trash, ChevronLeft, Minus } from '../../components/Icons';
import { useRequisicao } from '../../hooks/useRequisicao';
import { mensagemErro } from '../../utils/erro';
import { useToast } from '../../contexts/ToastContext';
import { listarTrilhas } from '../../services/trails';
import {
  obterRoadmapStudio,
  criarEstagio,
  atualizarEstagio,
  excluirEstagio,
  adicionarRef,
  removerRef,
  type RoadmapPhase,
  type RoadmapStudioStage,
} from '../../services/roadmaps';

const FASES: { v: RoadmapPhase; label: string }[] = [
  { v: 'fundamentos', label: 'Fundamentos' },
  { v: 'core', label: 'Core' },
  { v: 'avancado', label: 'Avançado' },
  { v: 'deploy', label: 'Deploy' },
];
const FASE_LABEL: Record<RoadmapPhase, string> = {
  fundamentos: 'Fundamentos',
  core: 'Core',
  avancado: 'Avançado',
  deploy: 'Deploy',
};

interface StageForm {
  phase: RoadmapPhase;
  title: string;
  description: string;
  tags: string;
  position: string;
}
const NOVO_ESTAGIO: StageForm = { phase: 'fundamentos', title: '', description: '', tags: '', position: '' };

function parseTags(s: string): string[] {
  return s
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

export function RoadmapEditor() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { mostrar } = useToast();
  const { dados, carregando, erro: falhaCarga, recarregar } = useRequisicao(
    () => obterRoadmapStudio(id),
    [id],
  );
  const { dados: trilhasData } = useRequisicao(() => listarTrilhas(), []);
  const trilhas = trilhasData ?? [];

  const [novo, setNovo] = useState<StageForm | null>(null);
  const [editando, setEditando] = useState<(StageForm & { id: string }) | null>(null);
  const [refTrail, setRefTrail] = useState<Record<string, string>>({});
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function comErro(fn: () => Promise<void>, msgOk: string, msgErro: string) {
    if (salvando) return;
    setSalvando(true);
    setErro('');
    try {
      await fn();
      mostrar(msgOk);
      recarregar();
    } catch (e: unknown) {
      setErro(mensagemErro(e, msgErro));
    } finally {
      setSalvando(false);
    }
  }

  function payloadDe(f: StageForm) {
    return {
      phase: f.phase,
      title: f.title,
      description: f.description,
      tags: parseTags(f.tags),
      ...(f.position.trim() !== '' ? { position: Number(f.position) } : {}),
    };
  }

  async function criar() {
    if (!novo) return;
    await comErro(
      async () => {
        await criarEstagio(id, payloadDe(novo));
        setNovo(null);
      },
      'Estágio adicionado.',
      'Não foi possível adicionar o estágio.',
    );
  }

  async function salvarEdicao() {
    if (!editando) return;
    const { id: stageId, ...f } = editando;
    await comErro(
      async () => {
        await atualizarEstagio(stageId, payloadDe(f));
        setEditando(null);
      },
      'Estágio atualizado.',
      'Não foi possível salvar o estágio.',
    );
  }

  async function excluirEtapa(s: RoadmapStudioStage) {
    if (!window.confirm(`Excluir o estágio "${s.title}" e suas referências?`)) return;
    await comErro(() => excluirEstagio(s.id), 'Estágio excluído.', 'Não foi possível excluir o estágio.');
  }

  async function addRef(stageId: string) {
    const trailId = refTrail[stageId];
    if (!trailId) return;
    await comErro(
      async () => {
        await adicionarRef(stageId, { refType: 'trail', refId: trailId });
        setRefTrail((m) => ({ ...m, [stageId]: '' }));
      },
      'Trilha vinculada ao estágio.',
      'Não foi possível vincular a trilha.',
    );
  }

  async function delRef(refId: string) {
    await comErro(() => removerRef(refId), 'Referência removida.', 'Não foi possível remover a referência.');
  }

  function iniciarEdicao(s: RoadmapStudioStage) {
    setNovo(null);
    setEditando({
      id: s.id,
      phase: s.phase,
      title: s.title,
      description: s.description,
      tags: s.tags.join(', '),
      position: String(s.position),
    });
  }

  const stages = dados?.stages ?? [];

  return (
    <div className="home">
      <EstudioTopbar
        crumb={
          <button className="studio__crumblink" onClick={() => navigate('/estudio/roadmaps')}>
            <ChevronLeft size={14} /> Roadmaps
          </button>
        }
      />

      <div className="estudio-home">
        {carregando && <p className="track__desc">Carregando...</p>}
        {falhaCarga && <div className="auth__alert">Não foi possível carregar o roadmap.</div>}

        {dados && (
          <>
            <div className="estudio-home__head">
              <div>
                <h1 className="estudio-home__title">{dados.name}</h1>
                <p className="estudio-home__sub">
                  {dados.published ? 'Publicado' : 'Rascunho'} · {stages.length}{' '}
                  {stages.length === 1 ? 'estágio' : 'estágios'} · /{dados.slug}
                </p>
              </div>
              {!novo && !editando && (
                <button className="btn btn--accent" onClick={() => setNovo({ ...NOVO_ESTAGIO })}>
                  <Plus size={14} /> Novo estágio
                </button>
              )}
            </div>

            {erro && <div className="auth__alert">{erro}</div>}

            {novo && (
              <StageFields
                titulo="Novo estágio"
                form={novo}
                setForm={(f) => setNovo(f)}
                onCancel={() => {
                  setNovo(null);
                  setErro('');
                }}
                onSave={criar}
                salvando={salvando}
                salvarLabel="Adicionar estágio"
              />
            )}

            <div className="rmadm-stages">
              {stages.map((s) =>
                editando?.id === s.id ? (
                  <StageFields
                    key={s.id}
                    titulo="Editar estágio"
                    form={editando}
                    setForm={(f) => setEditando({ ...f, id: s.id })}
                    onCancel={() => {
                      setEditando(null);
                      setErro('');
                    }}
                    onSave={salvarEdicao}
                    salvando={salvando}
                    salvarLabel="Salvar"
                  />
                ) : (
                  <div key={s.id} className="rmadm-stage">
                    <div className="rmadm-stage__head">
                      <div className="rmadm-stage__titlewrap">
                        <span className="chip--outline rmadm-stage__phase">{FASE_LABEL[s.phase]}</span>
                        <span className="rmadm-stage__pos">#{s.position}</span>
                        <span className="rmadm-stage__title">{s.title}</span>
                      </div>
                      <div className="estudio-home__actions">
                        <button
                          className="estudio-home__act"
                          onClick={() => iniciarEdicao(s)}
                          aria-label="Editar estágio"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="estudio-home__act estudio-home__act--danger"
                          onClick={() => excluirEtapa(s)}
                          aria-label="Excluir estágio"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                    {s.description && <p className="rmadm-stage__desc">{s.description}</p>}
                    {s.tags.length > 0 && (
                      <div className="track__tags">
                        {s.tags.map((t) => (
                          <span key={t} className="chip--outline">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="rmadm-refs">
                      <div className="rmadm-refs__label">Conteúdo do estágio</div>
                      {s.refs.length === 0 && (
                        <p className="rmadm-refs__empty">Nenhuma trilha vinculada ainda.</p>
                      )}
                      {s.refs.map((r) => (
                        <div key={r.id} className="rmadm-ref">
                          <span className="chip--outline rmadm-ref__type">{r.refType}</span>
                          <span className="rmadm-ref__title">{r.title ?? '(conteúdo removido)'}</span>
                          <button
                            className="estudio-home__act estudio-home__act--danger"
                            onClick={() => delRef(r.id)}
                            aria-label="Remover referência"
                          >
                            <Minus size={14} />
                          </button>
                        </div>
                      ))}
                      <div className="rmadm-refadd">
                        <select
                          className="estudio-form__input"
                          value={refTrail[s.id] ?? ''}
                          onChange={(e) => setRefTrail((m) => ({ ...m, [s.id]: e.target.value }))}
                        >
                          <option value="">Vincular uma trilha...</option>
                          {trilhas.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                        <button
                          className="btn btn--ghost"
                          disabled={!refTrail[s.id] || salvando}
                          onClick={() => addRef(s.id)}
                        >
                          <Plus size={13} /> Vincular
                        </button>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>

            {stages.length === 0 && !novo && (
              <p className="track__desc">
                Nenhum estágio ainda. Clique em "Novo estágio" para começar a montar o caminho.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface StageFieldsProps {
  titulo: string;
  form: StageForm;
  setForm: (f: StageForm) => void;
  onCancel: () => void;
  onSave: () => void;
  salvando: boolean;
  salvarLabel: string;
}

function StageFields({ titulo, form, setForm, onCancel, onSave, salvando, salvarLabel }: StageFieldsProps) {
  return (
    <div className="estudio-form">
      <div className="estudio-form__title">{titulo}</div>
      <div className="sim-adm__row">
        <div>
          <label className="studio__label">Fase</label>
          <select
            className="estudio-form__input"
            value={form.phase}
            onChange={(e) => setForm({ ...form, phase: e.target.value as RoadmapPhase })}
          >
            {FASES.map((f) => (
              <option key={f.v} value={f.v}>
                {f.label}
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
      </div>
      <label className="studio__label">Título</label>
      <input
        className="estudio-form__input"
        value={form.title}
        placeholder="Ex.: Banco de dados"
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <label className="studio__label">Descrição</label>
      <textarea
        className="estudio-form__input estudio-form__textarea"
        value={form.description}
        placeholder="O que este estágio ensina."
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <label className="studio__label">Tags (separadas por vírgula)</label>
      <input
        className="estudio-form__input"
        value={form.tags}
        placeholder="Ex.: SQL, PostgreSQL, Modelagem"
        onChange={(e) => setForm({ ...form, tags: e.target.value })}
      />
      <div className="estudio-form__actions">
        <button className="btn btn--ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button className="btn btn--accent" disabled={salvando} onClick={onSave}>
          {salvando ? 'Salvando...' : salvarLabel}
        </button>
      </div>
    </div>
  );
}
