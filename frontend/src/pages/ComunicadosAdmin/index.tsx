import { useEffect, useState } from 'react';
import { EstudioTopbar } from '../../components/EstudioTopbar';
import { Plus, Trash, ChevronDown } from '../../components/Icons';
import { useToast } from '../../contexts/ToastContext';
import {
  adminListarComunicados,
  adminResultadosComunicado,
  adminCriarComunicado,
  adminAtualizarComunicado,
  adminExcluirComunicado,
  type ComunicadoResumo,
  type ComunicadoResultados,
  type ComunicadoKind,
} from '../../services/comunicados';

const KIND_LABEL: Record<ComunicadoKind, string> = { aviso: 'Aviso', pesquisa: 'Pesquisa' };

export function ComunicadosAdmin() {
  const { mostrar } = useToast();
  const [itens, setItens] = useState<ComunicadoResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [formAberto, setFormAberto] = useState(false);
  const [form, setForm] = useState({ kind: 'pesquisa' as ComunicadoKind, title: '', message: '' });
  const [salvando, setSalvando] = useState(false);
  const [abertoId, setAbertoId] = useState<string | null>(null);
  const [resultados, setResultados] = useState<Record<string, ComunicadoResultados>>({});

  async function carregar() {
    try {
      setItens(await adminListarComunicados());
    } catch {
      mostrar('Não foi possível carregar os comunicados.', 'erro');
    } finally {
      setCarregando(false);
    }
  }
  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function criar() {
    if (salvando) return;
    setSalvando(true);
    try {
      await adminCriarComunicado({ ...form, published: true });
      mostrar('Comunicado publicado.');
      setForm({ kind: 'pesquisa', title: '', message: '' });
      setFormAberto(false);
      carregar();
    } catch {
      mostrar('Não foi possível criar o comunicado.', 'erro');
    } finally {
      setSalvando(false);
    }
  }

  async function alternarPublicacao(item: ComunicadoResumo) {
    try {
      await adminAtualizarComunicado(item.id, { published: !item.published });
      carregar();
    } catch {
      mostrar('Não foi possível atualizar.', 'erro');
    }
  }

  async function excluir(item: ComunicadoResumo) {
    if (!window.confirm(`Excluir "${item.title}" e todas as respostas?`)) return;
    try {
      await adminExcluirComunicado(item.id);
      mostrar('Comunicado excluído.');
      carregar();
    } catch {
      mostrar('Não foi possível excluir.', 'erro');
    }
  }

  async function alternarResultados(item: ComunicadoResumo) {
    if (abertoId === item.id) {
      setAbertoId(null);
      return;
    }
    setAbertoId(item.id);
    if (!resultados[item.id]) {
      try {
        const r = await adminResultadosComunicado(item.id);
        setResultados((prev) => ({ ...prev, [item.id]: r }));
      } catch {
        mostrar('Não foi possível carregar os resultados.', 'erro');
      }
    }
  }

  return (
    <div className="home">
      <EstudioTopbar crumb={<b>Comunicados</b>} />

      <div className="estudio-home">
        <div className="estudio-home__head">
          <div>
            <h1 className="estudio-home__title">Comunicados</h1>
            <p className="estudio-home__sub">
              Lance avisos ou pesquisas (nota de 1 a 5 com comentário opcional) para os usuários.
            </p>
          </div>
          <button className="btn btn--accent" onClick={() => setFormAberto((v) => !v)}>
            <Plus size={14} /> Novo comunicado
          </button>
        </div>

        {formAberto && (
          <div className="card" style={{ marginBottom: 18 }}>
            <div className="estudio-form__title">Novo comunicado</div>
            <div style={{ display: 'grid', gap: 10 }}>
              <select
                className="cmn-texto"
                style={{ resize: 'none', marginBottom: 0 }}
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value as ComunicadoKind })}
              >
                <option value="pesquisa">Pesquisa (nota 1 a 5 + comentário)</option>
                <option value="aviso">Aviso (só mensagem)</option>
              </select>
              <input
                className="cmn-texto"
                style={{ resize: 'none', marginBottom: 0 }}
                placeholder="Título"
                value={form.title}
                maxLength={200}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <textarea
                className="cmn-texto"
                style={{ marginBottom: 0 }}
                placeholder={
                  form.kind === 'pesquisa'
                    ? 'A pergunta da pesquisa (ex.: De 1 a 5, como está sendo sua experiência?)'
                    : 'A mensagem do aviso'
                }
                rows={3}
                maxLength={2000}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
              <div className="cmn-card__row">
                <button className="btn btn--ghost" onClick={() => setFormAberto(false)}>
                  Cancelar
                </button>
                <button
                  className="btn btn--accent"
                  onClick={criar}
                  disabled={form.title.trim().length < 2 || form.message.trim().length < 2 || salvando}
                >
                  {salvando ? 'Publicando...' : 'Publicar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {carregando && <p className="track__desc">Carregando...</p>}
        {!carregando && itens.length === 0 && (
          <p className="track__desc">Nenhum comunicado ainda. Lance o primeiro.</p>
        )}

        {itens.map((item) => {
          const res = resultados[item.id];
          const aberto = abertoId === item.id;
          const maxDist = res ? Math.max(1, ...res.distribuicao.map((d) => d.count)) : 1;
          return (
            <div key={item.id} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span className="studio__badge">{KIND_LABEL[item.kind]}</span>
                <b style={{ flex: 1, minWidth: 180 }}>{item.title}</b>
                <span className="td-lesson__dur">
                  {item.respondidos} respostas · {item.dispensados} dispensas
                  {item.media != null ? ` · média ${item.media}` : ''}
                </span>
                <button className="btn btn--ghost" onClick={() => alternarPublicacao(item)}>
                  {item.published ? 'Despublicar' : 'Publicar'}
                </button>
                {item.kind === 'pesquisa' && (
                  <button className="btn btn--ghost" onClick={() => alternarResultados(item)}>
                    <ChevronDown size={14} /> Resultados
                  </button>
                )}
                <button className="btn btn--ghost" onClick={() => excluir(item)}>
                  <Trash size={14} />
                </button>
              </div>
              <p className="cmn-card__msg" style={{ margin: '8px 0 0' }}>
                {item.message}
              </p>

              {aberto && res && (
                <div style={{ marginTop: 10 }}>
                  <div className="cmn-dist">
                    {[...res.distribuicao].reverse().map((d) => (
                      <div key={d.rating} className="cmn-dist__row">
                        <span style={{ width: 12 }}>{d.rating}</span>
                        <div className="cmn-dist__track">
                          <span style={{ width: `${(d.count / maxDist) * 100}%` }} />
                        </div>
                        <span style={{ width: 24, textAlign: 'right' }}>{d.count}</span>
                      </div>
                    ))}
                  </div>
                  {res.respostas.filter((r) => r.comment).map((r, i) => (
                    <div key={i} className="cmn-resposta">
                      <div className="cmn-resposta__meta">
                        <b>{r.name}</b>
                        <span>nota {r.rating}</span>
                        <span>{new Date(r.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                      {r.comment}
                    </div>
                  ))}
                  {res.respostas.every((r) => !r.comment) && (
                    <p className="track__desc">Nenhum comentário escrito ainda.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
