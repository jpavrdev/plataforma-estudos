import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
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

type Erros = Record<string, string>;

// Mostrada após o primeiro login social, para coletar os campos que o provedor
// não fornece (nascimento, gênero e telefone).
export function CompletarPerfil() {
  const navigate = useNavigate();
  const { atualizarUsuario } = useAuth();
  const [username, setUsername] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Erros>({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const limparErro = (campo: string) =>
    setErrors((prev) => (prev[campo] ? { ...prev, [campo]: '' } : prev));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const errs: Erros = validateProfileCompletionFields({ username, birthDate, gender, phone });
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
      const msg = mensagemErro(e, 'Não foi possível salvar. Tente novamente.');
      if (/usu[aá]rio/i.test(msg)) setErrors((prev) => ({ ...prev, username: msg }));
      else setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const brand = (
    <AuthBrand glow="register">
      <div className="auth__brand-body">
        <h1 className="auth__headline auth__headline--single">Falta pouco para começar.</h1>
        <p className="auth__lede">
          Complete seu cadastro para acompanhar seu progresso e subir no ranking.
        </p>
        <ul className="benefits">
          <li className="benefits__item">
            <span className="benefits__check">
              <Check size={14} />
            </span>
            Sua conta já está verificada
          </li>
        </ul>
      </div>
    </AuthBrand>
  );

  return (
    <AuthShell brand={brand}>
      <h2 className="auth__title">Quase lá</h2>
      <p className="auth__subtitle">Só faltam alguns dados para completar seu perfil.</p>

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
          onClearError={limparErro}
          required
        />
        <button className="btn btn--accent btn--block" type="submit" disabled={submitting}>
          {submitting ? 'Salvando...' : 'Concluir'}
        </button>
      </form>
    </AuthShell>
  );
}
