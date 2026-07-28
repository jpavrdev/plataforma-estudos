// Serviço interno dos labs de Linux. Cada conexão WebSocket ganha um container
// efêmero com um shell dentro, e o serviço liga o PTY desse container ao socket.
// Só ele fala com o Docker; o backend público nunca toca o socket.
//
// Diferente do runner dos desafios, aqui o aluno PRECISA de sudo, então
// no-new-privileges e cap-drop ALL não entram: eles quebrariam o setuid do sudo
// e metade do módulo de permissões. O que segura o host é o user namespace do
// daemon dedicado, onde o root de dentro é um UID alto sem poder nenhum fora.
import http from 'node:http';
import { WebSocketServer } from 'ws';
import pty from 'node-pty';

const MAX_SESSOES = Number(process.env.MAX_SESSOES || 20);
const TTL_MS = Number(process.env.LAB_TTL_MINUTOS || 45) * 60 * 1000;
const IMAGEM = process.env.LAB_IMAGEM || 'lab-linux';
const MEMORIA = process.env.LAB_MEMORIA || '256m';
const CPUS = process.env.LAB_CPUS || '0.5';
// Socket do daemon dedicado aos labs. Vazio = daemon padrão (usado só em dev).
const DOCKER_HOST = process.env.LAB_DOCKER_HOST || '';

const sessoes = new Map();

function argsDoContainer(nome) {
    return [
        'run',
        '--rm',
        '-i',
        '--tty',
        '--name',
        nome,
        '--hostname',
        'lab',
        // Sem rede o Docker não resolve o próprio hostname, e aí todo sudo cospe
        // um aviso de "unable to resolve host" antes de funcionar.
        '--add-host',
        'lab:127.0.0.1',
        // Sem rede: os módulos de comando, permissões e bash não precisam, e é o
        // que impede a caixa de ser usada para alcançar qualquer outra coisa.
        '--network',
        'none',
        '--memory',
        MEMORIA,
        '--memory-swap',
        MEMORIA,
        '--cpus',
        CPUS,
        '--pids-limit',
        '256',
        IMAGEM,
    ];
}

function encerrar(sessao, motivo) {
    if (sessao.encerrada) return;
    sessao.encerrada = true;
    clearTimeout(sessao.ttl);
    sessoes.delete(sessao.id);
    try {
        sessao.proc.kill();
    } catch (e) {
        console.error('[labs] falha ao matar o pty:', e.message);
    }
    // O --rm cuida do container quando o processo morre, mas se o pty já tiver
    // ido embora sem levar o docker junto, o rm garante que nada fica de pé.
    try {
        const env = DOCKER_HOST ? { ...process.env, DOCKER_HOST } : process.env;
        pty.spawn('docker', ['rm', '-f', sessao.nome], { env }).on('exit', () => {});
    } catch (e) {
        console.error('[labs] falha ao remover o container:', e.message);
    }
    if (sessao.ws.readyState === sessao.ws.OPEN) {
        sessao.ws.send(JSON.stringify({ tipo: 'fim', motivo }));
        sessao.ws.close();
    }
    console.log(`[labs] sessão ${sessao.id} encerrada (${motivo}); ativas: ${sessoes.size}`);
}

function abrirSessao(ws) {
    if (sessoes.size >= MAX_SESSOES) {
        ws.send(JSON.stringify({ tipo: 'erro', mensagem: 'Todos os laboratórios estão ocupados. Tente em instantes.' }));
        ws.close();
        return;
    }
    const id = `${Date.now().toString(36)}-${sessoes.size}`;
    const nome = `lab-${id}`;
    const env = DOCKER_HOST ? { ...process.env, DOCKER_HOST } : process.env;
    const proc = pty.spawn('docker', argsDoContainer(nome), {
        name: 'xterm-256color',
        cols: 80,
        rows: 24,
        env,
    });

    const sessao = { id, nome, proc, ws, encerrada: false };
    sessao.ttl = setTimeout(() => encerrar(sessao, 'tempo esgotado'), TTL_MS);
    sessoes.set(id, sessao);
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

server.listen(8090, () => console.log('labs ouvindo em :8090'));
