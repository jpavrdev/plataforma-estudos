import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthShell } from '../../components/auth/AuthShell';
import { AuthBrand } from '../../components/auth/AuthBrand';
import { FormField } from '../../components/FormField';
import { mensagemErro } from '../../utils/erro';

const brand = (
  <AuthBrand glow="login">
    <div className="auth__brand-body">
      <h1 className="auth__headline">
        <span className="auth__kicker">
          <span className="auth__kicker-soft">sem </span>estresse
        </span>
        <span className="auth__headline-main">Recupere seu acesso</span>
      </h1>
      <p className="auth__lede">
        Informe seu email e enviamos um link para você criar uma nova senha em segundos.
      </p>
    </div>
  </AuthBrand>
);

export function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/forgot-password', { email });
      setMensagem(
        data.mensagem ??
          'Se houver uma conta com esse email, enviamos um link para redefinir a senha.',
      );
      setEnviado(true);
    } catch (e: unknown) {
      setError(mensagemErro(e, 'Não foi possível enviar o link. Tente novamente.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell brand={brand}>
      <h2 className="auth__title">Esqueceu a senha?</h2>
      <p className="auth__subtitle">Enviamos um link de redefinição para o seu email.</p>

      {enviado ? (
        <>
          <div className="auth__alert auth__alert--ok">{mensagem}</div>
          <p className="auth__foot">
            <Link className="link" to="/">
              Voltar ao login
            </Link>
          </p>
        </>
      ) : (
        <>
          {error && <div className="auth__alert">{error}</div>}
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
            <button className="btn btn--accent btn--block" type="submit" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Enviar link'}
            </button>
          </form>
          <p className="auth__foot">
            Lembrou a senha?{' '}
            <Link className="link" to="/">
              Voltar ao login
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
