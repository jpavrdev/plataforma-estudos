import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  obterComunicadoAtivo,
  responderComunicado,
  dispensarComunicado,
  type ComunicadoAtivo,
} from '../services/comunicados';

// Não interrompe quem está no meio de uma aula, simulado ou desafio.
const ROTAS_SEM_PROMPT = [/\/aula\//, /\/tentativa/, /^\/desafios\/./];

export function ComunicadoPrompt() {
  const { isAuthenticated, user } = useAuth();
  const { pathname } = useLocation();
  const [comunicado, setComunicado] = useState<ComunicadoAtivo | null>(null);
  const [etapa, setEtapa] = useState<'convite' | 'pesquisa' | 'obrigado'>('convite');
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  const logado = isAuthenticated && !!user?.username;

  useEffect(() => {
    if (!logado) return;
    obterComunicadoAtivo()
      .then(setComunicado)
      .catch(() => {});
  }, [logado]);

  if (!logado || !comunicado || ROTAS_SEM_PROMPT.some((r) => r.test(pathname))) return null;

  async function dispensar() {
    const id = comunicado!.id;
    setComunicado(null);
    try {
      await dispensarComunicado(id);
    } catch (e) {
      console.error('Falha ao dispensar comunicado:', e);
    }
  }

  async function enviar() {
    if (nota < 1 || enviando) return;
    setEnviando(true);
    try {
      await responderComunicado(comunicado!.id, nota, comentario.trim() || undefined);
      setEtapa('obrigado');
    } catch (e) {
      console.error('Falha ao responder comunicado:', e);
      setComunicado(null);
    } finally {
      setEnviando(false);
    }
  }

  if (comunicado.kind === 'aviso') {
    return (
      <div className="cmn-card">
        <div className="cmn-card__kicker">Aviso</div>
        <h3 className="cmn-card__title">{comunicado.title}</h3>
        <p className="cmn-card__msg">{comunicado.message}</p>
        <div className="cmn-card__row">
          <button className="btn btn--accent" onClick={dispensar}>
            Entendi
          </button>
        </div>
      </div>
    );
  }

  if (etapa === 'convite') {
    return (
      <div className="cmn-card">
        <div className="cmn-card__kicker">Sua opinião</div>
        <h3 className="cmn-card__title">Topa responder um questionário rápido?</h3>
        <p className="cmn-card__msg">
          É uma pergunta só e ajuda a melhorar o site para todo mundo.
        </p>
        <div className="cmn-card__row">
          <button className="btn btn--ghost" onClick={dispensar}>
            Agora não
          </button>
          <button className="btn btn--accent" onClick={() => setEtapa('pesquisa')}>
            Responder
          </button>
        </div>
      </div>
    );
  }

  if (etapa === 'pesquisa') {
    return (
      <div className="cmn-card">
        <div className="cmn-card__kicker">Questionário</div>
        <h3 className="cmn-card__title">{comunicado.title}</h3>
        <p className="cmn-card__msg">{comunicado.message}</p>
        <div className="cmn-notas">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={`cmn-nota${nota === n ? ' cmn-nota--on' : ''}`}
              onClick={() => setNota(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <textarea
          className="cmn-texto"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Quer contar mais? (opcional)"
          maxLength={2000}
          rows={3}
        />
        <div className="cmn-card__row">
          <button className="btn btn--ghost" onClick={dispensar}>
            Cancelar
          </button>
          <button className="btn btn--accent" onClick={enviar} disabled={nota < 1 || enviando}>
            {enviando ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cmn-card">
      <div className="cmn-card__kicker">Valeu!</div>
      <h3 className="cmn-card__title">Resposta enviada</h3>
      <p className="cmn-card__msg">Obrigado por ajudar a melhorar o site.</p>
      <div className="cmn-card__row">
        <button className="btn btn--accent" onClick={() => setComunicado(null)}>
          Fechar
        </button>
      </div>
    </div>
  );
}
