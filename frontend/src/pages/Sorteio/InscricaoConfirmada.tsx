import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Check } from '../../components/Icons';
import type { Participacao, SorteioAtivo } from '../../services/sorteios';
import { dataHoraCurta, dataHoraPorExtenso } from '../../utils/tempo';
import { ContatosInformados } from './ContatosInformados';
import { InformacoesDoSorteio } from './InformacoesDoSorteio';

export function InscricaoConfirmada({
  sorteio,
  participacao,
}: {
  sorteio: SorteioAtivo;
  participacao: Participacao;
}) {
  const { user } = useAuth();
  const [verInformacoes, setVerInformacoes] = useState(false);

  return (
    <div className="card srt__confirmada">
      <span className="srt__confirmada-icone">
        <Check size={20} />
      </span>
      <h1 className="srt__confirmada-titulo">Inscrição confirmada</h1>
      <p className="srt__quem">
        Você participa como <b>@{user?.username}</b>
      </p>
      <p className="srt__texto">Se você ganhar, avisamos por estes contatos:</p>
      <ContatosInformados contatos={participacao.contatos} />
      <p className="srt__texto">
        As inscrições vão até {dataHoraPorExtenso(sorteio.fim)}, e o sorteio acontece depois disso.
      </p>
      <p className="srt__data-inscricao">
        Inscrição feita em {dataHoraCurta(participacao.inscritoEm)}.
      </p>
      <button
        type="button"
        className="btn btn--ghost"
        aria-expanded={verInformacoes}
        onClick={() => setVerInformacoes((v) => !v)}
      >
        {verInformacoes ? 'Esconder informações do sorteio' : 'Ver informações do sorteio'}
      </button>
      {verInformacoes && (
        <div className="srt__info">
          <InformacoesDoSorteio sorteio={sorteio} nivel="h2" />
        </div>
      )}
    </div>
  );
}
