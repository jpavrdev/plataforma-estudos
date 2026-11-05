import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/Logo';
import { TwoFactorLogin } from '../../components/auth/TwoFactorLogin';

// The backend redirects here with #token=...&destino=home|completar-perfil. The
// token comes in the fragment (it does not reach the server); we sign in and move
// on. A 2FA account arrives with #challenge=... instead and confirms the code here.
export function OAuthCallback() {
  const { entrarComToken } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const params = new URLSearchParams(window.location.hash.slice(1));
  const token = params.get('token');
  const destination = params.get('destino');
  const challenge = params.get('challenge');
  // Without a token in the URL it starts failed (avoids a synchronous setState in the effect).
  const [failed, setFailed] = useState(!token && !challenge);
  const proceed = () =>
    navigate(destination === 'completar-perfil' ? '/completar-perfil' : '/home', {
      replace: true,
    });
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    entrarComToken(token)
      .then(proceed)
      .catch((e: unknown) => {
        console.error('Social sign-in failed after the callback', e);
        setFailed(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="verify-shell">
      <div className="verify-card">
        <Logo variant="solid" size={22} />
        {failed ? (
          <>
            <div className="verify-icon verify-icon--erro">!</div>
            <h1 className="verify-title">{t('oauthCallback.failedTitle')}</h1>
            <p className="verify-text">{t('oauthCallback.failedText')}</p>
            <Link className="btn btn--ghost btn--block" to="/entrar">
              {t('auth.backToLogin')}
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
            <h1 className="verify-title">{t('oauthCallback.signingIn')}</h1>
            <p className="verify-text">{t('oauthCallback.wait')}</p>
          </>
        )}
      </div>
    </div>
  );
}
