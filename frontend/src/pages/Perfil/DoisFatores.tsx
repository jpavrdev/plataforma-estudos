import { useEffect, useState, type FormEvent } from 'react';
import api from '../../services/api';
import { FormField } from '../../components/FormField';
import { useAuth } from '../../contexts/AuthContext';
import { mensagemErro } from '../../utils/erro';

interface Estado {
  ativo: boolean;
  ativadoEm: string | null;
  codigosRestantes: number;
  temSenha: boolean;
}

interface Configuracao {
  segredo: string;
  qrSvg: string;
}

type Etapa = 'ver' | 'configurar' | 'codigos' | 'novos' | 'desativar';

// Verificação em duas etapas por app autenticador. O cartão aparece só para
// admin, e as funções de administrador exigem o 2FA ativo.
export function DoisFatores() {
  const { entrarComToken } = useAuth();
  const [estado, setEstado] = useState<Estado | null>(null);
  const [etapa, setEtapa] = useState<Etapa>('ver');
  const [config, setConfig] = useState<Configuracao | null>(null);
  const [codigos, setCodigos] = useState<string[]>([]);
  const [codigo, setCodigo] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    api
      .get<Estado>('/me/2fa')
      .then(({ data }) => setEstado(data))
      .catch((e: unknown) =>
        setErro(mensagemErro(e, 'Não foi possível carregar a verificação em duas etapas.')),
      );
  }, []);

  async function executar(acao: () => Promise<void>, falha: string) {
    setErro('');
    setAviso('');
    setEnviando(true);
    try {
      await acao();
    } catch (e: unknown) {
      setErro(mensagemErro(e, falha));
    } finally {
      setEnviando(false);
    }
  }

  function irPara(proxima: Etapa) {
    setErro('');
    setAviso('');
    setCodigo('');
    setSenha('');
    setEtapa(proxima);
  }

  function comecar() {
    return executar(async () => {
      const { data } = await api.post<Configuracao>('/me/2fa/configurar');
      setConfig(data);
      irPara('configurar');
    }, 'Não foi possível começar a configuração.');
  }

  function ativar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    return executar(async () => {
      const { data } = await api.post<{ codigosRecuperacao: string[]; token: string }>(
        '/me/2fa/ativar',
        { codigo, ...(estado?.temSenha ? { senhaAtual: senha } : {}) },
      );
      setConfig(null);
      setCodigos(data.codigosRecuperacao);
      setEstado(
        (atual) =>
          atual && {
            ...atual,
            ativo: true,
            ativadoEm: new Date().toISOString(),
            codigosRestantes: data.codigosRecuperacao.length,
          },
      );
      irPara('codigos');
      // A sessão volta verificada: é o token novo que libera as funções de admin.
      // Vem depois dos códigos para eles aparecerem mesmo se esta parte falhar.
      await entrarComToken(data.token);
    }, 'Não foi possível ativar.');
  }

  function gerarNovos(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    return executar(async () => {
      const { data } = await api.post<{ codigosRecuperacao: string[] }>('/me/2fa/codigos', {
        codigo,
      });
      setCodigos(data.codigosRecuperacao);
      setEstado((atual) => atual && { ...atual, codigosRestantes: data.codigosRecuperacao.length });
      irPara('codigos');
    }, 'Não foi possível gerar os códigos.');
  }

  function desativar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    return executar(async () => {
      await api.post('/me/2fa/desativar', {
        codigo,
        ...(estado?.temSenha ? { senhaAtual: senha } : {}),
      });
      setEstado(
        (atual) => atual && { ...atual, ativo: false, ativadoEm: null, codigosRestantes: 0 },
      );
      irPara('ver');
      setAviso('Verificação em duas etapas desativada.');
    }, 'Não foi possível desativar.');
  }

  function copiarCodigos() {
    navigator.clipboard.writeText(codigos.join('\n')).then(
      () => setAviso('Códigos copiados.'),
      (e: unknown) => {
        console.error('Falha ao copiar os códigos de recuperação', e);
        setErro('Não foi possível copiar. Use o botão Baixar.');
      },
    );
  }

  function baixarCodigos() {
    const texto = `Códigos de recuperação do ensina.dev. Cada um vale uma vez só.\n\n${codigos.join('\n')}\n`;
    const url = URL.createObjectURL(new Blob([texto], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ensinadev-codigos-de-recuperacao.txt';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  if (!estado) {
    return erro ? (
      <div className="card">
        <div className="auth__alert">{erro}</div>
      </div>
    ) : null;
  }

  const campoCodigoApp = (
    <FormField
      label="Código do app"
      inputMode="numeric"
      autoComplete="one-time-code"
      placeholder="000000"
      value={codigo}
      onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
    />
  );
  const campoSenha = estado.temSenha && (
    <FormField
      label="Senha atual"
      type="password"
      autoComplete="current-password"
      value={senha}
      onChange={(e) => setSenha(e.target.value)}
    />
  );

  return (
    <div className="card">
      <h3 className="card__title card__title--mb">Verificação em duas etapas</h3>
      <div className="pf-field__label">Situação</div>
      <div className="pf-field__value">
        {estado.ativo && estado.ativadoEm
          ? `Ativa desde ${new Date(estado.ativadoEm).toLocaleDateString('pt-BR')}`
          : 'Desativada'}
      </div>
      <span className="pf-field__hint">
        {estado.ativo
          ? `O login pede o código do app autenticador. Restam ${estado.codigosRestantes} códigos de recuperação.`
          : 'As funções de administrador só funcionam com ela ativa. Você vai precisar de um app autenticador, como Google Authenticator, Authy ou 1Password.'}
      </span>

      {aviso && <div className="auth__alert auth__alert--ok">{aviso}</div>}
      {erro && <div className="auth__alert">{erro}</div>}

      {etapa === 'ver' && (
        <div className="pf-actions">
          {estado.ativo ? (
            <>
              <button className="btn" onClick={() => irPara('novos')} disabled={enviando}>
                Gerar novos códigos
              </button>
              <button className="btn" onClick={() => irPara('desativar')} disabled={enviando}>
                Desativar
              </button>
            </>
          ) : (
            <button className="btn btn--accent" onClick={comecar} disabled={enviando}>
              {enviando ? 'Preparando...' : 'Ativar'}
            </button>
          )}
        </div>
      )}

      {etapa === 'configurar' && config && (
        <form className="form" onSubmit={ativar} noValidate>
          <span className="pf-field__hint">
            Escaneie o QR code com o app autenticador. Se não der para escanear, digite a chave no
            app.
          </span>
          <img
            className="df-qr"
            src={`data:image/svg+xml;utf8,${encodeURIComponent(config.qrSvg)}`}
            alt="QR code para cadastrar a conta no app autenticador"
          />
          <code className="df-chave">{config.segredo.match(/.{1,4}/g)?.join(' ')}</code>
          {campoCodigoApp}
          {campoSenha}
          <div className="pf-actions">
            <button
              className="btn btn--accent"
              type="submit"
              disabled={enviando || codigo.length !== 6}
            >
              Ativar
            </button>
            <button
              className="btn"
              type="button"
              onClick={() => {
                setConfig(null);
                irPara('ver');
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {etapa === 'codigos' && (
        <div className="form">
          <span className="pf-field__hint">
            Guarde estes códigos fora do celular. Cada um vale uma vez só e é o que permite entrar
            se você perder o app. Eles não aparecem de novo.
          </span>
          <ul className="df-codigos">
            {codigos.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <div className="pf-actions">
            <button className="btn" type="button" onClick={copiarCodigos}>
              Copiar
            </button>
            <button className="btn" type="button" onClick={baixarCodigos}>
              Baixar
            </button>
            <button
              className="btn btn--accent"
              type="button"
              onClick={() => {
                setCodigos([]);
                irPara('ver');
              }}
            >
              Já guardei
            </button>
          </div>
        </div>
      )}

      {etapa === 'novos' && (
        <form className="form" onSubmit={gerarNovos} noValidate>
          <span className="pf-field__hint">Os códigos de recuperação atuais deixam de valer.</span>
          {campoCodigoApp}
          <div className="pf-actions">
            <button
              className="btn btn--accent"
              type="submit"
              disabled={enviando || codigo.length !== 6}
            >
              Gerar
            </button>
            <button className="btn" type="button" onClick={() => irPara('ver')}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {etapa === 'desativar' && (
        <form className="form" onSubmit={desativar} noValidate>
          <span className="pf-field__hint">
            Sem a verificação em duas etapas, as funções de administrador ficam bloqueadas. Serve o
            código do app ou um de recuperação.
          </span>
          <FormField
            label="Código"
            autoComplete="one-time-code"
            placeholder="000000"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.slice(0, 20))}
          />
          {campoSenha}
          <div className="pf-actions">
            <button className="btn" type="submit" disabled={enviando || codigo.trim().length < 6}>
              Desativar
            </button>
            <button className="btn" type="button" onClick={() => irPara('ver')}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
