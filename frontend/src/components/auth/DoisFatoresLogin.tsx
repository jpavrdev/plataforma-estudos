import { useState, type FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FormField } from '../FormField';
import { mensagemErro } from '../../utils/erro';

interface Props {
  desafio: string;
  onConcluir: () => void;
  onVoltar: () => void;
}

// Segunda etapa do login de quem tem 2FA, depois da senha ou do login social:
// o código do app autenticador ou um código de recuperação.
export function DoisFatoresLogin({ desafio, onConcluir, onVoltar }: Props) {
  const { confirmarDoisFatores } = useAuth();
  const [recuperacao, setRecuperacao] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function confirmar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await confirmarDoisFatores(desafio, codigo);
      onConcluir();
    } catch (e: unknown) {
      setErro(mensagemErro(e, 'Não foi possível confirmar o código.'));
    } finally {
      setEnviando(false);
    }
  }

  function alternar() {
    setRecuperacao((atual) => !atual);
    setCodigo('');
    setErro('');
  }

  const completo = recuperacao
    ? codigo.replace(/[^a-z0-9]/gi, '').length === 10
    : codigo.length === 6;

  return (
    <>
      <h2 className="auth__title">Verificação em duas etapas</h2>
      <p className="auth__subtitle">
        {recuperacao
          ? 'Digite um dos seus códigos de recuperação. Cada um vale uma vez só.'
          : 'Digite o código de 6 dígitos do seu app autenticador.'}
      </p>

      {erro && <div className="auth__alert">{erro}</div>}

      <form className="form" onSubmit={confirmar} noValidate>
        {recuperacao ? (
          <FormField
            label="Código de recuperação"
            autoComplete="off"
            placeholder="xxxxx-xxxxx"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.slice(0, 20))}
          />
        ) : (
          <FormField
            label="Código do app"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
          />
        )}
        <button
          className="btn btn--accent btn--block"
          type="submit"
          disabled={enviando || !completo}
        >
          {enviando ? 'Confirmando...' : 'Confirmar'}
        </button>
      </form>

      <p className="auth__foot">
        <button type="button" className="link link--btn" onClick={alternar}>
          {recuperacao ? 'Usar o código do app' : 'Usar um código de recuperação'}
        </button>
        {' · '}
        <button type="button" className="link link--btn" onClick={onVoltar}>
          Voltar ao login
        </button>
      </p>
    </>
  );
}
