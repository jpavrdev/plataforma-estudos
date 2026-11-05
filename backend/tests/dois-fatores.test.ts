import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { base32, codigoNoPasso, conferirTotp, passoAtual } from "../src/services/totp.ts";

// O resto da suíte roda com a exigência desligada; aqui ela vale como em produção.
// O env é lido no primeiro import do app, então tudo que o carrega vem depois.
process.env.ADMIN_EXIGE_2FA = "true";
const { startTestServer, extractRefreshCookie } = await import("./helpers/server.ts");
const { limparBanco } = await import("./helpers/db.ts");

let server: Awaited<ReturnType<typeof startTestServer>>;

async function app() {
    const { db } = await import("../db.ts");
    const { users, tokens } = await import("../schema.ts");
    const { eq } = await import("drizzle-orm");
    return { db, users, tokens, eq };
}

const SENHA = "Senhaforte123!";
let seq = 0;

// Decodifica o segredo que a API mostra, do jeito que o app autenticador faz.
function deBase32(texto: string) {
    const alfabeto = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let valor = 0;
    let bits = 0;
    const bytes: number[] = [];
    for (const letra of texto) {
        valor = ((valor & 0xff) << 5) | alfabeto.indexOf(letra);
        bits += 5;
        if (bits >= 8) {
            bytes.push((valor >>> (bits - 8)) & 0xff);
            bits -= 8;
        }
    }
    return Buffer.from(bytes);
}

const codigoAgora = (segredo: Buffer, deslocamento = 0) =>
    codigoNoPasso(segredo, passoAtual() + deslocamento);

async function chamar(
    metodo: string,
    caminho: string,
    { token, cookie, body }: { token?: string; cookie?: string | null; body?: unknown } = {},
) {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (cookie) headers.Cookie = cookie;
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const res = await fetch(`${server.base}${caminho}`, {
        method: metodo,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const texto = await res.text();
    return {
        status: res.status,
        body: texto ? JSON.parse(texto) : null,
        cookie: extractRefreshCookie(res.headers.get("set-cookie")),
    };
}

async function criarAdmin() {
    const n = ++seq;
    const email = `admin_2fa_${n}_${Date.now()}@example.com`;
    const cadastro = await server.request("POST", "/register", {
        body: {
            name: "Admin Teste",
            email,
            username: `adm2fa_${n}`,
            password: SENHA,
            birthDate: "1990-01-01",
            gender: "outro",
            phone: "(11) 98888-7777",
        },
    });
    assert.equal(cadastro.status, 201);
    const { db, users, eq } = await app();
    await db
        .update(users)
        .set({ emailVerifiedAt: new Date(), role: "admin" })
        .where(eq(users.email, email));
    const login = await chamar("POST", "/login", { body: { email, password: SENHA } });
    assert.equal(login.status, 200);
    return { email, token: login.body.token as string, cookie: login.cookie };
}

// Admin com o 2FA já ligado pelo caminho de verdade (configurar e ativar).
async function criarAdminComDoisFatores() {
    const admin = await criarAdmin();
    const config = await chamar("POST", "/me/2fa/configurar", { token: admin.token });
    assert.equal(config.status, 200);
    const segredo = deBase32(config.body.segredo);
    const ativacao = await chamar("POST", "/me/2fa/ativar", {
        token: admin.token,
        cookie: admin.cookie,
        body: { codigo: codigoAgora(segredo), senhaAtual: SENHA },
    });
    assert.equal(ativacao.status, 200);
    return {
        ...admin,
        segredo,
        codigosRecuperacao: ativacao.body.codigosRecuperacao as string[],
        tokenAntigo: admin.token,
        cookieAntigo: admin.cookie,
        token: ativacao.body.token as string,
        cookie: ativacao.cookie,
    };
}

before(async () => {
    server = await startTestServer();
});

after(async () => {
    await server.close();
});

beforeEach(async () => {
    await limparBanco();
});

describe("2FA: TOTP", () => {
    test("bate com os vetores da RFC 6238", () => {
        const segredo = Buffer.from("12345678901234567890");
        const casos: [number, string][] = [
            [59, "94287082"],
            [1111111109, "07081804"],
            [1111111111, "14050471"],
            [1234567890, "89005924"],
            [2000000000, "69279037"],
            [20000000000, "65353130"],
        ];
        for (const [segundos, esperado] of casos) {
            assert.equal(codigoNoPasso(segredo, Math.floor(segundos / 30), 8), esperado);
        }
    });

    test("base32 bate com os vetores da RFC 4648, sem o preenchimento", () => {
        const casos: [string, string][] = [
            ["f", "MY"],
            ["fo", "MZXQ"],
            ["foo", "MZXW6"],
            ["foob", "MZXW6YQ"],
            ["fooba", "MZXW6YTB"],
            ["foobar", "MZXW6YTBOI"],
        ];
        for (const [texto, esperado] of casos) assert.equal(base32(Buffer.from(texto)), esperado);
    });

    test("aceita um passo de folga para cada lado e recusa o resto", () => {
        const segredo = Buffer.from("12345678901234567890");
        const agora = 1_800_000_000_000;
        const passo = passoAtual(agora);
        for (const d of [-1, 0, 1]) {
            assert.equal(
                conferirTotp(segredo, codigoNoPasso(segredo, passo + d), agora),
                passo + d,
            );
        }
        for (const d of [-2, 2]) {
            assert.equal(conferirTotp(segredo, codigoNoPasso(segredo, passo + d), agora), null);
        }
        assert.equal(conferirTotp(segredo, "12345", agora), null);
    });
});

describe("2FA: ativação", () => {
    test("admin sem 2FA não usa rota de admin e recebe o código para ativar", async () => {
        const admin = await criarAdmin();
        const r = await chamar("GET", "/admin/overview", { token: admin.token });
        assert.equal(r.status, 403);
        assert.equal(r.body.codigo, "2fa_obrigatorio");
    });

    test("ativar pede o código certo e a senha, e devolve dez códigos de recuperação", async () => {
        const admin = await criarAdmin();
        const config = await chamar("POST", "/me/2fa/configurar", { token: admin.token });
        assert.equal(config.status, 200);
        assert.match(config.body.uri, /^otpauth:\/\/totp\/ensina\.dev:/);
        assert.match(config.body.qrSvg, /^<svg/);
        const segredo = deBase32(config.body.segredo);

        const errado = await chamar("POST", "/me/2fa/ativar", {
            token: admin.token,
            cookie: admin.cookie,
            body: { codigo: codigoAgora(segredo, 5), senhaAtual: SENHA },
        });
        assert.equal(errado.status, 400);

        const semSenha = await chamar("POST", "/me/2fa/ativar", {
            token: admin.token,
            cookie: admin.cookie,
            body: { codigo: codigoAgora(segredo) },
        });
        assert.equal(semSenha.status, 403);

        const semCookie = await chamar("POST", "/me/2fa/ativar", {
            token: admin.token,
            body: { codigo: codigoAgora(segredo), senhaAtual: SENHA },
        });
        assert.equal(semCookie.status, 401);

        const ok = await chamar("POST", "/me/2fa/ativar", {
            token: admin.token,
            cookie: admin.cookie,
            body: { codigo: codigoAgora(segredo), senhaAtual: SENHA },
        });
        assert.equal(ok.status, 200);
        assert.equal(ok.body.codigosRecuperacao.length, 10);
        assert.ok(ok.cookie, "a sessão atual volta com cookie novo");

        const estado = await chamar("GET", "/me/2fa", { token: ok.body.token });
        assert.equal(estado.body.ativo, true);
        assert.equal(estado.body.codigosRestantes, 10);

        const deNovo = await chamar("POST", "/me/2fa/configurar", { token: ok.body.token });
        assert.equal(deNovo.status, 409);
    });

    test("depois de ativar, só a sessão nova usa o admin, e as antigas caem", async () => {
        const admin = await criarAdminComDoisFatores();

        assert.equal((await chamar("GET", "/admin/overview", { token: admin.token })).status, 200);

        const antigo = await chamar("GET", "/admin/overview", { token: admin.tokenAntigo });
        assert.equal(antigo.status, 403);
        assert.equal(antigo.body.codigo, "2fa_sessao");

        const refreshAntigo = await chamar("POST", "/refresh", { cookie: admin.cookieAntigo });
        assert.equal(refreshAntigo.status, 401);

        const refreshNovo = await chamar("POST", "/refresh", { cookie: admin.cookie });
        assert.equal(refreshNovo.status, 200);
        const comRefresh = await chamar("GET", "/admin/overview", {
            token: refreshNovo.body.token,
        });
        assert.equal(comRefresh.status, 200, "a sessão renovada continua verificada");
    });
});

describe("2FA: login", () => {
    test("a senha só abre o desafio, e o código do app fecha o login", async () => {
        const admin = await criarAdminComDoisFatores();

        const login = await chamar("POST", "/login", {
            body: { email: admin.email, password: SENHA },
        });
        assert.equal(login.status, 200);
        assert.equal(login.body.token, undefined);
        assert.equal(login.cookie, null);
        assert.match(login.body.desafio, /^[a-f0-9]{64}$/);

        const errado = await chamar("POST", "/login/2fa", {
            body: { desafio: login.body.desafio, codigo: codigoAgora(admin.segredo, 5) },
        });
        assert.equal(errado.status, 401);

        const ok = await chamar("POST", "/login/2fa", {
            body: { desafio: login.body.desafio, codigo: codigoAgora(admin.segredo, 1) },
        });
        assert.equal(ok.status, 200);
        assert.ok(ok.body.token);
        assert.ok(ok.cookie);
        assert.equal(
            (await chamar("GET", "/admin/overview", { token: ok.body.token })).status,
            200,
        );

        const reuso = await chamar("POST", "/login/2fa", {
            body: { desafio: login.body.desafio, codigo: codigoAgora(admin.segredo, 1) },
        });
        assert.equal(reuso.status, 401, "o desafio já foi usado");
    });

    test("o mesmo código do app não entra duas vezes", async () => {
        const admin = await criarAdminComDoisFatores();
        const codigo = codigoAgora(admin.segredo, 1);

        const primeiro = await chamar("POST", "/login", {
            body: { email: admin.email, password: SENHA },
        });
        const ok = await chamar("POST", "/login/2fa", {
            body: { desafio: primeiro.body.desafio, codigo },
        });
        assert.equal(ok.status, 200);

        const segundo = await chamar("POST", "/login", {
            body: { email: admin.email, password: SENHA },
        });
        const repetido = await chamar("POST", "/login/2fa", {
            body: { desafio: segundo.body.desafio, codigo },
        });
        assert.equal(repetido.status, 401);
    });

    test("código de recuperação entra uma vez só, com ou sem hífen", async () => {
        const admin = await criarAdminComDoisFatores();
        const [codigo] = admin.codigosRecuperacao;

        const login = await chamar("POST", "/login", {
            body: { email: admin.email, password: SENHA },
        });
        const ok = await chamar("POST", "/login/2fa", {
            body: { desafio: login.body.desafio, codigo: codigo.replace("-", "").toUpperCase() },
        });
        assert.equal(ok.status, 200);
        assert.equal(ok.body.codigosRestantes, 9);

        const outro = await chamar("POST", "/login", {
            body: { email: admin.email, password: SENHA },
        });
        const gasto = await chamar("POST", "/login/2fa", {
            body: { desafio: outro.body.desafio, codigo },
        });
        assert.equal(gasto.status, 401);
    });

    test("cinco códigos errados travam a conta, mesmo com a senha certa no meio", async () => {
        const admin = await criarAdminComDoisFatores();
        for (let i = 0; i < 5; i++) {
            const login = await chamar("POST", "/login", {
                body: { email: admin.email, password: SENHA },
            });
            assert.equal(login.status, 200);
            const errado = await chamar("POST", "/login/2fa", {
                body: { desafio: login.body.desafio, codigo: "000000" },
            });
            assert.equal(errado.status, 401);
        }
        const travado = await chamar("POST", "/login", {
            body: { email: admin.email, password: SENHA },
        });
        assert.equal(travado.status, 429);
    });

    test("desafio inexistente ou vencido não abre sessão", async () => {
        const admin = await criarAdminComDoisFatores();
        const inventado = await chamar("POST", "/login/2fa", {
            body: { desafio: "a".repeat(64), codigo: codigoAgora(admin.segredo) },
        });
        assert.equal(inventado.status, 401);

        const login = await chamar("POST", "/login", {
            body: { email: admin.email, password: SENHA },
        });
        const { db, tokens, eq } = await app();
        await db
            .update(tokens)
            .set({ expiredAt: new Date(Date.now() - 1000) })
            .where(eq(tokens.type, "login_2fa"));
        const vencido = await chamar("POST", "/login/2fa", {
            body: { desafio: login.body.desafio, codigo: codigoAgora(admin.segredo, 1) },
        });
        assert.equal(vencido.status, 401);
    });
});

describe("2FA: gestão", () => {
    test("novos códigos de recuperação pedem um código válido", async () => {
        const admin = await criarAdminComDoisFatores();
        const errado = await chamar("POST", "/me/2fa/codigos", {
            token: admin.token,
            body: { codigo: "000000" },
        });
        assert.equal(errado.status, 403);

        const ok = await chamar("POST", "/me/2fa/codigos", {
            token: admin.token,
            body: { codigo: codigoAgora(admin.segredo, 1) },
        });
        assert.equal(ok.status, 200);
        assert.equal(ok.body.codigosRecuperacao.length, 10);
        assert.notDeepEqual(ok.body.codigosRecuperacao, admin.codigosRecuperacao);
    });

    test("desativar pede código e senha, e o admin volta a ficar bloqueado", async () => {
        const admin = await criarAdminComDoisFatores();

        const semSenha = await chamar("POST", "/me/2fa/desativar", {
            token: admin.token,
            body: { codigo: codigoAgora(admin.segredo, 1) },
        });
        assert.equal(semSenha.status, 403);

        const ok = await chamar("POST", "/me/2fa/desativar", {
            token: admin.token,
            body: { codigo: codigoAgora(admin.segredo, 1), senhaAtual: SENHA },
        });
        assert.equal(ok.status, 200);

        const bloqueado = await chamar("GET", "/admin/overview", { token: admin.token });
        assert.equal(bloqueado.status, 403);
        assert.equal(bloqueado.body.codigo, "2fa_obrigatorio");

        const login = await chamar("POST", "/login", {
            body: { email: admin.email, password: SENHA },
        });
        assert.ok(login.body.token, "sem 2FA o login volta a ser só a senha");
    });
});
