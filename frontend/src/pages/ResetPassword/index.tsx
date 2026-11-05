import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import api from '../../services/api';
import { AuthShell } from '../../components/auth/AuthShell';
import { AuthBrand } from '../../components/auth/AuthBrand';
import { FormField } from '../../components/FormField';
import { mensagemErro } from '../../utils/erro';

export function ResetPassword() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (password !== confirmation) {
      setError(t('resetPassword.errors.mismatch'));
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/reset-password', { token, password });
      setDone(true);
    } catch (e: unknown) {
      setError(mensagemErro(e, t('resetPassword.errors.generic')));
    } finally {
      setSubmitting(false);
    }
  }

  const brand = (
    <AuthBrand glow="register">
      <div className="auth__brand-body">
        <h1 className="auth__headline">
          <span className="auth__kicker">
            <Trans
              i18nKey="resetPassword.kicker"
              components={{ soft: <span className="auth__kicker-soft" /> }}
            />
          </span>
          <span className="auth__headline-main">{t('resetPassword.headline')}</span>
        </h1>
        <p className="auth__lede">{t('resetPassword.lede')}</p>
      </div>
    </AuthBrand>
  );

  return (
    <AuthShell brand={brand}>
      {!token ? (
        <>
          <h2 className="auth__title">{t('resetPassword.invalidTitle')}</h2>
          <p className="auth__subtitle">{t('resetPassword.invalidText')}</p>
          <p className="auth__foot">
            <Link className="link" to="/recuperar-senha">
              {t('resetPassword.requestNew')}
            </Link>
          </p>
        </>
      ) : done ? (
        <>
          <h2 className="auth__title">{t('resetPassword.doneTitle')}</h2>
          <p className="auth__subtitle">{t('resetPassword.doneText')}</p>
          <Link className="btn btn--accent btn--block" to="/entrar">
            {t('resetPassword.goToLogin')}
          </Link>
        </>
      ) : (
        <>
          <h2 className="auth__title">{t('resetPassword.title')}</h2>
          <p className="auth__subtitle">{t('resetPassword.subtitle')}</p>

          {error && <div className="auth__alert">{error}</div>}

          <form className="form" onSubmit={handleSubmit} noValidate>
            <FormField
              label={t('auth.newPassword')}
              type="password"
              autoComplete="new-password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            >
              <span className="field__hint">{t('resetPassword.hint')}</span>
            </FormField>
            <FormField
              label={t('resetPassword.confirmPassword')}
              type="password"
              autoComplete="new-password"
              placeholder="••••••••••"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              required
            />
            <button className="btn btn--accent btn--block" type="submit" disabled={submitting}>
              {submitting ? t('common.saving') : t('resetPassword.submit')}
            </button>
          </form>
          <p className="auth__foot">
            <Link className="link" to="/entrar">
              {t('auth.backToLogin')}
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
