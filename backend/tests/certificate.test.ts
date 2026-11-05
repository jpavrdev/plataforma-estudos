import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { startTestServer } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;

let seq = 0;
const newUser = () => ({
    name: "Aluno Certificado",
    email: `cert_${++seq}_${Math.round(performance.now() * 1000)}@email.com`,
    username: `cert_${seq}`,
    password: "Senhaforte123!",
    birthDate: "1990-01-01",
    gender: "outro",
    phone: "11999998888",
});

async function updateUser(email: string, fields: Record<string, unknown>) {
    const { db } = await import("../db.ts");
    const { users } = await import("../schema.ts");
    const { eq } = await import("drizzle-orm");
    await db.update(users).set(fields).where(eq(users.email, email));
}

async function createLoggedUser(admin = false) {
    const data = newUser();
    await server.request("POST", "/register", { body: data });
    await updateUser(data.email, {
        emailVerifiedAt: new Date(),
        ...(admin ? { role: "admin" } : {}),
    });
    const login = await server.request("POST", "/login", {
        body: { email: data.email, password: data.password },
    });
    return { email: data.email, token: login.body.token };
}

function auth(token: string) {
    return { Authorization: `Bearer ${token}` };
}
async function get(path: string, token?: string) {
    const res = await fetch(`${server.base}${path}`, { headers: token ? auth(token) : {} });
    return { status: res.status, body: await res.json().catch(() => null) };
}
async function post(path: string, token: string, body?: unknown) {
    const res = await fetch(`${server.base}${path}`, {
        method: "POST",
        headers: { ...auth(token), "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
    });
    return { status: res.status, body: await res.json().catch(() => null) };
}
async function patch(path: string, token: string, body?: unknown) {
    const res = await fetch(`${server.base}${path}`, {
        method: "PATCH",
        headers: { ...auth(token), "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
    });
    return { status: res.status, body: await res.json().catch(() => null) };
}

const VALID_CPF = "52998224725";

async function seedTrail(adminToken: string, opts: { hours?: number | null } = {}) {
    const trail = await post("/trails", adminToken, {
        name: "Logica",
        level: "iniciante",
        description: "Base da programacao logica.",
        ...(opts.hours !== null ? { workloadHours: opts.hours ?? 20 } : {}),
    });
    const moduleRow = await post(`/trails/${trail.body.id}/modules`, adminToken, {
        title: "Modulo 1",
        position: 1,
    });
    const lessonIds: string[] = [];
    for (let i = 1; i <= 2; i++) {
        const lesson = await post(`/modules/${moduleRow.body.id}/lessons`, adminToken, {
            title: `Aula ${i}`,
            position: i,
        });
        for (let q = 1; q <= 5; q++) {
            await post(`/lessons/${lesson.body.id}/questions`, adminToken, {
                statement: `Questao numero ${q}`,
                position: q,
                options: [
                    { text: "errada", isCorrect: false },
                    { text: "certa", isCorrect: true },
                ],
            });
        }
        await patch(`/lessons/${lesson.body.id}/published`, adminToken, { published: true });
        lessonIds.push(lesson.body.id as string);
    }
    return { trailId: trail.body.id as string, lessonIds };
}

async function passQuiz(token: string, lessonId: string) {
    const lesson = await get(`/lessons/${lessonId}`, token);
    const answers = lesson.body.questions.map((q: any) => ({
        questionId: q.id,
        optionId: q.options.find((o: any) => o.text === "certa").id,
    }));
    await post(`/lessons/${lessonId}/quiz`, token, { answers });
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

describe("Completion certificate", () => {
    test("full flow: eligible after completing, issues, validates publicly and downloads the PDF", async () => {
        const admin = await createLoggedUser(true);
        const { trailId, lessonIds } = await seedTrail(admin.token);
        const student = await createLoggedUser();

        const antes = await get(`/trails/${trailId}/certificado`, student.token);
        assert.equal(antes.body.elegivel, false);
        assert.equal(antes.body.motivo, "progresso");

        for (const id of lessonIds) await passQuiz(student.token, id);

        const after = await get(`/trails/${trailId}/certificado`, student.token);
        assert.equal(after.body.elegivel, true);

        const issued = await post(`/trails/${trailId}/certificado`, student.token, {
            cpf: "529.982.247-25",
            name: "Aluno Certificado da Silva",
        });
        assert.equal(issued.status, 200);
        assert.match(issued.body.code, /^ED(-[2-9A-HJKMNP-Z]{4}){3}$/);

        const publicView = await get(`/certificados/${issued.body.code}`);
        assert.equal(publicView.status, 200);
        assert.equal(publicView.body.studentName, "Aluno Certificado da Silva");
        assert.equal(publicView.body.trailName, "Logica");
        assert.equal(publicView.body.workloadHours, 20);
        assert.equal(publicView.body.cpf, "***.982.247-**");

        const pdf = await fetch(`${server.base}/certificados/${issued.body.code}/pdf`, {
            headers: auth(student.token),
        });
        assert.equal(pdf.status, 200);
        assert.equal(pdf.headers.get("content-type"), "application/pdf");
        const body = Buffer.from(await pdf.arrayBuffer());
        assert.equal(body.subarray(0, 5).toString(), "%PDF-");
        assert.ok(body.length > 2000);

        const anonimo = await fetch(`${server.base}/certificados/${issued.body.code}/pdf`);
        assert.equal(anonimo.status, 401);
        const other = await createLoggedUser();
        const alheio = await fetch(`${server.base}/certificados/${issued.body.code}/pdf`, {
            headers: auth(other.token),
        });
        assert.equal(alheio.status, 403);

        const repeated = await post(`/trails/${trailId}/certificado`, student.token, {
            cpf: VALID_CPF,
            name: "Aluno Certificado da Silva",
        });
        assert.equal(repeated.body.code, issued.body.code);
    });

    test("once issued the CPF does not change, even when asked again with another one", async () => {
        const admin = await createLoggedUser(true);
        const { trailId, lessonIds } = await seedTrail(admin.token);
        const student = await createLoggedUser();
        for (const id of lessonIds) await passQuiz(student.token, id);

        const first = await post(`/trails/${trailId}/certificado`, student.token, {
            cpf: VALID_CPF,
            name: "Aluno Certificado da Silva",
        });
        const attempt = await post(`/trails/${trailId}/certificado`, student.token, {
            cpf: "111.444.777-35",
            name: "Outro Nome Qualquer",
        });
        assert.equal(attempt.status, 200);
        assert.equal(attempt.body.code, first.body.code);

        const publicView = await get(`/certificados/${first.body.code}`);
        assert.equal(publicView.body.cpf, "***.982.247-**");
    });

    test("without completing the track it does not issue; an invalid CPF is rejected", async () => {
        const admin = await createLoggedUser(true);
        const { trailId, lessonIds } = await seedTrail(admin.token);
        const student = await createLoggedUser();

        const cedo = await post(`/trails/${trailId}/certificado`, student.token, {
            cpf: VALID_CPF,
            name: "Aluno Certificado da Silva",
        });
        assert.equal(cedo.status, 409);

        for (const id of lessonIds) await passQuiz(student.token, id);
        const invalid = await post(`/trails/${trailId}/certificado`, student.token, {
            cpf: "111.111.111-11",
            name: "Aluno Certificado da Silva",
        });
        assert.equal(invalid.status, 400);

        const shortName = await post(`/trails/${trailId}/certificado`, student.token, {
            cpf: VALID_CPF,
            name: "Fulano",
        });
        assert.equal(shortName.status, 400);
    });

    test("a manual completion through the roadmap does not issue a certificate", async () => {
        const admin = await createLoggedUser(true);
        const { trailId } = await seedTrail(admin.token);
        const rm = await post("/roadmaps", admin.token, {
            name: "Backend",
            description: "Do zero ao backend.",
            level: "iniciante",
            published: true,
        });
        const st = await post(`/roadmaps/${rm.body.id}/stages`, admin.token, {
            phase: "fundamentos",
            title: "Etapa 1",
            description: "Descricao da etapa.",
        });
        await post(`/roadmap-stages/${st.body.id}/refs`, admin.token, {
            refType: "trail",
            refId: trailId,
        });
        const student = await createLoggedUser();
        await post(`/roadmap-stages/${st.body.id}/concluir`, student.token);

        const status = await get(`/trails/${trailId}/certificado`, student.token);
        assert.equal(status.body.elegivel, false);
        assert.equal(status.body.motivo, "manual");

        const attempt = await post(`/trails/${trailId}/certificado`, student.token, {
            cpf: VALID_CPF,
            name: "Aluno Certificado da Silva",
        });
        assert.equal(attempt.status, 409);
    });

    // The track screen uses the reason to explain to the student why the certificate
    // does not show up. Without it the screen shows a silent card, which is what caused
    // the "I completed the track and cannot issue it" report.
    test("whoever has not completed yet gets the reason progresso", async () => {
        const admin = await createLoggedUser(true);
        const { trailId, lessonIds } = await seedTrail(admin.token);
        const student = await createLoggedUser();
        await passQuiz(student.token, lessonIds[0]);

        const status = await get(`/trails/${trailId}/certificado`, student.token);
        assert.equal(status.body.elegivel, false);
        assert.equal(status.body.motivo, "progresso");
    });

    test("a track without workload hours does not issue", async () => {
        const admin = await createLoggedUser(true);
        const { trailId, lessonIds } = await seedTrail(admin.token, { hours: null });
        const student = await createLoggedUser();
        for (const id of lessonIds) await passQuiz(student.token, id);

        const status = await get(`/trails/${trailId}/certificado`, student.token);
        assert.equal(status.body.motivo, "carga_horaria");
        const r = await post(`/trails/${trailId}/certificado`, student.token, {
            cpf: VALID_CPF,
            name: "Aluno Certificado da Silva",
        });
        assert.equal(r.status, 409);
    });

    test("multi-language track: one complete track issues, with the language on the certificate", async () => {
        const admin = await createLoggedUser(true);
        const { trailId, lessonIds } = await seedTrail(admin.token);
        const { db } = await import("../db.ts");
        const { lessons, modules } = await import("../schema.ts");
        const { eq } = await import("drizzle-orm");
        await db
            .update(lessons)
            .set({ language: "javascript" })
            .where(eq(lessons.id, lessonIds[1]));
        const [mod] = await db
            .select({ id: modules.id })
            .from(modules)
            .where(eq(modules.trailId, trailId));
        const pair = await post(`/modules/${mod.id}/lessons`, admin.token, {
            title: "Aula 2 em Python",
            position: 3,
        });
        await patch(`/lessons/${pair.body.id}/published`, admin.token, { published: true });
        await db.update(lessons).set({ language: "python" }).where(eq(lessons.id, pair.body.id));

        const student = await createLoggedUser();
        for (const id of lessonIds) await passQuiz(student.token, id);

        const status = await get(`/trails/${trailId}/certificado`, student.token);
        assert.equal(status.body.elegivel, true);

        const mine = await get("/me/trails", student.token);
        assert.equal(mine.body[0].progress, 100);

        const issued = await post(`/trails/${trailId}/certificado`, student.token, {
            cpf: VALID_CPF,
            name: "Aluno Certificado da Silva",
        });
        assert.equal(issued.status, 200);
        const publicView = await get(`/certificados/${issued.body.code}`);
        assert.equal(publicView.body.language, "JavaScript");
    });

    test("an unknown code returns 404 on the public validation", async () => {
        const r = await get("/certificados/ED-XXXX-XXXX-XXXX");
        assert.equal(r.status, 404);
    });
});
