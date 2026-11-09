import { test, describe, before, after, beforeEach, type TestContext } from "node:test";
import assert from "node:assert/strict";
import { startTestServer } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;

// The app modules can only be imported after the test env is ready.
async function app() {
    const { db } = await import("../db.ts");
    const { users } = await import("../schema.ts");
    const { eq } = await import("drizzle-orm");
    const { authService } = await import("../src/services/auth.service.ts");
    const { emailService } = await import("../src/services/email.service.ts");
    const { whatsappService } = await import("../src/services/whatsapp.service.ts");
    return { db, users, eq, authService, emailService, whatsappService };
}

// The senders become spies: the test sees what would go out and where, without sending anything.
async function spyOnSends(t: TestContext) {
    const { emailService, whatsappService } = await app();
    return {
        whatsappSenha: t.mock.method(whatsappService, "sendResetCode", async () => {}),
        whatsappTelefone: t.mock.method(whatsappService, "sendPhoneCode", async () => {}),
        emailSenha: t.mock.method(emailService, "sendResetCode", async () => {}),
        avisoTelefone: t.mock.method(emailService, "sendPhoneChangedNotice", async () => {}),
        avisoSenha: t.mock.method(emailService, "sendPasswordChangedNotice", async () => {}),
    };
}

const PASSWORD = "Senhaforte123!";
const PHONE = "(11) 98888-7777";
let seq = 0;

async function createSignedInUser() {
    const email = `aluno_${++seq}_${Math.round(performance.now() * 1000)}@example.com`;
    await server.request("POST", "/register", {
        body: {
            name: "Aluno Teste",
            email,
            username: `aluno_${seq}`,
            password: PASSWORD,
            birthDate: "1990-01-01",
            gender: "masculino",
            phone: PHONE,
        },
    });
    const { db, users, eq } = await app();
    await db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.email, email));
    const login = await server.request("POST", "/login", { body: { email, password: PASSWORD } });
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return { user, token: login.body.token as string };
}

async function call(method: string, path: string, token: string, body?: unknown) {
    const res = await fetch(`${server.base}${path}`, {
        method: method,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
    });
    return { status: res.status, body: await res.json().catch(() => null) };
}

async function markPhoneVerified(userId: string) {
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

describe("password code over WhatsApp", () => {
    test("an unverified phone does not get it: the code goes by email", async (t) => {
        const sent = await spyOnSends(t);
        const { user } = await createSignedInUser();

        const res = await server.request("POST", "/forgot-password-otp", {
            body: { email: user.email, canal: "whatsapp" },
        });
        assert.equal(res.status, 200);
        assert.equal(sent.whatsappSenha.mock.callCount(), 0);
        assert.equal(sent.emailSenha.mock.callCount(), 1);
    });

    test("a verified phone gets the code over WhatsApp", async (t) => {
        const sent = await spyOnSends(t);
        const { user } = await createSignedInUser();
        await markPhoneVerified(user.id);

        await server.request("POST", "/forgot-password-otp", {
            body: { email: user.email, canal: "whatsapp" },
        });
        assert.equal(sent.whatsappSenha.mock.callCount(), 1);
        assert.equal(sent.whatsappSenha.mock.calls[0].arguments[0], PHONE);
    });

    test("resetting the password notifies the account email", async (t) => {
        const sent = await spyOnSends(t);
        const { user } = await createSignedInUser();
        const { authService } = await app();
        const otp = await authService.createPasswordResetCode(user.id);

        const res = await server.request("POST", "/reset-password-otp", {
            body: { email: user.email, otp, password: "Novasenha456!" },
        });
        assert.equal(res.status, 200);
        assert.equal(sent.avisoSenha.mock.callCount(), 1);
        assert.equal(sent.avisoSenha.mock.calls[0].arguments[0], user.email);
    });
});

describe("phone verification", () => {
    test("the code that arrives over WhatsApp confirms the phone", async (t) => {
        const sent = await spyOnSends(t);
        const { token } = await createSignedInUser();

        const request = await call("POST", "/me/telefone/codigo", token);
        assert.equal(request.status, 200);
        assert.equal(sent.whatsappTelefone.mock.callCount(), 1);
        const [phone, code] = sent.whatsappTelefone.mock.calls[0].arguments;
        assert.equal(phone, PHONE);

        const confirmed = await call("POST", "/me/telefone/verificar", token, { codigo: code });
        assert.equal(confirmed.status, 200);
        assert.ok(confirmed.body.phoneVerifiedAt);

        const again = await call("POST", "/me/telefone/codigo", token);
        assert.equal(again.status, 409);
    });

    test("a wrong code does not confirm", async (t) => {
        const sent = await spyOnSends(t);
        const { token } = await createSignedInUser();
        await call("POST", "/me/telefone/codigo", token);
        const [, code] = sent.whatsappTelefone.mock.calls[0].arguments;
        const wrong = code === "111111" ? "222222" : "111111";

        const res = await call("POST", "/me/telefone/verificar", token, { codigo: wrong });
        assert.equal(res.status, 400);
        const me = await call("GET", "/me", token);
        assert.equal(me.body.phoneVerifiedAt, null);
    });

    test("/me tells whether the account has a password and the phone was verified", async () => {
        const { token } = await createSignedInUser();
        const me = await call("GET", "/me", token);
        assert.equal(me.body.temSenha, true);
        assert.equal(me.body.phoneVerifiedAt, null);
    });
});

describe("changing the phone", () => {
    test("asks for the current password, resets the verification and notifies the email", async (t) => {
        const sent = await spyOnSends(t);
        const { user, token } = await createSignedInUser();
        await markPhoneVerified(user.id);
        const newPhone = "(21) 97777-6666";

        const withoutPassword = await call("PUT", "/me/telefone", token, { phone: newPhone });
        assert.equal(withoutPassword.status, 403);
        const wrongPassword = await call("PUT", "/me/telefone", token, {
            phone: newPhone,
            senhaAtual: "Outrasenha1!",
        });
        assert.equal(wrongPassword.status, 403);

        const changed = await call("PUT", "/me/telefone", token, {
            phone: newPhone,
            senhaAtual: PASSWORD,
        });
        assert.equal(changed.status, 200);
        assert.equal(changed.body.phone, newPhone);
        assert.equal(changed.body.phoneVerifiedAt, null);
        assert.equal(sent.avisoTelefone.mock.callCount(), 1);
        assert.equal(sent.avisoTelefone.mock.calls[0].arguments[0], user.email);
    });

    test("complete-profile does not change a phone that already exists", async () => {
        const { user, token } = await createSignedInUser();
        const profile = {
            username: user.username,
            birthDate: "1990-01-01",
            gender: "masculino",
        };

        const other = await call("POST", "/me/complete-profile", token, {
            ...profile,
            phone: "(21) 97777-6666",
        });
        assert.equal(other.status, 403);

        const same = await call("POST", "/me/complete-profile", token, {
            ...profile,
            phone: "11988887777",
        });
        assert.equal(same.status, 200);
    });
});
