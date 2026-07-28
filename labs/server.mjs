// Serviço interno dos labs de Linux. Cada conexão WebSocket ganha um container
// efêmero com um shell dentro, e o serviço liga o PTY desse container ao socket.
// Só ele fala com o Docker; o backend público nunca toca o socket.
//
// Diferente do runner dos desafios, aqui o aluno PRECISA de sudo, então
// no-new-privileges e cap-drop ALL não entram: eles quebrariam o setuid do sudo
// e metade do módulo de permissões. O que segura o host é o user namespace do
// daemon dedicado, onde o root de dentro é um UID alto sem poder nenhum fora.
import http from 'node:http';
import { execFile } from 'node:child_process';
import { WebSocketServer } from 'ws';
import pty from 'node-pty';

const MAX_SESSOES = Number(process.env.MAX_SESSOES || 6);
const TTL_MS = Number(process.env.LAB_TTL_MINUTOS || 45) * 60 * 1000;
const IMAGEM = process.env.LAB_IMAGEM || 'lab-linux';
const MEMORIA = process.env.LAB_MEMORIA || '256m';
const CPUS = process.env.LAB_CPUS || '0.25';
// Socket do daemon dedicado aos labs. Vazio = daemon padrão (usado só em dev).
const DOCKER_HOST = process.env.LAB_DOCKER_HOST || '';

const ambiente = DOCKER_HOST ? { ...process.env, DOCKER_HOST } : process.env;
const sessoes = new Map();
// Uma sessão por aluno, para uma conta só não ocupar todas as vagas.
const porUsuario = new Map();

function argsDoContainer(nome) {
  return [
    'run', '--rm', '-i', '--tty',
    '--name', nome,
    '--hostname', 'lab',
    // Sem rede o Docker não resolve o próprio hostname, e aí todo sudo cospe
    // um aviso de "unable to resolve host" antes de funcionar.
    '--add-host', 'lab:127.0.0.1',
    // Sem rede: os módulos de comando, permissões e bash não precisam, e é o
    // que impede a caixa de ser usada para alcançar qualquer outra coisa.
    '--network', 'none',
    '--memory', MEMORIA,
    '--memory-swap', MEMORIA,
    '--cpus', CPUS,
    // Peso baixo na disputa por CPU. A máquina tem 2 vCPUs e o banco roda nela:
    // com tudo ocupado, backend e Postgres ganham do laboratório, para um aluno
    // sozinho não deixar o site lento para todo mundo.
    '--cpu-shares', '256',
    '--pids-limit', '256',
    IMAGEM,
    // O tempo de vida também vale de dentro. Se este serviço morrer ou for
    // recriado num deploy, o container se encerra sozinho em vez de ficar
    // rodando para sempre, porque o TTL daqui mora só na memória do processo.
    'timeout', String(Math.round(TTL_MS / 1000)), '/bin/bash', '-l',
  ];
}

// O --rm do Docker costuma chegar primeiro, então "não existe" e "remoção já em
// andamento" são o caminho normal, não erro.
const jaResolvido = /No such container|already in progress/i;

function removerContainer(nome) {
  execFile('docker', ['rm', '-f', nome], { env: ambiente }, (e) => {
    if (e && !jaResolvido.test(e.message)) {
      console.error('[labs] falha ao remover o container:', e.message);
    }
  });
}

// Um deploy recria este serviço, e os containers da execução anterior continuam
// de pé sem ninguém para encerrá-los. Varre e limpa ao subir.
function limparOrfaos() {
  execFile('docker', ['ps', '-aq', '--filter', 'name=^lab-'], { env: ambiente }, (e, saida) => {
    if (e) {
      console.error('[labs] não foi possível procurar órfãos:', e.message);
      return;
    }
    const ids = saida.split('\n').filter(Boolean);
    if (ids.length === 0) return;
    console.log(`[labs] removendo ${ids.length} laboratório(s) órfão(s) da execução anterior`);
    execFile('docker', ['rm', '-f', ...ids], { env: ambiente }, (err) => {
      if (err && !jaResolvido.test(err.message)) {
        console.error('[labs] falha ao remover órfãos:', err.message);
      }
    });
  });
}

function encerrar(sessao, motivo) {
  if (sessao.encerrada) return;
  sessao.encerrada = true;
  clearTimeout(sessao.ttl);
  sessoes.delete(sessao.id);
  if (porUsuario.get(sessao.userId) === sessao) porUsuario.delete(sessao.userId);
  try {
    sessao.proc.kill();
  } catch (e) {
    console.error('[labs] falha ao matar o pty:', e.message);
  }
  removerContainer(sessao.nome);
  if (sessao.ws.readyState === sessao.ws.OPEN) {
    sessao.ws.send(JSON.stringify({ tipo: 'fim', motivo }));
    sessao.ws.close();
  }
  console.log(`[labs] sessão ${sessao.id} encerrada (${motivo}); ativas: ${sessoes.size}`);
}

function abrirSessao(ws, req) {
  // O backend só encaminha depois de conferir o ticket, e manda de quem é.
  // Sem cabeçalho (conexão direta em dev), todos caem no mesmo balde.
  const userId = String(req.headers['x-user-id'] || 'anonimo');

  // Recarregar a página não pode trancar o próprio acesso, então a sessão
  // anterior do mesmo aluno é substituída em vez de a nova ser recusada.
  const anterior = porUsuario.get(userId);
  if (anterior) encerrar(anterior, 'substituída por uma nova sessão do mesmo aluno');

  if (sessoes.size >= MAX_SESSOES) {
    ws.send(
      JSON.stringify({
        tipo: 'erro',
        mensagem: 'Todos os laboratórios estão ocupados. Tente em instantes.',
      }),
    );
    ws.close();
    return;
  }

  const id = `${Date.now().toString(36)}-${Math.round(Math.random() * 1e6).toString(36)}`;
  const nome = `lab-${id}`;
  const proc = pty.spawn('docker', argsDoContainer(nome), {
    name: 'xterm-256color',
    cols: 80,
    rows: 24,
    env: ambiente,
  });

  const sessao = { id, nome, userId, proc, ws, encerrada: false };
  sessao.ttl = setTimeout(() => encerrar(sessao, 'tempo esgotado'), TTL_MS);
  sessoes.set(id, sessao);
  porUsuario.set(userId, sessao);
  console.log(`[labs] sessão ${id} aberta; ativas: ${sessoes.size}`);

  proc.onData((d) => {
    if (ws.readyState === ws.OPEN) ws.send(d);
  });
  proc.onExit(() => encerrar(sessao, 'shell encerrado'));

  ws.on('message', (raw, ehBinario) => {
    if (sessao.encerrada) return;
    // Texto puro é tecla digitada. JSON com tipo é comando de controle, hoje
    // só o redimensionamento da janela.
    const texto = ehBinario ? null : raw.toString();
    if (texto && texto.startsWith('{')) {
      try {
        const msg = JSON.parse(texto);
        if (msg.tipo === 'resize') {
          proc.resize(Math.max(2, msg.cols | 0), Math.max(2, msg.rows | 0));
          return;
        }
      } catch (e) {
        console.error('[labs] mensagem de controle inválida:', e.message);
      }
    }
    proc.write(texto ?? raw.toString());
  });

  ws.on('close', () => encerrar(sessao, 'conexão fechada'));
  ws.on('error', (e) => {
    console.error('[labs] erro no websocket:', e.message);
    encerrar(sessao, 'erro de conexão');
  });

  ws.send(JSON.stringify({ tipo: 'pronto', ttlMinutos: Math.round(TTL_MS / 60000) }));
}

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', sessoes: sessoes.size, max: MAX_SESSOES }));
    return;
  }
  res.writeHead(404).end();
});

const wss = new WebSocketServer({ server, path: '/sessao' });
wss.on('connection', abrirSessao);

limparOrfaos();
server.listen(8090, () => console.log(`labs ouvindo em :8090 (até ${MAX_SESSOES} sessões)`));
