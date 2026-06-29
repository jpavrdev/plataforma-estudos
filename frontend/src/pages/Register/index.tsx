import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthShell } from '../../components/auth/AuthShell';
import { AuthBrand } from '../../components/auth/AuthBrand';
import { FormField } from '../../components/FormField';
import { SelectField } from '../../components/SelectField';
import { Avatar } from '../../components/Avatar';
import { Check } from '../../components/Icons';
import { formatPhone } from '../../utils/phone';
import { mensagemErro } from '../../utils/erro';

const BENEFITS = [
  'Um desafio novo todos os dias',
  'Mantenha seu streak e ganhe XP',
  'Suba no ranking global',
  'Acompanhe seu progresso por trilhas',
];

const GENDER_OPTIONS = [
  { value: 'feminino', label: 'Feminino' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'outro', label: 'Outro' },
  { value: 'prefiro_nao_dizer', label: 'Prefiro não dizer' },
];

export function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/register', {
        name,
        username,
        email: email.trim(),
        password,
        birthDate,
        gender,
        phone: phone.trim(),
      });
      navigate('/');
    } catch (e: unknown) {
      setError(mensagemErro(e, 'Erro ao criar conta. Tente novamente.'));
    } finally {
      setSubmitting(false);
    }
  }

  const brand = (
    <AuthBrand glow="register">
      <div className="auth__brand-body">
        <h1 className="auth__headline auth__headline--single">
          Comece sua jornada dev hoje.
        </h1>
        <p className="auth__lede">
          Crie sua conta gratuita e desbloqueie um novo desafio a cada dia.
        </p>

        <ul className="benefits">
          {BENEFITS.map((b) => (
            <li key={b} className="benefits__item">
              <span className="benefits__check"><Check size={14} /></span>
              {b}
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
        <p>Junte-se a <b>12.482</b> devs<br />aprendendo agora.</p>
      </div>
    </AuthBrand>
  );

  return (
    <AuthShell brand={brand}>
      <h2 className="auth__title">Crie sua conta</h2>
      <p className="auth__subtitle">Leva menos de um minuto.</p>

      {error && <div className="auth__alert">{error}</div>}

      <form className="form" onSubmit={handleSubmit} noValidate>
        <FormField
          label="Nome"
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <FormField
          label="Nome de usuário"
          placeholder="seu_usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20))}
          required
        />
        <FormField
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="voce@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <FormField
          label="Senha"
          type="password"
          autoComplete="new-password"
          placeholder="mínimo 12 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <FormField
          label="Data de nascimento"
          type="date"
          autoComplete="bday"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
        />
        <SelectField
          label="Gênero"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          options={GENDER_OPTIONS}
          placeholder="Selecione"
          required
        />
        <FormField
          label="Telefone"
          type="tel"
          autoComplete="tel"
          placeholder="(11) 98888-7777"
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          required
        />
        <button className="btn btn--accent btn--block" type="submit" disabled={submitting}>
          {submitting ? 'Criando conta...' : 'Criar conta grátis'}
        </button>
      </form>

      <p className="auth__terms">
        Ao criar a conta, você concorda com os{' '}
        <a className="link" href="#">Termos</a> e a{' '}
        <a className="link" href="#">Política de Privacidade</a>.
      </p>
      <p className="auth__foot">
        Já tem conta? <Link className="link" to="/">Entrar</Link>
      </p>
    </AuthShell>
  );
}
