import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { EstudioTopbar } from '../../components/EstudioTopbar';
import { useRequisicao } from '../../hooks/useRequisicao';
import { useToast } from '../../contexts/ToastContext';
import { useSorteioAtivo } from '../../contexts/SorteioContext';
import { ConfirmModal } from '../Simulados/ConfirmModal';
import {
  adminAtualizarSorteio,
  adminExcluirSorteio,
  adminObterSorteio,
  adminSortear,
  type SorteioDetalhe,
} from '../../services/sorteios';
import {
  alteracoes,
  formDoSorteio,
  podeSortear,
  quantosGanhadores,
  rotuloInscritos,
  type FormSorteio,
} from '../../utils/sorteio';
import { mensagemErro } from '../../utils/erro';
import { dataHoraCurta } from '../../utils/tempo';
import { SeloSituacao } from './SeloSituacao';
import { SorteioForm } from './SorteioForm';
import { Ganhadores } from './Ganhadores';
import { ListaInscritos } from './ListaInscritos';

function fraseGanhadores(inscritos: number): string {
  const ganhadores = quantosGanhadores(inscritos);
  return ganhadores === 1 ? 'Sai 1 ganhador' : `Saem ${ganhadores} ganhadores`;
}

function explicacaoDoSorteio(sorteio: SorteioDetalhe): string {
  const inscritos = sorteio.participantes.length;
  const fim = dataHoraCurta(sorteio.fim);
  switch (sorteio.situacao) {
    case 'agendado':
      return `As inscrições ainda não abriram. O sorteio fica liberado depois do fim, em ${fim}.`;
    case 'aberto':
      return `As inscrições estão abertas até ${fim}. O sorteio fica liberado depois disso.`;
    case 'encerrado':
      return inscritos === 0
        ? 'As inscrições fecharam sem ninguém inscrito, então não há quem sortear.'
        : `As inscrições fecharam. ${fraseGanhadores(inscritos)} entre ${rotuloInscritos(inscritos)}.`;
    case 'sorteado':
      return '';
  }
}

export function SorteioAdminDetalhe() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { mostrar } = useToast();
  const { recarregar: recarregarSorteioAtivo } = useSorteioAtivo();
  const { dados, carregando, erro, recarregar } = useRequisicao(() => adminObterSorteio(id), [id]);
  // O POST de sortear já devolve o detalhe; usá-lo evita reexibir o botão até recarregar.
  const [sorteado, setSorteado] = useState<SorteioDetalhe | null>(null);
  const [confirmacao, setConfirmacao] = useState<'sortear' | 'excluir' | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [processando, setProcessando] = useState(false);

  const sorteio = sorteado?.id === id ? sorteado : dados;

  async function salvar(valores: FormSorteio) {
    if (!sorteio) return;
    setSalvando(true);
    try {
      await adminAtualizarSorteio(sorteio.id, alteracoes(formDoSorteio(sorteio), valores));
      mostrar('Sorteio salvo.');
      recarregar();
      recarregarSorteioAtivo();
    } catch (e) {
      console.error('Falha ao salvar o sorteio:', e);
      mostrar(mensagemErro(e, 'Não foi possível salvar o sorteio.'), 'erro');
    } finally {
      setSalvando(false);
    }
  }

  async function sortear() {
    if (!sorteio) return;
    setProcessando(true);
    try {
      setSorteado(await adminSortear(sorteio.id));
      mostrar('Sorteio feito. Os ganhadores estão na tela.');
    } catch (e) {
      console.error('Falha ao sortear:', e);
      mostrar(mensagemErro(e, 'Não foi possível sortear.'), 'erro');
      recarregar();
    } finally {
      setProcessando(false);
      setConfirmacao(null);
    }
  }

  async function excluir() {
    if (!sorteio) return;
    setProcessando(true);
    try {
      await adminExcluirSorteio(sorteio.id);
      mostrar('Sorteio excluído.');
      recarregarSorteioAtivo();
      navigate('/estudio/sorteios');
    } catch (e) {
      console.error('Falha ao excluir o sorteio:', e);
      mostrar(mensagemErro(e, 'Não foi possível excluir o sorteio.'), 'erro');
      setProcessando(false);
      setConfirmacao(null);
    }
  }

  const cabecalho = (
    <EstudioTopbar
      nav={false}
      crumb={
        <>
          <Link to="/estudio/sorteios">Sorteios</Link>
          <span>/</span>
          <b>{sorteio?.titulo ?? 'Sorteio'}</b>
        </>
      }
      actions={
        <Link className="btn btn--ghost studio__btn" to="/estudio/sorteios">
          Voltar
        </Link>
      }
    />
  );

  if (!sorteio) {
    return (
      <div className="home">
        {cabecalho}
        <div className="estudio-home">
          {carregando ? (
            <p className="track__desc">Carregando...</p>
          ) : (
            <div className="auth__alert">
              {erro ? 'Não foi possível carregar o sorteio.' : 'Sorteio não encontrado.'}
            </div>
          )}
        </div>
      </div>
    );
  }

  const inscritos = sorteio.participantes.length;
  const jaSorteado = sorteio.situacao === 'sorteado';

  return (
    <div className="home">
      {cabecalho}

      <div className="estudio-home srt-adm">
        <div>
          <h1 className="estudio-home__title">{sorteio.titulo}</h1>
          <div className="srt-adm__resumo">
            <SeloSituacao situacao={sorteio.situacao} />
            <span>
              {dataHoraCurta(sorteio.inicio)} até {dataHoraCurta(sorteio.fim)}
            </span>
            <span>{rotuloInscritos(inscritos)}</span>
            {sorteio.sorteadoEm && <span>Sorteado em {dataHoraCurta(sorteio.sorteadoEm)}</span>}
          </div>
        </div>

        <section className="card srt-adm__secao">
          <h2 className="srt-adm__secao-titulo">{jaSorteado ? 'Ganhadores' : 'Sorteio'}</h2>
          {jaSorteado ? (
            <Ganhadores ganhadores={sorteio.ganhadores} />
          ) : (
            <>
              <p className="srt-adm__texto">{explicacaoDoSorteio(sorteio)}</p>
              <button
                className="btn btn--accent"
                disabled={!podeSortear(sorteio)}
                onClick={() => setConfirmacao('sortear')}
              >
                Sortear ganhadores
              </button>
            </>
          )}
        </section>

        {jaSorteado ? (
          <section className="card srt-adm__secao">
            <h2 className="srt-adm__secao-titulo">Descrição</h2>
            <p className="srt-adm__descricao">{sorteio.descricao}</p>
          </section>
        ) : (
          <SorteioForm
            titulo="Editar sorteio"
            inicial={formDoSorteio(sorteio)}
            rotuloEnviar="Salvar alterações"
            enviando={salvando}
            onEnviar={salvar}
          />
        )}

        <section className="card srt-adm__secao">
          <h2 className="srt-adm__secao-titulo">
            Inscritos <span className="studio__pill">{inscritos}</span>
          </h2>
          <ListaInscritos inscritos={sorteio.participantes} />
        </section>

        <div className="srt-adm__excluir">
          <button className="btn btn--perigo" onClick={() => setConfirmacao('excluir')}>
            Excluir sorteio
          </button>
        </div>
      </div>

      {confirmacao === 'sortear' && (
        <ConfirmModal
          title="Sortear agora?"
          confirmLabel="Sortear"
          loading={processando}
          onConfirm={sortear}
          onCancel={() => setConfirmacao(null)}
        >
          {fraseGanhadores(inscritos)} entre {rotuloInscritos(inscritos)}. O resultado é definitivo,
          e os contatos de quem não ganhar são apagados na hora.
        </ConfirmModal>
      )}
      {confirmacao === 'excluir' && (
        <ConfirmModal
          title="Excluir o sorteio?"
          confirmLabel="Excluir"
          loading={processando}
          onConfirm={excluir}
          onCancel={() => setConfirmacao(null)}
        >
          As inscrições vão junto, inclusive os contatos dos ganhadores. Não dá para desfazer.
        </ConfirmModal>
      )}
    </div>
  );
}
