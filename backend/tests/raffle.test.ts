import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { startTestServer } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;

let seq = 0;
const newUser = () => ({
    name: `Aluno ${++seq}`,
    email: `sorteio_${seq}_${Math.round(performance.now() * 1000)}@email.com`,
    username: `sorteio_${seq}`,
    password: "Senhaforte123!",
    birthDate: "1990-01-01",
    gender: "outro",
    phone: "11999998888",
});

async function updateUserFields(email: string, fields: Record<string, unknown>) {
    const { db } = await import("../db.ts");
    const { users } = await import("../schema.ts");
    const { eq } = await import("drizzle-orm");
    await db.update(users).set(fields).where(eq(users.email, email));
}

async function createLoggedInUser(admin = false) {
    const data = newUser();
    await server.request("POST", "/register", { body: data });
    await updateUserFields(data.email, {
        emailVerifiedAt: new Date(),
        ...(admin ? { role: "admin" } : {}),
    });
    const login = await server.request("POST", "/login", {
        body: { email: data.email, password: data.password },
    });
    return { email: data.email, username: data.username, token: login.body.token as string };
}

async function call(method: string, path: string, token: string, body?: unknown) {
    const res = await fetch(`${server.base}${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: res.status, body: await res.json().catch(() => null) };
}

// The rules depend on the real clock, so dates are relative to now.
const minutesFromNow = (minutes: number) => new Date(Date.now() + minutes * 60_000).toISOString();

const raffleData = (inicio: number, fim: number, titulo = "Sorteio de teste") => ({
    titulo,
    descricao: "Três prêmios.\nBoa sorte!",
    inicio: minutesFromNow(inicio),
    fim: minutesFromNow(fim),
});

async function createRaffle(admin: string, inicio: number, fim: number, titulo?: string) {
    const res = await call("POST", "/sorteios", admin, raffleData(inicio, fim, titulo));
    assert.equal(res.status, 201);
    return res.body;
}

// Closes entries by moving the end into the past, as the admin would through the edit.
async function closeEntries(admin: string, id: string) {
    const res = await call("PATCH", `/sorteios/${id}`, admin, { fim: minutesFromNow(-1) });
    assert.equal(res.status, 200);
    assert.equal(res.body.situacao, "encerrado");
}

const ZAP = { canal: "whatsapp", pais: "BR", ddd: "(11)", numero: "98765-4321" };
const INSTA = { canal: "instagram", usuario: "@Fulano.Dev" };
const EMAIL = { canal: "email", email: " Fulano@Email.com " };

const enter = (token: string, id: string, body: unknown = { primario: ZAP, secundario: INSTA }) =>
    call("POST", `/sorteios/${id}/participacao`, token, body);

const activeRaffle = async (token: string) => (await call("GET", "/sorteios/ativo", token)).body;

before(async () => {
    server = await startTestServer();
});
after(async () => {
    await server.close();
});
beforeEach(async () => {
    await limparBanco();
});

describe("Raffles: student", () => {
    test("sees only the open raffle; scheduled and closed ones do not show up", async () => {
        const admin = await createLoggedInUser(true);
        const student = await createLoggedInUser();
        await createRaffle(admin.token, -120, -60);
        await createRaffle(admin.token, 60, 120);
        assert.equal(await activeRaffle(student.token), null);

        const open = await createRaffle(admin.token, -30, 30);
        const body = await activeRaffle(student.token);
        assert.deepEqual(Object.keys(body).sort(), [
            "descricao",
            "fim",
            "id",
            "inicio",
            "participacao",
            "titulo",
        ]);
        assert.equal(body.id, open.id);
        assert.equal(body.descricao, "Três prêmios.\nBoa sorte!");
        assert.equal(body.participacao, null);
    });

    test("entering creates with 201 and normalizes the contacts; the second one gets 409 and nothing changes", async () => {
        const admin = await createLoggedInUser(true);
        const student = await createLoggedInUser();
        const raffle = await createRaffle(admin.token, -30, 30);

        const first = await enter(student.token, raffle.id);
        assert.equal(first.status, 201);
        assert.deepEqual(Object.keys(first.body).sort(), ["contatos", "inscritoEm"]);
        assert.deepEqual(first.body.contatos, {
            primario: { canal: "whatsapp", pais: "BR", ddi: "55", ddd: "11", numero: "987654321" },
            secundario: { canal: "instagram", usuario: "fulano.dev" },
        });
        assert.ok(first.body.inscritoEm);

        const second = await enter(student.token, raffle.id, { primario: EMAIL });
        assert.equal(second.status, 409);
        assert.equal(second.body.erro, "Você já está inscrito neste sorteio");

        assert.deepEqual((await activeRaffle(student.token)).participacao, first.body);
        const detail = await call("GET", `/studio/sorteios/${raffle.id}`, admin.token);
        assert.equal(detail.body.participantes.length, 1);
        assert.deepEqual(detail.body.participantes[0].contatos, first.body.contatos);
    });

    test("two submissions at the same time enter only once", async () => {
        const admin = await createLoggedInUser(true);
        const student = await createLoggedInUser();
        const raffle = await createRaffle(admin.token, -30, 30);

        const responses = await Promise.all([
            enter(student.token, raffle.id),
            enter(student.token, raffle.id),
        ]);
        assert.deepEqual(responses.map((r) => r.status).sort(), [201, 409]);
        const detail = await call("GET", `/studio/sorteios/${raffle.id}`, admin.token);
        assert.equal(detail.body.participantes.length, 1);
    });

    test("entering with only the primary contact stores the secondary as null", async () => {
        const admin = await createLoggedInUser(true);
        const student = await createLoggedInUser();
        const raffle = await createRaffle(admin.token, -30, 30);

        const res = await enter(student.token, raffle.id, { primario: INSTA });
        assert.equal(res.status, 201);
        assert.deepEqual(res.body.contatos, {
            primario: { canal: "instagram", usuario: "fulano.dev" },
            secundario: null,
        });
    });

    test("an invalid contact gives 400 and does not enter", async () => {
        const admin = await createLoggedInUser(true);
        const student = await createLoggedInUser();
        const raffle = await createRaffle(admin.token, -30, 30);

        const invalid = [
            { primario: { ...ZAP, ddd: "20" } },
            { primario: { ...ZAP, numero: "8765-4321" } },
            { primario: { canal: "whatsapp", pais: "XX", numero: "912345678" } },
            { primario: { canal: "instagram", usuario: "fulano..dev" } },
            { primario: { canal: "email", email: "fulano@" } },
            { primario: INSTA, secundario: { canal: "instagram", usuario: "outro" } },
            { primario: ZAP, secundario: { canal: "email", email: "invalido" } },
            { primario: { canal: "telegram", usuario: "fulano" } },
            { secundario: INSTA },
        ];
        for (const body of invalid) {
            const res = await enter(student.token, raffle.id, body);
            assert.equal(res.status, 400, JSON.stringify(body));
        }
        assert.equal((await activeRaffle(student.token)).participacao, null);
    });

    test("outside the period gives 409; a nonexistent raffle gives 404", async () => {
        const admin = await createLoggedInUser(true);
        const student = await createLoggedInUser();
        const scheduled = await createRaffle(admin.token, 60, 120);
        const closed = await createRaffle(admin.token, -120, -60);

        for (const raffle of [scheduled, closed]) {
            assert.equal((await enter(student.token, raffle.id)).status, 409);
        }

        assert.equal((await enter(student.token, randomUUID())).status, 404);
        assert.equal((await enter(student.token, "nao-e-um-id")).status, 400);
    });

    test("a student without an @ cannot enter", async () => {
        const admin = await createLoggedInUser(true);
        const student = await createLoggedInUser();
        const raffle = await createRaffle(admin.token, -30, 30);
        await updateUserFields(student.email, { username: null });

        assert.equal((await enter(student.token, raffle.id)).status, 403);
    });
});

describe("Raffles: studio", () => {
    test("admin creates; an overlapping period gives 409 and a back-to-back one passes", async () => {
        const admin = await createLoggedInUser(true);
        const created = await call("POST", "/sorteios", admin.token, {
            ...raffleData(10, 20),
            titulo: "  Sorteio de novembro  ",
        });
        assert.equal(created.status, 201);
        assert.equal(created.body.titulo, "Sorteio de novembro");
        assert.equal(created.body.situacao, "agendado");
        assert.equal(created.body.sorteadoEm, null);
        assert.deepEqual(created.body.ganhadores, []);
        assert.deepEqual(created.body.participantes, []);

        const overlapping = await call("POST", "/sorteios", admin.token, raffleData(15, 25));
        assert.equal(overlapping.status, 409);

        const backToBack = await call("POST", "/sorteios", admin.token, {
            ...raffleData(0, 30),
            inicio: created.body.fim,
        });
        assert.equal(backToBack.status, 201);

        const intruding = await call("PATCH", `/sorteios/${backToBack.body.id}`, admin.token, {
            inicio: minutesFromNow(19),
        });
        assert.equal(intruding.status, 409);
    });

    test("validates title, description and dates", async () => {
        const admin = await createLoggedInUser(true);
        const created = await createRaffle(admin.token, 10, 20);
        const invalid = [
            { ...raffleData(40, 50), titulo: "ab" },
            { ...raffleData(40, 50), titulo: "x".repeat(121) },
            { ...raffleData(40, 50), descricao: "   " },
            { ...raffleData(40, 50), descricao: "x".repeat(2001) },
            { ...raffleData(40, 50), inicio: "2026-12-01T10:00", fim: "2026-12-02T10:00" },
            raffleData(50, 40),
        ];
        for (const body of invalid) {
            const res = await call("POST", "/sorteios", admin.token, body);
            assert.equal(res.status, 400, JSON.stringify(body).slice(0, 120));
        }

        // Only the end in the edit, before the start that was already stored.
        const edit = await call("PATCH", `/sorteios/${created.id}`, admin.token, {
            fim: minutesFromNow(5),
        });
        assert.equal(edit.status, 400);
        const empty = await call("PATCH", `/sorteios/${created.id}`, admin.token, {});
        assert.equal(empty.status, 400);
    });

    test("a common student gets 403 on the admin routes", async () => {
        const admin = await createLoggedInUser(true);
        const student = await createLoggedInUser();
        const { id } = await createRaffle(admin.token, -30, 30);

        const routes: Array<[string, string, unknown?]> = [
            ["GET", "/studio/sorteios"],
            ["GET", `/studio/sorteios/${id}`],
            ["POST", "/sorteios", raffleData(60, 120)],
            ["PATCH", `/sorteios/${id}`, { titulo: "Outro título" }],
            ["DELETE", `/sorteios/${id}`],
            ["POST", `/sorteios/${id}/sortear`],
        ];
        for (const [method, path, body] of routes) {
            const res = await call(method, path, student.token, body);
            assert.equal(res.status, 403, `${method} ${path}`);
        }
    });

    test("the list brings status and entries, from the most recent start to the oldest", async () => {
        const admin = await createLoggedInUser(true);
        await createRaffle(admin.token, -120, -60, "Passado");
        const open = await createRaffle(admin.token, -30, 30, "Atual");
        await createRaffle(admin.token, 60, 120, "Futuro");
        for (const student of [await createLoggedInUser(), await createLoggedInUser()]) {
            await enter(student.token, open.id);
        }

        const list = await call("GET", "/studio/sorteios", admin.token);
        assert.equal(list.status, 200);
        assert.deepEqual(
            list.body.map((s: any) => [s.titulo, s.situacao, s.participantes]),
            [
                ["Futuro", "agendado", 0],
                ["Atual", "aberto", 2],
                ["Passado", "encerrado", 0],
            ],
        );
        assert.deepEqual(Object.keys(list.body[0]).sort(), [
            "fim",
            "id",
            "inicio",
            "participantes",
            "situacao",
            "sorteadoEm",
            "titulo",
        ]);
    });

    test("deleting takes the entries along", async () => {
        const admin = await createLoggedInUser(true);
        const student = await createLoggedInUser();
        const raffle = await createRaffle(admin.token, -30, 30);
        await enter(student.token, raffle.id);

        const res = await call("DELETE", `/sorteios/${raffle.id}`, admin.token);
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { ok: true });
        const detail = await call("GET", `/studio/sorteios/${raffle.id}`, admin.token);
        assert.equal(detail.status, 404);
        assert.equal(await activeRaffle(student.token), null);

        const { db } = await import("../db.ts");
        const { sorteioParticipacoes } = await import("../schema.ts");
        assert.equal((await db.select().from(sorteioParticipacoes)).length, 0);
    });
});

describe("Raffles: drawing", () => {
    async function raffleWithEntries(admin: string, howMany: number) {
        const raffle = await createRaffle(admin, -60, 60);
        const students = [];
        for (let i = 0; i < howMany; i++) {
            const student = await createLoggedInUser();
            assert.equal((await enter(student.token, raffle.id)).status, 201);
            students.push(student);
        }
        return { raffle, students };
    }

    test("before the end gives 409", async () => {
        const admin = await createLoggedInUser(true);
        const { raffle } = await raffleWithEntries(admin.token, 1);

        const res = await call("POST", `/sorteios/${raffle.id}/sortear`, admin.token);
        assert.equal(res.status, 409);
        const detail = await call("GET", `/studio/sorteios/${raffle.id}`, admin.token);
        assert.equal(detail.body.situacao, "aberto");
    });

    test("with 5 entries 3 winners come out and the rest lose their contacts", async () => {
        const admin = await createLoggedInUser(true);
        const { raffle, students } = await raffleWithEntries(admin.token, 5);
        await closeEntries(admin.token, raffle.id);

        const res = await call("POST", `/sorteios/${raffle.id}/sortear`, admin.token);
        assert.equal(res.status, 200);
        assert.equal(res.body.situacao, "sorteado");
        assert.ok(res.body.sorteadoEm);
        assert.deepEqual(
            res.body.ganhadores.map((g: any) => g.posicao),
            [1, 2, 3],
        );
        const winners = res.body.ganhadores.map((g: any) => g.username);
        assert.equal(new Set(winners).size, 3);
        for (const winner of res.body.ganhadores) {
            assert.ok(winner.nome);
            assert.equal(winner.contatos.primario.canal, "whatsapp");
        }

        assert.deepEqual(
            res.body.participantes.map((p: any) => p.username),
            students.map((a) => a.username),
        );
        for (const participant of res.body.participantes) {
            const won = winners.includes(participant.username);
            assert.equal(participant.contatos === null, !won, participant.username);
        }

        const repeat = await call("POST", `/sorteios/${raffle.id}/sortear`, admin.token);
        assert.equal(repeat.status, 409);
        const edit = await call("PATCH", `/sorteios/${raffle.id}`, admin.token, {
            titulo: "Outro título",
        });
        assert.equal(edit.status, 409);
    });

    test("two clicks at the same time draw only once", async () => {
        const admin = await createLoggedInUser(true);
        const { raffle } = await raffleWithEntries(admin.token, 4);
        await closeEntries(admin.token, raffle.id);

        const path = `/sorteios/${raffle.id}/sortear`;
        const responses = await Promise.all([
            call("POST", path, admin.token),
            call("POST", path, admin.token),
        ]);
        assert.deepEqual(responses.map((r) => r.status).sort(), [200, 409]);
        const detail = await call("GET", `/studio/sorteios/${raffle.id}`, admin.token);
        assert.equal(detail.body.ganhadores.length, 3);
    });

    test("with 2 entries 2 winners come out", async () => {
        const admin = await createLoggedInUser(true);
        const { raffle } = await raffleWithEntries(admin.token, 2);
        await closeEntries(admin.token, raffle.id);

        const res = await call("POST", `/sorteios/${raffle.id}/sortear`, admin.token);
        assert.equal(res.status, 200);
        assert.deepEqual(
            res.body.ganhadores.map((g: any) => g.posicao),
            [1, 2],
        );
        assert.equal(
            res.body.participantes.every((p: any) => p.contatos !== null),
            true,
        );
    });

    test("with no entries gives 409 and the raffle stays closed", async () => {
        const admin = await createLoggedInUser(true);
        const raffle = await createRaffle(admin.token, -120, -60);

        const res = await call("POST", `/sorteios/${raffle.id}/sortear`, admin.token);
        assert.equal(res.status, 409);
        const detail = await call("GET", `/studio/sorteios/${raffle.id}`, admin.token);
        assert.equal(detail.body.situacao, "encerrado");
        assert.equal(detail.body.sorteadoEm, null);
    });

    test("a nonexistent raffle gives 404", async () => {
        const admin = await createLoggedInUser(true);
        const res = await call("POST", `/sorteios/${randomUUID()}/sortear`, admin.token);
        assert.equal(res.status, 404);
    });
});
