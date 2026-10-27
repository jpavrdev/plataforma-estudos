import type { Inscrito } from '../../services/sorteios';
import { dataHoraCurta } from '../../utils/tempo';
import { ContatosInscrito } from './ContatosInscrito';

export function ListaInscritos({ inscritos }: { inscritos: Inscrito[] }) {
  if (inscritos.length === 0) {
    return <p className="srt-adm__texto">Ninguém se inscreveu ainda.</p>;
  }
  return (
    <div className="assin-tabela-wrap">
      <table className="assin-tabela">
        <thead>
          <tr>
            <th>Inscrito</th>
            <th>Inscrição</th>
            <th>Contatos</th>
          </tr>
        </thead>
        <tbody>
          {inscritos.map((i) => (
            <tr key={i.username}>
              <td>
                <b>{i.nome}</b>
                <span className="assin-email">@{i.username}</span>
              </td>
              <td>{dataHoraCurta(i.inscritoEm)}</td>
              <td>
                <ContatosInscrito contatos={i.contatos} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
