import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import api from '../../services/api';
import { AuthShell } from '../../components/auth/AuthShell';
import { AuthBrand } from '../../components/auth/AuthBrand';
import { FormField } from '../../components/FormField';
import { PasswordChecklist, isValidPassword } from '../../components/auth/PasswordChecklist';
import { mensagemErro } from '../../utils/erro';

type Channel = 'email' | 'whatsapp';

export function ForgotPassword() {
  const { t } = useTranslation();
  const [step, setStep] = useState<'request' | 'code' | 'done'>('request');
  const [email, setEmail] = useState('');
  const [channel, setChannel] = useState<Channel | null>(null);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function requestCode(selected: Channel) {
    if (submitting || !email) return;
    setError('');
    setChannel(selected);
    setSubmitting(true);
    try {
      await api.post('/forgot-password-otp', { email, canal: selected });
      setStep('code');
    } catch (e: unknown) {
      setError(mensagemErro(e, t('forgotPassword.errors.sendCode')));
    } finally {
      setSubmitting(false);
    }
  }

  async function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    // The same rules the backend enforces, checked here so the message says what
    // is wrong instead of a generic "invalid data".
    if (!isValidPassword(password)) {
      setError(t('auth.weakPassword'));
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/reset-password-otp', { email, otp, password });
      setMessage(data.mensagem ?? t('forgotPassword.done'));
      setStep('done');
    } catch (e: unknown) {
      setError(mensagemErro(e, t('forgotPassword.errors.reset')));
    } finally {
      setSubmitting(false);
    }
  }

  const brand = (
    <AuthBrand glow="login">
      <div className="auth__brand-body">
        <h1 className="auth__headline">
          <span className="auth__kicker">
            <Trans
              i18nKey="forgotPassword.kicker"
              components={{ soft: <span className="auth__kicker-soft" /> }}
            />
          </span>
          <span className="auth__headline-main">{t('forgotPassword.headline')}</span>
        </h1>
        <p className="auth__lede">{t('forgotPassword.lede')}</p>
      </div>
    </AuthBrand>
  );

  return (
    <AuthShell brand={brand}>
      <h2 className="auth__title">{t('forgotPassword.title')}</h2>

      {step === 'done' ? (
        <>
          <div className="auth__alert auth__alert--ok">{message}</div>
          <p className="auth__foot">
            <Link className="link" to="/entrar">
              {t('auth.backToLogin')}
            </Link>
          </p>
        </>
      ) : step === 'request' ? (
        <>
          <p className="auth__subtitle">{t('forgotPassword.chooseChannel')}</p>
          {error && <div className="auth__alert">{error}</div>}
          <div className="form">
            <FormField
              label={t('auth.email')}
              type="email"
              autoComplete="email"
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              className="btn btn--accent btn--block"
              type="button"
              disabled={submitting || !email}
              onClick={() => requestCode('whatsapp')}
            >
              {submitting && channel === 'whatsapp'
                ? t('common.sending')
                : t('forgotPassword.viaWhatsApp')}
            </button>
            <button
              className="btn btn--ghost btn--block"
              type="button"
              disabled={submitting || !email}
              onClick={() => requestCode('email')}
            >
              {submitting && channel === 'email'
                ? t('common.sending')
                : t('forgotPassword.viaEmail')}
            </button>
          </div>
          <p className="auth__foot">
            {t('forgotPassword.remembered')}{' '}
            <Link className="link" to="/entrar">
              {t('auth.backToLogin')}
            </Link>
          </p>
        </>
      ) : (
        <>
          <p className="auth__subtitle">
            {channel === 'whatsapp'
              ? t('forgotPassword.enterCodeWhatsApp')
              : t('forgotPassword.enterCodeEmail')}
          </p>
          {error && <div className="auth__alert">{error}</div>}
          <form className="form" onSubmit={resetPassword} noValidate>
            <FormField
              label={t('forgotPassword.code')}
              type="text"
              autoComplete="one-time-code"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
            />
            <FormField
              label={t('auth.newPassword')}
              type="password"
              autoComplete="new-password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            >
              <PasswordChecklist value={password} />
            </FormField>
            <button className="btn btn--accent btn--block" type="submit" disabled={submitting}>
              {submitting ? t('forgotPassword.resetting') : t('forgotPassword.submit')}
            </button>
          </form>
          <p className="auth__foot">
            <button
              type="button"
              className="link link--btn"
              onClick={() => {
                setStep('request');
                setOtp('');
                setError('');
              }}
            >
              {t('forgotPassword.otherChannel')}
            </button>
          </p>
        </>
      )}
    </AuthShell>
  );
}
