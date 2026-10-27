import {
  ROTULO_CANAL,
  descreverContato,
  linkDoContato,
  type Contato,
  type Contatos,
} from '../../utils/contatos';

function LinhaContato({ contato, atalho }: { contato: Contato; atalho: boolean }) {
  const texto = descreverContato(contato);
  return (
    <span className="srt-adm__contato">
      <span className="srt-adm__canal">{ROTULO_CANAL[contato.canal]}</span>
      {atalho ? (
        <a
          className="link"
          href={linkDoContato(contato)}
          target={contato.canal === 'email' ? undefined : '_blank'}
          rel="noreferrer"
        >
          {texto}
        </a>
      ) : (
        texto
      )}
    </span>
  );
}

export function ContatosInscrito({
  contatos,
  atalho = false,
}: {
  contatos: Contatos | null;
  atalho?: boolean;
}) {
  if (!contatos) return <span className="srt-adm__apagado">Contato apagado após o sorteio</span>;
  return (
    <div className="srt-adm__contatos">
      <LinhaContato contato={contatos.primario} atalho={atalho} />
      {contatos.secundario && <LinhaContato contato={contatos.secundario} atalho={atalho} />}
    </div>
  );
}
