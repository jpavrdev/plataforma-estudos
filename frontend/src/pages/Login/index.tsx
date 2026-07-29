import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AuthShell } from '../../components/auth/AuthShell';
import { AuthBrand } from '../../components/auth/AuthBrand';
import { Logo } from '../../components/Logo';
import { FormField } from '../../components/FormField';
import { SocialAuth } from '../../components/auth/SocialAuth';
import { Flame, Trophy } from '../../components/Icons';
import api from '../../services/api';
import { mensagemErro, statusErro } from '../../utils/erro';

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

  // Quem acabou de se cadastrar chega aqui com o aviso de confirmar o email e com o
  // endereço já preenchido; sem isso a pessoa cai numa tela de login sem entender por
  // que foi parar nela.
  const vindoDoCadastro = useLocation().state as { aviso?: string; email?: string } | null;
  const [avisoCadastro, setAvisoCadastro] = useState(vindoDoCadastro?.aviso ?? '');

  const [email, setEmail] = useState(vindoDoCadastro?.email ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // Login bloqueado por email não confirmado (403): oferece reenviar a verificação.
  const [naoVerificado, setNaoVerificado] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [reenvioMsg, setReenvioMsg] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setAvisoCadastro('');
    setNaoVerificado(false);
    setReenvioMsg('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/home');
    } catch (e: unknown) {
      setError(mensagemErro(e, 'Erro ao fazer login. Tente novamente.'));
      setNaoVerificado(statusErro(e) === 403);
    } finally {
      setSubmitting(false);
    }
  }

  async function reenviarVerificacao() {
    if (reenviando || !email) return;
    setReenviando(true);
    try {
      const { data } = await api.post('/resend-verification', { email });
      setReenvioMsg(
        data.mensagem ?? 'Se houver uma conta pendente, reenviamos o link de confirmação.',
      );
    } catch {
      setReenvioMsg('Não foi possível reenviar agora. Tente de novo em instantes.');
    } finally {
      setReenviando(false);
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
      <div className="auth__logo-m">
        <Logo variant="solid" size={22} />
      </div>
      <h2 className="auth__title">Bem-vindo de volta</h2>
      <p className="auth__subtitle">Continue de onde você parou.</p>

      {avisoCadastro && <div className="auth__alert auth__alert--ok">{avisoCadastro}</div>}

      {(error || erroOAuth) && <div className="auth__alert">{error || erroOAuth}</div>}

      {naoVerificado &&
        (reenvioMsg ? (
          <div className="auth__alert auth__alert--ok">{reenvioMsg}</div>
        ) : (
          <button
            type="button"
            className="btn btn--ghost btn--block"
            onClick={reenviarVerificacao}
            disabled={reenviando}
          >
            {reenviando ? 'Reenviando...' : 'Reenviar email de verificação'}
          </button>
        ))}

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

      <SocialAuth />

      <p className="auth__foot">
        Não tem conta?{' '}
        <Link className="link" to="/cadastro">
          Criar conta grátis
        </Link>
      </p>
    </AuthShell>
  );
}
