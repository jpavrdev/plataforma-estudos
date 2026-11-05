import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { base32, codeAtStep, currentStep, verifyTotp } from "../src/services/totp.ts";

// The rest of the suite runs with the requirement off; here it applies as in
// production. The env is read on the app's first import, so everything that
// loads it comes after this line.
process.env.ADMIN_REQUIRE_2FA = "true";
const { startTestServer, extractRefreshCookie } = await import("./helpers/server.ts");
const { limparBanco } = await import("./helpers/db.ts");

let server: Awaited<ReturnType<typeof startTestServer>>;

async function app() {
    const { db } = await import("../db.ts");
    const { users, tokens } = await import("../schema.ts");
    const { eq } = await import("drizzle-orm");
    return { db, users, tokens, eq };
}

const PASSWORD = "Senhaforte123!";
let seq = 0;

// Decodes the secret the API shows, the way an authenticator app does.
function fromBase32(text: string) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let value = 0;
    let bits = 0;
    const bytes: number[] = [];
    for (const char of text) {
        value = ((value & 0xff) << 5) | alphabet.indexOf(char);
        bits += 5;
        if (bits >= 8) {
            bytes.push((value >>> (bits - 8)) & 0xff);
            bits -= 8;
        }
    }
    return Buffer.from(bytes);
}

const codeNow = (secret: Buffer, offset = 0) => codeAtStep(secret, currentStep() + offset);

async function call(
    method: string,
    path: string,
    { token, cookie, body }: { token?: string; cookie?: string | null; body?: unknown } = {},
) {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (cookie) headers.Cookie = cookie;
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const res = await fetch(`${server.base}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    return {
        status: res.status,
        body: text ? JSON.parse(text) : null,
        cookie: extractRefreshCookie(res.headers.get("set-cookie")),
    };
}

async function createAdmin() {
    const n = ++seq;
    const email = `admin_2fa_${n}_${Date.now()}@example.com`;
    const signup = await server.request("POST", "/register", {
        body: {
            name: "Admin Teste",
            email,
            username: `adm2fa_${n}`,
            password: PASSWORD,
            birthDate: "1990-01-01",
            gender: "outro",
            phone: "(11) 98888-7777",
        },
    });
    assert.equal(signup.status, 201);
    const { db, users, eq } = await app();
    await db
        .update(users)
        .set({ emailVerifiedAt: new Date(), role: "admin" })
        .where(eq(users.email, email));
    const login = await call("POST", "/login", { body: { email, password: PASSWORD } });
    assert.equal(login.status, 200);
    return { email, token: login.body.token as string, cookie: login.cookie };
}

// An admin with 2FA already on, through the real path (setup and enable).
async function createAdminWithTwoFactor() {
    const admin = await createAdmin();
    const setup = await call("POST", "/me/2fa/setup", { token: admin.token });
    assert.equal(setup.status, 200);
    const secret = fromBase32(setup.body.secret);
    const enabled = await call("POST", "/me/2fa/enable", {
        token: admin.token,
        cookie: admin.cookie,
        body: { code: codeNow(secret), currentPassword: PASSWORD },
    });
    assert.equal(enabled.status, 200);
    return {
        ...admin,
        secret,
        recoveryCodes: enabled.body.recoveryCodes as string[],
        oldToken: admin.token,
        oldCookie: admin.cookie,
        token: enabled.body.token as string,
        cookie: enabled.cookie,
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
    test("matches the RFC 6238 test vectors", () => {
        const secret = Buffer.from("12345678901234567890");
        const cases: [number, string][] = [
            [59, "94287082"],
            [1111111109, "07081804"],
            [1111111111, "14050471"],
            [1234567890, "89005924"],
            [2000000000, "69279037"],
            [20000000000, "65353130"],
        ];
        for (const [seconds, expected] of cases) {
            assert.equal(codeAtStep(secret, Math.floor(seconds / 30), 8), expected);
        }
    });

    test("base32 matches the RFC 4648 test vectors, without padding", () => {
        const cases: [string, string][] = [
            ["f", "MY"],
            ["fo", "MZXQ"],
            ["foo", "MZXW6"],
            ["foob", "MZXW6YQ"],
            ["fooba", "MZXW6YTB"],
            ["foobar", "MZXW6YTBOI"],
        ];
        for (const [text, expected] of cases) assert.equal(base32(Buffer.from(text)), expected);
    });

    test("accepts one step of drift each way and rejects the rest", () => {
        const secret = Buffer.from("12345678901234567890");
        const now = 1_800_000_000_000;
        const step = currentStep(now);
        for (const d of [-1, 0, 1]) {
            assert.equal(verifyTotp(secret, codeAtStep(secret, step + d), now), step + d);
        }
        for (const d of [-2, 2]) {
            assert.equal(verifyTotp(secret, codeAtStep(secret, step + d), now), null);
        }
        assert.equal(verifyTotp(secret, "12345", now), null);
    });
});

describe("2FA: setup", () => {
    test("an admin without 2FA cannot use admin routes and gets the code to enable it", async () => {
        const admin = await createAdmin();
        const r = await call("GET", "/admin/overview", { token: admin.token });
        assert.equal(r.status, 403);
        assert.equal(r.body.code, "2fa_required");
        const me = await call("GET", "/me", { token: admin.token });
        assert.equal(me.body.pendingTwoFactor, "2fa_required", "/me tells the frontend");
    });

    test("enabling asks for the right code and the password, and returns ten recovery codes", async () => {
        const admin = await createAdmin();
        const setup = await call("POST", "/me/2fa/setup", { token: admin.token });
        assert.equal(setup.status, 200);
        assert.match(setup.body.uri, /^otpauth:\/\/totp\/ensina\.dev:/);
        assert.match(setup.body.qrSvg, /^<svg/);
        const secret = fromBase32(setup.body.secret);

        const wrongCode = await call("POST", "/me/2fa/enable", {
            token: admin.token,
            cookie: admin.cookie,
            body: { code: codeNow(secret, 5), currentPassword: PASSWORD },
        });
        assert.equal(wrongCode.status, 400);

        const noPassword = await call("POST", "/me/2fa/enable", {
            token: admin.token,
            cookie: admin.cookie,
            body: { code: codeNow(secret) },
        });
        assert.equal(noPassword.status, 403);

        const noCookie = await call("POST", "/me/2fa/enable", {
            token: admin.token,
            body: { code: codeNow(secret), currentPassword: PASSWORD },
        });
        assert.equal(noCookie.status, 401);

        const ok = await call("POST", "/me/2fa/enable", {
            token: admin.token,
            cookie: admin.cookie,
            body: { code: codeNow(secret), currentPassword: PASSWORD },
        });
        assert.equal(ok.status, 200);
        assert.equal(ok.body.recoveryCodes.length, 10);
        assert.ok(ok.cookie, "the current session comes back with a new cookie");

        const status = await call("GET", "/me/2fa", { token: ok.body.token });
        assert.equal(status.body.enabled, true);
        assert.equal(status.body.recoveryCodesLeft, 10);

        const again = await call("POST", "/me/2fa/setup", { token: ok.body.token });
        assert.equal(again.status, 409);
    });

    test("after enabling, only the new session uses admin and the old ones are dropped", async () => {
        const admin = await createAdminWithTwoFactor();

        assert.equal((await call("GET", "/admin/overview", { token: admin.token })).status, 200);

        const old = await call("GET", "/admin/overview", { token: admin.oldToken });
        assert.equal(old.status, 403);
        assert.equal(old.body.code, "2fa_session");
        assert.equal(
            (await call("GET", "/me", { token: admin.oldToken })).body.pendingTwoFactor,
            "2fa_session",
        );
        assert.equal(
            (await call("GET", "/me", { token: admin.token })).body.pendingTwoFactor,
            null,
        );

        const oldRefresh = await call("POST", "/refresh", { cookie: admin.oldCookie });
        assert.equal(oldRefresh.status, 401);

        const newRefresh = await call("POST", "/refresh", { cookie: admin.cookie });
        assert.equal(newRefresh.status, 200);
        const refreshed = await call("GET", "/admin/overview", { token: newRefresh.body.token });
        assert.equal(refreshed.status, 200, "the refreshed session stays verified");
    });
});

describe("2FA: login", () => {
    test("the password only opens the challenge, and the app code completes the login", async () => {
        const admin = await createAdminWithTwoFactor();

        const login = await call("POST", "/login", {
            body: { email: admin.email, password: PASSWORD },
        });
        assert.equal(login.status, 200);
        assert.equal(login.body.token, undefined);
        assert.equal(login.cookie, null);
        assert.match(login.body.challenge, /^[a-f0-9]{64}$/);

        const wrong = await call("POST", "/login/2fa", {
            body: { challenge: login.body.challenge, code: codeNow(admin.secret, 5) },
        });
        assert.equal(wrong.status, 401);

        const ok = await call("POST", "/login/2fa", {
            body: { challenge: login.body.challenge, code: codeNow(admin.secret, 1) },
        });
        assert.equal(ok.status, 200);
        assert.ok(ok.body.token);
        assert.ok(ok.cookie);
        assert.equal((await call("GET", "/admin/overview", { token: ok.body.token })).status, 200);

        const reuse = await call("POST", "/login/2fa", {
            body: { challenge: login.body.challenge, code: codeNow(admin.secret, 1) },
        });
        assert.equal(reuse.status, 401, "the challenge was already used");
    });

    test("the same app code is never accepted twice", async () => {
        const admin = await createAdminWithTwoFactor();
        const code = codeNow(admin.secret, 1);

        const first = await call("POST", "/login", {
            body: { email: admin.email, password: PASSWORD },
        });
        const ok = await call("POST", "/login/2fa", {
            body: { challenge: first.body.challenge, code },
        });
        assert.equal(ok.status, 200);

        const second = await call("POST", "/login", {
            body: { email: admin.email, password: PASSWORD },
        });
        const repeated = await call("POST", "/login/2fa", {
            body: { challenge: second.body.challenge, code },
        });
        assert.equal(repeated.status, 401);
    });

    test("a recovery code works only once, with or without the dash", async () => {
        const admin = await createAdminWithTwoFactor();
        const [code] = admin.recoveryCodes;

        const login = await call("POST", "/login", {
            body: { email: admin.email, password: PASSWORD },
        });
        const ok = await call("POST", "/login/2fa", {
            body: { challenge: login.body.challenge, code: code.replace("-", "").toUpperCase() },
        });
        assert.equal(ok.status, 200);
        assert.equal(ok.body.recoveryCodesLeft, 9);

        const another = await call("POST", "/login", {
            body: { email: admin.email, password: PASSWORD },
        });
        const spent = await call("POST", "/login/2fa", {
            body: { challenge: another.body.challenge, code },
        });
        assert.equal(spent.status, 401);
    });

    test("five wrong codes lock the account, even with the right password in between", async () => {
        const admin = await createAdminWithTwoFactor();
        for (let i = 0; i < 5; i++) {
            const login = await call("POST", "/login", {
                body: { email: admin.email, password: PASSWORD },
            });
            assert.equal(login.status, 200);
            const wrong = await call("POST", "/login/2fa", {
                body: { challenge: login.body.challenge, code: "000000" },
            });
            assert.equal(wrong.status, 401);
        }
        const locked = await call("POST", "/login", {
            body: { email: admin.email, password: PASSWORD },
        });
        assert.equal(locked.status, 429);
    });

    test("an unknown or expired challenge does not open a session", async () => {
        const admin = await createAdminWithTwoFactor();
        const madeUp = await call("POST", "/login/2fa", {
            body: { challenge: "a".repeat(64), code: codeNow(admin.secret) },
        });
        assert.equal(madeUp.status, 401);

        const login = await call("POST", "/login", {
            body: { email: admin.email, password: PASSWORD },
        });
        const { db, tokens, eq } = await app();
        await db
            .update(tokens)
            .set({ expiredAt: new Date(Date.now() - 1000) })
            .where(eq(tokens.type, "login_2fa"));
        const expired = await call("POST", "/login/2fa", {
            body: { challenge: login.body.challenge, code: codeNow(admin.secret, 1) },
        });
        assert.equal(expired.status, 401);
    });
});

describe("2FA: management", () => {
    test("new recovery codes require a valid code", async () => {
        const admin = await createAdminWithTwoFactor();
        const wrong = await call("POST", "/me/2fa/recovery-codes", {
            token: admin.token,
            body: { code: "000000" },
        });
        assert.equal(wrong.status, 403);

        const ok = await call("POST", "/me/2fa/recovery-codes", {
            token: admin.token,
            body: { code: codeNow(admin.secret, 1) },
        });
        assert.equal(ok.status, 200);
        assert.equal(ok.body.recoveryCodes.length, 10);
        assert.notDeepEqual(ok.body.recoveryCodes, admin.recoveryCodes);
    });

    test("disabling asks for a code and the password, and the admin is blocked again", async () => {
        const admin = await createAdminWithTwoFactor();

        const noPassword = await call("POST", "/me/2fa/disable", {
            token: admin.token,
            body: { code: codeNow(admin.secret, 1) },
        });
        assert.equal(noPassword.status, 403);

        const ok = await call("POST", "/me/2fa/disable", {
            token: admin.token,
            body: { code: codeNow(admin.secret, 1), currentPassword: PASSWORD },
        });
        assert.equal(ok.status, 200);

        const blocked = await call("GET", "/admin/overview", { token: admin.token });
        assert.equal(blocked.status, 403);
        assert.equal(blocked.body.code, "2fa_required");

        const login = await call("POST", "/login", {
            body: { email: admin.email, password: PASSWORD },
        });
        assert.ok(login.body.token, "without 2FA the login is back to the password alone");
    });
});
