import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
    withTimeout,
    createDependencyChecker,
    TimeoutError,
    tokenMatches,
    tokenFromHeader,
    usagePercent,
} from "./dependencies.ts";
import type { DiskSpace, DependencyPorts } from "./dependencies.ts";

const DISK_34_PERCENT: DiskSpace = { blocks: 1000, bfree: 660, bavail: 660 };

const never = () => new Promise<never>(() => {});

function ports(overrides: Partial<DependencyPorts> = {}): DependencyPorts {
    return {
        consultarBanco: async () => undefined,
        estadoDoWhatsapp: async () => "open",
        espacoEmDisco: async () => DISK_34_PERCENT,
        saudeDosLabs: async () => ({ status: "ok", sessoes: 1, max: 6 }),
        ...overrides,
    };
}

function check(overrides: Partial<DependencyPorts> = {}, timeoutMs = 1000) {
    return createDependencyChecker(ports(overrides), timeoutMs)();
}

describe("tokenFromHeader", () => {
    test("extracts the Bearer token", () => {
        assert.equal(tokenFromHeader("Bearer abc123"), "abc123");
    });

    test("accepts the scheme in any case", () => {
        assert.equal(tokenFromHeader("bearer abc123"), "abc123");
    });

    test("no header returns null", () => {
        assert.equal(tokenFromHeader(undefined), null);
    });

    test("another scheme returns null", () => {
        assert.equal(tokenFromHeader("Basic abc123"), null);
    });

    test("Bearer without a token returns null", () => {
        assert.equal(tokenFromHeader("Bearer"), null);
        assert.equal(tokenFromHeader("Bearer   "), null);
    });
});

describe("tokenMatches", () => {
    const EXPECTED = "f3a9c1d27b4e8a6f0c5d9e2b7a1f4c8d";

    test("accepts the right token", () => {
        assert.equal(tokenMatches(EXPECTED, EXPECTED), true);
    });

    test("rejects a wrong token of the same length", () => {
        assert.equal(tokenMatches("0".repeat(EXPECTED.length), EXPECTED), false);
    });

    test("rejects a token of another length without throwing", () => {
        assert.equal(tokenMatches(EXPECTED.slice(0, -1), EXPECTED), false);
        assert.equal(tokenMatches(EXPECTED + "0", EXPECTED), false);
    });

    test("rejects a missing or empty token", () => {
        assert.equal(tokenMatches(null, EXPECTED), false);
        assert.equal(tokenMatches("", EXPECTED), false);
    });

    test("without an expected token nothing matches", () => {
        assert.equal(tokenMatches("", ""), false);
        assert.equal(tokenMatches(EXPECTED, ""), false);
    });
});

describe("withTimeout", () => {
    test("returns the result of whoever answers in time", async () => {
        assert.equal(await withTimeout(async () => 42, 1000), 42);
    });

    test("rejects with TimeoutError when it times out", async () => {
        await assert.rejects(withTimeout(never, 10), TimeoutError);
    });

    test("aborts the signal given to the task on timeout", async () => {
        let signal: AbortSignal | undefined;
        const task = (s: AbortSignal) => {
            signal = s;
            return never();
        };
        await assert.rejects(withTimeout(task, 10), TimeoutError);
        assert.equal(signal?.aborted, true);
    });

    test("passes on the task's own error", async () => {
        const error = new Error("connection refused");
        await assert.rejects(
            withTimeout(() => Promise.reject(error), 1000),
            (e) => e === error,
        );
    });
});

describe("usagePercent", () => {
    test("does the df math, without the root reserve in the total", () => {
        // 400 blocks used out of 950 within reach of non-root users: 42.1% rounds up to 43.
        assert.equal(usagePercent({ blocks: 1000, bfree: 600, bavail: 550 }), 43);
    });

    test("an exact value is not rounded", () => {
        assert.equal(usagePercent(DISK_34_PERCENT), 34);
    });

    test("an empty disk is 0", () => {
        assert.equal(usagePercent({ blocks: 1000, bfree: 1000, bavail: 950 }), 0);
    });

    test("no space left for non-root users is 100", () => {
        assert.equal(usagePercent({ blocks: 1000, bfree: 50, bavail: 0 }), 100);
    });

    test("statfs without blocks throws", () => {
        assert.throws(() => usagePercent({ blocks: 0, bfree: 0, bavail: 0 }));
    });
});

describe("createDependencyChecker", () => {
    test("everything up returns the contract shape", async () => {
        const report = await check();
        assert.deepEqual(report, {
            banco: { situacao: "ok", latenciaMs: report.banco.latenciaMs },
            whatsapp: { situacao: "ok", estado: "open" },
            disco: { situacao: "ok", usoPercentual: 34 },
            labs: { situacao: "ok", sessoes: 1, max: 6 },
        });
        const latency = report.banco.latenciaMs;
        assert.ok(typeof latency === "number" && Number.isInteger(latency) && latency >= 0);
    });

    test("a database outage becomes a failure without taking down the others or leaking the error", async (t) => {
        const log = t.mock.method(console, "error", () => {});
        const error = new Error("connect ECONNREFUSED 172.18.0.3:5432");
        const report = await check({ consultarBanco: () => Promise.reject(error) });

        assert.deepEqual(report.banco, { situacao: "falha" });
        assert.deepEqual(report.whatsapp, { situacao: "ok", estado: "open" });
        assert.deepEqual(report.disco, { situacao: "ok", usoPercentual: 34 });
        assert.deepEqual(report.labs, { situacao: "ok", sessoes: 1, max: 6 });
        assert.equal(JSON.stringify(report).includes("172.18.0.3"), false);
        assert.equal(log.mock.callCount(), 1);
        assert.match(String(log.mock.calls[0].arguments[0]), /database/);
        assert.equal(log.mock.calls[0].arguments[1], error);
    });

    test("a hanging database times out and becomes a failure", async (t) => {
        const log = t.mock.method(console, "error", () => {});
        const report = await check({ consultarBanco: never }, 20);

        assert.deepEqual(report.banco, { situacao: "falha" });
        assert.equal(report.disco.situacao, "ok");
        assert.ok(log.mock.calls[0].arguments[1] instanceof TimeoutError);
    });

    test("whatsapp without Evolution configured comes back nao-configurado", async () => {
        const report = await check({ estadoDoWhatsapp: async () => null });
        assert.deepEqual(report.whatsapp, { situacao: "nao-configurado" });
    });

    test("whatsapp outside the open state is a failure and reports the state", async () => {
        for (const state of ["close", "connecting"]) {
            const report = await check({ estadoDoWhatsapp: async () => state });
            assert.deepEqual(report.whatsapp, { situacao: "falha", estado: state });
        }
    });

    test("whatsapp with an Evolution error becomes a failure", async (t) => {
        const log = t.mock.method(console, "error", () => {});
        const report = await check({
            estadoDoWhatsapp: () => Promise.reject(new Error("Evolution answered HTTP 401")),
        });

        assert.deepEqual(report.whatsapp, { situacao: "falha" });
        assert.equal(log.mock.callCount(), 1);
    });

    test("a hanging whatsapp becomes a failure and gets its request aborted", async (t) => {
        t.mock.method(console, "error", () => {});
        let signal: AbortSignal | undefined;
        const report = await check(
            {
                estadoDoWhatsapp: (s) => {
                    signal = s;
                    return never();
                },
            },
            20,
        );

        assert.deepEqual(report.whatsapp, { situacao: "falha" });
        assert.equal(signal?.aborted, true);
    });

    test("an unreadable disk becomes a failure", async (t) => {
        t.mock.method(console, "error", () => {});
        const enoent = Object.assign(new Error("ENOENT: no such file or directory"), {
            code: "ENOENT",
        });
        const report = await check({ espacoEmDisco: () => Promise.reject(enoent) });
        assert.deepEqual(report.disco, { situacao: "falha" });
    });

    test("statfs without blocks becomes a failure", async (t) => {
        t.mock.method(console, "error", () => {});
        const report = await check({
            espacoEmDisco: async () => ({ blocks: 0, bfree: 0, bavail: 0 }),
        });
        assert.deepEqual(report.disco, { situacao: "falha" });
    });

    test("labs down becomes a failure", async (t) => {
        const log = t.mock.method(console, "error", () => {});
        const report = await check({
            saudeDosLabs: () => Promise.reject(new Error("the labs service answered 503")),
        });

        assert.deepEqual(report.labs, { situacao: "falha" });
        assert.equal(report.banco.situacao, "ok");
        assert.equal(log.mock.callCount(), 1);
        assert.match(String(log.mock.calls[0].arguments[0]), /labs/);
    });

    test("labs that do not answer status ok become a failure", async (t) => {
        t.mock.method(console, "error", () => {});
        for (const body of [{ status: "falha", sessoes: 0, max: 6 }, null, "ok"]) {
            const report = await check({ saudeDosLabs: async () => body });
            assert.deepEqual(report.labs, { situacao: "falha" });
        }
    });

    test("labs ok without the session count are still ok", async () => {
        const report = await check({ saudeDosLabs: async () => ({ status: "ok" }) });
        assert.deepEqual(report.labs, { situacao: "ok" });
    });

    test("everything down at once still returns the report", async (t) => {
        const log = t.mock.method(console, "error", () => {});
        const report = await check(
            {
                consultarBanco: () => Promise.reject(new Error("database")),
                estadoDoWhatsapp: never,
                espacoEmDisco: () => Promise.reject(new Error("disk")),
                saudeDosLabs: () => Promise.reject(new Error("labs")),
            },
            20,
        );

        assert.deepEqual(report, {
            banco: { situacao: "falha" },
            whatsapp: { situacao: "falha" },
            disco: { situacao: "falha" },
            labs: { situacao: "falha" },
        });
        assert.equal(log.mock.callCount(), 4);
    });

    test("the four checks run in parallel", async () => {
        // Each port only finishes after all four started: in series, the first
        // one would wait for the others forever and time out.
        let started = 0;
        let release = () => {};
        const allStarted = new Promise<void>((resolve) => {
            release = () => resolve();
        });
        const waitForTheOthers = async () => {
            started += 1;
            if (started === 4) release();
            await allStarted;
        };

        const report = await check(
            {
                consultarBanco: waitForTheOthers,
                estadoDoWhatsapp: async () => {
                    await waitForTheOthers();
                    return "open";
                },
                espacoEmDisco: async () => {
                    await waitForTheOthers();
                    return DISK_34_PERCENT;
                },
                saudeDosLabs: async () => {
                    await waitForTheOthers();
                    return { status: "ok", sessoes: 0, max: 6 };
                },
            },
            500,
        );

        assert.equal(report.banco.situacao, "ok");
        assert.equal(report.whatsapp.situacao, "ok");
        assert.equal(report.disco.situacao, "ok");
        assert.equal(report.labs.situacao, "ok");
    });
});
