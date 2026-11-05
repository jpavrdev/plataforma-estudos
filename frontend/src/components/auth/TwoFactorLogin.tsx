import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { FormField } from '../FormField';
import { mensagemErro } from '../../utils/erro';

interface Props {
  challenge: string;
  onDone: () => void;
  onBack: () => void;
}

// Second login step for 2FA accounts, after the password or the social login:
// the authenticator app code or a recovery code.
export function TwoFactorLogin({ challenge, onDone, onBack }: Props) {
  const { confirmTwoFactor } = useAuth();
  const { t } = useTranslation();
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await confirmTwoFactor(challenge, code);
      onDone();
    } catch (e: unknown) {
      setError(mensagemErro(e, t('twoFactorLogin.error')));
    } finally {
      setSubmitting(false);
    }
  }

  function toggleMode() {
    setRecoveryMode((current) => !current);
    setCode('');
    setError('');
  }

  const complete = recoveryMode ? code.replace(/[^a-z0-9]/gi, '').length === 10 : code.length === 6;

  return (
    <>
      <h2 className="auth__title">{t('twoFactorLogin.title')}</h2>
      <p className="auth__subtitle">
        {recoveryMode ? t('twoFactorLogin.recoveryHint') : t('twoFactorLogin.appHint')}
      </p>

      {error && <div className="auth__alert">{error}</div>}

      <form className="form" onSubmit={confirm} noValidate>
        {recoveryMode ? (
          <FormField
            label={t('twoFactorLogin.recoveryCode')}
            autoComplete="off"
            placeholder="xxxxx-xxxxx"
            value={code}
            onChange={(e) => setCode(e.target.value.slice(0, 20))}
          />
        ) : (
          <FormField
            label={t('twoFactorLogin.appCode')}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          />
        )}
        <button
          className="btn btn--accent btn--block"
          type="submit"
          disabled={submitting || !complete}
        >
          {submitting ? t('twoFactorLogin.confirming') : t('twoFactorLogin.confirm')}
        </button>
      </form>

      <p className="auth__foot">
        <button type="button" className="link link--btn" onClick={toggleMode}>
          {recoveryMode ? t('twoFactorLogin.useApp') : t('twoFactorLogin.useRecovery')}
        </button>
        {' · '}
        <button type="button" className="link link--btn" onClick={onBack}>
          {t('auth.backToLogin')}
        </button>
      </p>
    </>
  );
}
