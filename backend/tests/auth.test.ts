import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { startTestServer, extractRefreshCookie } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;

let seq = 0;
const novoUsuario = (over: Record<string, unknown> = {}) => ({
    name: "Maria Silva",
    email: `maria_${++seq}_${Math.round(performance.now() * 1000)}@email.com`,
    username: `maria_${seq}`,
    password: "Senhaforte123!",
    birthDate: "1990-01-01",
    gender: "feminino",
    phone: "(11) 98888-7777",
    ...over,
});

// Marca o email como verificado direto no banco, para testar o login.
async function verificarEmail(email: string) {
    const { db } = await import("../db.ts");
    const { users } = await import("../schema.ts");
    const { eq } = await import("drizzle-orm");
    await db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.email, email));
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

describe("POST /register", () => {
    test("cria usuário com os campos obrigatórios e retorna 201", async () => {
        const dados = novoUsuario();
        const res = await server.request("POST", "/register", { body: dados });

        assert.equal(res.status, 201);
        assert.equal(res.body.user.email, dados.email);
        // Não deve vazar hash de senha nem logar automaticamente (fluxo hard)
        assert.equal(res.body.user.passwordHash, undefined);
        assert.equal(res.body.token, undefined);
        assert.equal(extractRefreshCookie(res.setCookie), null);
    });

    test("rejeita cadastro sem campos obrigatórios (400)", async () => {
        const res = await server.request("POST", "/register", {
            body: { name: "X", email: "x@email.com", password: "senhaforte123" },
        });
        assert.equal(res.status, 400);
    });

    test("rejeita email duplicado", async () => {
        const dados = novoUsuario();
        await server.request("POST", "/register", { body: dados });
        // Mesmo email, username diferente: deve barrar pela checagem de email.
        const res = await server.request("POST", "/register", {
            body: novoUsuario({ email: dados.email }),
        });
        assert.equal(res.status, 409);
    });
});

describe("POST /login", () => {
    test("bloqueia login com email não verificado (403)", async () => {
        const dados = novoUsuario();
        await server.request("POST", "/register", { body: dados });

        const res = await server.request("POST", "/login", {
            body: { email: dados.email, password: dados.password },
        });
        assert.equal(res.status, 403);
        assert.equal(extractRefreshCookie(res.setCookie), null);
    });

    test("permite login após verificar o email (200 + cookie)", async () => {
        const dados = novoUsuario();
        await server.request("POST", "/register", { body: dados });
        await verificarEmail(dados.email);

        const res = await server.request("POST", "/login", {
            body: { email: dados.email, password: dados.password },
        });
        assert.equal(res.status, 200);
        assert.ok(res.body.token, "deve retornar access token");
        assert.ok(extractRefreshCookie(res.setCookie), "deve setar cookie de refresh");
    });

    test("rejeita senha errada (401)", async () => {
        const dados = novoUsuario();
        await server.request("POST", "/register", { body: dados });
        await verificarEmail(dados.email);

        const res = await server.request("POST", "/login", {
            body: { email: dados.email, password: "senhaerrada999" },
        });
        assert.equal(res.status, 401);
    });

    test("rejeita usuário inexistente (401)", async () => {
        const res = await server.request("POST", "/login", {
            body: { email: "naoexiste@email.com", password: "senhaforte123" },
        });
        assert.equal(res.status, 401);
    });
});

describe("Lockout de conta", () => {
    // Lê o estado de lockout direto do banco.
    async function estadoLock(email: string) {
        const { db } = await import("../db.ts");
        const { users } = await import("../schema.ts");
        const { eq } = await import("drizzle-orm");
        const [u] = await db
            .select({ tentativas: users.failedLoginAttempts, lockedUntil: users.lockedUntil })
            .from(users)
            .where(eq(users.email, email));
        return u;
    }

    test("trava a conta com 429 após 5 senhas erradas", async () => {
        const dados = novoUsuario();
        await server.request("POST", "/register", { body: dados });
        await verificarEmail(dados.email);

        // 5 tentativas erradas: as 4 primeiras 401, a 5a trava
        for (let i = 0; i < 5; i++) {
            await server.request("POST", "/login", {
                body: { email: dados.email, password: "errada999" },
            });
        }

        // 6a tentativa (mesmo com a senha CERTA) deve bater no lock -> 429
        const res = await server.request("POST", "/login", {
            body: { email: dados.email, password: dados.password },
        });
        assert.equal(res.status, 429);

        const estado = await estadoLock(dados.email);
        assert.ok(
            estado.lockedUntil && estado.lockedUntil > new Date(),
            "lockedUntil deve estar no futuro",
        );
    });

    test("login bem-sucedido zera o contador de tentativas", async () => {
        const dados = novoUsuario();
        await server.request("POST", "/register", { body: dados });
        await verificarEmail(dados.email);

        // 2 erros (abaixo do limite), depois acerta
        await server.request("POST", "/login", {
            body: { email: dados.email, password: "errada1" },
        });
        await server.request("POST", "/login", {
            body: { email: dados.email, password: "errada2" },
        });

        let estado = await estadoLock(dados.email);
        assert.equal(estado.tentativas, 2);

        const ok = await server.request("POST", "/login", {
            body: { email: dados.email, password: dados.password },
        });
        assert.equal(ok.status, 200);

        estado = await estadoLock(dados.email);
        assert.equal(estado.tentativas, 0);
        assert.equal(estado.lockedUntil, null);
    });

    test("lockout expirado permite login novamente", async () => {
        const dados = novoUsuario();
        await server.request("POST", "/register", { body: dados });
        await verificarEmail(dados.email);

        // Trava manualmente com lockedUntil no PASSADO (simula lock expirado)
        const { db } = await import("../db.ts");
        const { users } = await import("../schema.ts");
        const { eq } = await import("drizzle-orm");
        await db
            .update(users)
            .set({ lockedUntil: new Date(Date.now() - 1000), failedLoginAttempts: 5 })
            .where(eq(users.email, dados.email));

        // Lock no passado nao bloqueia: login com senha certa deve funcionar
        const res = await server.request("POST", "/login", {
            body: { email: dados.email, password: dados.password },
        });
        assert.equal(res.status, 200);
    });
});

describe("POST /verify-email", () => {
    test("verifica email com token válido e libera o login", async () => {
        const dados = novoUsuario();
        // Captura o token puro interceptando o emailService via log não é trivial;
        // então geramos um token de verificação diretamente pelo service.
        await server.request("POST", "/register", { body: dados });

        const { authService } = await import("../src/services/auth.service.ts");
        const { db } = await import("../db.ts");
        const { users } = await import("../schema.ts");
        const { eq } = await import("drizzle-orm");
        const [u] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, dados.email));
        const token = await authService.gerarTokenVerificacao(u.id);

        const res = await server.request("POST", "/verify-email", { body: { token } });
        assert.equal(res.status, 200);

        // Agora o login deve funcionar
        const login = await server.request("POST", "/login", {
            body: { email: dados.email, password: dados.password },
        });
        assert.equal(login.status, 200);
    });

    test("rejeita token inválido (400)", async () => {
        const res = await server.request("POST", "/verify-email", {
            body: { token: "lixoinvalido" },
        });
        assert.equal(res.status, 400);
    });

    test("rejeita reuso do mesmo token (400)", async () => {
        const dados = novoUsuario();
        await server.request("POST", "/register", { body: dados });
        const { authService } = await import("../src/services/auth.service.ts");
        const { db } = await import("../db.ts");
        const { users } = await import("../schema.ts");
        const { eq } = await import("drizzle-orm");
        const [u] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, dados.email));
        const token = await authService.gerarTokenVerificacao(u.id);

        await server.request("POST", "/verify-email", { body: { token } });
        const segundo = await server.request("POST", "/verify-email", { body: { token } });
        assert.equal(segundo.status, 400);
    });
});

// Helper: registra, verifica e loga, devolvendo o cookie de refresh.
async function usuarioLogado(dados = novoUsuario()) {
    await server.request("POST", "/register", { body: dados });
    await verificarEmail(dados.email as string);
    const login = await server.request("POST", "/login", {
        body: { email: dados.email, password: dados.password },
    });
    return { dados, cookie: extractRefreshCookie(login.setCookie), token: login.body.token };
}

describe("POST /refresh", () => {
    test("renova o token com cookie válido (200 + novo cookie)", async () => {
        const { cookie } = await usuarioLogado();
        const res = await server.request("POST", "/refresh", { cookie: cookie! });
        assert.equal(res.status, 200);
        assert.ok(res.body.token);
        assert.ok(extractRefreshCookie(res.setCookie));
    });

    test("sem cookie retorna 401 (não 500)", async () => {
        const res = await server.request("POST", "/refresh", {});
        assert.equal(res.status, 401);
    });

    test("detecta reuso de token rotacionado", async () => {
        const { cookie } = await usuarioLogado();
        // Primeiro refresh: consome o cookie original e gera um novo
        const r1 = await server.request("POST", "/refresh", { cookie: cookie! });
        assert.equal(r1.status, 200);
        // Reusar o cookie ORIGINAL (já rotacionado) deve falhar
        const r2 = await server.request("POST", "/refresh", { cookie: cookie! });
        assert.equal(r2.status, 401);
    });
});

describe("POST /logout", () => {
    test("revoga o refresh token (refresh posterior falha)", async () => {
        const { cookie } = await usuarioLogado();
        const out = await server.request("POST", "/logout", { cookie: cookie! });
        assert.equal(out.status, 204);

        const res = await server.request("POST", "/refresh", { cookie: cookie! });
        assert.equal(res.status, 401);
    });
});

// Promove um usuário a admin direto no banco.
async function promoverAdmin(email: string) {
    const { db } = await import("../db.ts");
    const { users } = await import("../schema.ts");
    const { eq } = await import("drizzle-orm");
    await db.update(users).set({ role: "admin" }).where(eq(users.email, email));
}

describe("GET /users (RBAC)", () => {
    test("usuário comum recebe 403", async () => {
        const { token } = await usuarioLogado();
        const res = await fetch(`${server.base}/users`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        assert.equal(res.status, 403);
    });

    test("admin recebe 200 e a lista não expõe passwordHash", async () => {
        const dados = novoUsuario();
        await server.request("POST", "/register", { body: dados });
        await verificarEmail(dados.email);
        await promoverAdmin(dados.email);
        const login = await server.request("POST", "/login", {
            body: { email: dados.email, password: dados.password },
        });

        const res = await fetch(`${server.base}/users`, {
            headers: { Authorization: `Bearer ${login.body.token}` },
        });
        assert.equal(res.status, 200);
        const lista = await res.json();
        assert.ok(Array.isArray(lista));
        for (const u of lista) {
            assert.equal(u.passwordHash, undefined, "passwordHash não deve vazar");
        }
    });

    test("sem token retorna 401", async () => {
        const res = await fetch(`${server.base}/users`);
        assert.equal(res.status, 401);
    });
});

// Relato de produção: uma aluna que entrou pelo Google pediu para redefinir a senha,
// recebeu a mensagem de que o link tinha sido enviado, e nada chegou nunca. O motivo
// era o pedido ser descartado em silêncio quando a conta não tinha senha para
// redefinir. Ela não queria redefinir: queria passar a ter uma.
describe("Recuperação de senha em conta de login social", () => {
    // Simula quem entrou por provedor: sem senha, e com a conta social vinculada.
    async function contaSocial(provider = "google") {
        const dados = novoUsuario();
        await server.request("POST", "/register", { body: dados });
        await verificarEmail(dados.email);
        const { db } = await import("../db.ts");
        const { users, oauthAccounts } = await import("../schema.ts");
        const { eq } = await import("drizzle-orm");
        const [u] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, dados.email));
        await db.update(users).set({ passwordHash: null }).where(eq(users.id, u.id));
        await db.insert(oauthAccounts).values({ userId: u.id, provider, providerId: `id-${u.id}` });
        return { id: u.id, email: dados.email };
    }

    async function tokensDe(userId: string, tipo: string) {
        const { db } = await import("../db.ts");
        const { tokens } = await import("../schema.ts");
        const { and, eq } = await import("drizzle-orm");
        return db
            .select()
            .from(tokens)
            .where(and(eq(tokens.userId, userId), eq(tokens.type, tipo)));
    }

    test("pedido de conta sem senha passa a gerar o link, em vez de morrer calado", async () => {
        const conta = await contaSocial();
        assert.equal((await tokensDe(conta.id, "password_reset")).length, 0);

        const res = await server.request("POST", "/forgot-password", {
            body: { email: conta.email },
        });
        assert.equal(res.status, 200);
        assert.equal(
            (await tokensDe(conta.id, "password_reset")).length,
            1,
            "a conta sem senha precisa receber um link para criar uma",
        );
    });

    test("o link cria a senha e libera o login por email", async () => {
        const conta = await contaSocial();
        const { authService } = await import("../src/services/auth.service.ts");
        const token = await authService.gerarTokenResetSenha(conta.id);

        const troca = await server.request("POST", "/reset-password", {
            body: { token, password: "NovaSenha123!" },
        });
        assert.equal(troca.status, 200);

        const login = await server.request("POST", "/login", {
            body: { email: conta.email, password: "NovaSenha123!" },
        });
        assert.equal(login.status, 200);
    });

    // Criar senha não pode custar o acesso que ela já tinha.
    test("criar a senha não desvincula a conta social", async () => {
        const conta = await contaSocial();
        const { authService } = await import("../src/services/auth.service.ts");
        const token = await authService.gerarTokenResetSenha(conta.id);
        await server.request("POST", "/reset-password", {
            body: { token, password: "NovaSenha123!" },
        });

        const { db } = await import("../db.ts");
        const { oauthAccounts } = await import("../schema.ts");
        const { eq } = await import("drizzle-orm");
        const vinculos = await db
            .select()
            .from(oauthAccounts)
            .where(eq(oauthAccounts.userId, conta.id));
        assert.equal(vinculos.length, 1);
        assert.equal(vinculos[0].provider, "google");
    });

    test("o caminho do código de seis dígitos também atende conta sem senha", async () => {
        const conta = await contaSocial();
        const res = await server.request("POST", "/forgot-password-otp", {
            body: { email: conta.email, canal: "email" },
        });
        assert.equal(res.status, 200);
        assert.equal((await tokensDe(conta.id, "password_reset_otp")).length, 1);
    });

    // A resposta continua sem revelar se o email tem conta, que é o motivo de ela ser
    // genérica. O que mudou foi só o que acontece por baixo.
    test("email sem conta continua sem gerar token e com a mesma resposta", async () => {
        const conta = await contaSocial();
        const res = await server.request("POST", "/forgot-password", {
            body: { email: `naoexiste_${Date.now()}@email.com` },
        });
        assert.equal(res.status, 200);

        const comConta = await server.request("POST", "/forgot-password", {
            body: { email: conta.email },
        });
        assert.deepEqual(res.body, comConta.body, "as duas respostas precisam ser iguais");
    });
});
