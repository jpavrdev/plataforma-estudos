import { useParams } from 'react-router-dom';
import { useRequisicao } from '../../hooks/useRequisicao';
import { SimTopbar } from './SimTopbar';
import { Prova } from './Prova';
import { Resultado } from './Resultado';
import { obterTentativa } from '../../services/simulados';

export function TentativaSimulado() {
  const { attemptId = '' } = useParams();
  const { dados, carregando, erro, recarregar } = useRequisicao(
    () => obterTentativa(attemptId),
    [attemptId],
  );

  // Só a prova em andamento é fluxo focado (esconde a topbar no telefone). No
  // resultado a topbar volta, para o aluno navegar de volta (logo, hambúrguer).
  const emProva = Boolean(dados && !dados.submitted);

  return (
    <div className={`home-shell${emProva ? ' app-mobilehdr' : ''}`}>
      <div className="home">
        <SimTopbar />
        {carregando && (
          <div className="sim">
            <p className="sim-empty">Carregando simulado...</p>
          </div>
        )}
        {erro && (
          <div className="sim">
            <p className="sim-empty">Não foi possível carregar a tentativa.</p>
          </div>
        )}
        {dados &&
          (dados.submitted ? (
            <Resultado dados={dados} />
          ) : (
            <Prova dados={dados} onEnviado={recarregar} />
          ))}
      </div>
    </div>
  );
}
