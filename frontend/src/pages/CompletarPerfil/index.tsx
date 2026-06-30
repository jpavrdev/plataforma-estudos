import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthShell } from '../../components/auth/AuthShell';
import { AuthBrand } from '../../components/auth/AuthBrand';
import { FormField } from '../../components/FormField';
import { SelectField } from '../../components/SelectField';
import { Check } from '../../components/Icons';
import { formatPhone } from '../../utils/phone';
import { mensagemErro } from '../../utils/erro';

const GENDER_OPTIONS = [
  { value: 'feminino', label: 'Feminino' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'outro', label: 'Outro' },
  { value: 'prefiro_nao_dizer', label: 'Prefiro não dizer' },
];

type Erros = Record<string, string>;

// Mostrada após o primeiro login social, para coletar os campos que o provedor
// não fornece (nascimento, gênero e telefone).
export function CompletarPerfil() {
  const navigate = useNavigate();
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
    const errs: Erros = {};
    if (username.trim().length < 3) errs.username = 'Usuário deve ter ao menos 3 caracteres';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) errs.birthDate = 'Informe sua data de nascimento';
    if (!gender) errs.gender = 'Selecione o gênero';
    if (!phone.trim()) errs.phone = 'Informe seu telefone';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await api.post('/me/complete-profile', { username, birthDate, gender, phone: phone.trim() });
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
        <FormField
          label="Nome de usuário"
          placeholder="seu_usuario"
          value={username}
          onChange={(e) => {
            setUsername(
              e.target.value
                .toLowerCase()
                .replace(/[^a-z0-9_]/g, '')
                .slice(0, 20),
            );
            limparErro('username');
          }}
          required
          error={errors.username}
        />
        <FormField
          label="Data de nascimento"
          type="date"
          autoComplete="bday"
          value={birthDate}
          onChange={(e) => {
            setBirthDate(e.target.value);
            limparErro('birthDate');
          }}
          required
          error={errors.birthDate}
        />
        <SelectField
          label="Gênero"
          value={gender}
          onChange={(e) => {
            setGender(e.target.value);
            limparErro('gender');
          }}
          options={GENDER_OPTIONS}
          placeholder="Selecione"
          required
          error={errors.gender}
        />
        <FormField
          label="Telefone"
          type="tel"
          autoComplete="tel"
          placeholder="(11) 98888-7777"
          value={phone}
          onChange={(e) => {
            setPhone(formatPhone(e.target.value));
            limparErro('phone');
          }}
          required
          error={errors.phone}
        />
        <button className="btn btn--accent btn--block" type="submit" disabled={submitting}>
          {submitting ? 'Salvando...' : 'Concluir'}
        </button>
      </form>
    </AuthShell>
  );
}
