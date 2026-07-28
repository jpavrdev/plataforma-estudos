import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import api from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

type Estado = 'parado' | 'conectando' | 'ligado' | 'encerrado' | 'erro';

// Terminal de verdade dentro da aula. O xterm só transporta tecla para lá e
// caractere de volta; quem executa é um container descartável do outro lado.
export function TerminalLab() {
  const caixa = useRef<HTMLDivElement>(null);
  const term = useRef<Terminal | null>(null);
  const fit = useRef<FitAddon | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const [estado, setEstado] = useState<Estado>('parado');
  const [aviso, setAviso] = useState('');
  const { theme } = useTheme();

  useEffect(() => {
    return () => {
      ws.current?.close();
      term.current?.dispose();
    };
  }, []);

  async function iniciar() {
    if (estado === 'conectando' || estado === 'ligado') return;
    setAviso('');
    setEstado('conectando');
    try {
      const { data } = await api.post<{ ticket: string }>('/labs/ticket');

      const t = new Terminal({
        fontFamily: 'var(--font-code), ui-monospace, monospace',
        fontSize: 13,
        cursorBlink: true,
        convertEol: true,
        theme:
          theme === 'dark'
            ? { background: '#0d1320', foreground: '#ecf1fa', cursor: '#2d6bf5' }
            : { background: '#1b1726', foreground: '#f3efe6', cursor: '#2d6bf5' },
      });
      const f = new FitAddon();
      t.loadAddon(f);
      if (!caixa.current) return;
      caixa.current.innerHTML = '';
      t.open(caixa.current);
      f.fit();
      term.current = t;
      fit.current = f;

      const base = (api.defaults.baseURL ?? '').replace(/^http/, 'ws');
      const socket = new WebSocket(`${base}/labs/terminal?ticket=${data.ticket}`);
      ws.current = socket;

      socket.onopen = () => {
        setEstado('ligado');
        socket.send(JSON.stringify({ tipo: 'resize', cols: t.cols, rows: t.rows }));
        t.focus();
      };
      socket.onmessage = (ev) => {
        const texto = String(ev.data);
        // O serviço avisa por JSON quando fica pronto, quando dá erro e quando
        // o tempo acaba. O resto é saída crua do shell.
        if (texto.startsWith('{')) {
          try {
            const msg = JSON.parse(texto);
            if (msg.tipo === 'erro') {
              setAviso(msg.mensagem);
              setEstado('erro');
              return;
            }
            if (msg.tipo === 'fim') {
              t.writeln(`\r\n\r\n[laboratório encerrado: ${msg.motivo}]`);
              setEstado('encerrado');
              return;
            }
            if (msg.tipo === 'pronto') {
              setAviso(`Sessão de ${msg.ttlMinutos} minutos. Nada aqui é salvo.`);
              return;
            }
          } catch {
            // Não era controle, então é saída do shell e segue o fluxo normal.
            t.write(texto);
            return;
          }
          return;
        }
        t.write(texto);
      };
      socket.onclose = () => setEstado((e) => (e === 'erro' ? e : 'encerrado'));
      socket.onerror = () => {
        setAviso('Não foi possível conectar ao laboratório.');
        setEstado('erro');
      };

      t.onData((d) => {
        if (socket.readyState === WebSocket.OPEN) socket.send(d);
      });

      const aoRedimensionar = () => {
        f.fit();
        if (socket.readyState === WebSocket.OPEN)
          socket.send(JSON.stringify({ tipo: 'resize', cols: t.cols, rows: t.rows }));
      };
      window.addEventListener('resize', aoRedimensionar);
      socket.addEventListener('close', () => window.removeEventListener('resize', aoRedimensionar));
    } catch {
      setAviso('Não foi possível abrir o laboratório. Tente de novo em instantes.');
      setEstado('erro');
    }
  }

  function encerrar() {
    ws.current?.close();
    setEstado('encerrado');
  }

  return (
    <div className="lab">
      <div className="lab__barra">
        <span className="lab__titulo">Laboratório</span>
        <span className={`lab__estado lab__estado--${estado}`}>
          {estado === 'ligado'
            ? 'conectado'
            : estado === 'conectando'
              ? 'conectando...'
              : estado === 'encerrado'
                ? 'encerrado'
                : estado === 'erro'
                  ? 'erro'
                  : 'desligado'}
        </span>
        {estado === 'ligado' ? (
          <button className="btn btn--ghost lab__botao" type="button" onClick={encerrar}>
            Encerrar
          </button>
        ) : (
          <button
            className="btn btn--accent lab__botao"
            type="button"
            onClick={iniciar}
            disabled={estado === 'conectando'}
          >
            {estado === 'parado' ? 'Iniciar laboratório' : 'Reiniciar'}
          </button>
        )}
      </div>
      {aviso && <p className="lab__aviso">{aviso}</p>}
      {estado === 'parado' ? (
        <div className="lab__vazio">
          <p>
            Um terminal Linux de verdade, só seu, criado na hora e apagado ao fim. Pode usar
            <code className="code-inline">sudo</code> à vontade: quebrar essa máquina não afeta
            nada.
          </p>
        </div>
      ) : (
        <div className="lab__tela" ref={caixa} />
      )}
    </div>
  );
}
