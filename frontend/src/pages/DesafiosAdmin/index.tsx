import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { Plus, Pencil, Trash, ChevronRight, Target } from '../../components/Icons';
import { useRequisicao } from '../../hooks/useRequisicao';
import { useToast } from '../../contexts/ToastContext';
import { adminListarDesafios, adminExcluirDesafio } from '../../services/desafios';
import type { DesafioAdminResumo } from '../../services/desafios';

const DIF: Record<string, string> = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' };

function formatarData(iso: string | null): string {
  if (!iso) return 'Sem data';
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function DesafiosAdmin() {
  const navigate = useNavigate();
  const { mostrar } = useToast();
  const { dados, carregando, erro, recarregar } = useRequisicao(adminListarDesafios, []);
  const desafios = dados ?? [];

  async function excluir(item: DesafioAdminResumo) {
    if (!window.confirm(`Excluir o desafio "${item.title}" e todas as submissões?`)) return;
    try {
      await adminExcluirDesafio(item.id);
      mostrar('Desafio excluído.');
      recarregar();
    } catch {
      mostrar('Não foi possível excluir o desafio.', 'erro');
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
          <b>Desafios</b>
        </div>
        <div className="topbar__spacer" />
        <Link className="btn btn--ghost studio__btn" to="/estudio">
          Trilhas
        </Link>
        <Link className="btn btn--ghost studio__btn" to="/estudio/simulados">
          Simulados
        </Link>
        <Link className="btn btn--ghost studio__btn" to="/home">
          Voltar ao app
        </Link>
      </header>

      <div className="estudio-home">
        <div className="estudio-home__head">
          <div>
            <h1 className="estudio-home__title">Desafios de código</h1>
            <p className="estudio-home__sub">
              Crie desafios e marque a data em que cada um vale 100 XP.
            </p>
          </div>
          <button className="btn btn--accent" onClick={() => navigate('/estudio/desafios/novo')}>
            <Plus size={14} /> Novo desafio
          </button>
        </div>

        {carregando && <p className="track__desc">Carregando...</p>}
        {erro && <div className="auth__alert">Não foi possível carregar os desafios.</div>}
        {!carregando && desafios.length === 0 && (
          <p className="track__desc">Nenhum desafio cadastrado ainda.</p>
        )}

        <div className="estudio-home__list">
          {desafios.map((d) => (
            <div key={d.id} className="estudio-home__card">
              <button
                className="estudio-home__open"
                onClick={() => navigate(`/estudio/desafios/${d.id}`)}
              >
                <span className="estudio-home__glyph">
                  <Target size={18} />
                </span>
                <div className="estudio-home__meta">
                  <div className="estudio-home__name">
                    {d.number != null ? `${d.number}. ` : ''}
                    {d.title}
                  </div>
                  <div className="estudio-home__info">
                    {d.topic ? `${d.topic} · ` : ''}
                    {formatarData(d.activeDate)} · {DIF[d.difficulty]} · {d.testes} casos ·{' '}
                    {d.published ? 'Publicado' : 'Rascunho'}
                  </div>
                </div>
              </button>
              <div className="estudio-home__actions">
                <button
                  className="estudio-home__act"
                  onClick={() => navigate(`/estudio/desafios/${d.id}`)}
                  aria-label="Editar desafio"
                >
                  <Pencil size={15} />
                </button>
                <button
                  className="estudio-home__act estudio-home__act--danger"
                  onClick={() => excluir(d)}
                  aria-label="Excluir desafio"
                >
                  <Trash size={15} />
                </button>
                <button
                  className="estudio-home__act"
                  onClick={() => navigate(`/estudio/desafios/${d.id}`)}
                  aria-label="Abrir desafio"
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
