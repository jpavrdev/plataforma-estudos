// Recebe { code, stdins, caseTimeoutMs, mode, entryPoint } por stdin, roda o código
// uma vez por entrada e devolve o resultado de cada caso como JSON. Sem rede.
// mode "stdin": o código lê stdin e imprime stdout.
// mode "function": anexa um driver que lê os args (JSON) do stdin, chama
//   Solution().<entry>(...args) ou <entry>(...args) e imprime o retorno em JSON.
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

function driver(entry) {
  const e = /^[A-Za-z_$][\w$]*$/.test(entry) ? entry : 'solve';
  return `
;(async () => {
  const __fs = require('fs');
  let __args;
  try { __args = JSON.parse(__fs.readFileSync(0, 'utf8') || '[]'); } catch { __args = []; }
  if (!Array.isArray(__args)) __args = [__args];
  let __fn;
  if (typeof Solution !== 'undefined') {
    const __o = new Solution();
    const __m = __o['${e}'];
    if (typeof __m === 'function') __fn = __m.bind(__o);
  }
  if (typeof __fn !== 'function' && typeof ${e} === 'function') __fn = ${e};
  if (typeof __fn !== 'function') {
    console.error('Defina a classe Solution com o método ${e}(...) ou a função ${e}(...).');
    process.exit(1);
  }
  let __r = __fn(...__args);
  if (__r && typeof __r.then === 'function') __r = await __r;
  process.stdout.write(JSON.stringify(__r === undefined ? null : __r));
})();
`;
}

let entrada = '';
process.stdin.on('data', (d) => (entrada += d));
process.stdin.on('end', () => {
  const { code = '', stdins = [], caseTimeoutMs = 5000, mode = 'stdin', entryPoint = '' } =
    JSON.parse(entrada);

  const programa = mode === 'function' ? `${code}\n${driver(entryPoint)}` : code;
  writeFileSync('/tmp/code.js', programa);

  // Checagem de sintaxe: erro aqui é "compilação".
  const check = spawnSync('node', ['--check', '/tmp/code.js'], { encoding: 'utf8' });
  if (check.status !== 0) {
    process.stdout.write(
      JSON.stringify({ compileOutput: (check.stderr || 'Erro de sintaxe').slice(0, 4000), results: [] }),
    );
    return;
  }

  const results = stdins.map((stdin) => {
    const r = spawnSync('node', ['/tmp/code.js'], {
      input: stdin,
      timeout: caseTimeoutMs,
      maxBuffer: 2 * 1024 * 1024,
      encoding: 'utf8',
      killSignal: 'SIGKILL',
    });
    const timedOut = r.error && r.error.code === 'ETIMEDOUT';
    return {
      stdout: (r.stdout || '').slice(0, 100_000),
      stderr: (r.stderr || '').slice(0, 4000),
      exitCode: timedOut ? 124 : r.status === null ? 1 : r.status,
      timedOut: !!timedOut,
    };
  });
  process.stdout.write(JSON.stringify({ compileOutput: null, results }));
});
