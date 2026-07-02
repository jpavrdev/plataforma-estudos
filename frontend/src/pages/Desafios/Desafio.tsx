import { useParams, Link } from 'react-router-dom';
import { ResolverDesafio } from './ResolverDesafio';
import { useRequisicao } from '../../hooks/useRequisicao';
import { getDesafio } from '../../services/desafios';

export function Desafio() {
  const { id } = useParams();
  const { dados, carregando, erro } = useRequisicao(() => getDesafio(id!), [id]);

  if (carregando) {
    return <div className="solve-loading">Carregando desafio...</div>;
  }
  if (erro || !dados) {
    return (
      <div className="solve-loading">
        Desafio não encontrado. <Link to="/desafios">Voltar aos desafios</Link>
      </div>
    );
  }
  return <ResolverDesafio desafio={dados} />;
}
