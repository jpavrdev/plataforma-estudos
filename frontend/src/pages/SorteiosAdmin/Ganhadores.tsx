import type { Ganhador } from '../../services/sorteios';
import { ContatosInscrito } from './ContatosInscrito';

export function Ganhadores({ ganhadores }: { ganhadores: Ganhador[] }) {
  return (
    <ol className="srt-adm__ganhadores">
      {ganhadores.map((g) => (
        <li key={g.posicao} className="srt-adm__ganhador">
          <span className={`srt-adm__posicao srt-adm__posicao--${g.posicao}`}>{g.posicao}º</span>
          <div className="srt-adm__pessoa">
            <div>
              <b>{g.nome}</b> <span className="srt-adm__username">@{g.username}</span>
            </div>
            <ContatosInscrito contatos={g.contatos} atalho />
          </div>
        </li>
      ))}
    </ol>
  );
}
