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

  return (
    <div className="home-shell">
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
