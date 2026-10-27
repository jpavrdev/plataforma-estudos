import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { obterSorteioAtivo, type SorteioAtivo } from '../services/sorteios';

const INTERVALO_MS = 5 * 60 * 1000;

interface SorteioCtx {
  sorteio: SorteioAtivo | null;
  carregando: boolean;
  erro: boolean;
  recarregar: () => Promise<void>;
}

// O dono impede que a inscrição de outra conta apareça depois de uma troca de login.
interface Resposta {
  dono: string;
  sorteio: SorteioAtivo | null;
  erro: boolean;
}

const Ctx = createContext<SorteioCtx>({
  sorteio: null,
  carregando: false,
  erro: false,
  recarregar: async () => {},
});

export function SorteioProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const dono = isAuthenticated && user?.username ? user.id : null;
  const [resposta, setResposta] = useState<Resposta | null>(null);
  const ultimaBusca = useRef(0);
  const sequencia = useRef(0);

  const recarregar = useCallback((): Promise<void> => {
    if (!dono) return Promise.resolve();
    // Só vale a busca mais recente: uma resposta atrasada não sobrescreve a nova.
    const minha = ++sequencia.current;
    ultimaBusca.current = Date.now();
    return obterSorteioAtivo()
      .then((sorteio) => {
        if (minha === sequencia.current) setResposta({ dono, sorteio, erro: false });
      })
      .catch((e: unknown) => {
        console.error('Falha ao buscar o sorteio ativo:', e);
        if (minha !== sequencia.current) return;
        setResposta((anterior) =>
          anterior?.dono === dono
            ? { ...anterior, erro: true }
            : { dono, sorteio: null, erro: true },
        );
      });
  }, [dono]);

  useEffect(() => {
    if (!dono) return;
    recarregar();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') recarregar();
    }, INTERVALO_MS);
    function aoVoltarParaAba() {
      const desatualizado = Date.now() - ultimaBusca.current >= INTERVALO_MS;
      if (document.visibilityState === 'visible' && desatualizado) recarregar();
    }
    document.addEventListener('visibilitychange', aoVoltarParaAba);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', aoVoltarParaAba);
    };
  }, [dono, recarregar]);

  const atual = dono && resposta?.dono === dono ? resposta : null;

  return (
    <Ctx.Provider
      value={{
        sorteio: atual?.sorteio ?? null,
        carregando: !!dono && !atual,
        erro: atual?.erro ?? false,
        recarregar,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useSorteioAtivo() {
  return useContext(Ctx);
}
