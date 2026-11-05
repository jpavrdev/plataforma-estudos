import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { Logo } from '../../components/Logo';
import { mensagemErro } from '../../utils/erro';

type Status = 'verifying' | 'done' | 'failed';

export function VerifyEmail() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<Status>(token ? 'verifying' : 'failed');
  const [message, setMessage] = useState(token ? '' : t('verifyEmail.noToken'));
  const started = useRef(false);

  useEffect(() => {
    // Avoids a double call in StrictMode (dev). Without a token, the initial state is already failed.
    if (!token || started.current) return;
    started.current = true;

    async function verify() {
      try {
        const { data } = await api.post('/verify-email', { token });
        setStatus('done');
        setMessage(data.mensagem ?? t('verifyEmail.done'));
      } catch (e: unknown) {
        setStatus('failed');
        setMessage(mensagemErro(e, t('verifyEmail.failed')));
      }
    }

    verify();
  }, [token, t]);

  return (
    <div className="verify-shell">
      <div className="verify-card">
        <Logo variant="solid" size={22} />

        {status === 'verifying' && (
          <>
            <h1 className="verify-title">{t('verifyEmail.verifying')}</h1>
            <p className="verify-text">{t('verifyEmail.wait')}</p>
          </>
        )}

        {status === 'done' && (
          <>
            <div className="verify-icon verify-icon--ok">✓</div>
            <h1 className="verify-title">{t('verifyEmail.doneTitle')}</h1>
            <p className="verify-text">{message}</p>
            <Link className="btn btn--accent btn--block" to="/entrar">
              {t('auth.goToLogin')}
            </Link>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="verify-icon verify-icon--erro">!</div>
            <h1 className="verify-title">{t('verifyEmail.failedTitle')}</h1>
            <p className="verify-text">{message}</p>
            <Link className="btn btn--ghost btn--block" to="/entrar">
              {t('auth.backToLogin')}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
