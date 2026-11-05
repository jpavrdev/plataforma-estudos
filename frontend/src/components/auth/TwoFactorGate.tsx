import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../Logo';

interface Props {
  reason: '2fa_required' | '2fa_session';
}

// Shown instead of the admin area while 2FA is missing. Some Estúdio screens only
// read regular routes and would open normally, failing only when saving.
export function TwoFactorGate({ reason }: Props) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="verify-shell">
      <div className="verify-card">
        <Logo variant="solid" size={22} />
        <h1 className="verify-title">Verificação em duas etapas</h1>
        {reason === '2fa_required' ? (
          <>
            <p className="verify-text">
              As funções de administrador pedem a verificação em duas etapas. Ative no seu perfil
              com um app autenticador.
            </p>
            <Link className="btn btn--accent btn--block" to="/perfil#two-factor">
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
