import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";

// A configured provider lets the social login start, which is where the screen
// language is stored. The env is read on the app's first import.
process.env.GOOGLE_CLIENT_ID = "test-client-id";
process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";
const { startTestServer } = await import("./helpers/server.ts");
const { limparBanco } = await import("./helpers/db.ts");

let server: Awaited<ReturnType<typeof startTestServer>>;

async function app() {
    const { db } = await import("../db.ts");
    const { users } = await import("../schema.ts");
    const { eq } = await import("drizzle-orm");
    const { emailService } = await import("../src/services/email.service.ts");
    const { vincularContaSocial } = await import("../src/services/contaSocial.service.ts");
    return { db, users, eq, emailService, vincularContaSocial };
}

const PASSWORD = "Senhaforte123!";
let seq = 0;

async function call(
    method: string,
    path: string,
    { token, locale, body }: { token?: string; locale?: string; body?: unknown } = {},
) {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (locale) headers["X-Locale"] = locale;
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const res = await fetch(`${server.base}${path}`, {
        method,
        headers,
        redirect: "manual",
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json: unknown;
    try {
        json = text ? JSON.parse(text) : null;
    } catch {
        json = text;
    }
    return { status: res.status, body: json as Record<string, unknown>, headers: res.headers };
}

async function signUp(locale?: string) {
    const n = ++seq;
    const email = `locale_${n}_${Date.now()}@example.com`;
    const res = await call("POST", "/register", {
        locale,
        body: {
            name: "Aluno Idioma",
            email,
            username: `idioma_${n}`,
            password: PASSWORD,
            birthDate: "1995-05-05",
            gender: "outro",
            phone: "(11) 97777-6666",
        },
    });
    assert.equal(res.status, 201);
    return email;
}

async function savedLocale(email: string) {
    const { db, users, eq } = await app();
    const [user] = await db
        .select({ locale: users.locale })
        .from(users)
        .where(eq(users.email, email));
    return user?.locale;
}

async function signIn(email: string) {
    const { db, users, eq } = await app();
    await db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.email, email));
    const res = await call("POST", "/login", { body: { email, password: PASSWORD } });
    assert.equal(res.status, 200);
    return res.body.token as string;
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

describe("account language", () => {
    test("sign-up saves the screen language and sends the email in it", async (t) => {
        const { emailService } = await app();
        const sent = t.mock.method(emailService, "sendVerification", async () => {});

        const english = await signUp("en");
        assert.equal(await savedLocale(english), "en");
        assert.equal(sent.mock.calls[0].arguments[2], "en");

        const portuguese = await signUp();
        assert.equal(await savedLocale(portuguese), "pt-BR");
        assert.equal(sent.mock.calls[1].arguments[2], "pt-BR");
    });

    test("GET /me tells the account language", async () => {
        const token = await signIn(await signUp("en"));
        const me = await call("GET", "/me", { token });
        assert.equal(me.status, 200);
        assert.equal(me.body.locale, "en");
    });

    test("PUT /me/locale changes the language, and only to a known one", async () => {
        const email = await signUp();
        const token = await signIn(email);

        const changed = await call("PUT", "/me/locale", { token, body: { locale: "en" } });
        assert.equal(changed.status, 200);
        assert.deepEqual(changed.body, { locale: "en" });
        assert.equal(await savedLocale(email), "en");

        const unknown = await call("PUT", "/me/locale", { token, body: { locale: "fr" } });
        assert.equal(unknown.status, 400);
        assert.equal(await savedLocale(email), "en");

        const anonymous = await call("PUT", "/me/locale", { body: { locale: "pt-BR" } });
        assert.equal(anonymous.status, 401);
    });

    test("recovery emails go in the account language, not the screen one", async (t) => {
        const { emailService } = await app();
        const sent = t.mock.method(emailService, "sendResetCode", async () => {});
        const email = await signUp("en");
        await signIn(email);

        const res = await call("POST", "/forgot-password-otp", {
            locale: "pt-BR",
            body: { email, canal: "email" },
        });
        assert.equal(res.status, 200);
        assert.equal(sent.mock.callCount(), 1);
        assert.equal(sent.mock.calls[0].arguments[2], "en");
    });

    test("social login keeps the language of the screen where it started", async () => {
        const start = await call("GET", "/auth/google?locale=en");
        assert.equal(start.status, 302);
        assert.match(start.headers.get("set-cookie") ?? "", /oauth_locale=en/);

        const { vincularContaSocial } = await app();
        const created = await vincularContaSocial(
            "google",
            {
                providerId: "google-locale-1",
                email: `social_${Date.now()}@example.com`,
                name: "Aluna",
            },
            "en",
        );
        assert.equal(created.locale, "en");

        const fallback = await vincularContaSocial("google", {
            providerId: "google-locale-2",
            email: `social2_${Date.now()}@example.com`,
            name: "Aluno",
        });
        assert.equal(fallback.locale, "pt-BR");
    });
});
