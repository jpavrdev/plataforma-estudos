import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Logo } from '../../components/Logo';
import { mensagemErro } from '../../utils/erro';

type Status = 'verificando' | 'sucesso' | 'erro';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<Status>('verificando');
  const [mensagem, setMensagem] = useState('');
  const jaRodou = useRef(false);

  useEffect(() => {
    // Evita chamada dupla no StrictMode (dev)
    if (jaRodou.current) return;
    jaRodou.current = true;

    const token = searchParams.get('token');

    if (!token) {
      setStatus('erro');
      setMensagem('Link inválido: token não encontrado.');
      return;
    }

    async function verificar() {
      try {
        const { data } = await api.post('/verify-email', { token });
        setStatus('sucesso');
        setMensagem(data.mensagem ?? 'Email verificado com sucesso.');
      } catch (e: unknown) {
        setStatus('erro');
        setMensagem(
          mensagemErro(e, 'Não foi possível verificar seu email. O link pode ter expirado.'),
        );
      }
    }

    verificar();
  }, [searchParams]);

  return (
    <div className="verify-shell">
      <div className="verify-card">
        <Logo variant="solid" size={22} />

        {status === 'verificando' && (
          <>
            <h1 className="verify-title">Verificando seu email...</h1>
            <p className="verify-text">Aguarde um instante.</p>
          </>
        )}

        {status === 'sucesso' && (
          <>
            <div className="verify-icon verify-icon--ok">✓</div>
            <h1 className="verify-title">Email verificado!</h1>
            <p className="verify-text">{mensagem}</p>
            <Link className="btn btn--accent btn--block" to="/">
              Ir para o login
            </Link>
          </>
        )}

        {status === 'erro' && (
          <>
            <div className="verify-icon verify-icon--erro">!</div>
            <h1 className="verify-title">Não foi possível verificar</h1>
            <p className="verify-text">{mensagem}</p>
            <Link className="btn btn--ghost btn--block" to="/">
              Voltar ao login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
