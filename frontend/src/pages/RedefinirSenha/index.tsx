import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { AuthShell } from '../../components/auth/AuthShell';
import { AuthBrand } from '../../components/auth/AuthBrand';
import { FormField } from '../../components/FormField';
import { mensagemErro } from '../../utils/erro';

const brand = (
  <AuthBrand glow="register">
    <div className="auth__brand-body">
      <h1 className="auth__headline">
        <span className="auth__kicker">
          <span className="auth__kicker-soft">quase </span>lá
        </span>
        <span className="auth__headline-main">Crie uma nova senha</span>
      </h1>
      <p className="auth__lede">
        Escolha uma senha forte e volte a estudar. O link é válido por 1 hora.
      </p>
    </div>
  </AuthBrand>
);

export function RedefinirSenha() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (password !== confirmacao) {
      setError('As senhas não coincidem.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/reset-password', { token, password });
      setSucesso(true);
    } catch (e: unknown) {
      setError(mensagemErro(e, 'Não foi possível redefinir. O link pode ter expirado.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell brand={brand}>
      {!token ? (
        <>
          <h2 className="auth__title">Link inválido</h2>
          <p className="auth__subtitle">O link de redefinição está incompleto ou expirou.</p>
          <p className="auth__foot">
            <Link className="link" to="/recuperar-senha">
              Pedir um novo link
            </Link>
          </p>
        </>
      ) : sucesso ? (
        <>
          <h2 className="auth__title">Senha redefinida!</h2>
          <p className="auth__subtitle">Já pode entrar com a sua nova senha.</p>
          <Link className="btn btn--accent btn--block" to="/">
            Ir para o login
          </Link>
        </>
      ) : (
        <>
          <h2 className="auth__title">Criar nova senha</h2>
          <p className="auth__subtitle">Escolha uma senha forte para a sua conta.</p>

          {error && <div className="auth__alert">{error}</div>}

          <form className="form" onSubmit={handleSubmit} noValidate>
            <FormField
              label="Nova senha"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            >
              <span className="field__hint">
                Mínimo 12 caracteres, com maiúscula, minúscula, número e símbolo.
              </span>
            </FormField>
            <FormField
              label="Confirmar senha"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••••"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              required
            />
            <button className="btn btn--accent btn--block" type="submit" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Redefinir senha'}
            </button>
          </form>
          <p className="auth__foot">
            <Link className="link" to="/">
              Voltar ao login
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
