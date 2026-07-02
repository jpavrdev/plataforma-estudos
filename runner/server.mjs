// Serviço interno de execução de desafios. Recebe { language, code, stdins } e roda
// o código num container efêmero e endurecido, um por submissão. Só ele fala com o
// Docker (o backend público nunca toca o socket).
import http from 'node:http';
import { spawn } from 'node:child_process';

// C# entra depois: basta adicionar a imagem desafio-csharp aqui, no schema de
// execução e no seletor do front. O enum do banco já reserva o valor.
const LIMITS = {
  javascript: { image: 'desafio-js', mem: '256m', caseTimeoutMs: 5000 },
  python: { image: 'desafio-python', mem: '256m', caseTimeoutMs: 5000 },
};
const RUNTIME = process.env.RUNNER_RUNTIME || ''; // "runsc" (gVisor) quando disponível
const MAX_CONCURRENT = Number(process.env.MAX_CONCURRENT || 2);

let running = 0;
const fila = [];
const adquirir = () =>
  new Promise((r) => (running < MAX_CONCURRENT ? (running++, r()) : fila.push(r)));
const liberar = () => {
  running--;
  const proximo = fila.shift();
  if (proximo) (running++, proximo());
};

function rodarContainer(cfg, payload) {
  return new Promise((resolve) => {
    const args = [
      'run', '--rm', '-i',
      '--network', 'none',
      '--memory', cfg.mem, '--memory-swap', cfg.mem,
      '--cpus', '1',
      '--pids-limit', '128',
      '--read-only',
      '--tmpfs', '/tmp:rw,exec,size=256m',
      '--cap-drop', 'ALL',
      '--security-opt', 'no-new-privileges',
      ...(RUNTIME ? ['--runtime', RUNTIME] : []),
      cfg.image,
    ];
    const p = spawn('docker', args);
    let out = '';
    let err = '';
    // Cerca dura: o container tem seus próprios timeouts, isto é só o backstop.
    const backstop = setTimeout(() => p.kill('SIGKILL'), 60_000);
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (err += d));
    p.on('close', () => {
      clearTimeout(backstop);
      try {
        resolve(JSON.parse(out));
      } catch {
        resolve({ compileOutput: 'Falha no executor: ' + (err.slice(0, 500) || 'saída inválida'), results: [] });
      }
    });
    p.stdin.on('error', () => {});
    p.stdin.write(JSON.stringify(payload));
    p.stdin.end();
  });
}

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200).end('ok');
    return;
  }
  if (req.method === 'POST' && req.url === '/run') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', async () => {
      let dados;
      try {
        dados = JSON.parse(body);
      } catch {
        res.writeHead(400).end('{}');
        return;
      }
      const cfg = LIMITS[dados.language];
      if (!cfg) {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ compileOutput: 'Linguagem não suportada', results: [] }));
        return;
      }
      await adquirir();
      try {
        const r = await rodarContainer(cfg, {
          code: String(dados.code || ''),
          stdins: (dados.stdins || []).map(String),
          caseTimeoutMs: cfg.caseTimeoutMs,
          mode: dados.mode === 'function' ? 'function' : 'stdin',
          entryPoint: String(dados.entryPoint || ''),
        });
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify(r));
      } finally {
        liberar();
      }
    });
    return;
  }
  res.writeHead(404).end();
});

server.listen(8080, () => console.log('runner ouvindo em :8080'));
