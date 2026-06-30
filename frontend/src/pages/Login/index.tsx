import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AuthShell } from '../../components/auth/AuthShell';
import { AuthBrand } from '../../components/auth/AuthBrand';
import { FormField } from '../../components/FormField';
import { SocialAuth } from '../../components/auth/SocialAuth';
import { Flame, Trophy } from '../../components/Icons';
import { mensagemErro } from '../../utils/erro';

// Mensagens dos erros que o callback do OAuth manda via ?erro= ao voltar pro login.
const ERROS_OAUTH: Record<string, string> = {
  provedor_indisponivel: 'Esse login social não está disponível no momento.',
  oauth_invalido: 'Não foi possível validar o login. Tente de novo.',
  oauth_falhou: 'Falha ao entrar com o provedor. Tente de novo.',
  oauth_sem_email: 'Não foi possível obter um email verificado da sua conta.',
};

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [searchParams] = useSearchParams();
  const erroOAuth = ERROS_OAUTH[searchParams.get('erro') ?? ''] ?? '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/home');
    } catch (e: unknown) {
      setError(mensagemErro(e, 'Erro ao fazer login. Tente novamente.'));
    } finally {
      setSubmitting(false);
    }
  }

  const brand = (
    <AuthBrand glow="login">
      <div className="auth__brand-body">
        <h1 className="auth__headline">
          <span className="auth__kicker">
            <span className="auth__kicker-soft">todo </span>dia
          </span>
          <span className="auth__headline-main">Resolva um desafio</span>
        </h1>
        <p className="auth__lede">
          Aprenda programação na prática com problemas diários, streaks e um ranking que mantém você
          no ritmo.
        </p>

        <div className="code-window">
          <div className="code-window__dots">
            <i />
            <i />
            <i />
          </div>
          <div>
            <span className="tok">function</span> <span className="tok-fn">soma</span>(a, b) {'{'}
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
          <Flame size={14} /> 12 dias
        </span>
        <span className="chip">
          <Trophy size={13} /> Top 4
        </span>
      </div>
    </AuthBrand>
  );

  return (
    <AuthShell brand={brand}>
      <h2 className="auth__title">Bem-vindo de volta</h2>
      <p className="auth__subtitle">Continue de onde você parou.</p>

      <SocialAuth />

      {(error || erroOAuth) && <div className="auth__alert">{error || erroOAuth}</div>}

      <form className="form" onSubmit={handleSubmit} noValidate>
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
          autoComplete="current-password"
          placeholder="••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          labelAddon={
            <Link className="link" to="/recuperar-senha">
              Esqueceu a senha?
            </Link>
          }
        />
        <button className="btn btn--accent btn--block" type="submit" disabled={submitting}>
          {submitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="auth__foot">
        Não tem conta?{' '}
        <Link className="link" to="/cadastro">
          Criar conta grátis
        </Link>
      </p>
    </AuthShell>
  );
}
