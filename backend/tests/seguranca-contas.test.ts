import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { startTestServer, extractRefreshCookie } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;

// Os módulos do app só podem ser importados depois de o env de teste estar pronto.
async function app() {
    const { db } = await import("../db.ts");
    const { users, tokens, oauthAccounts } = await import("../schema.ts");
    const { and, eq, sql } = await import("drizzle-orm");
    const { authService } = await import("../src/services/auth.service.ts");
    const { vincularContaSocial } = await import("../src/services/contaSocial.service.ts");
    return { db, users, tokens, oauthAccounts, and, eq, sql, authService, vincularContaSocial };
}

const SENHA = "Senhaforte123!";
const NOVA_SENHA = "Novasenha456!";
let seq = 0;

async function criarUsuario({ verificado }: { verificado: boolean }) {
    const email = `aluna_${++seq}_${Math.round(performance.now() * 1000)}@example.com`;
    const res = await server.request("POST", "/register", {
        body: {
            name: "Aluna Teste",
            email,
            username: `aluna_${seq}`,
            password: SENHA,
            birthDate: "1990-01-01",
            gender: "feminino",
            phone: "(11) 98888-7777",
        },
    });
    assert.equal(res.status, 201);
    const { db, users, eq } = await app();
    if (verificado) {
        await db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.email, email));
    }
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
}

async function codigosDe(userId: string) {
    const { db, tokens, and, eq } = await app();
    return db
        .select()
        .from(tokens)
        .where(and(eq(tokens.userId, userId), eq(tokens.type, "password_reset_otp")));
}

const outroCodigo = (otp: string) => (otp === "111111" ? "222222" : "111111");

before(async () => {
    server = await startTestServer();
});
after(async () => {
    await server.close();
});
beforeEach(async () => {
    await limparBanco();
});

describe("/refresh só aceita token de sessão", () => {
    test("o código de 6 dígitos no cookie não vira sessão", async () => {
        const user = await criarUsuario({ verificado: true });
        const { authService } = await app();
        const otp = await authService.gerarOtpResetSenha(user.id);
        assert.ok(otp);

        const res = await server.request("POST", "/refresh", {
            cookie: `refreshToken=${user.id}:${otp}`,
        });
        assert.equal(res.status, 401);
    });

    test("o token de sessão de verdade segue funcionando", async () => {
        const user = await criarUsuario({ verificado: true });
        const login = await server.request("POST", "/login", {
            body: { email: user.email, password: SENHA },
        });
        const cookie = extractRefreshCookie(login.setCookie);
        assert.ok(cookie);

        const res = await server.request("POST", "/refresh", { cookie });
        assert.equal(res.status, 200);
        assert.ok(res.body.token);
    });
});

describe("código de 6 dígitos", () => {
    test("o quinto erro mata o código, e o certo deixa de valer", async () => {
        const user = await criarUsuario({ verificado: true });
        const { authService } = await app();
        const otp = (await authService.gerarOtpResetSenha(user.id))!;

        for (let i = 0; i < 5; i++) {
            const errado = await server.request("POST", "/reset-password-otp", {
                body: { email: user.email, otp: outroCodigo(otp), password: NOVA_SENHA },
            });
            assert.equal(errado.status, 400);
        }
        const certo = await server.request("POST", "/reset-password-otp", {
            body: { email: user.email, otp, password: NOVA_SENHA },
        });
        assert.equal(certo.status, 400);
    });

    test("o certo depois de quatro erros redefine a senha", async () => {
        const user = await criarUsuario({ verificado: true });
        const { authService } = await app();
        const otp = (await authService.gerarOtpResetSenha(user.id))!;

        for (let i = 0; i < 4; i++) {
            await server.request("POST", "/reset-password-otp", {
                body: { email: user.email, otp: outroCodigo(otp), password: NOVA_SENHA },
            });
        }
        const certo = await server.request("POST", "/reset-password-otp", {
            body: { email: user.email, otp, password: NOVA_SENHA },
        });
        assert.equal(certo.status, 200);

        const login = await server.request("POST", "/login", {
            body: { email: user.email, password: NOVA_SENHA },
        });
        assert.equal(login.status, 200);
    });

    test("pedido repetido em menos de um minuto não gera código novo", async () => {
        const user = await criarUsuario({ verificado: true });
        for (let i = 0; i < 2; i++) {
            const res = await server.request("POST", "/forgot-password-otp", {
                body: { email: user.email, canal: "email" },
            });
            assert.equal(res.status, 200);
        }
        assert.equal((await codigosDe(user.id)).length, 1);
    });

    test("no máximo 10 códigos por dia por conta", async () => {
        const user = await criarUsuario({ verificado: true });
        const { db, tokens, and, eq, sql, authService } = await app();

        for (let i = 0; i < 10; i++) {
            assert.ok(await authService.gerarOtpResetSenha(user.id));
            // Recua os códigos dois minutos para o próximo pedido passar do intervalo.
            await db
                .update(tokens)
                .set({ expiredAt: sql`${tokens.expiredAt} - interval '2 minutes'` })
                .where(and(eq(tokens.userId, user.id), eq(tokens.type, "password_reset_otp")));
        }
        assert.equal(await authService.gerarOtpResetSenha(user.id), null);
        const ativos = (await codigosDe(user.id)).filter((t) => t.usedAt === null);
        assert.equal(ativos.length, 1);
    });
});

describe("login social", () => {
    test("conta nunca verificada é adotada sem o que o cadastro preencheu", async () => {
        const user = await criarUsuario({ verificado: false });
        const { db, tokens, oauthAccounts, eq, vincularContaSocial } = await app();

        const adotada = await vincularContaSocial("google", {
            providerId: "google-1",
            email: user.email,
            name: "Dona do Email",
        });

        assert.equal(adotada.id, user.id);
        assert.ok(adotada.emailVerifiedAt);
        assert.equal(adotada.passwordHash, null);
        assert.equal(adotada.phone, null);
        assert.equal(adotada.username, null);
        assert.equal(adotada.birthDate, null);
        assert.equal(adotada.gender, null);
        assert.equal(adotada.name, "Dona do Email");
        assert.equal((await db.select().from(tokens).where(eq(tokens.userId, user.id))).length, 0);
        const vinculos = await db
            .select()
            .from(oauthAccounts)
            .where(eq(oauthAccounts.userId, user.id));
        assert.equal(vinculos.length, 1);

        const login = await server.request("POST", "/login", {
            body: { email: user.email, password: SENHA },
        });
        assert.notEqual(login.status, 200);
    });

    test("conta verificada mantém senha e telefone", async () => {
        const user = await criarUsuario({ verificado: true });
        const { vincularContaSocial } = await app();

        const vinculada = await vincularContaSocial("github", {
            providerId: "github-1",
            email: user.email,
            name: "Outro Nome",
        });

        assert.equal(vinculada.id, user.id);
        assert.ok(vinculada.passwordHash);
        assert.equal(vinculada.phone, user.phone);
        assert.equal(vinculada.name, user.name);
    });

    test("vínculo existente devolve o mesmo usuário", async () => {
        const { vincularContaSocial } = await app();
        const dados = { providerId: "google-2", email: "nova@example.com", name: "Nova" };
        const primeira = await vincularContaSocial("google", dados);
        const segunda = await vincularContaSocial("google", {
            ...dados,
            email: "outro@example.com",
        });
        assert.equal(segunda.id, primeira.id);
    });
});
