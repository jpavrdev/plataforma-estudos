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
        Enviamos um código de 6 dígitos por email ou WhatsApp para você criar uma nova senha em
        segundos.
      </p>
    </div>
  </AuthBrand>
);

type Canal = 'email' | 'whatsapp';

export function RecuperarSenha() {
  const [etapa, setEtapa] = useState<'pedir' | 'codigo' | 'ok'>('pedir');
  const [email, setEmail] = useState('');
  const [canal, setCanal] = useState<Canal | null>(null);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mensagem, setMensagem] = useState('');

  async function pedirCodigo(c: Canal) {
    if (submitting || !email) return;
    setError('');
    setCanal(c);
    setSubmitting(true);
    try {
      await api.post('/forgot-password-otp', { email, canal: c });
      setEtapa('codigo');
    } catch (e: unknown) {
      setError(mensagemErro(e, 'Não foi possível enviar o código. Tente novamente.'));
    } finally {
      setSubmitting(false);
    }
  }

  async function redefinir(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/reset-password-otp', { email, otp, password });
      setMensagem(data.mensagem ?? 'Senha redefinida com sucesso. Você já pode fazer login.');
      setEtapa('ok');
    } catch (e: unknown) {
      setError(mensagemErro(e, 'Não foi possível redefinir a senha. Confira o código e a senha.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell brand={brand}>
      <h2 className="auth__title">Esqueceu a senha?</h2>

      {etapa === 'ok' ? (
        <>
          <div className="auth__alert auth__alert--ok">{mensagem}</div>
          <p className="auth__foot">
            <Link className="link" to="/">
              Voltar ao login
            </Link>
          </p>
        </>
      ) : etapa === 'pedir' ? (
        <>
          <p className="auth__subtitle">Como você quer receber o código de 6 dígitos?</p>
          {error && <div className="auth__alert">{error}</div>}
          <div className="form">
            <FormField
              label="E-mail"
              type="email"
              autoComplete="email"
              placeholder="voce@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              className="btn btn--accent btn--block"
              type="button"
              disabled={submitting || !email}
              onClick={() => pedirCodigo('whatsapp')}
            >
              {submitting && canal === 'whatsapp' ? 'Enviando...' : 'Receber no WhatsApp'}
            </button>
            <button
              className="btn btn--ghost btn--block"
              type="button"
              disabled={submitting || !email}
              onClick={() => pedirCodigo('email')}
            >
              {submitting && canal === 'email' ? 'Enviando...' : 'Receber por email'}
            </button>
          </div>
          <p className="auth__foot">
            Lembrou a senha?{' '}
            <Link className="link" to="/">
              Voltar ao login
            </Link>
          </p>
        </>
      ) : (
        <>
          <p className="auth__subtitle">
            Digite o código que enviamos {canal === 'whatsapp' ? 'no WhatsApp' : 'por email'} e a
            nova senha.
          </p>
          {error && <div className="auth__alert">{error}</div>}
          <form className="form" onSubmit={redefinir} noValidate>
            <FormField
              label="Código (6 dígitos)"
              type="text"
              autoComplete="one-time-code"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
            />
            <FormField
              label="Nova senha"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button className="btn btn--accent btn--block" type="submit" disabled={submitting}>
              {submitting ? 'Redefinindo...' : 'Redefinir senha'}
            </button>
          </form>
          <p className="auth__foot">
            <button
              type="button"
              className="link link--btn"
              onClick={() => {
                setEtapa('pedir');
                setOtp('');
                setError('');
              }}
            >
              Não recebeu? Escolher outro canal
            </button>
          </p>
        </>
      )}
    </AuthShell>
  );
}
