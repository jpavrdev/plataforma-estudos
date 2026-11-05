import { useEffect, useState, type FormEvent } from 'react';
import api from '../../services/api';
import { FormField } from '../../components/FormField';
import { useAuth } from '../../contexts/AuthContext';
import { mensagemErro } from '../../utils/erro';

interface Status {
  enabled: boolean;
  enabledAt: string | null;
  recoveryCodesLeft: number;
  hasPassword: boolean;
}

interface Setup {
  secret: string;
  qrSvg: string;
}

type Step = 'view' | 'setup' | 'codes' | 'regenerate' | 'disable';

// Two-factor authentication with an authenticator app. Only admins see this card,
// and the admin features require 2FA to be enabled.
export function TwoFactorCard() {
  const { entrarComToken, atualizarUsuario } = useAuth();
  const [status, setStatus] = useState<Status | null>(null);
  const [step, setStep] = useState<Step>('view');
  const [setup, setSetup] = useState<Setup | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get<Status>('/me/2fa')
      .then(({ data }) => {
        setStatus(data);
        // Whoever comes from the admin area gate lands right on the card.
        if (window.location.hash === '#two-factor') {
          requestAnimationFrame(() =>
            document
              .getElementById('two-factor')
              ?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
          );
        }
      })
      .catch((e: unknown) =>
        setError(mensagemErro(e, 'Não foi possível carregar a verificação em duas etapas.')),
      );
  }, []);

  async function run(action: () => Promise<void>, fallback: string) {
    setError('');
    setNotice('');
    setBusy(true);
    try {
      await action();
    } catch (e: unknown) {
      setError(mensagemErro(e, fallback));
    } finally {
      setBusy(false);
    }
  }

  function goTo(next: Step) {
    setError('');
    setNotice('');
    setCode('');
    setPassword('');
    setStep(next);
  }

  function startSetup() {
    return run(async () => {
      const { data } = await api.post<Setup>('/me/2fa/setup');
      setSetup(data);
      goTo('setup');
    }, 'Não foi possível começar a configuração.');
  }

  function enable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    return run(async () => {
      const { data } = await api.post<{ recoveryCodes: string[]; token: string }>(
        '/me/2fa/enable',
        { code, ...(status?.hasPassword ? { currentPassword: password } : {}) },
      );
      setSetup(null);
      setRecoveryCodes(data.recoveryCodes);
      setStatus(
        (current) =>
          current && {
            ...current,
            enabled: true,
            enabledAt: new Date().toISOString(),
            recoveryCodesLeft: data.recoveryCodes.length,
          },
      );
      goTo('codes');
      // The session comes back verified: the new token is what unlocks the admin
      // features. It comes after the codes so they show up even if this fails.
      await entrarComToken(data.token);
    }, 'Não foi possível ativar.');
  }

  function regenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    return run(async () => {
      const { data } = await api.post<{ recoveryCodes: string[] }>('/me/2fa/recovery-codes', {
        code,
      });
      setRecoveryCodes(data.recoveryCodes);
      setStatus(
        (current) => current && { ...current, recoveryCodesLeft: data.recoveryCodes.length },
      );
      goTo('codes');
    }, 'Não foi possível gerar os códigos.');
  }

  function disable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    return run(async () => {
      await api.post('/me/2fa/disable', {
        code,
        ...(status?.hasPassword ? { currentPassword: password } : {}),
      });
      setStatus(
        (current) =>
          current && { ...current, enabled: false, enabledAt: null, recoveryCodesLeft: 0 },
      );
      const { data } = await api.get('/me');
      atualizarUsuario({ pendingTwoFactor: data.pendingTwoFactor ?? null });
      goTo('view');
      setNotice('Verificação em duas etapas desativada.');
    }, 'Não foi possível desativar.');
  }

  function copyCodes() {
    navigator.clipboard.writeText(recoveryCodes.join('\n')).then(
      () => setNotice('Códigos copiados.'),
      (e: unknown) => {
        console.error('Failed to copy the recovery codes', e);
        setError('Não foi possível copiar. Use o botão Baixar.');
      },
    );
  }

  function downloadCodes() {
    const text = `Códigos de recuperação do ensina.dev. Cada um vale uma vez só.\n\n${recoveryCodes.join('\n')}\n`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ensinadev-codigos-de-recuperacao.txt';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  if (!status) {
    return error ? (
      <div className="card">
        <div className="auth__alert">{error}</div>
      </div>
    ) : null;
  }

  const appCodeField = (
    <FormField
      label="Código do app"
      inputMode="numeric"
      autoComplete="one-time-code"
      placeholder="000000"
      value={code}
      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
    />
  );
  const passwordField = status.hasPassword && (
    <FormField
      label="Senha atual"
      type="password"
      autoComplete="current-password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
  );

  return (
    <div className="card" id="two-factor">
      <h3 className="card__title card__title--mb">Verificação em duas etapas</h3>
      <div className="pf-field__label">Situação</div>
      <div className="pf-field__value">
        {status.enabled && status.enabledAt
          ? `Ativa desde ${new Date(status.enabledAt).toLocaleDateString('pt-BR')}`
          : 'Desativada'}
      </div>
      <span className="pf-field__hint">
        {status.enabled
          ? `O login pede o código do app autenticador. Restam ${status.recoveryCodesLeft} códigos de recuperação.`
          : 'As funções de administrador só funcionam com ela ativa. Você vai precisar de um app autenticador, como Google Authenticator, Authy ou 1Password.'}
      </span>

      {notice && <div className="auth__alert auth__alert--ok">{notice}</div>}
      {error && <div className="auth__alert">{error}</div>}

      {step === 'view' && (
        <div className="pf-actions">
          {status.enabled ? (
            <>
              <button className="btn" onClick={() => goTo('regenerate')} disabled={busy}>
                Gerar novos códigos
              </button>
              <button className="btn" onClick={() => goTo('disable')} disabled={busy}>
                Desativar
              </button>
            </>
          ) : (
            <button className="btn btn--accent" onClick={startSetup} disabled={busy}>
              {busy ? 'Preparando...' : 'Ativar'}
            </button>
          )}
        </div>
      )}

      {step === 'setup' && setup && (
        <form className="form" onSubmit={enable} noValidate>
          <span className="pf-field__hint">
            Escaneie o QR code com o app autenticador. Se não der para escanear, digite a chave no
            app.
          </span>
          <img
            className="tf-qr"
            src={`data:image/svg+xml;utf8,${encodeURIComponent(setup.qrSvg)}`}
            alt="QR code para cadastrar a conta no app autenticador"
          />
          <code className="tf-key">{setup.secret.match(/.{1,4}/g)?.join(' ')}</code>
          {appCodeField}
          {passwordField}
          <div className="pf-actions">
            <button className="btn btn--accent" type="submit" disabled={busy || code.length !== 6}>
              Ativar
            </button>
            <button
              className="btn"
              type="button"
              onClick={() => {
                setSetup(null);
                goTo('view');
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {step === 'codes' && (
        <div className="form">
          <span className="pf-field__hint">
            Guarde estes códigos fora do celular. Cada um vale uma vez só e é o que permite entrar
            se você perder o app. Eles não aparecem de novo.
          </span>
          <ul className="tf-codes">
            {recoveryCodes.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <div className="pf-actions">
            <button className="btn" type="button" onClick={copyCodes}>
              Copiar
            </button>
            <button className="btn" type="button" onClick={downloadCodes}>
              Baixar
            </button>
            <button
              className="btn btn--accent"
              type="button"
              onClick={() => {
                setRecoveryCodes([]);
                goTo('view');
              }}
            >
              Já guardei
            </button>
          </div>
        </div>
      )}

      {step === 'regenerate' && (
        <form className="form" onSubmit={regenerate} noValidate>
          <span className="pf-field__hint">Os códigos de recuperação atuais deixam de valer.</span>
          {appCodeField}
          <div className="pf-actions">
            <button className="btn btn--accent" type="submit" disabled={busy || code.length !== 6}>
              Gerar
            </button>
            <button className="btn" type="button" onClick={() => goTo('view')}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {step === 'disable' && (
        <form className="form" onSubmit={disable} noValidate>
          <span className="pf-field__hint">
            Sem a verificação em duas etapas, as funções de administrador ficam bloqueadas. Serve o
            código do app ou um de recuperação.
          </span>
          <FormField
            label="Código"
            autoComplete="one-time-code"
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.slice(0, 20))}
          />
          {passwordField}
          <div className="pf-actions">
            <button className="btn" type="submit" disabled={busy || code.trim().length < 6}>
              Desativar
            </button>
            <button className="btn" type="button" onClick={() => goTo('view')}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
