import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import api from '../../services/api';
import { AuthShell } from '../../components/auth/AuthShell';
import { AuthBrand } from '../../components/auth/AuthBrand';
import { Logo } from '../../components/Logo';
import { FormField } from '../../components/FormField';
import {
  birthDateDisplayToIso,
  ProfileCompletionFields,
  validateProfileCompletionFields,
} from '../../components/ProfileCompletionFields';
import { SocialAuth } from '../../components/auth/SocialAuth';
import { Avatar } from '../../components/Avatar';
import { Check } from '../../components/Icons';
import {
  PasswordChecklist,
  PASSWORD_MIN,
  isValidPassword,
} from '../../components/auth/PasswordChecklist';
import { mensagemErro } from '../../utils/erro';

const BENEFITS = ['daily', 'streak', 'ranking', 'progress'] as const;

type FieldErrors = Record<string, string>;

export function Register() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const clearError = (field: string) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev));

  // Client-side validation for per-field feedback; the backend validates again.
  function validate(): FieldErrors {
    const e: FieldErrors = {};
    if (name.trim().length < 2) e.name = t('register.errors.name');

    const profileErrors = validateProfileCompletionFields({ username, birthDate, gender, phone });
    Object.assign(e, profileErrors);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = t('register.errors.email');

    if (!isValidPassword(password)) e.password = t('auth.weakPassword');

    return e;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const birthDateIso = birthDateDisplayToIso(birthDate);
    if (!birthDateIso) return;

    setSubmitting(true);
    try {
      const { data } = await api.post('/register', {
        name,
        username,
        email: email.trim(),
        password,
        birthDate: birthDateIso,
        gender,
        phone: phone.trim(),
      });
      // Carries the confirm-your-email notice along: sign-in refuses whoever has not
      // confirmed yet, and without this text the person does not understand why they
      // came back here. (`notice` is the state key the sign-in screen reads.)
      navigate('/entrar', {
        state: {
          notice: data?.mensagem ?? t('register.accountCreated'),
          email: email.trim(),
        },
      });
    } catch (e: unknown) {
      // Maps the known backend errors (409) to the right field, in either language.
      const msg = mensagemErro(e, t('register.errors.generic'));
      if (/usu[aá]rio|username/i.test(msg)) setErrors((prev) => ({ ...prev, username: msg }));
      else if (/email/i.test(msg)) setErrors((prev) => ({ ...prev, email: msg }));
      else setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const brand = (
    <AuthBrand glow="register">
      <div className="auth__brand-body">
        <h1 className="auth__headline auth__headline--single">{t('register.brandTitle')}</h1>
        <p className="auth__lede">{t('register.brandLede')}</p>

        <ul className="benefits">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="benefits__item">
              <span className="benefits__check">
                <Check size={14} />
              </span>
              {t(`register.benefits.${benefit}`)}
            </li>
          ))}
        </ul>
      </div>

      <div className="social-proof">
        <div className="avatars">
          <Avatar initials="MA" background="#E0A82E" color="#3a2a00" />
          <Avatar initials="LP" background="#5B8DEF" />
          <Avatar initials="AS" background="#2E9E6B" />
          <span className="avatar avatar--sm avatars__more">+9k</span>
        </div>
        <p>
          <Trans i18nKey="register.socialProof" components={{ b: <b />, br: <br /> }} />
        </p>
      </div>
    </AuthBrand>
  );

  return (
    <AuthShell brand={brand}>
      <div className="auth__logo-m">
        <Logo variant="solid" size={22} />
      </div>
      <h2 className="auth__title">{t('register.title')}</h2>
      <p className="auth__subtitle">{t('register.subtitle')}</p>

      {error && <div className="auth__alert">{error}</div>}

      <form className="form" onSubmit={handleSubmit} noValidate>
        <FormField
          label={t('register.name')}
          placeholder={t('register.namePlaceholder')}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            clearError('name');
          }}
          required
          error={errors.name}
        />
        <FormField
          label={t('auth.email')}
          type="email"
          autoComplete="email"
          placeholder={t('auth.emailPlaceholder')}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearError('email');
          }}
          required
          error={errors.email}
        />
        <ProfileCompletionFields
          username={username}
          onUsernameChange={setUsername}
          birthDate={birthDate}
          onBirthDateChange={setBirthDate}
          gender={gender}
          onGenderChange={setGender}
          phone={phone}
          onPhoneChange={setPhone}
          errors={errors}
          onClearError={clearError}
          required
        />
        <FormField
          label={t('auth.password')}
          type="password"
          autoComplete="new-password"
          placeholder={t('register.passwordPlaceholder', { min: PASSWORD_MIN })}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearError('password');
          }}
          required
          error={errors.password}
        >
          <PasswordChecklist value={password} />
        </FormField>
        <button className="btn btn--accent btn--block" type="submit" disabled={submitting}>
          {submitting ? t('register.submitting') : t('register.submit')}
        </button>
      </form>

      <SocialAuth />

      <p className="auth__terms">
        <Trans
          i18nKey="register.terms"
          components={{
            terms: <Link className="link" to="/termos" />,
            privacy: <Link className="link" to="/privacidade" />,
          }}
        />
      </p>
      <p className="auth__foot">
        {t('register.haveAccount')}{' '}
        <Link className="link" to="/entrar">
          {t('register.signIn')}
        </Link>
      </p>
    </AuthShell>
  );
}
