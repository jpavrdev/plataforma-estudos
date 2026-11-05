import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../Logo';

interface Props {
  motivo: '2fa_obrigatorio' | '2fa_sessao';
}

// Tela no lugar da área de admin enquanto falta o 2FA. Algumas telas do Estúdio
// só leem rotas comuns e abririam normalmente, quebrando só na hora de salvar.
export function BloqueioDoisFatores({ motivo }: Props) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="verify-shell">
      <div className="verify-card">
        <Logo variant="solid" size={22} />
        <h1 className="verify-title">Verificação em duas etapas</h1>
        {motivo === '2fa_obrigatorio' ? (
          <>
            <p className="verify-text">
              As funções de administrador pedem a verificação em duas etapas. Ative no seu perfil
              com um app autenticador.
            </p>
            <Link className="btn btn--accent btn--block" to="/perfil#dois-fatores">
              Ativar no perfil
            </Link>
          </>
        ) : (
          <>
            <p className="verify-text">
              Esta sessão começou antes da verificação em duas etapas. Entre de novo e confirme com
              o código do app.
            </p>
            <button
              className="btn btn--accent btn--block"
              onClick={() => logout().then(() => navigate('/entrar'))}
            >
              Entrar de novo
            </button>
          </>
        )}
        <Link className="btn btn--ghost btn--block" to="/home">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
