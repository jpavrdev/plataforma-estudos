import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useSorteioAtivo } from '../../contexts/SorteioContext';
import { ConfirmModal } from '../Simulados/ConfirmModal';
import { ContatoCampos } from './ContatoCampos';
import { ContatosInformados } from './ContatosInformados';
import { inscreverNoSorteio, type SorteioAtivo } from '../../services/sorteios';
import {
  CANAIS,
  RASCUNHOS_VAZIOS,
  SEM_ERROS,
  canaisDoSecundario,
  editarContato,
  escolherCanal,
  prepararInscricao,
  validarCampo,
  type CampoTexto,
  type Canal,
  type Contatos,
  type ErrosInscricao,
  type InscricaoEntrada,
  type Papel,
  type Rascunhos,
} from '../../utils/contatos';
import { mensagemErro, statusErro } from '../../utils/erro';

function sorteioMudou(e: unknown): boolean {
  const status = statusErro(e);
  return status === 404 || status === 409;
}

export function FormularioInscricao({ sorteio }: { sorteio: SorteioAtivo }) {
  const { user } = useAuth();
  const { mostrar } = useToast();
  const { recarregar } = useSorteioAtivo();
  const [rascunhos, setRascunhos] = useState<Rascunhos>(RASCUNHOS_VAZIOS);
  const [erros, setErros] = useState<ErrosInscricao>(SEM_ERROS);
  const [conferindo, setConferindo] = useState<{
    entrada: InscricaoEntrada;
    contatos: Contatos;
  } | null>(null);
  const [enviando, setEnviando] = useState(false);

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

  function conferir(evento: FormEvent) {
    evento.preventDefault();
    const resultado = prepararInscricao(rascunhos);
    if (!resultado.valida) {
      setErros(resultado.erros);
      return;
    }
    setErros(SEM_ERROS);
    setConferindo({ entrada: resultado.entrada, contatos: resultado.contatos });
  }

  async function confirmar() {
    if (!conferindo || enviando) return;
    setEnviando(true);
    try {
      await inscreverNoSorteio(sorteio.id, conferindo.entrada);
      mostrar('Inscrição confirmada. Boa sorte!');
      await recarregar();
    } catch (e) {
      console.error('Falha ao confirmar a inscrição no sorteio:', e);
      mostrar(mensagemErro(e, 'Não foi possível confirmar a inscrição.'), 'erro');
      if (sorteioMudou(e)) await recarregar();
    } finally {
      setEnviando(false);
      setConferindo(null);
    }
  }

  return (
    <>
      <form className="card srt__form" onSubmit={conferir} noValidate>
        <p className="srt__quem">
          Você participa como <b>@{user?.username}</b>
        </p>

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
          <button type="submit" className="btn btn--accent" disabled={enviando}>
            Participar do sorteio
          </button>
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
      {conferindo && (
        <ConfirmModal
          title="Confira sua inscrição"
          confirmLabel="OK"
          cancelLabel="Voltar"
          loading={enviando}
          onConfirm={confirmar}
          onCancel={() => setConferindo(null)}
        >
          Confira se suas informações estão corretas. Depois de confirmar, não dá para alterar.
          <ContatosInformados contatos={conferindo.contatos} />
          Se estiver tudo certo, aperte OK.
        </ConfirmModal>
      )}
    </>
  );
}
