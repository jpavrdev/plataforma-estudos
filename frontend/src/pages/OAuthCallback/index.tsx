import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/Logo';
import { TwoFactorLogin } from '../../components/auth/TwoFactorLogin';

// O backend redireciona para cá com #token=...&destino=home|completar-perfil.
// Pegamos o token do fragment (não vai pro servidor), entramos e seguimos.
// A 2FA account arrives with #challenge=... instead of the token and confirms the code here.
export function OAuthCallback() {
  const { entrarComToken } = useAuth();
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.hash.slice(1));
  const token = params.get('token');
  const destino = params.get('destino');
  const challenge = params.get('challenge');
  // Sem token na URL já começa em erro (evita setState síncrono no efeito).
  const [erro, setErro] = useState(!token && !challenge);
  const proceed = () =>
    navigate(destino === 'completar-perfil' ? '/completar-perfil' : '/home', { replace: true });
  const jaRodou = useRef(false);

  useEffect(() => {
    if (!token || jaRodou.current) return;
    jaRodou.current = true;
    entrarComToken(token)
      .then(proceed)
      .catch(() => setErro(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="verify-shell">
      <div className="verify-card">
        <Logo variant="solid" size={22} />
        {erro ? (
          <>
            <div className="verify-icon verify-icon--erro">!</div>
            <h1 className="verify-title">Não foi possível entrar</h1>
            <p className="verify-text">Tente novamente pela tela de login.</p>
            <Link className="btn btn--ghost btn--block" to="/entrar">
              Voltar ao login
            </Link>
          </>
        ) : challenge ? (
          <TwoFactorLogin
            challenge={challenge}
            onDone={proceed}
            onBack={() => navigate('/entrar', { replace: true })}
          />
        ) : (
          <>
            <h1 className="verify-title">Entrando...</h1>
            <p className="verify-text">Só um instante.</p>
          </>
        )}
      </div>
    </div>
  );
}
