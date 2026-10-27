import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EstudioTopbar } from '../../components/EstudioTopbar';
import { ChevronRight, Plus, Trophy } from '../../components/Icons';
import { useRequisicao } from '../../hooks/useRequisicao';
import { useToast } from '../../contexts/ToastContext';
import { useSorteioAtivo } from '../../contexts/SorteioContext';
import { adminCriarSorteio, adminListarSorteios } from '../../services/sorteios';
import {
  FORM_SORTEIO_VAZIO,
  paraPayload,
  rotuloInscritos,
  type FormSorteio,
} from '../../utils/sorteio';
import { mensagemErro } from '../../utils/erro';
import { dataHoraCurta } from '../../utils/tempo';
import { SeloSituacao } from './SeloSituacao';
import { SorteioForm } from './SorteioForm';

export function SorteiosAdmin() {
  const navigate = useNavigate();
  const { mostrar } = useToast();
  const { recarregar: recarregarSorteioAtivo } = useSorteioAtivo();
  const { dados, carregando, erro, recarregar } = useRequisicao(adminListarSorteios, []);
  const sorteios = dados ?? [];
  const [formAberto, setFormAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function criar(valores: FormSorteio) {
    setSalvando(true);
    try {
      await adminCriarSorteio(paraPayload(valores));
      mostrar('Sorteio criado.');
      setFormAberto(false);
      recarregar();
      // Se ele já começa aberto, o item do menu aparece sem esperar a próxima busca.
      recarregarSorteioAtivo();
    } catch (e) {
      console.error('Falha ao criar o sorteio:', e);
      mostrar(mensagemErro(e, 'Não foi possível criar o sorteio.'), 'erro');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="home">
      <EstudioTopbar crumb={<b>Sorteios</b>} />

      <div className="estudio-home">
        <div className="estudio-home__head">
          <div>
            <h1 className="estudio-home__title">Sorteios</h1>
            <p className="estudio-home__sub">
              Abra as inscrições por um período e, depois do fim, sorteie os 3 ganhadores aqui.
            </p>
          </div>
          <button className="btn btn--accent" onClick={() => setFormAberto((v) => !v)}>
            <Plus size={14} /> Novo sorteio
          </button>
        </div>

        {formAberto && (
          <SorteioForm
            titulo="Novo sorteio"
            inicial={FORM_SORTEIO_VAZIO}
            rotuloEnviar="Criar sorteio"
            enviando={salvando}
            onEnviar={criar}
            onCancelar={() => setFormAberto(false)}
          />
        )}

        {carregando && <p className="track__desc">Carregando...</p>}
        {erro && <div className="auth__alert">Não foi possível carregar os sorteios.</div>}
        {!carregando && !erro && sorteios.length === 0 && (
          <p className="track__desc">Nenhum sorteio ainda. Crie o primeiro.</p>
        )}

        <div className="estudio-home__list">
          {sorteios.map((s) => (
            <div key={s.id} className="estudio-home__card">
              <button
                className="estudio-home__open"
                onClick={() => navigate(`/estudio/sorteios/${s.id}`)}
              >
                <span className="estudio-home__glyph">
                  <Trophy size={18} />
                </span>
                <div className="estudio-home__meta">
                  <div className="estudio-home__name">{s.titulo}</div>
                  <div className="estudio-home__info">
                    {dataHoraCurta(s.inicio)} até {dataHoraCurta(s.fim)} ·{' '}
                    {rotuloInscritos(s.participantes)}
                  </div>
                </div>
                <SeloSituacao situacao={s.situacao} />
              </button>
              <div className="estudio-home__actions">
                <button
                  className="estudio-home__act"
                  onClick={() => navigate(`/estudio/sorteios/${s.id}`)}
                  aria-label="Abrir sorteio"
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
