import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { Check, X } from '../components/Icons';

type Tipo = 'sucesso' | 'erro';
interface Toast {
  id: number;
  msg: string;
  tipo: Tipo;
}

interface ToastCtx {
  mostrar: (msg: string, tipo?: Tipo) => void;
}

const Ctx = createContext<ToastCtx>({ mostrar: () => {} });

export function useToast() {
  return useContext(Ctx);
}

let idSeq = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const mostrar = useCallback((msg: string, tipo: Tipo = 'sucesso') => {
    const id = idSeq++;
    setToasts((prev) => [...prev, { id, msg, tipo }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  return (
    <Ctx.Provider value={{ mostrar }}>
      {children}
      <div className="toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.tipo}`}>
            <span className="toast__icon">
              {t.tipo === 'sucesso' ? <Check size={13} /> : <X size={11} />}
            </span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
