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
  return (
    <span className="srt-contatos">
      <LinhaContato papel="Principal" contato={contatos.primario} />
      {contatos.secundario && <LinhaContato papel="Secundário" contato={contatos.secundario} />}
    </span>
  );
}
