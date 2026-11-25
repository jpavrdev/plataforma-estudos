import { useTranslation } from 'react-i18next';
import { Calendar, Trophy } from '../../components/Icons';
import type { SorteioAtivo } from '../../services/sorteios';
import { dataHoraPorExtenso } from '../../utils/tempo';

export function InformacoesDoSorteio({
  sorteio,
  nivel = 'h1',
}: {
  sorteio: SorteioAtivo;
  nivel?: 'h1' | 'h2';
}) {
  const { t, i18n } = useTranslation();
  const Titulo = nivel;
  return (
    <div className="srt__cabecalho">
      <span className="srt__selo">
        <Trophy size={13} /> {t('sorteio.openBadge')}
      </span>
      <Titulo className="srt__titulo">{sorteio.titulo}</Titulo>
      <p className="srt__descricao">{sorteio.descricao}</p>
      <p className="srt__prazo">
        <Calendar size={15} /> {t('sorteio.deadline', { date: dataHoraPorExtenso(sorteio.fim, i18n.language) })}
      </p>
    </div>
  );
}
