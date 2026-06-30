import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/Logo';

// O backend redireciona para cá com #token=...&destino=home|completar-perfil.
// Pegamos o token do fragment (não vai pro servidor), entramos e seguimos.
export function OAuthCallback() {
  const { entrarComToken } = useAuth();
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.hash.slice(1));
  const token = params.get('token');
  const destino = params.get('destino');
  // Sem token na URL já começa em erro (evita setState síncrono no efeito).
  const [erro, setErro] = useState(!token);
  const jaRodou = useRef(false);

  useEffect(() => {
    if (!token || jaRodou.current) return;
    jaRodou.current = true;
    entrarComToken(token)
      .then(() =>
        navigate(destino === 'completar-perfil' ? '/completar-perfil' : '/home', {
          replace: true,
        }),
      )
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
            <Link className="btn btn--ghost btn--block" to="/">
              Voltar ao login
            </Link>
          </>
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
