import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { startTestServer, extractRefreshCookie } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;

// The app modules can only be imported after the test env is ready.
async function app() {
    const { db } = await import("../db.ts");
    const { users, tokens, oauthAccounts } = await import("../schema.ts");
    const { and, eq, sql } = await import("drizzle-orm");
    const { authService } = await import("../src/services/auth.service.ts");
    const { linkSocialAccount } = await import("../src/services/socialAccount.service.ts");
    return { db, users, tokens, oauthAccounts, and, eq, sql, authService, linkSocialAccount };
}

const PASSWORD = "Senhaforte123!";
const NEW_PASSWORD = "Novasenha456!";
let seq = 0;

async function createUser({ verificado: verified }: { verificado: boolean }) {
    const email = `aluna_${++seq}_${Math.round(performance.now() * 1000)}@example.com`;
    const res = await server.request("POST", "/register", {
        body: {
            name: "Aluna Teste",
            email,
            username: `aluna_${seq}`,
            password: PASSWORD,
            birthDate: "1990-01-01",
            gender: "feminino",
            phone: "(11) 98888-7777",
        },
    });
    assert.equal(res.status, 201);
    const { db, users, eq } = await app();
    if (verified) {
        await db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.email, email));
    }
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
}

async function codesOf(userId: string) {
    const { db, tokens, and, eq } = await app();
    return db
        .select()
        .from(tokens)
        .where(and(eq(tokens.userId, userId), eq(tokens.type, "password_reset_otp")));
}

const otherCode = (otp: string) => (otp === "111111" ? "222222" : "111111");

before(async () => {
    server = await startTestServer();
});
after(async () => {
    await server.close();
});
beforeEach(async () => {
    await limparBanco();
});

describe("/refresh only accepts session tokens", () => {
    test("the 6-digit code in the cookie does not become a session", async () => {
        const user = await createUser({ verificado: true });
        const { authService } = await app();
        const otp = await authService.createPasswordResetCode(user.id);
        assert.ok(otp);

        const res = await server.request("POST", "/refresh", {
            cookie: `refreshToken=${user.id}:${otp}`,
        });
        assert.equal(res.status, 401);
    });

    test("a real session token keeps working", async () => {
        const user = await createUser({ verificado: true });
        const login = await server.request("POST", "/login", {
            body: { email: user.email, password: PASSWORD },
        });
        const cookie = extractRefreshCookie(login.setCookie);
        assert.ok(cookie);

        const res = await server.request("POST", "/refresh", { cookie });
        assert.equal(res.status, 200);
        assert.ok(res.body.token);
    });
});

describe("6-digit code", () => {
    test("the fifth mistake kills the code, and the right one stops working", async () => {
        const user = await createUser({ verificado: true });
        const { authService } = await app();
        const otp = (await authService.createPasswordResetCode(user.id))!;

        for (let i = 0; i < 5; i++) {
            const wrong = await server.request("POST", "/reset-password-otp", {
                body: { email: user.email, otp: otherCode(otp), password: NEW_PASSWORD },
            });
            assert.equal(wrong.status, 400);
        }
        const right = await server.request("POST", "/reset-password-otp", {
            body: { email: user.email, otp, password: NEW_PASSWORD },
        });
        assert.equal(right.status, 400);
    });

    test("the right one after four mistakes resets the password", async () => {
        const user = await createUser({ verificado: true });
        const { authService } = await app();
        const otp = (await authService.createPasswordResetCode(user.id))!;

        for (let i = 0; i < 4; i++) {
            await server.request("POST", "/reset-password-otp", {
                body: { email: user.email, otp: otherCode(otp), password: NEW_PASSWORD },
            });
        }
        const right = await server.request("POST", "/reset-password-otp", {
            body: { email: user.email, otp, password: NEW_PASSWORD },
        });
        assert.equal(right.status, 200);

        const login = await server.request("POST", "/login", {
            body: { email: user.email, password: NEW_PASSWORD },
        });
        assert.equal(login.status, 200);
    });

    test("a repeated request within a minute creates no new code", async () => {
        const user = await createUser({ verificado: true });
        for (let i = 0; i < 2; i++) {
            const res = await server.request("POST", "/forgot-password-otp", {
                body: { email: user.email, canal: "email" },
            });
            assert.equal(res.status, 200);
        }
        assert.equal((await codesOf(user.id)).length, 1);
    });

    test("at most 10 codes a day per account", async () => {
        const user = await createUser({ verificado: true });
        const { db, tokens, and, eq, sql, authService } = await app();

        for (let i = 0; i < 10; i++) {
            assert.ok(await authService.createPasswordResetCode(user.id));
            // Moves the codes back two minutes so the next request clears the interval.
            await db
                .update(tokens)
                .set({ expiredAt: sql`${tokens.expiredAt} - interval '2 minutes'` })
                .where(and(eq(tokens.userId, user.id), eq(tokens.type, "password_reset_otp")));
        }
        assert.equal(await authService.createPasswordResetCode(user.id), null);
        const active = (await codesOf(user.id)).filter((t) => t.usedAt === null);
        assert.equal(active.length, 1);
    });
});

describe("social login", () => {
    test("a never-verified account is adopted without what the sign-up filled in", async () => {
        const user = await createUser({ verificado: false });
        const { db, tokens, oauthAccounts, eq, linkSocialAccount } = await app();

        const adopted = await linkSocialAccount("google", {
            providerId: "google-1",
            email: user.email,
            name: "Dona do Email",
        });

        assert.equal(adopted.id, user.id);
        assert.ok(adopted.emailVerifiedAt);
        assert.equal(adopted.passwordHash, null);
        assert.equal(adopted.phone, null);
        assert.equal(adopted.username, null);
        assert.equal(adopted.birthDate, null);
        assert.equal(adopted.gender, null);
        assert.equal(adopted.name, "Dona do Email");
        assert.equal((await db.select().from(tokens).where(eq(tokens.userId, user.id))).length, 0);
        const links = await db
            .select()
            .from(oauthAccounts)
            .where(eq(oauthAccounts.userId, user.id));
        assert.equal(links.length, 1);

        const login = await server.request("POST", "/login", {
            body: { email: user.email, password: PASSWORD },
        });
        assert.notEqual(login.status, 200);
    });

    test("a verified account keeps its password and phone", async () => {
        const user = await createUser({ verificado: true });
        const { linkSocialAccount } = await app();

        const linked = await linkSocialAccount("github", {
            providerId: "github-1",
            email: user.email,
            name: "Outro Nome",
        });

        assert.equal(linked.id, user.id);
        assert.ok(linked.passwordHash);
        assert.equal(linked.phone, user.phone);
        assert.equal(linked.name, user.name);
    });

    test("an existing link returns the same user", async () => {
        const { linkSocialAccount } = await app();
        const data = { providerId: "google-2", email: "nova@example.com", name: "Nova" };
        const first = await linkSocialAccount("google", data);
        const second = await linkSocialAccount("google", {
            ...data,
            email: "outro@example.com",
        });
        assert.equal(second.id, first.id);
    });
});
