import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { AuthShell } from '../../components/auth/AuthShell';
import { AuthBrand } from '../../components/auth/AuthBrand';
import { Logo } from '../../components/Logo';
import { FormField } from '../../components/FormField';
import { SocialAuth } from '../../components/auth/SocialAuth';
import { TwoFactorLogin } from '../../components/auth/TwoFactorLogin';
import { Flame, Trophy } from '../../components/Icons';
import api from '../../services/api';
import { mensagemErro, statusErro } from '../../utils/erro';

// The social login callback comes back here with ?erro=<code> when it fails.
const OAUTH_ERRORS = {
  provedor_indisponivel: 'providerUnavailable',
  oauth_invalido: 'invalid',
  oauth_falhou: 'failed',
  oauth_sem_email: 'noEmail',
} as const;

type OAuthErrorCode = keyof typeof OAUTH_ERRORS;
const isOAuthError = (code: string | null): code is OAuthErrorCode =>
  !!code && Object.hasOwn(OAUTH_ERRORS, code);

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  const [searchParams] = useSearchParams();
  const oauthCode = searchParams.get('erro');
  const oauthError = isOAuthError(oauthCode)
    ? t(`login.oauthErrors.${OAUTH_ERRORS[oauthCode]}`)
    : '';

  // Whoever just signed up arrives with the confirm-your-email notice and the
  // address filled in; without it the person lands on a sign-in screen without
  // understanding why.
  const fromSignUp = useLocation().state as { notice?: string; email?: string } | null;
  const [signUpNotice, setSignUpNotice] = useState(fromSignUp?.notice ?? '');

  const [email, setEmail] = useState(fromSignUp?.email ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // 2FA account: after the password, the screen asks for the code.
  const [challenge, setChallenge] = useState<string | null>(null);
  // Sign-in blocked because the email is not confirmed (403): offers to resend it.
  const [unverified, setUnverified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSignUpNotice('');
    setUnverified(false);
    setResendMessage('');
    setSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.challenge) {
        setChallenge(result.challenge);
        return;
      }
      navigate('/home');
    } catch (e: unknown) {
      setError(mensagemErro(e, t('login.errors.generic')));
      setUnverified(statusErro(e) === 403);
    } finally {
      setSubmitting(false);
    }
  }

  async function resendVerification() {
    if (resending || !email) return;
    setResending(true);
    try {
      const { data } = await api.post('/resend-verification', { email });
      setResendMessage(data.mensagem ?? t('login.resent'));
    } catch (e: unknown) {
      console.error('Could not resend the verification email', e);
      setResendMessage(t('login.resendFailed'));
    } finally {
      setResending(false);
    }
  }

  const brand = (
    <AuthBrand glow="login">
      <div className="auth__brand-body">
        <h1 className="auth__headline">
          <span className="auth__kicker">
            <Trans
              i18nKey="login.kicker"
              components={{ soft: <span className="auth__kicker-soft" /> }}
            />
          </span>
          <span className="auth__headline-main">{t('login.headline')}</span>
        </h1>
        <p className="auth__lede">{t('login.lede')}</p>

        <div className="code-window">
          <div className="code-window__dots">
            <i />
            <i />
            <i />
          </div>
          <div>
            <span className="tok">function</span>{' '}
            <span className="tok-fn">{t('login.sampleFunction')}</span>(a, b) {'{'}
          </div>
          <div className="code-window__indent">
            <span className="tok">return</span> a + b;
          </div>
          <div>{'}'}</div>
          <div className="code-window__comment">// +50 XP · streak 12</div>
        </div>
      </div>

      <div className="auth__chips">
        <span className="chip">
          <Flame size={14} /> {t('login.streakChip')}
        </span>
        <span className="chip">
          <Trophy size={13} /> Top 4
        </span>
      </div>
    </AuthBrand>
  );

  if (challenge) {
    return (
      <AuthShell brand={brand}>
        <div className="auth__logo-m">
          <Logo variant="solid" size={22} />
        </div>
        <TwoFactorLogin
          challenge={challenge}
          onDone={() => navigate('/home')}
          onBack={() => {
            setChallenge(null);
            setPassword('');
          }}
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell brand={brand}>
      <div className="auth__logo-m">
        <Logo variant="solid" size={22} />
      </div>
      <h2 className="auth__title">{t('login.title')}</h2>
      <p className="auth__subtitle">{t('login.subtitle')}</p>

      {signUpNotice && <div className="auth__alert auth__alert--ok">{signUpNotice}</div>}

      {(error || oauthError) && <div className="auth__alert">{error || oauthError}</div>}

      {unverified &&
        (resendMessage ? (
          <div className="auth__alert auth__alert--ok">{resendMessage}</div>
        ) : (
          <button
            type="button"
            className="btn btn--ghost btn--block"
            onClick={resendVerification}
            disabled={resending}
          >
            {resending ? t('login.resending') : t('login.resend')}
          </button>
        ))}

      <form className="form" onSubmit={handleSubmit} noValidate>
        <FormField
          label={t('auth.email')}
          type="email"
          autoComplete="email"
          placeholder={t('auth.emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <FormField
          label={t('auth.password')}
          type="password"
          autoComplete="current-password"
          placeholder="••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          labelAddon={
            <Link className="link" to="/recuperar-senha">
              {t('login.forgotPassword')}
            </Link>
          }
        />
        <button className="btn btn--accent btn--block" type="submit" disabled={submitting}>
          {submitting ? t('login.submitting') : t('login.submit')}
        </button>
      </form>

      <SocialAuth />

      <p className="auth__foot">
        {t('login.noAccount')}{' '}
        <Link className="link" to="/cadastro">
          {t('login.createAccount')}
        </Link>
      </p>
    </AuthShell>
  );
}
