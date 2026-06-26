import { Link } from 'react-router-dom';

interface PlaceholderProps {
  title: string;
  description?: string;
}

/** Página temporária para seções ainda sem dados (Perfil, Meu progresso). */
export function Placeholder({ title, description }: PlaceholderProps) {
  return (
    <div className="placeholder">
      <div className="placeholder__card">
        <h1 className="placeholder__title">{title}</h1>
        <p className="placeholder__desc">
          {description ?? 'Esta seção está em construção e ainda não tem dados.'}
        </p>
        <Link className="btn btn--accent placeholder__back" to="/home">
          Voltar para o início
        </Link>
      </div>
    </div>
  );
}
