import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { AuthShell } from '../../components/auth/AuthShell';
import { AuthBrand } from '../../components/auth/AuthBrand';
import {
  birthDateDisplayToIso,
  ProfileCompletionFields,
  validateProfileCompletionFields,
} from '../../components/ProfileCompletionFields';
import { Check } from '../../components/Icons';
import { mensagemErro } from '../../utils/erro';
import { useAuth } from '../../contexts/AuthContext';
import { formatPhone } from '../../utils/phone';

type FieldErrors = Record<string, string>;

// Shown after the first social sign-in, to collect the fields the provider does not
// give us (birth date, gender and phone).
export function CompleteProfile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, atualizarUsuario, logout } = useAuth();
  const [username, setUsername] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  // An existing phone comes filled in: changing it goes through the profile, with the password.
  const [phone, setPhone] = useState(user?.phone ? formatPhone(user.phone) : '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const clearError = (field: string) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev));

  // Without this way out the user is stuck: every route sends them here while there is no username.
  async function signOut() {
    await logout();
    navigate('/', { replace: true });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const errs = validateProfileCompletionFields({ username, birthDate, gender, phone });
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const birthDateIso = birthDateDisplayToIso(birthDate);
    if (!birthDateIso) return;

    setSubmitting(true);
    try {
      await api.post('/me/complete-profile', {
        username,
        birthDate: birthDateIso,
        gender,
        phone: phone.trim(),
      });
      atualizarUsuario({ username, gender, phone: phone.trim() });
      navigate('/home', { replace: true });
    } catch (e: unknown) {
      // The backend answers in the screen language, so the match covers both.
      const msg = mensagemErro(e, t('completeProfile.errors.generic'));
      if (/usu[aá]rio|username/i.test(msg)) setErrors((prev) => ({ ...prev, username: msg }));
      else setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const brand = (
    <AuthBrand glow="register">
      <div className="auth__brand-body">
        <h1 className="auth__headline auth__headline--single">{t('completeProfile.brandTitle')}</h1>
        <p className="auth__lede">{t('completeProfile.brandLede')}</p>
        <ul className="benefits">
          <li className="benefits__item">
            <span className="benefits__check">
              <Check size={14} />
            </span>
            {t('completeProfile.verified')}
          </li>
        </ul>
      </div>
    </AuthBrand>
  );

  return (
    <AuthShell brand={brand}>
      <h2 className="auth__title">{t('completeProfile.title')}</h2>
      <p className="auth__subtitle">{t('completeProfile.subtitle')}</p>

      {error && <div className="auth__alert">{error}</div>}

      <form className="form" onSubmit={handleSubmit} noValidate>
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
        <button className="btn btn--accent btn--block" type="submit" disabled={submitting}>
          {submitting ? t('common.saving') : t('completeProfile.submit')}
        </button>
      </form>

      <p className="auth__foot">
        {t('completeProfile.leaveQuestion')}{' '}
        <button className="link link--btn" type="button" onClick={signOut}>
          {t('completeProfile.leave')}
        </button>
      </p>
    </AuthShell>
  );
}
