"""Recebe { code, stdins, caseTimeoutMs, mode, entryPoint } por stdin, roda o código
uma vez por entrada e devolve o resultado de cada caso como JSON. Sem rede.
mode "stdin": o código lê stdin e imprime stdout.
mode "function": anexa um driver que lê os args (JSON) do stdin, chama
  Solution().<entry>(*args) ou <entry>(*args) e imprime o retorno em JSON."""
import sys
import json
import re
import subprocess

dados = json.load(sys.stdin)
code = dados.get("code", "")
stdins = dados.get("stdins", [])
timeout = dados.get("caseTimeoutMs", 5000) / 1000
mode = dados.get("mode", "stdin")
entry = dados.get("entryPoint", "") or "solve"
if not re.match(r"^[A-Za-z_]\w*$", entry):
    entry = "solve"


def driver(e):
    return f'''

if __name__ == "__main__":
    import sys as __sys, json as __json
    try:
        __args = __json.loads(__sys.stdin.read() or "[]")
    except Exception:
        __args = []
    if not isinstance(__args, list):
        __args = [__args]
    __fn = None
    if "Solution" in dir():
        __m = getattr(Solution(), "{e}", None)
        if callable(__m):
            __fn = __m
    if __fn is None and callable(globals().get("{e}")):
        __fn = globals()["{e}"]
    if __fn is None:
        __sys.stderr.write("Defina a classe Solution com o metodo {e}(...) ou a funcao {e}(...).")
        __sys.exit(1)
    print(__json.dumps(__fn(*__args)))
'''


programa = code + "\n" + driver(entry) if mode == "function" else code
with open("/tmp/code.py", "w") as f:
    f.write(programa)

# Checagem de sintaxe: erro aqui é "compilação".
check = subprocess.run(
    [sys.executable, "-m", "py_compile", "/tmp/code.py"], capture_output=True, text=True
)
if check.returncode != 0:
    print(json.dumps({"compileOutput": (check.stderr or "Erro de sintaxe")[:4000], "results": []}))
    sys.exit(0)

results = []
for stdin in stdins:
    try:
        r = subprocess.run(
            [sys.executable, "/tmp/code.py"],
            input=stdin,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        results.append(
            {
                "stdout": r.stdout[:100_000],
                "stderr": r.stderr[:4000],
                "exitCode": r.returncode,
                "timedOut": False,
            }
        )
    except subprocess.TimeoutExpired as e:
        parcial = e.stdout or ""
        if isinstance(parcial, bytes):
            parcial = parcial.decode("utf-8", "replace")
        results.append({"stdout": parcial[:100_000], "stderr": "", "exitCode": 124, "timedOut": True})

print(json.dumps({"compileOutput": None, "results": results}))
