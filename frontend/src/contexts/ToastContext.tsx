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

// A barra de progresso é animada por esta mesma duração.
const TOAST_MS = 4500;

export function useToast() {
  return useContext(Ctx);
}

let idSeq = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const mostrar = useCallback((msg: string, tipo: Tipo = 'sucesso') => {
    const id = idSeq++;
    setToasts((prev) => [...prev, { id, msg, tipo }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), TOAST_MS);
  }, []);

  return (
    <Ctx.Provider value={{ mostrar }}>
      {children}
      <div className="toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.tipo}`}>
            <div className="toast__linha">
              <span className="toast__icon">
                {t.tipo === 'sucesso' ? <Check size={15} /> : <X size={13} />}
              </span>
              <span className="toast__msg">{t.msg}</span>
            </div>
            <div className="toast__barra">
              <div className="toast__progresso" style={{ animationDuration: `${TOAST_MS}ms` }} />
            </div>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
