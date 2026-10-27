import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useSorteioAtivo } from '../../contexts/SorteioContext';
import { ConfirmModal } from '../Simulados/ConfirmModal';
import { ContatoCampos } from './ContatoCampos';
import { inscreverNoSorteio, sairDoSorteio, type SorteioAtivo } from '../../services/sorteios';
import {
  CANAIS,
  SEM_ERROS,
  canaisDoSecundario,
  editarContato,
  escolherCanal,
  prepararInscricao,
  rascunhosDe,
  validarCampo,
  type CampoTexto,
  type Canal,
  type ErrosInscricao,
  type Papel,
  type Rascunhos,
} from '../../utils/contatos';
import { mensagemErro, statusErro } from '../../utils/erro';
import { dataHoraCurta } from '../../utils/tempo';

function sorteioMudou(e: unknown): boolean {
  const status = statusErro(e);
  return status === 404 || status === 409;
}

export function FormularioInscricao({ sorteio }: { sorteio: SorteioAtivo }) {
  const { user } = useAuth();
  const { mostrar } = useToast();
  const { recarregar } = useSorteioAtivo();
  const participacao = sorteio.participacao;
  const [rascunhos, setRascunhos] = useState<Rascunhos>(() =>
    rascunhosDe(participacao?.contatos ?? null),
  );
  const [erros, setErros] = useState<ErrosInscricao>(SEM_ERROS);
  const [enviando, setEnviando] = useState(false);
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);
  const [saindo, setSaindo] = useState(false);

  function mudarCanal(papel: Papel, canal: Canal | '') {
    setRascunhos((r) => escolherCanal(r, papel, canal));
    setErros((e) => ({ ...e, [papel]: {} }));
  }

  function mudarCampo(papel: Papel, campo: CampoTexto | 'pais', valor: string) {
    setRascunhos((r) => ({ ...r, [papel]: editarContato(r[papel], campo, valor) }));
    const limpos =
      campo === 'pais' ? { ddd: undefined, numero: undefined } : { [campo]: undefined };
    setErros((e) => ({ ...e, [papel]: { ...e[papel], ...limpos } }));
  }

  function sairDoCampo(papel: Papel, campo: CampoTexto) {
    const erro = validarCampo(rascunhos[papel], campo);
    setErros((e) => ({ ...e, [papel]: { ...e[papel], [campo]: erro } }));
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    if (enviando) return;
    const resultado = prepararInscricao(rascunhos);
    if (!resultado.valida) {
      setErros(resultado.erros);
      return;
    }
    setErros(SEM_ERROS);
    setEnviando(true);
    try {
      await inscreverNoSorteio(sorteio.id, resultado.entrada);
      mostrar(participacao ? 'Alterações salvas.' : 'Inscrição feita. Boa sorte!');
      await recarregar();
    } catch (e) {
      console.error('Falha ao salvar a inscrição no sorteio:', e);
      mostrar(mensagemErro(e, 'Não foi possível salvar a inscrição.'), 'erro');
      if (sorteioMudou(e)) await recarregar();
    } finally {
      setEnviando(false);
    }
  }

  async function sair() {
    setSaindo(true);
    try {
      await sairDoSorteio(sorteio.id);
      mostrar('Você saiu do sorteio.');
      await recarregar();
    } catch (e) {
      console.error('Falha ao sair do sorteio:', e);
      mostrar(mensagemErro(e, 'Não foi possível sair do sorteio.'), 'erro');
      if (sorteioMudou(e)) await recarregar();
    } finally {
      setSaindo(false);
      setConfirmandoSaida(false);
    }
  }

  const ocupado = enviando || saindo;

  return (
    <>
      <form className="card srt__form" onSubmit={enviar} noValidate>
        <p className="srt__quem">
          Você participa como <b>@{user?.username}</b>
        </p>
        {participacao && (
          <div className="auth__alert auth__alert--ok srt__inscrito">
            Você entrou no sorteio em {dataHoraCurta(participacao.inscritoEm)}. Até o fim das
            inscrições dá para trocar os contatos ou sair.
          </div>
        )}

        <ContatoCampos
          titulo="Contato principal"
          dica="Por onde avisamos se você for sorteado."
          canais={CANAIS}
          rascunho={rascunhos.primario}
          erros={erros.primario}
          onCanal={(canal) => mudarCanal('primario', canal)}
          onCampo={(campo, valor) => mudarCampo('primario', campo, valor)}
          onSairDoCampo={(campo) => sairDoCampo('primario', campo)}
        />
        <ContatoCampos
          titulo="Contato secundário (opcional)"
          dica="Um segundo caminho, caso não consigamos falar com você pelo principal."
          opcional
          canais={canaisDoSecundario(rascunhos.primario.canal)}
          rascunho={rascunhos.secundario}
          erros={erros.secundario}
          onCanal={(canal) => mudarCanal('secundario', canal)}
          onCampo={(campo, valor) => mudarCampo('secundario', campo, valor)}
          onSairDoCampo={(campo) => sairDoCampo('secundario', campo)}
        />

        <div className="srt__acoes">
          <button type="submit" className="btn btn--accent" disabled={ocupado}>
            {enviando
              ? 'Salvando...'
              : participacao
                ? 'Salvar alterações'
                : 'Participar do sorteio'}
          </button>
          {participacao && (
            <button
              type="button"
              className="btn btn--ghost"
              disabled={ocupado}
              onClick={() => setConfirmandoSaida(true)}
            >
              Sair do sorteio
            </button>
          )}
        </div>

        <p className="srt__privacidade">
          Seus contatos servem só para avisar quem for sorteado. Os de quem não ganhar são apagados
          no ato do sorteio. Os detalhes estão na{' '}
          <Link className="link" to="/privacidade" target="_blank" rel="noreferrer">
            Política de Privacidade
          </Link>
          .
        </p>
      </form>

      {/* Fora do form: os botões do modal não têm type e enviariam o formulário. */}
      {confirmandoSaida && (
        <ConfirmModal
          title="Sair do sorteio?"
          confirmLabel="Sair do sorteio"
          loading={saindo}
          onConfirm={sair}
          onCancel={() => setConfirmandoSaida(false)}
        >
          Seus contatos são apagados e você deixa de concorrer. Enquanto as inscrições estiverem
          abertas, dá para entrar de novo.
        </ConfirmModal>
      )}
    </>
  );
}
