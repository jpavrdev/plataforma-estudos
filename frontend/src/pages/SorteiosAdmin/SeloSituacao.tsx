import type { SituacaoSorteio } from '../../services/sorteios';

const ROTULO: Record<SituacaoSorteio, string> = {
  agendado: 'Agendado',
  aberto: 'Aberto',
  encerrado: 'Encerrado',
  sorteado: 'Sorteado',
};

export function SeloSituacao({ situacao }: { situacao: SituacaoSorteio }) {
  return <span className={`srt-situacao srt-situacao--${situacao}`}>{ROTULO[situacao]}</span>;
}
