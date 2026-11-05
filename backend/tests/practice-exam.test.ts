import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { startTestServer } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;

let seq = 0;
const newUser = (over: Record<string, unknown> = {}) => ({
    name: "Aluno Teste",
    email: `sim_${++seq}_${Math.round(performance.now() * 1000)}@email.com`,
    username: `sim_${seq}`,
    password: "Senhaforte123!",
    birthDate: "1990-01-01",
    gender: "outro",
    phone: "11999998888",
    ...over,
});

async function updateUser(email: string, fields: Record<string, unknown>) {
    const { db } = await import("../db.ts");
    const { users } = await import("../schema.ts");
    const { eq } = await import("drizzle-orm");
    await db.update(users).set(fields).where(eq(users.email, email));
}

async function createSignedInUser(admin = false) {
    const data = newUser();
    await server.request("POST", "/register", { body: data });
    await updateUser(data.email, {
        emailVerifiedAt: new Date(),
        ...(admin ? { role: "admin" } : {}),
    });
    const login = await server.request("POST", "/login", {
        body: { email: data.email, password: data.password },
    });
    return { email: data.email, token: login.body.token as string };
}

function auth(token: string) {
    return { Authorization: `Bearer ${token}` };
}
async function get(path: string, token: string) {
    const res = await fetch(`${server.base}${path}`, { headers: auth(token) });
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
async function put(path: string, token: string, body?: unknown) {
    const res = await fetch(`${server.base}${path}`, {
        method: "PUT",
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
async function del(path: string, token: string) {
    const res = await fetch(`${server.base}${path}`, { method: "DELETE", headers: auth(token) });
    return { status: res.status, body: await res.json().catch(() => null) };
}

// Creates an exam with 3 questions (2 single answer, 1 multiple answer) straight in the
// database, since exams are created by seed or admin (there is no public endpoint).
async function buildExam(over: Record<string, unknown> = {}) {
    const { db } = await import("../db.ts");
    const { simulados, simuladoQuestions, simuladoOptions } = await import("../schema.ts");
    const [s] = await db
        .insert(simulados)
        .values({
            slug: `ccp-${++seq}`,
            name: "AWS CCP Teste",
            durationMinutes: 90,
            questionCount: 3,
            passPercent: 70,
            published: true,
            ...over,
        })
        .returning();

    const correctIds: Record<string, string[]> = {};

    async function addQuestion(answerKey: boolean[], topic: string) {
        const [q] = await db
            .insert(simuladoQuestions)
            .values({ simuladoId: s.id, statement: "Enunciado", explanation: "Porque sim.", topic })
            .returning();
        const optionRows = await db
            .insert(simuladoOptions)
            .values(
                answerKey.map((isCorrect, i) => ({
                    questionId: q.id,
                    text: `opcao ${i + 1}`,
                    isCorrect,
                    position: i + 1,
                })),
            )
            .returning();
        correctIds[q.id] = optionRows.filter((o) => o.isCorrect).map((o) => o.id);
        return q.id;
    }

    await addQuestion([true, false], "Tema A"); // single answer
    await addQuestion([false, true], "Tema A"); // single answer
    const multiId = await addQuestion([true, true, false], "Tema B"); // multiple (2 right)

    return { slug: s.slug as string, corretas: correctIds, multiId };
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

describe("Practice exam: start and security", () => {
    test("starts the attempt without leaking the answer key", async () => {
        const student = await createSignedInUser();
        const { slug } = await buildExam();

        const r = await post(`/simulados/${slug}/attempts`, student.token);
        assert.equal(r.status, 201);
        assert.equal(r.body.questions.length, 3);
        assert.ok(r.body.remainingSeconds > 0);
        assert.equal(r.body.submitted, false);

        const leaked = r.body.questions.some((q: any) =>
            q.options.some((o: any) => "isCorrect" in o),
        );
        assert.equal(leaked, false);
        assert.equal(
            r.body.questions.some((q: any) => "explanation" in q),
            false,
        );
        assert.equal(
            r.body.questions.some((q: any) => "topic" in q),
            false,
        );
    });

    test("another user cannot open someone else's attempt", async () => {
        const owner = await createSignedInUser();
        const { slug } = await buildExam();
        const created = await post(`/simulados/${slug}/attempts`, owner.token);

        const intruder = await createSignedInUser();
        const r = await get(`/simulado-attempts/${created.body.attemptId}`, intruder.token);
        assert.equal(r.status, 404);
    });

    test("a missing exam returns 404", async () => {
        const student = await createSignedInUser();
        const r = await post(`/simulados/nao-existe/attempts`, student.token);
        assert.equal(r.status, 404);
    });
});

describe("Practice exam: answering, submitting and grading", () => {
    test("getting everything right passes with 100 and reveals the answer key", async () => {
        const student = await createSignedInUser();
        const { slug, corretas: correctIds } = await buildExam();

        const attempt = await post(`/simulados/${slug}/attempts`, student.token);
        const id = attempt.body.attemptId;

        for (const q of attempt.body.questions) {
            await put(`/simulado-attempts/${id}/answers/${q.id}`, student.token, {
                optionIds: correctIds[q.id],
            });
        }

        const submission = await post(`/simulado-attempts/${id}/submit`, student.token);
        assert.equal(submission.status, 200);
        assert.equal(submission.body.score, 100);
        assert.equal(submission.body.passed, true);

        // After submitting, the answer key shows.
        const review = await get(`/simulado-attempts/${id}`, student.token);
        assert.equal(review.body.submitted, true);
        assert.ok(review.body.questions[0].options.some((o: any) => "isCorrect" in o));
    });

    test("marking only one option of the multiple-answer question fails that question", async () => {
        const student = await createSignedInUser();
        const { slug, corretas: correctIds, multiId } = await buildExam();

        const attempt = await post(`/simulados/${slug}/attempts`, student.token);
        const id = attempt.body.attemptId;

        for (const q of attempt.body.questions) {
            const toMark = q.id === multiId ? [correctIds[q.id][0]] : correctIds[q.id];
            await put(`/simulado-attempts/${id}/answers/${q.id}`, student.token, {
                optionIds: toMark,
            });
        }

        const submission = await post(`/simulado-attempts/${id}/submit`, student.token);
        assert.equal(submission.body.acertos, 2);
        assert.equal(submission.body.score, 67);
        assert.equal(submission.body.passed, false);
    });

    test("the result groups the mistakes by topic and reveals the topic", async () => {
        const student = await createSignedInUser();
        const { slug, corretas: correctIds, multiId } = await buildExam();
        const attempt = await post(`/simulados/${slug}/attempts`, student.token);
        const id = attempt.body.attemptId;

        // gets everything right except the multiple-answer one (Tema B)
        for (const q of attempt.body.questions) {
            const toMark = q.id === multiId ? [correctIds[q.id][0]] : correctIds[q.id];
            await put(`/simulado-attempts/${id}/answers/${q.id}`, student.token, {
                optionIds: toMark,
            });
        }
        await post(`/simulado-attempts/${id}/submit`, student.token);

        const rev = await get(`/simulado-attempts/${id}`, student.token);
        assert.ok(rev.body.questions.every((q: any) => "topic" in q));
        assert.deepEqual(rev.body.temasARevisar, [{ topic: "Tema B", erradas: 1, total: 1 }]);
    });

    test("does not allow submitting twice", async () => {
        const student = await createSignedInUser();
        const { slug } = await buildExam();
        const attempt = await post(`/simulados/${slug}/attempts`, student.token);
        const id = attempt.body.attemptId;

        await post(`/simulado-attempts/${id}/submit`, student.token);
        const second = await post(`/simulado-attempts/${id}/submit`, student.token);
        assert.equal(second.status, 409);
    });

    test("the history lists the submitted attempt", async () => {
        const student = await createSignedInUser();
        const { slug, corretas: correctIds } = await buildExam();
        const attempt = await post(`/simulados/${slug}/attempts`, student.token);
        const id = attempt.body.attemptId;
        for (const q of attempt.body.questions) {
            await put(`/simulado-attempts/${id}/answers/${q.id}`, student.token, {
                optionIds: correctIds[q.id],
            });
        }
        await post(`/simulado-attempts/${id}/submit`, student.token);

        const history = await get(`/me/simulado-attempts`, student.token);
        assert.equal(history.status, 200);
        assert.equal(history.body.length, 1);
        assert.equal(history.body[0].passed, true);
        assert.equal(history.body[0].score, 100);
    });
});

describe("Practice exam: practice mode", () => {
    test("checks right away, reveals the answer key and locks the answer", async () => {
        const student = await createSignedInUser();
        const { slug, corretas: correctIds } = await buildExam();

        const attempt = await post(`/simulados/${slug}/attempts`, student.token, { pratica: true });
        assert.equal(attempt.status, 201);
        assert.equal(attempt.body.pratica, true);
        // Practice is study, not an exam: it never has a timer.
        assert.equal(attempt.body.expiresAt, null);
        assert.equal(attempt.body.remainingSeconds, null);

        const q = attempt.body.questions[0];
        const id = attempt.body.attemptId;
        await put(`/simulado-attempts/${id}/answers/${q.id}`, student.token, {
            optionIds: correctIds[q.id],
        });

        const checked = await post(
            `/simulado-attempts/${id}/answers/${q.id}/conferir`,
            student.token,
        );
        assert.equal(checked.status, 200);
        assert.equal(checked.body.correta, true);
        assert.deepEqual(checked.body.corretas, correctIds[q.id]);
        assert.equal(checked.body.explanation, "Porque sim.");

        // A checked question cannot change its answer, otherwise the final score would be fiction.
        const markAgain = await put(`/simulado-attempts/${id}/answers/${q.id}`, student.token, {
            optionIds: [],
        });
        assert.equal(markAgain.status, 409);

        // The answer key shows only on the checked question.
        const state = await get(`/simulado-attempts/${id}`, student.token);
        const checkedInState = state.body.questions.find((x: any) => x.id === q.id);
        const otherQuestion = state.body.questions.find((x: any) => x.id !== q.id);
        assert.equal(checkedInState.revealed, true);
        assert.ok(checkedInState.options.every((o: any) => "isCorrect" in o));
        assert.equal(checkedInState.explanation, "Porque sim.");
        assert.equal(otherQuestion.revealed, false);
        assert.equal(
            otherQuestion.options.some((o: any) => "isCorrect" in o),
            false,
        );
        assert.equal("explanation" in otherQuestion, false);
    });

    test("does not check a blank question", async () => {
        const student = await createSignedInUser();
        const { slug } = await buildExam();
        const attempt = await post(`/simulados/${slug}/attempts`, student.token, { pratica: true });
        const id = attempt.body.attemptId;
        const q = attempt.body.questions[0];

        const r = await post(`/simulado-attempts/${id}/answers/${q.id}/conferir`, student.token);
        assert.equal(r.status, 409);

        const state = await get(`/simulado-attempts/${id}`, student.token);
        assert.equal(
            state.body.questions.some((x: any) => x.options.some((o: any) => "isCorrect" in o)),
            false,
        );
    });

    test("a regular attempt does not reveal the answer key through the check", async () => {
        const student = await createSignedInUser();
        const { slug, corretas: correctIds } = await buildExam();
        const attempt = await post(`/simulados/${slug}/attempts`, student.token);
        const id = attempt.body.attemptId;
        const q = attempt.body.questions[0];
        await put(`/simulado-attempts/${id}/answers/${q.id}`, student.token, {
            optionIds: correctIds[q.id],
        });

        const r = await post(`/simulado-attempts/${id}/answers/${q.id}/conferir`, student.token);
        assert.equal(r.status, 409);

        const state = await get(`/simulado-attempts/${id}`, student.token);
        assert.equal(state.body.pratica, false);
        assert.equal(
            state.body.questions.some((x: any) => x.options.some((o: any) => "isCorrect" in o)),
            false,
        );
    });

    test("practice shows as practice in the history and is still scored", async () => {
        const student = await createSignedInUser();
        const { slug, corretas: correctIds } = await buildExam();
        const attempt = await post(`/simulados/${slug}/attempts`, student.token, { pratica: true });
        const id = attempt.body.attemptId;
        for (const q of attempt.body.questions) {
            await put(`/simulado-attempts/${id}/answers/${q.id}`, student.token, {
                optionIds: correctIds[q.id],
            });
        }
        const submission = await post(`/simulado-attempts/${id}/submit`, student.token);
        assert.equal(submission.body.score, 100);

        const history = await get(`/me/simulado-attempts`, student.token);
        assert.equal(history.body[0].pratica, true);
        assert.equal(history.body[0].personalizado, true);
        assert.equal(history.body[0].comTempo, false);
    });
});

describe("Practice exam: favorites", () => {
    test("favoriting marks the exam only for whoever favorited it", async () => {
        const student = await createSignedInUser();
        const otherUser = await createSignedInUser();
        const { slug } = await buildExam();

        const r = await post(`/simulados/${slug}/favoritar`, student.token);
        assert.equal(r.status, 200);
        assert.equal(r.body.favorito, true);

        const mine = await get("/simulados", student.token);
        assert.equal(mine.body.find((s: any) => s.slug === slug).favorito, true);
        const theirs = await get("/simulados", otherUser.token);
        assert.equal(theirs.body.find((s: any) => s.slug === slug).favorito, false);
    });

    test("favoriting again removes the favorite", async () => {
        const student = await createSignedInUser();
        const { slug } = await buildExam();

        await post(`/simulados/${slug}/favoritar`, student.token);
        const r = await post(`/simulados/${slug}/favoritar`, student.token);
        assert.equal(r.body.favorito, false);

        const examList = await get("/simulados", student.token);
        assert.equal(examList.body.find((s: any) => s.slug === slug).favorito, false);
    });

    test("a missing or unpublished exam returns 404", async () => {
        const student = await createSignedInUser();
        const { slug } = await buildExam({ published: false });

        assert.equal((await post(`/simulados/nao-existe/favoritar`, student.token)).status, 404);
        assert.equal((await post(`/simulados/${slug}/favoritar`, student.token)).status, 404);
    });

    test("deleting a favorited exam removes its favorites too", async () => {
        const admin = await createSignedInUser(true);
        const student = await createSignedInUser();
        const { slug } = await buildExam();
        await post(`/simulados/${slug}/favoritar`, student.token);

        const r = await del(`/simulados/${slug}`, admin.token);
        assert.equal(r.status, 200);
        const examList = await get("/simulados", student.token);
        assert.equal(
            examList.body.some((s: any) => s.slug === slug),
            false,
        );
    });
});

describe("Practice exam: admin CRUD", () => {
    const newExam = (over: Record<string, unknown> = {}) => ({
        slug: `admin-${++seq}`,
        name: "Simulado Admin",
        durationMinutes: 30,
        questionCount: 10,
        passPercent: 70,
        published: true,
        ...over,
    });
    const newQuestion = (over: Record<string, unknown> = {}) => ({
        statement: "Enunciado da questão de teste",
        topic: "Tema X",
        explanation: "Porque sim.",
        options: [
            { text: "certa", isCorrect: true },
            { text: "errada", isCorrect: false },
        ],
        ...over,
    });

    test("the admin creates an exam; a regular user gets 403", async () => {
        const admin = await createSignedInUser(true);
        assert.equal((await post("/simulados", admin.token, newExam())).status, 201);

        const regular = await createSignedInUser();
        assert.equal((await post("/simulados", regular.token, newExam())).status, 403);
    });

    test("a duplicate slug returns 409", async () => {
        const admin = await createSignedInUser(true);
        const s = newExam();
        assert.equal((await post("/simulados", admin.token, s)).status, 201);
        assert.equal((await post("/simulados", admin.token, s)).status, 409);
    });

    test("a question without a right option is rejected (400)", async () => {
        const admin = await createSignedInUser(true);
        const s = newExam();
        await post("/simulados", admin.token, s);
        const r = await post(`/simulados/${s.slug}/questions`, admin.token, {
            statement: "Sem gabarito",
            options: [
                { text: "a", isCorrect: false },
                { text: "b", isCorrect: false },
            ],
        });
        assert.equal(r.status, 400);
    });

    test("flow: creates, adds a question, edits, deletes the question and the exam", async () => {
        const admin = await createSignedInUser(true);
        const s = newExam();
        await post("/simulados", admin.token, s);

        const created = await post(`/simulados/${s.slug}/questions`, admin.token, newQuestion());
        assert.equal(created.status, 201);

        let det = await get(`/admin/simulados/${s.slug}`, admin.token);
        assert.equal(det.body.questions.length, 1);
        assert.ok(det.body.questions[0].options.some((o: any) => o.isCorrect === true));
        const qId = det.body.questions[0].id;

        const edited = await patch(
            `/simulado-questions/${qId}`,
            admin.token,
            newQuestion({
                statement: "Enunciado editado",
                options: [
                    { text: "nova certa", isCorrect: true },
                    { text: "nova errada", isCorrect: false },
                    { text: "outra", isCorrect: false },
                ],
            }),
        );
        assert.equal(edited.status, 200);
        det = await get(`/admin/simulados/${s.slug}`, admin.token);
        assert.equal(det.body.questions[0].statement, "Enunciado editado");
        assert.equal(det.body.questions[0].options.length, 3);

        const examList = await get(`/admin/simulados`, admin.token);
        assert.equal(Number(examList.body.find((x: any) => x.slug === s.slug).questoes), 1);

        assert.equal((await del(`/simulado-questions/${qId}`, admin.token)).status, 200);
        det = await get(`/admin/simulados/${s.slug}`, admin.token);
        assert.equal(det.body.questions.length, 0);

        assert.equal((await del(`/simulados/${s.slug}`, admin.token)).status, 200);
        assert.equal((await get(`/admin/simulados/${s.slug}`, admin.token)).status, 404);
    });

    test("syncs (save all) atomically", async () => {
        const admin = await createSignedInUser(true);
        const s = newExam();
        await post("/simulados", admin.token, s);
        const q = (t: string) => ({
            statement: `Enunciado ${t}`,
            topic: "Tema",
            options: [
                { text: "certa", isCorrect: true },
                { text: "errada", isCorrect: false },
            ],
        });

        // creates two at once
        let r = await put(`/admin/simulados/${s.slug}/questions`, admin.token, {
            questions: [q("A"), q("B")],
        });
        assert.equal(r.status, 200);
        let det = await get(`/admin/simulados/${s.slug}`, admin.token);
        assert.equal(det.body.questions.length, 2);

        // edits the 1st, removes the 2nd, adds a new one
        const q1Id = det.body.questions[0].id;
        r = await put(`/admin/simulados/${s.slug}/questions`, admin.token, {
            questions: [{ ...q("A"), id: q1Id, statement: "Editada" }, q("C")],
        });
        assert.equal(r.status, 200);
        det = await get(`/admin/simulados/${s.slug}`, admin.token);
        const statements = det.body.questions.map((x: any) => x.statement).sort();
        assert.deepEqual(statements, ["Editada", "Enunciado C"]);

        // atomic: one invalid question rejects everything, without changing the state
        const invalid = await put(`/admin/simulados/${s.slug}/questions`, admin.token, {
            questions: [
                q("D"),
                { statement: "sem correta", options: [{ text: "a", isCorrect: false }] },
            ],
        });
        assert.equal(invalid.status, 400);
        det = await get(`/admin/simulados/${s.slug}`, admin.token);
        assert.equal(det.body.questions.length, 2);
    });
});
