import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { startTestServer } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;

// An increasing counter keeps the email unique even for users created in the same millisecond.
let seq = 0;
const newUser = (over: Record<string, unknown> = {}) => ({
    name: "Aluno Teste",
    email: `aluno_${++seq}_${Math.round(performance.now() * 1000)}@email.com`,
    username: `aluno_${seq}`,
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
    return { email: data.email, token: login.body.token };
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
async function patch(path: string, token: string, body?: unknown) {
    const res = await fetch(`${server.base}${path}`, {
        method: "PATCH",
        headers: { ...auth(token), "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
    });
    return { status: res.status, body: await res.json().catch(() => null) };
}

// Builds a full track: 1 module, N lessons, each lesson with 5 questions (option B is right).
async function buildTrail(adminToken: string, lessonCount = 2) {
    const trail = await post("/trails", adminToken, {
        name: "Logica",
        level: "iniciante",
        description: "Base da programacao logica.",
    });
    const mod = await post(`/trails/${trail.body.id}/modules`, adminToken, {
        title: "Modulo 1",
        position: 1,
    });
    const lessons: string[] = [];
    for (let i = 1; i <= lessonCount; i++) {
        const lesson = await post(`/modules/${mod.body.id}/lessons`, adminToken, {
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
        // Publishes the lesson so the students see it.
        await patch(`/lessons/${lesson.body.id}/published`, adminToken, { published: true });
        lessons.push(lesson.body.id);
    }
    return { trailId: trail.body.id as string, lessonIds: lessons };
}

// Answers a lesson quiz; correctCount = how many to answer right (the rest wrong).
async function answerQuiz(token: string, lessonId: string, correctCount: number) {
    const lesson = await get(`/lessons/${lessonId}`, token);
    if (lesson.status !== 200) return lesson;
    const answers = lesson.body.questions.map((q: any, idx: number) => ({
        questionId: q.id,
        optionId: q.options.find((o: any) => o.text === (idx < correctCount ? "certa" : "errada"))
            .id,
    }));
    return post(`/lessons/${lessonId}/quiz`, token, { answers });
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

describe("Catalog (admin)", () => {
    test("the admin creates a track; a regular user gets 403", async () => {
        const admin = await createSignedInUser(true);
        const ok = await post("/trails", admin.token, {
            name: "Trilha",
            level: "iniciante",
            description: "Descricao com dez caracteres.",
        });
        assert.equal(ok.status, 201);

        const regular = await createSignedInUser();
        const denied = await post("/trails", regular.token, {
            name: "Trilha",
            level: "iniciante",
            description: "Descricao com dez caracteres.",
        });
        assert.equal(denied.status, 403);
    });

    test("rejects an invalid level (400)", async () => {
        const admin = await createSignedInUser(true);
        const res = await post("/trails", admin.token, {
            name: "Trilha",
            level: "expert",
            description: "Descricao com dez caracteres.",
        });
        assert.equal(res.status, 400);
    });

    test("rejects a question without exactly one right option (400)", async () => {
        const admin = await createSignedInUser(true);
        const t = await post("/trails", admin.token, {
            name: "Trilha",
            level: "iniciante",
            description: "Descricao longa o suficiente.",
        });
        const m = await post(`/trails/${t.body.id}/modules`, admin.token, {
            title: "Modulo",
            position: 1,
        });
        const a = await post(`/modules/${m.body.id}/lessons`, admin.token, {
            title: "Aula",
            position: 1,
        });
        const res = await post(`/lessons/${a.body.id}/questions`, admin.token, {
            statement: "Pergunta valida",
            position: 1,
            options: [
                { text: "a", isCorrect: true },
                { text: "b", isCorrect: true },
            ],
        });
        assert.equal(res.status, 400);
    });
});

describe("GET /lessons/:id (security)", () => {
    test("does not reveal which option is the right one", async () => {
        const admin = await createSignedInUser(true);
        const { lessonIds } = await buildTrail(admin.token, 1);
        const student = await createSignedInUser();

        const res = await get(`/lessons/${lessonIds[0]}`, student.token);
        assert.equal(res.status, 200);
        const hasAnswerKey = res.body.questions.some((q: any) =>
            q.options.some((o: any) => "isCorrect" in o),
        );
        assert.equal(hasAnswerKey, false);
    });
});

describe("Quiz and lesson state", () => {
    test("lessons open out of order, but the state reflects the progress", async () => {
        const admin = await createSignedInUser(true);
        const { trailId, lessonIds } = await buildTrail(admin.token, 2);
        const student = await createSignedInUser();

        // No sequential lock: lesson 2 opens even without completing lesson 1
        const earlier = await get(`/lessons/${lessonIds[1]}`, student.token);
        assert.equal(earlier.status, 200);

        // Still, the state in the track reflects the progress: 1 current, 2 locked
        const trailBefore = await get(`/trails/${trailId}`, student.token);
        const statesBefore = trailBefore.body.modules.flatMap((m: any) =>
            m.lessons.map((l: any) => l.state),
        );
        assert.deepEqual(statesBefore, ["current", "locked"]);

        // Completes lesson 1 with 5 right answers
        const quiz = await answerQuiz(student.token, lessonIds[0], 5);
        assert.equal(quiz.body.passed, true);
        assert.equal(quiz.body.lessonCompleted, true);

        // States in the track: 1 done, 2 current
        const trail = await get(`/trails/${trailId}`, student.token);
        const states = trail.body.modules.flatMap((m: any) => m.lessons.map((l: any) => l.state));
        assert.deepEqual(states, ["done", "current"]);
    });

    test("a quiz can be completed out of order", async () => {
        const admin = await createSignedInUser(true);
        const { trailId, lessonIds } = await buildTrail(admin.token, 2);
        const student = await createSignedInUser();

        const quiz = await answerQuiz(student.token, lessonIds[1], 5);
        assert.equal(quiz.status, 200);
        assert.equal(quiz.body.lessonCompleted, true);

        const trail = await get(`/trails/${trailId}`, student.token);
        const states = trail.body.modules.flatMap((m: any) => m.lessons.map((l: any) => l.state));
        assert.deepEqual(states, ["current", "done"]);
    });

    test("fewer than 4 right answers do not complete the lesson", async () => {
        const admin = await createSignedInUser(true);
        const { lessonIds } = await buildTrail(admin.token, 1);
        const student = await createSignedInUser();

        const quiz = await answerQuiz(student.token, lessonIds[0], 2);
        assert.equal(quiz.body.correct, 2);
        assert.equal(quiz.body.passed, false);
        assert.equal(quiz.body.lessonCompleted, false);
    });

    test("an unpublished lesson stays invisible to the student", async () => {
        const admin = await createSignedInUser(true);
        const t = await post("/trails", admin.token, {
            name: "Trilha",
            level: "iniciante",
            description: "Descricao longa o suficiente.",
        });
        const m = await post(`/trails/${t.body.id}/modules`, admin.token, {
            title: "Modulo",
            position: 1,
        });
        const a = await post(`/modules/${m.body.id}/lessons`, admin.token, {
            title: "Aula oculta",
            position: 1,
        });
        // lesson created without publishing (default false)

        const student = await createSignedInUser();
        // It does not show in the track
        const trail = await get(`/trails/${t.body.id}`, student.token);
        const totalLessons = trail.body.modules.flatMap((md: any) => md.lessons).length;
        assert.equal(totalLessons, 0);
        // Direct access returns 404
        const direct = await get(`/lessons/${a.body.id}`, student.token);
        assert.equal(direct.status, 404);

        // The admin sees the lesson
        const adminTrail = await get(`/trails/${t.body.id}`, admin.token);
        assert.equal(adminTrail.body.modules[0].lessons.length, 1);

        // After publishing, the student sees it
        await patch(`/lessons/${a.body.id}/published`, admin.token, { published: true });
        const later = await get(`/trails/${t.body.id}`, student.token);
        assert.equal(later.body.modules.flatMap((md: any) => md.lessons).length, 1);
    });

    test("one student's progress does not affect another's", async () => {
        const admin = await createSignedInUser(true);
        const { trailId, lessonIds } = await buildTrail(admin.token, 2);

        const studentA = await createSignedInUser();
        await answerQuiz(studentA.token, lessonIds[0], 5);

        const studentB = await createSignedInUser();
        const trailB = await get(`/trails/${trailId}`, studentB.token);
        const statesB = trailB.body.modules.flatMap((m: any) => m.lessons.map((l: any) => l.state));
        // Nothing was completed for B: the first is current, the rest locked
        assert.deepEqual(statesB, ["current", "locked"]);
    });
});

describe("Multi-language track", () => {
    test("without an explicit lang, it stays on the path of the last completed lesson", async () => {
        const admin = await createSignedInUser(true);
        const { trailId, lessonIds } = await buildTrail(admin.token, 4);

        const { db } = await import("../db.ts");
        const { lessons } = await import("../schema.ts");
        const { eq } = await import("drizzle-orm");
        const setLanguage = (id: string, language: string, position: number) =>
            db.update(lessons).set({ language, position }).where(eq(lessons.id, id));
        await setLanguage(lessonIds[0], "javascript", 1);
        await setLanguage(lessonIds[1], "javascript", 2);
        await setLanguage(lessonIds[2], "python", 1);
        await setLanguage(lessonIds[3], "python", 2);

        const student = await createSignedInUser();

        const earlier = await get(`/trails/${trailId}`, student.token);
        assert.equal(earlier.body.activeLanguage, "javascript");

        const quiz = await answerQuiz(student.token, lessonIds[2], 5);
        assert.equal(quiz.body.lessonCompleted, true);

        const later = await get(`/trails/${trailId}`, student.token);
        assert.equal(later.body.activeLanguage, "python");
        const lessonRows = later.body.modules.flatMap((m: any) => m.lessons);
        assert.equal(lessonRows.find((l: any) => l.state === "current")?.id, lessonIds[3]);

        const js = await get(`/trails/${trailId}?lang=javascript`, student.token);
        assert.equal(js.body.activeLanguage, "javascript");
    });

    test("a roadmap stage completes with a single full path", async () => {
        const admin = await createSignedInUser(true);
        const { trailId, lessonIds } = await buildTrail(admin.token, 4);

        const { db } = await import("../db.ts");
        const { lessons } = await import("../schema.ts");
        const { eq } = await import("drizzle-orm");
        const setLanguage = (id: string, language: string, position: number) =>
            db.update(lessons).set({ language, position }).where(eq(lessons.id, id));
        await setLanguage(lessonIds[0], "javascript", 1);
        await setLanguage(lessonIds[1], "javascript", 2);
        await setLanguage(lessonIds[2], "python", 1);
        await setLanguage(lessonIds[3], "python", 2);

        const rm = await post("/roadmaps", admin.token, {
            name: "Backend",
            description: "Do zero ao backend.",
            level: "iniciante",
            published: true,
        });
        const st = await post(`/roadmaps/${rm.body.id}/stages`, admin.token, {
            phase: "fundamentos",
            title: "Logica",
            description: "Base de logica.",
        });
        await post(`/roadmap-stages/${st.body.id}/refs`, admin.token, {
            refType: "trail",
            refId: trailId,
        });

        const student = await createSignedInUser();
        await answerQuiz(student.token, lessonIds[2], 5);
        await answerQuiz(student.token, lessonIds[3], 5);

        const det = await get(`/roadmaps/${rm.body.slug}`, student.token);
        assert.equal(det.status, 200);
        assert.equal(det.body.stages[0].completed, true);
    });
});

// Bug reported in production: the student redid the quiz and got everything right, but
// on reloading the lesson the score went back to the first attempt, and the mastery bar
// in the progress tab never went up. The cause was the answer being saved only once and
// never updated. The rule now has two halves, and each test covers one.
describe("Redoing the quiz", () => {
    async function savedAnswers(token: string, lessonId: string) {
        const lesson = await get(`/lessons/${lessonId}`, token);
        const qs = lesson.body.questions as { answer: { isCorrect: boolean } | null }[];
        return {
            respondidas: qs.filter((q) => q.answer).length,
            certas: qs.filter((q) => q.answer?.isCorrect).length,
        };
    }

    // The rows that already count as a right answer, which is what feeds XP, ranking and mastery.
    async function savedHits(email: string) {
        const { db } = await import("../db.ts");
        const { questionAnswers, users } = await import("../schema.ts");
        const { and, eq, isNotNull } = await import("drizzle-orm");
        const [u] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
        return db
            .select()
            .from(questionAnswers)
            .where(and(eq(questionAnswers.userId, u.id), isNotNull(questionAnswers.acertouEm)));
    }

    test("the lesson restores the last attempt, not the first", async () => {
        const admin = await createSignedInUser(true);
        const student = await createSignedInUser();
        const { lessonIds } = await buildTrail(admin.token, 1);

        await answerQuiz(student.token, lessonIds[0], 2);
        assert.deepEqual(await savedAnswers(student.token, lessonIds[0]), {
            respondidas: 5,
            certas: 2,
        });

        await answerQuiz(student.token, lessonIds[0], 5);
        assert.deepEqual(
            await savedAnswers(student.token, lessonIds[0]),
            { respondidas: 5, certas: 5 },
            "after redoing and getting everything right, the restored score has to be 5 out of 5",
        );
    });

    // An earned right answer does not go back: it is the base of XP, ranking and
    // mastery, so redoing and getting it wrong cannot take anything from anyone.
    test("getting it wrong on a redo does not erase a right answer already earned", async () => {
        const admin = await createSignedInUser(true);
        const student = await createSignedInUser();
        const { lessonIds } = await buildTrail(admin.token, 1);

        await answerQuiz(student.token, lessonIds[0], 5);
        const earlier = await savedHits(student.email);
        assert.equal(earlier.length, 5);

        await answerQuiz(student.token, lessonIds[0], 0);
        const later = await savedHits(student.email);
        assert.equal(later.length, 5, "the five right answers still count for XP and ranking");

        // But the lesson shows what was just answered, which was all wrong.
        assert.deepEqual(await savedAnswers(student.token, lessonIds[0]), {
            respondidas: 5,
            certas: 0,
        });
    });

    // The XP per question is earned once: the date of the first right answer does not move,
    // otherwise redoing the same question every day would fill the activity chart.
    test("getting it right again does not move the date of the first right answer", async () => {
        const admin = await createSignedInUser(true);
        const student = await createSignedInUser();
        const { lessonIds } = await buildTrail(admin.token, 1);

        await answerQuiz(student.token, lessonIds[0], 5);
        const first = (await savedHits(student.email))
            .map((l) => l.acertouEm!.toISOString())
            .sort();

        await answerQuiz(student.token, lessonIds[0], 5);
        const second = (await savedHits(student.email))
            .map((l) => l.acertouEm!.toISOString())
            .sort();

        assert.deepEqual(second, first);
    });

    // Getting it wrong first and right later has to earn the right answer, otherwise the
    // student never closes the track at 100% mastery.
    test("getting it right after getting it wrong counts as a right answer", async () => {
        const admin = await createSignedInUser(true);
        const student = await createSignedInUser();
        const { lessonIds } = await buildTrail(admin.token, 1);

        await answerQuiz(student.token, lessonIds[0], 0);
        assert.equal((await savedHits(student.email)).length, 0);

        await answerQuiz(student.token, lessonIds[0], 5);
        assert.equal((await savedHits(student.email)).length, 5);
    });
});

describe("Quiz without shortcuts", () => {
    test("the same right question sent repeatedly does not complete the lesson", async () => {
        const admin = await createSignedInUser(true);
        const { trailId, lessonIds } = await buildTrail(admin.token, 1);
        const student = await createSignedInUser();
        const lesson = await get(`/lessons/${lessonIds[0]}`, student.token);
        const q = lesson.body.questions[0];
        const right = {
            questionId: q.id,
            optionId: q.options.find((o: any) => o.text === "certa").id,
        };

        const quiz = await post(`/lessons/${lessonIds[0]}/quiz`, student.token, {
            answers: [right, right, right, right],
        });
        assert.equal(quiz.status, 400);
        const trail = await get(`/trails/${trailId}`, student.token);
        const states = trail.body.modules.flatMap((m: any) => m.lessons.map((l: any) => l.state));
        assert.deepEqual(states, ["current"]);
    });

    test("a missing question rejects the submission, even with four right ones", async () => {
        const admin = await createSignedInUser(true);
        const { lessonIds } = await buildTrail(admin.token, 1);
        const student = await createSignedInUser();
        const lesson = await get(`/lessons/${lessonIds[0]}`, student.token);
        const answers = lesson.body.questions.slice(0, 4).map((q: any) => ({
            questionId: q.id,
            optionId: q.options.find((o: any) => o.text === "certa").id,
        }));

        const quiz = await post(`/lessons/${lessonIds[0]}/quiz`, student.token, { answers });
        assert.equal(quiz.status, 400);
    });
});
