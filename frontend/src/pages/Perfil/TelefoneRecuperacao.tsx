import { useEffect, useState, type FormEvent } from 'react';
import api from '../../services/api';
import { FormField } from '../../components/FormField';
import { formatPhone } from '../../utils/phone';
import { mensagemErro } from '../../utils/erro';

interface Estado {
  phone: string | null;
  phoneVerifiedAt: string | null;
  temSenha: boolean;
}

type Etapa = 'ver' | 'codigo' | 'trocar';

// Telefone que recebe o código de senha por WhatsApp. Ele só vale depois de
// verificado, e trocá-lo pede a senha atual quando a conta tem uma.
export function TelefoneRecuperacao() {
  const [estado, setEstado] = useState<Estado | null>(null);
  const [etapa, setEtapa] = useState<Etapa>('ver');
  const [codigo, setCodigo] = useState('');
  const [novo, setNovo] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    api
      .get('/me')
      .then(({ data }) =>
        setEstado({
          phone: data.phone ?? null,
          phoneVerifiedAt: data.phoneVerifiedAt ?? null,
          temSenha: Boolean(data.temSenha),
        }),
      )
      .catch((e: unknown) => setErro(mensagemErro(e, 'Não foi possível carregar o telefone.')));
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
    setEtapa(proxima);
  }

  function pedirCodigo() {
    return executar(async () => {
      const { data } = await api.post('/me/telefone/codigo');
      setCodigo('');
      setEtapa('codigo');
      setAviso(data.mensagem);
    }, 'Não foi possível enviar o código.');
  }

  function confirmarCodigo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    return executar(async () => {
      const { data } = await api.post('/me/telefone/verificar', { codigo });
      setEstado((atual) => atual && { ...atual, phoneVerifiedAt: data.phoneVerifiedAt });
      setEtapa('ver');
      setAviso('Telefone verificado.');
    }, 'Não foi possível confirmar o código.');
  }

  function trocar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    return executar(async () => {
      const { data } = await api.put('/me/telefone', {
        phone: novo.trim(),
        ...(estado?.temSenha ? { senhaAtual: senha } : {}),
      });
      setEstado(
        (atual) => atual && { ...atual, phone: data.phone, phoneVerifiedAt: data.phoneVerifiedAt },
      );
      setNovo('');
      setSenha('');
      setEtapa('ver');
      setAviso('Telefone salvo. Verifique o número para usar a recuperação por WhatsApp.');
    }, 'Não foi possível salvar o telefone.');
  }

  if (!estado) {
    return erro ? (
      <div className="card">
        <div className="auth__alert">{erro}</div>
      </div>
    ) : null;
  }

  const verificado = Boolean(estado.phoneVerifiedAt);

  return (
    <div className="card">
      <h3 className="card__title card__title--mb">Recuperação por WhatsApp</h3>
      <div className="pf-field__label">Telefone</div>
      <div className="pf-field__value">
        {estado.phone
          ? `${estado.phone} (${verificado ? 'verificado' : 'não verificado'})`
          : 'Nenhum telefone cadastrado'}
      </div>
      <span className="pf-field__hint">
        O código para redefinir a senha só vai por WhatsApp para telefone verificado. Sem ele, o
        código vai para o seu email.
      </span>

      {aviso && <div className="auth__alert auth__alert--ok">{aviso}</div>}
      {erro && <div className="auth__alert">{erro}</div>}

      {etapa === 'ver' && (
        <div className="pf-actions">
          {estado.phone && !verificado && (
            <button className="btn btn--accent" onClick={pedirCodigo} disabled={enviando}>
              {enviando ? 'Enviando...' : 'Verificar por WhatsApp'}
            </button>
          )}
          <button className="btn" onClick={() => irPara('trocar')} disabled={enviando}>
            {estado.phone ? 'Trocar telefone' : 'Cadastrar telefone'}
          </button>
        </div>
      )}

      {etapa === 'codigo' && (
        <form className="form" onSubmit={confirmarCodigo} noValidate>
          <FormField
            label="Código recebido"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
          />
          <div className="pf-actions">
            <button
              className="btn btn--accent"
              type="submit"
              disabled={enviando || codigo.length !== 6}
            >
              Confirmar
            </button>
            <button className="btn" type="button" onClick={() => irPara('ver')}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {etapa === 'trocar' && (
        <form className="form" onSubmit={trocar} noValidate>
          <FormField
            label="Telefone"
            type="tel"
            autoComplete="tel"
            placeholder="(11) 98888-7777"
            value={novo}
            onChange={(e) => setNovo(formatPhone(e.target.value))}
          />
          {estado.temSenha && (
            <FormField
              label="Senha atual"
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          )}
          <div className="pf-actions">
            <button
              className="btn btn--accent"
              type="submit"
              disabled={enviando || novo.replace(/\D/g, '').length < 10}
            >
              Salvar
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
