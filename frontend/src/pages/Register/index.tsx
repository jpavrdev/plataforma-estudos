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

type Erros = Record<string, string>;

// Requisitos da senha (espelham o registerSchema do backend, que é a fonte de verdade).
const SENHA_MIN = 12;
const REGRAS_SENHA: { ok: (s: string) => boolean; label: string }[] = [
  { ok: (s) => s.length >= SENHA_MIN, label: `Ao menos ${SENHA_MIN} caracteres` },
  { ok: (s) => /[A-Z]/.test(s), label: 'Uma letra maiúscula' },
  { ok: (s) => /[a-z]/.test(s), label: 'Uma letra minúscula' },
  { ok: (s) => /[0-9]/.test(s), label: 'Um número' },
  { ok: (s) => /[^A-Za-z0-9]/.test(s), label: 'Um caractere especial' },
];
const senhaValida = (s: string) => REGRAS_SENHA.every((r) => r.ok(s));

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
  const [errors, setErrors] = useState<Erros>({});
  const [submitting, setSubmitting] = useState(false);

  const limparErro = (campo: string) =>
    setErrors((prev) => (prev[campo] ? { ...prev, [campo]: '' } : prev));

  // Validação no cliente para dar feedback por campo; o backend valida de novo.
  function validar(): Erros {
    const e: Erros = {};
    if (name.trim().length < 2) e.name = 'Nome deve ter ao menos 2 caracteres';

    const u = username.trim();
    if (u.length < 3) e.username = 'Usuário deve ter ao menos 3 caracteres';
    else if (u.length > 20) e.username = 'Usuário deve ter no máximo 20 caracteres';
    else if (!/^[a-zA-Z0-9_]+$/.test(u)) e.username = 'Use apenas letras, números e underscore';

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Email inválido';

    if (!senhaValida(password)) e.password = 'A senha não cumpre todos os requisitos';

    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) e.birthDate = 'Informe sua data de nascimento';
    if (!gender) e.gender = 'Selecione o gênero';
    if (!phone.trim()) e.phone = 'Informe seu telefone';
    return e;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const errs = validar();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

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
      // Mapeia os erros conhecidos do backend (409) para o campo certo.
      const msg = mensagemErro(e, 'Erro ao criar conta. Tente novamente.');
      if (/usu[aá]rio/i.test(msg)) setErrors((prev) => ({ ...prev, username: msg }));
      else if (/email/i.test(msg)) setErrors((prev) => ({ ...prev, email: msg }));
      else setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const reqsSenha = REGRAS_SENHA.map((r) => ({ ok: r.ok(password), label: r.label }));

  const brand = (
    <AuthBrand glow="register">
      <div className="auth__brand-body">
        <h1 className="auth__headline auth__headline--single">Comece sua jornada dev hoje.</h1>
        <p className="auth__lede">
          Crie sua conta gratuita e desbloqueie um novo desafio a cada dia.
        </p>

        <ul className="benefits">
          {BENEFITS.map((b) => (
            <li key={b} className="benefits__item">
              <span className="benefits__check">
                <Check size={14} />
              </span>
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
        <p>
          Junte-se a <b>12.482</b> devs
          <br />
          aprendendo agora.
        </p>
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
          onChange={(e) => {
            setName(e.target.value);
            limparErro('name');
          }}
          required
          error={errors.name}
        />
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
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="voce@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            limparErro('email');
          }}
          required
          error={errors.email}
        />
        <FormField
          label="Senha"
          type="password"
          autoComplete="new-password"
          placeholder={`mínimo ${SENHA_MIN} caracteres`}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            limparErro('password');
          }}
          required
        >
          <ul className="pw-reqs">
            {reqsSenha.map((r) => (
              <li key={r.label} className={`pw-reqs__item${r.ok ? ' pw-reqs__item--ok' : ''}`}>
                <Check size={12} /> {r.label}
              </li>
            ))}
          </ul>
        </FormField>
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
          {submitting ? 'Criando conta...' : 'Criar conta grátis'}
        </button>
      </form>

      <p className="auth__terms">
        Ao criar a conta, você concorda com os{' '}
        <a className="link" href="#">
          Termos
        </a>{' '}
        e a{' '}
        <a className="link" href="#">
          Política de Privacidade
        </a>
        .
      </p>
      <p className="auth__foot">
        Já tem conta?{' '}
        <Link className="link" to="/">
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}
