import { test, describe, before, after, beforeEach, type TestContext } from "node:test";
import assert from "node:assert/strict";
import { startTestServer } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;

// Os módulos do app só podem ser importados depois de o env de teste estar pronto.
async function app() {
    const { db } = await import("../db.ts");
    const { users } = await import("../schema.ts");
    const { eq } = await import("drizzle-orm");
    const { authService } = await import("../src/services/auth.service.ts");
    const { emailService } = await import("../src/services/email.service.ts");
    const { whatsappService } = await import("../src/services/whatsapp.service.ts");
    return { db, users, eq, authService, emailService, whatsappService };
}

// Os envios viram espiões: o teste vê o que sairia e para onde, sem mandar nada.
async function espionarEnvios(t: TestContext) {
    const { emailService, whatsappService } = await app();
    return {
        whatsappSenha: t.mock.method(whatsappService, "sendResetCode", async () => {}),
        whatsappTelefone: t.mock.method(whatsappService, "sendPhoneCode", async () => {}),
        emailSenha: t.mock.method(emailService, "sendResetCode", async () => {}),
        avisoTelefone: t.mock.method(emailService, "sendPhoneChangedNotice", async () => {}),
        avisoSenha: t.mock.method(emailService, "sendPasswordChangedNotice", async () => {}),
    };
}

const SENHA = "Senhaforte123!";
const TELEFONE = "(11) 98888-7777";
let seq = 0;

async function criarUsuarioLogado() {
    const email = `aluno_${++seq}_${Math.round(performance.now() * 1000)}@example.com`;
    await server.request("POST", "/register", {
        body: {
            name: "Aluno Teste",
            email,
            username: `aluno_${seq}`,
            password: SENHA,
            birthDate: "1990-01-01",
            gender: "masculino",
            phone: TELEFONE,
        },
    });
    const { db, users, eq } = await app();
    await db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.email, email));
    const login = await server.request("POST", "/login", { body: { email, password: SENHA } });
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return { user, token: login.body.token as string };
}

async function chamar(metodo: string, path: string, token: string, body?: unknown) {
    const res = await fetch(`${server.base}${path}`, {
        method: metodo,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
    });
    return { status: res.status, body: await res.json().catch(() => null) };
}

async function marcarTelefoneVerificado(userId: string) {
    const { db, users, eq } = await app();
    await db.update(users).set({ phoneVerifiedAt: new Date() }).where(eq(users.id, userId));
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

describe("código de senha por WhatsApp", () => {
    test("telefone não verificado não recebe: o código vai por email", async (t) => {
        const envios = await espionarEnvios(t);
        const { user } = await criarUsuarioLogado();

        const res = await server.request("POST", "/forgot-password-otp", {
            body: { email: user.email, canal: "whatsapp" },
        });
        assert.equal(res.status, 200);
        assert.equal(envios.whatsappSenha.mock.callCount(), 0);
        assert.equal(envios.emailSenha.mock.callCount(), 1);
    });

    test("telefone verificado recebe o código por WhatsApp", async (t) => {
        const envios = await espionarEnvios(t);
        const { user } = await criarUsuarioLogado();
        await marcarTelefoneVerificado(user.id);

        await server.request("POST", "/forgot-password-otp", {
            body: { email: user.email, canal: "whatsapp" },
        });
        assert.equal(envios.whatsappSenha.mock.callCount(), 1);
        assert.equal(envios.whatsappSenha.mock.calls[0].arguments[0], TELEFONE);
    });

    test("redefinir a senha avisa o email da conta", async (t) => {
        const envios = await espionarEnvios(t);
        const { user } = await criarUsuarioLogado();
        const { authService } = await app();
        const otp = await authService.gerarOtpResetSenha(user.id);

        const res = await server.request("POST", "/reset-password-otp", {
            body: { email: user.email, otp, password: "Novasenha456!" },
        });
        assert.equal(res.status, 200);
        assert.equal(envios.avisoSenha.mock.callCount(), 1);
        assert.equal(envios.avisoSenha.mock.calls[0].arguments[0], user.email);
    });
});

describe("verificação do telefone", () => {
    test("o código que chega por WhatsApp confirma o telefone", async (t) => {
        const envios = await espionarEnvios(t);
        const { token } = await criarUsuarioLogado();

        const pedido = await chamar("POST", "/me/telefone/codigo", token);
        assert.equal(pedido.status, 200);
        assert.equal(envios.whatsappTelefone.mock.callCount(), 1);
        const [telefone, codigo] = envios.whatsappTelefone.mock.calls[0].arguments;
        assert.equal(telefone, TELEFONE);

        const confirmado = await chamar("POST", "/me/telefone/verificar", token, { codigo });
        assert.equal(confirmado.status, 200);
        assert.ok(confirmado.body.phoneVerifiedAt);

        const denovo = await chamar("POST", "/me/telefone/codigo", token);
        assert.equal(denovo.status, 409);
    });

    test("código errado não confirma", async (t) => {
        const envios = await espionarEnvios(t);
        const { token } = await criarUsuarioLogado();
        await chamar("POST", "/me/telefone/codigo", token);
        const [, codigo] = envios.whatsappTelefone.mock.calls[0].arguments;
        const errado = codigo === "111111" ? "222222" : "111111";

        const res = await chamar("POST", "/me/telefone/verificar", token, { codigo: errado });
        assert.equal(res.status, 400);
        const me = await chamar("GET", "/me", token);
        assert.equal(me.body.phoneVerifiedAt, null);
    });

    test("o /me diz se a conta tem senha e se o telefone foi verificado", async () => {
        const { token } = await criarUsuarioLogado();
        const me = await chamar("GET", "/me", token);
        assert.equal(me.body.temSenha, true);
        assert.equal(me.body.phoneVerifiedAt, null);
    });
});

describe("troca do telefone", () => {
    test("pede a senha atual, zera a verificação e avisa o email", async (t) => {
        const envios = await espionarEnvios(t);
        const { user, token } = await criarUsuarioLogado();
        await marcarTelefoneVerificado(user.id);
        const novo = "(21) 97777-6666";

        const semSenha = await chamar("PUT", "/me/telefone", token, { phone: novo });
        assert.equal(semSenha.status, 403);
        const senhaErrada = await chamar("PUT", "/me/telefone", token, {
            phone: novo,
            senhaAtual: "Outrasenha1!",
        });
        assert.equal(senhaErrada.status, 403);

        const trocado = await chamar("PUT", "/me/telefone", token, {
            phone: novo,
            senhaAtual: SENHA,
        });
        assert.equal(trocado.status, 200);
        assert.equal(trocado.body.phone, novo);
        assert.equal(trocado.body.phoneVerifiedAt, null);
        assert.equal(envios.avisoTelefone.mock.callCount(), 1);
        assert.equal(envios.avisoTelefone.mock.calls[0].arguments[0], user.email);
    });

    test("o complete-profile não troca um telefone que já existe", async () => {
        const { user, token } = await criarUsuarioLogado();
        const perfil = {
            username: user.username,
            birthDate: "1990-01-01",
            gender: "masculino",
        };

        const outro = await chamar("POST", "/me/complete-profile", token, {
            ...perfil,
            phone: "(21) 97777-6666",
        });
        assert.equal(outro.status, 403);

        const mesmo = await chamar("POST", "/me/complete-profile", token, {
            ...perfil,
            phone: "11988887777",
        });
        assert.equal(mesmo.status, 200);
    });
});
