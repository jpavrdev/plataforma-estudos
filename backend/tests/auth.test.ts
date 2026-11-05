import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { startTestServer, extractRefreshCookie } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;

let seq = 0;
const newUser = (over: Record<string, unknown> = {}) => ({
    name: "Maria Silva",
    email: `maria_${++seq}_${Math.round(performance.now() * 1000)}@email.com`,
    username: `maria_${seq}`,
    password: "Senhaforte123!",
    birthDate: "1990-01-01",
    gender: "feminino",
    phone: "(11) 98888-7777",
    ...over,
});

// Marks the email as verified straight in the database, to test the login.
async function markEmailVerified(email: string) {
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
    test("creates a user with the required fields and returns 201", async () => {
        const data = newUser();
        const res = await server.request("POST", "/register", { body: data });

        assert.equal(res.status, 201);
        assert.equal(res.body.user.email, data.email);
        // It must not leak the password hash or sign in automatically (hard flow)
        assert.equal(res.body.user.passwordHash, undefined);
        assert.equal(res.body.token, undefined);
        assert.equal(extractRefreshCookie(res.setCookie), null);
    });

    test("rejects a sign-up without the required fields (400)", async () => {
        const res = await server.request("POST", "/register", {
            body: { name: "X", email: "x@email.com", password: "senhaforte123" },
        });
        assert.equal(res.status, 400);
    });

    test("rejects a duplicate email", async () => {
        const data = newUser();
        await server.request("POST", "/register", { body: data });
        // Same email, different username: the email check has to block it.
        const res = await server.request("POST", "/register", {
            body: newUser({ email: data.email }),
        });
        assert.equal(res.status, 409);
    });
});

describe("POST /login", () => {
    test("blocks login with an unverified email (403)", async () => {
        const data = newUser();
        await server.request("POST", "/register", { body: data });

        const res = await server.request("POST", "/login", {
            body: { email: data.email, password: data.password },
        });
        assert.equal(res.status, 403);
        assert.equal(extractRefreshCookie(res.setCookie), null);
    });

    test("allows login after verifying the email (200 + cookie)", async () => {
        const data = newUser();
        await server.request("POST", "/register", { body: data });
        await markEmailVerified(data.email);

        const res = await server.request("POST", "/login", {
            body: { email: data.email, password: data.password },
        });
        assert.equal(res.status, 200);
        assert.ok(res.body.token, "must return an access token");
        assert.ok(extractRefreshCookie(res.setCookie), "must set the refresh cookie");
    });

    test("rejects a wrong password (401)", async () => {
        const data = newUser();
        await server.request("POST", "/register", { body: data });
        await markEmailVerified(data.email);

        const res = await server.request("POST", "/login", {
            body: { email: data.email, password: "senhaerrada999" },
        });
        assert.equal(res.status, 401);
    });

    test("rejects a missing user (401)", async () => {
        const res = await server.request("POST", "/login", {
            body: { email: "naoexiste@email.com", password: "senhaforte123" },
        });
        assert.equal(res.status, 401);
    });
});

describe("Account lockout", () => {
    // Reads the lockout state straight from the database.
    async function lockState(email: string) {
        const { db } = await import("../db.ts");
        const { users } = await import("../schema.ts");
        const { eq } = await import("drizzle-orm");
        const [u] = await db
            .select({ tentativas: users.failedLoginAttempts, lockedUntil: users.lockedUntil })
            .from(users)
            .where(eq(users.email, email));
        return u;
    }

    test("locks the account with 429 after 5 wrong passwords", async () => {
        const data = newUser();
        await server.request("POST", "/register", { body: data });
        await markEmailVerified(data.email);

        // 5 wrong attempts: the first 4 get 401, the 5th locks
        for (let i = 0; i < 5; i++) {
            await server.request("POST", "/login", {
                body: { email: data.email, password: "errada999" },
            });
        }

        // 6th attempt (even with the RIGHT password) must hit the lock -> 429
        const res = await server.request("POST", "/login", {
            body: { email: data.email, password: data.password },
        });
        assert.equal(res.status, 429);

        const state = await lockState(data.email);
        assert.ok(
            state.lockedUntil && state.lockedUntil > new Date(),
            "lockedUntil deve estar no futuro",
        );
    });

    test("a successful login resets the attempt counter", async () => {
        const data = newUser();
        await server.request("POST", "/register", { body: data });
        await markEmailVerified(data.email);

        // 2 mistakes (below the limit), then the right one
        await server.request("POST", "/login", {
            body: { email: data.email, password: "errada1" },
        });
        await server.request("POST", "/login", {
            body: { email: data.email, password: "errada2" },
        });

        let state = await lockState(data.email);
        assert.equal(state.tentativas, 2);

        const ok = await server.request("POST", "/login", {
            body: { email: data.email, password: data.password },
        });
        assert.equal(ok.status, 200);

        state = await lockState(data.email);
        assert.equal(state.tentativas, 0);
        assert.equal(state.lockedUntil, null);
    });

    test("an expired lockout allows login again", async () => {
        const data = newUser();
        await server.request("POST", "/register", { body: data });
        await markEmailVerified(data.email);

        // Locks by hand with lockedUntil in the PAST (simulates an expired lock)
        const { db } = await import("../db.ts");
        const { users } = await import("../schema.ts");
        const { eq } = await import("drizzle-orm");
        await db
            .update(users)
            .set({ lockedUntil: new Date(Date.now() - 1000), failedLoginAttempts: 5 })
            .where(eq(users.email, data.email));

        // A lock in the past does not block: login with the right password must work
        const res = await server.request("POST", "/login", {
            body: { email: data.email, password: data.password },
        });
        assert.equal(res.status, 200);
    });
});

describe("POST /verify-email", () => {
    test("verifies the email with a valid token and allows login", async () => {
        const data = newUser();
        // Capturing the raw token by intercepting the emailService through the log is not
        // simple, so the verification token comes straight from the service.
        await server.request("POST", "/register", { body: data });

        const { authService } = await import("../src/services/auth.service.ts");
        const { db } = await import("../db.ts");
        const { users } = await import("../schema.ts");
        const { eq } = await import("drizzle-orm");
        const [u] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, data.email));
        const token = await authService.createVerificationToken(u.id);

        const res = await server.request("POST", "/verify-email", { body: { token } });
        assert.equal(res.status, 200);

        // Now the login must work
        const login = await server.request("POST", "/login", {
            body: { email: data.email, password: data.password },
        });
        assert.equal(login.status, 200);
    });

    test("rejects an invalid token (400)", async () => {
        const res = await server.request("POST", "/verify-email", {
            body: { token: "lixoinvalido" },
        });
        assert.equal(res.status, 400);
    });

    test("rejects reusing the same token (400)", async () => {
        const data = newUser();
        await server.request("POST", "/register", { body: data });
        const { authService } = await import("../src/services/auth.service.ts");
        const { db } = await import("../db.ts");
        const { users } = await import("../schema.ts");
        const { eq } = await import("drizzle-orm");
        const [u] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, data.email));
        const token = await authService.createVerificationToken(u.id);

        await server.request("POST", "/verify-email", { body: { token } });
        const second = await server.request("POST", "/verify-email", { body: { token } });
        assert.equal(second.status, 400);
    });
});

// Helper: signs up, verifies and signs in, returning the refresh cookie.
async function signedInUser(data = newUser()) {
    await server.request("POST", "/register", { body: data });
    await markEmailVerified(data.email as string);
    const login = await server.request("POST", "/login", {
        body: { email: data.email, password: data.password },
    });
    return { dados: data, cookie: extractRefreshCookie(login.setCookie), token: login.body.token };
}

describe("POST /refresh", () => {
    test("renews the token with a valid cookie (200 + new cookie)", async () => {
        const { cookie } = await signedInUser();
        const res = await server.request("POST", "/refresh", { cookie: cookie! });
        assert.equal(res.status, 200);
        assert.ok(res.body.token);
        assert.ok(extractRefreshCookie(res.setCookie));
    });

    test("without a cookie returns 401 (not 500)", async () => {
        const res = await server.request("POST", "/refresh", {});
        assert.equal(res.status, 401);
    });

    test("detects reuse of a rotated token", async () => {
        const { cookie } = await signedInUser();
        // First refresh: uses the original cookie and creates a new one
        const r1 = await server.request("POST", "/refresh", { cookie: cookie! });
        assert.equal(r1.status, 200);
        // Reusing the ORIGINAL cookie (already rotated) must fail
        const r2 = await server.request("POST", "/refresh", { cookie: cookie! });
        assert.equal(r2.status, 401);
    });
});

describe("POST /logout", () => {
    test("revokes the refresh token (a later refresh fails)", async () => {
        const { cookie } = await signedInUser();
        const out = await server.request("POST", "/logout", { cookie: cookie! });
        assert.equal(out.status, 204);

        const res = await server.request("POST", "/refresh", { cookie: cookie! });
        assert.equal(res.status, 401);
    });
});

// Promotes a user to admin straight in the database.
async function promoteToAdmin(email: string) {
    const { db } = await import("../db.ts");
    const { users } = await import("../schema.ts");
    const { eq } = await import("drizzle-orm");
    await db.update(users).set({ role: "admin" }).where(eq(users.email, email));
}

describe("GET /users (RBAC)", () => {
    test("a regular user gets 403", async () => {
        const { token } = await signedInUser();
        const res = await fetch(`${server.base}/users`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        assert.equal(res.status, 403);
    });

    test("the admin gets 200 and the list does not expose passwordHash", async () => {
        const data = newUser();
        await server.request("POST", "/register", { body: data });
        await markEmailVerified(data.email);
        await promoteToAdmin(data.email);
        const login = await server.request("POST", "/login", {
            body: { email: data.email, password: data.password },
        });

        const res = await fetch(`${server.base}/users`, {
            headers: { Authorization: `Bearer ${login.body.token}` },
        });
        assert.equal(res.status, 200);
        const userList = await res.json();
        assert.ok(Array.isArray(userList));
        for (const u of userList) {
            assert.equal(u.passwordHash, undefined, "passwordHash must not leak");
        }
    });

    test("without a token returns 401", async () => {
        const res = await fetch(`${server.base}/users`);
        assert.equal(res.status, 401);
    });
});

// Reported in production: a student who signed in with Google asked to reset her
// password, was told the link had been sent, and nothing ever arrived. The request
// was dropped silently when the account had no password to reset. She did not want
// to reset one: she wanted to have one.
describe("Password recovery for a social login account", () => {
    // Simulates someone who came through a provider: no password, and the social account linked.
    async function socialAccount(provider = "google") {
        const data = newUser();
        await server.request("POST", "/register", { body: data });
        await markEmailVerified(data.email);
        const { db } = await import("../db.ts");
        const { users, oauthAccounts } = await import("../schema.ts");
        const { eq } = await import("drizzle-orm");
        const [u] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, data.email));
        await db.update(users).set({ passwordHash: null }).where(eq(users.id, u.id));
        await db.insert(oauthAccounts).values({ userId: u.id, provider, providerId: `id-${u.id}` });
        return { id: u.id, email: data.email };
    }

    async function tokensOf(userId: string, tokenType: string) {
        const { db } = await import("../db.ts");
        const { tokens } = await import("../schema.ts");
        const { and, eq } = await import("drizzle-orm");
        return db
            .select()
            .from(tokens)
            .where(and(eq(tokens.userId, userId), eq(tokens.type, tokenType)));
    }

    test("a request from an account without a password now creates the link, instead of dying silently", async () => {
        const account = await socialAccount();
        assert.equal((await tokensOf(account.id, "password_reset")).length, 0);

        const res = await server.request("POST", "/forgot-password", {
            body: { email: account.email },
        });
        assert.equal(res.status, 200);
        assert.equal(
            (await tokensOf(account.id, "password_reset")).length,
            1,
            "a conta sem senha precisa receber um link para criar uma",
        );
    });

    test("the link creates the password and allows email login", async () => {
        const account = await socialAccount();
        const { authService } = await import("../src/services/auth.service.ts");
        const token = await authService.createPasswordResetToken(account.id);

        const exchange = await server.request("POST", "/reset-password", {
            body: { token, password: "NovaSenha123!" },
        });
        assert.equal(exchange.status, 200);

        const login = await server.request("POST", "/login", {
            body: { email: account.email, password: "NovaSenha123!" },
        });
        assert.equal(login.status, 200);
    });

    // Creating a password must not cost the access she already had.
    test("creating the password does not unlink the social account", async () => {
        const account = await socialAccount();
        const { authService } = await import("../src/services/auth.service.ts");
        const token = await authService.createPasswordResetToken(account.id);
        await server.request("POST", "/reset-password", {
            body: { token, password: "NovaSenha123!" },
        });

        const { db } = await import("../db.ts");
        const { oauthAccounts } = await import("../schema.ts");
        const { eq } = await import("drizzle-orm");
        const links = await db
            .select()
            .from(oauthAccounts)
            .where(eq(oauthAccounts.userId, account.id));
        assert.equal(links.length, 1);
        assert.equal(links[0].provider, "google");
    });

    test("the six-digit code path also serves an account without a password", async () => {
        const account = await socialAccount();
        const res = await server.request("POST", "/forgot-password-otp", {
            body: { email: account.email, canal: "email" },
        });
        assert.equal(res.status, 200);
        assert.equal((await tokensOf(account.id, "password_reset_otp")).length, 1);
    });

    // The answer still does not reveal whether the email has an account, which is why it
    // is generic. Only what happens underneath changed.
    test("an email without an account still creates no token and gets the same answer", async () => {
        const account = await socialAccount();
        const res = await server.request("POST", "/forgot-password", {
            body: { email: `naoexiste_${Date.now()}@email.com` },
        });
        assert.equal(res.status, 200);

        const withAccount = await server.request("POST", "/forgot-password", {
            body: { email: account.email },
        });
        assert.deepEqual(res.body, withAccount.body, "both answers have to be the same");
    });
});
