import { useTranslation } from 'react-i18next';
import { ROTULO_CANAL, descreverContato, type Contato, type Contatos } from '../../utils/contatos';

function LinhaContato({ papel, contato }: { papel: string; contato: Contato }) {
  return (
    <span className="srt-contatos__linha">
      <span className="srt-contatos__papel">{papel}</span>
      <span className="srt-contatos__valor">
        {ROTULO_CANAL[contato.canal]}: {descreverContato(contato)}
      </span>
    </span>
  );
}

// Só spans: a lista também vai dentro do parágrafo do modal de conferência.
export function ContatosInformados({ contatos }: { contatos: Contatos }) {
  const { t } = useTranslation();
  return (
    <span className="srt-contatos">
      <LinhaContato papel={t('sorteio.primaryRole')} contato={contatos.primario} />
      {contatos.secundario && (
        <LinhaContato papel={t('sorteio.secondaryRole')} contato={contatos.secundario} />
      )}
    </span>
  );
}
