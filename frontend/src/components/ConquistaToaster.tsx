import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { obterConquistasNaoVistas, type ConquistaDesbloqueada } from '../services/trails';
import { EVENTO_CONQUISTA } from '../utils/conquistas';
import { IconeConquista } from './Icons';

// Notificação de desbloqueio no estilo Steam: quando o usuário ganha uma conquista,
// um card desliza no canto e some sozinho. As não-vistas vêm do backend (que marca
// como vistas ao ler), então cada conquista notifica uma única vez.
const DURACAO_MS = 6000;

export function ConquistaToaster() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [fila, setFila] = useState<ConquistaDesbloqueada[]>([]);
  const buscando = useRef(false);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const remover = useCallback((id: string) => {
    setFila((prev) => prev.filter((c) => c.id !== id));
    const t = timers.current[id];
    if (t) {
      clearTimeout(t);
      delete timers.current[id];
    }
  }, []);

  const checar = useCallback(async () => {
    if (buscando.current) return;
    buscando.current = true;
    try {
      const novas = await obterConquistasNaoVistas();
      if (novas.length === 0) return;
      setFila((prev) => {
        const jaNaFila = new Set(prev.map((c) => c.id));
        const adicionar = novas.filter((c) => !jaNaFila.has(c.id));
        for (const c of adicionar) {
          timers.current[c.id] = setTimeout(() => remover(c.id), DURACAO_MS);
        }
        return [...prev, ...adicionar];
      });
    } catch (e) {
      // Não deve atrapalhar o fluxo do usuário; só registra para depuração.
      console.debug('Falha ao checar conquistas não-vistas', e);
    } finally {
      buscando.current = false;
    }
  }, [remover]);

  // Ao autenticar e a cada troca de rota (pega desbloqueios que aconteceram no caminho).
  useEffect(() => {
    if (!isAuthenticated) return;
    checar();
  }, [isAuthenticated, location.pathname, checar]);

  // Sinal imediato após uma ação que pode desbloquear (fim de quiz, desafio aprovado).
  useEffect(() => {
    if (!isAuthenticated) return;
    const handler = () => checar();
    window.addEventListener(EVENTO_CONQUISTA, handler);
    return () => window.removeEventListener(EVENTO_CONQUISTA, handler);
  }, [isAuthenticated, checar]);

  useEffect(() => {
    const ts = timers.current;
    return () => Object.values(ts).forEach(clearTimeout);
  }, []);

  if (fila.length === 0) return null;

  return (
    <div className="conq-toaster" aria-live="polite">
      {fila.map((c) => (
        <button
          key={c.id}
          type="button"
          className="conq-toast"
          onClick={() => remover(c.id)}
          title="Dispensar"
        >
          <span className="conq-toast__badge">
            <IconeConquista chave={c.icon} size={24} />
          </span>
          <span className="conq-toast__body">
            <span className="conq-toast__label">Conquista desbloqueada</span>
            <span className="conq-toast__name">{c.name}</span>
            <span className="conq-toast__desc">{c.description}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
