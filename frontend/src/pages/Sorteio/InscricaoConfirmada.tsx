import { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
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
  const { t, i18n } = useTranslation();
  const [verInformacoes, setVerInformacoes] = useState(false);

  return (
    <div className="card srt__confirmada">
      <span className="srt__confirmada-icone">
        <Check size={20} />
      </span>
      <h1 className="srt__confirmada-titulo">{t('sorteio.confirmedTitle')}</h1>
      <p className="srt__quem">
        <Trans i18nKey="sorteio.youParticipate" values={{ user: user?.username ?? '' }} components={{ b: <b /> }} />
      </p>
      <p className="srt__texto">{t('sorteio.notifyThrough')}</p>
      <ContatosInformados contatos={participacao.contatos} />
      <p className="srt__texto">
        {t('sorteio.deadlineFull', { date: dataHoraPorExtenso(sorteio.fim, i18n.language) })}
      </p>
      <p className="srt__data-inscricao">
        {t('sorteio.registeredAt', { date: dataHoraCurta(participacao.inscritoEm, i18n.language) })}
      </p>
      <button
        type="button"
        className="btn btn--ghost"
        aria-expanded={verInformacoes}
        onClick={() => setVerInformacoes((v) => !v)}
      >
        {verInformacoes ? t('sorteio.hideInfo') : t('sorteio.showInfo')}
      </button>
      {verInformacoes && (
        <div className="srt__info">
          <InformacoesDoSorteio sorteio={sorteio} nivel="h2" />
        </div>
      )}
    </div>
  );
}
