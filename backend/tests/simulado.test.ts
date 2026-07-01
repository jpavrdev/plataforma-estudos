import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { startTestServer } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;

let seq = 0;
const novoUsuario = (over: Record<string, unknown> = {}) => ({
    name: "Aluno Teste",
    email: `sim_${++seq}_${Math.round(performance.now() * 1000)}@email.com`,
    username: `sim_${seq}`,
    password: "Senhaforte123!",
    birthDate: "1990-01-01",
    gender: "outro",
    phone: "11999998888",
    ...over,
});

async function ajustarUsuario(email: string, campos: Record<string, unknown>) {
    const { db } = await import("../db.ts");
    const { users } = await import("../schema.ts");
    const { eq } = await import("drizzle-orm");
    await db.update(users).set(campos).where(eq(users.email, email));
}

async function criarUsuarioLogado(admin = false) {
    const dados = novoUsuario();
    await server.request("POST", "/register", { body: dados });
    await ajustarUsuario(dados.email, {
        emailVerifiedAt: new Date(),
        ...(admin ? { role: "admin" } : {}),
    });
    const login = await server.request("POST", "/login", {
        body: { email: dados.email, password: dados.password },
    });
    return { email: dados.email, token: login.body.token as string };
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

// Cria um simulado com 3 questões (2 de resposta única, 1 de múltipla) direto no
// banco, já que a criação de simulado é por seed/admin (não há endpoint público).
async function montarSimulado(over: Record<string, unknown> = {}) {
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

    const corretas: Record<string, string[]> = {};

    async function criarQuestao(gabarito: boolean[], topic: string) {
        const [q] = await db
            .insert(simuladoQuestions)
            .values({ simuladoId: s.id, statement: "Enunciado", explanation: "Porque sim.", topic })
            .returning();
        const opcoes = await db
            .insert(simuladoOptions)
            .values(
                gabarito.map((isCorrect, i) => ({
                    questionId: q.id,
                    text: `opcao ${i + 1}`,
                    isCorrect,
                    position: i + 1,
                })),
            )
            .returning();
        corretas[q.id] = opcoes.filter((o) => o.isCorrect).map((o) => o.id);
        return q.id;
    }

    await criarQuestao([true, false], "Tema A"); // única
    await criarQuestao([false, true], "Tema A"); // única
    const multiId = await criarQuestao([true, true, false], "Tema B"); // múltipla (2 corretas)

    return { slug: s.slug as string, corretas, multiId };
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

describe("Simulado: início e segurança", () => {
    test("inicia a tentativa sem vazar o gabarito", async () => {
        const aluno = await criarUsuarioLogado();
        const { slug } = await montarSimulado();

        const r = await post(`/simulados/${slug}/attempts`, aluno.token);
        assert.equal(r.status, 201);
        assert.equal(r.body.questions.length, 3);
        assert.ok(r.body.remainingSeconds > 0);
        assert.equal(r.body.submitted, false);

        const vazou = r.body.questions.some((q: any) =>
            q.options.some((o: any) => "isCorrect" in o),
        );
        assert.equal(vazou, false);
        assert.equal(
            r.body.questions.some((q: any) => "explanation" in q),
            false,
        );
        assert.equal(
            r.body.questions.some((q: any) => "topic" in q),
            false,
        );
    });

    test("outro usuário não acessa a tentativa alheia", async () => {
        const dono = await criarUsuarioLogado();
        const { slug } = await montarSimulado();
        const criada = await post(`/simulados/${slug}/attempts`, dono.token);

        const intruso = await criarUsuarioLogado();
        const r = await get(`/simulado-attempts/${criada.body.attemptId}`, intruso.token);
        assert.equal(r.status, 404);
    });

    test("simulado inexistente retorna 404", async () => {
        const aluno = await criarUsuarioLogado();
        const r = await post(`/simulados/nao-existe/attempts`, aluno.token);
        assert.equal(r.status, 404);
    });
});

describe("Simulado: responder, enviar e corrigir", () => {
    test("gabaritando, passa com 100 e revela o gabarito", async () => {
        const aluno = await criarUsuarioLogado();
        const { slug, corretas } = await montarSimulado();

        const attempt = await post(`/simulados/${slug}/attempts`, aluno.token);
        const id = attempt.body.attemptId;

        for (const q of attempt.body.questions) {
            await put(`/simulado-attempts/${id}/answers/${q.id}`, aluno.token, {
                optionIds: corretas[q.id],
            });
        }

        const envio = await post(`/simulado-attempts/${id}/submit`, aluno.token);
        assert.equal(envio.status, 200);
        assert.equal(envio.body.score, 100);
        assert.equal(envio.body.passed, true);

        // Depois de enviar, o gabarito aparece.
        const revisao = await get(`/simulado-attempts/${id}`, aluno.token);
        assert.equal(revisao.body.submitted, true);
        assert.ok(revisao.body.questions[0].options.some((o: any) => "isCorrect" in o));
    });

    test("marcar só uma opção da múltipla reprova aquela questão", async () => {
        const aluno = await criarUsuarioLogado();
        const { slug, corretas, multiId } = await montarSimulado();

        const attempt = await post(`/simulados/${slug}/attempts`, aluno.token);
        const id = attempt.body.attemptId;

        for (const q of attempt.body.questions) {
            const marcar = q.id === multiId ? [corretas[q.id][0]] : corretas[q.id];
            await put(`/simulado-attempts/${id}/answers/${q.id}`, aluno.token, {
                optionIds: marcar,
            });
        }

        const envio = await post(`/simulado-attempts/${id}/submit`, aluno.token);
        assert.equal(envio.body.acertos, 2);
        assert.equal(envio.body.score, 67);
        assert.equal(envio.body.passed, false);
    });

    test("resultado agrupa os erros por tema e revela o tópico", async () => {
        const aluno = await criarUsuarioLogado();
        const { slug, corretas, multiId } = await montarSimulado();
        const attempt = await post(`/simulados/${slug}/attempts`, aluno.token);
        const id = attempt.body.attemptId;

        // acerta tudo, menos a múltipla (Tema B)
        for (const q of attempt.body.questions) {
            const marcar = q.id === multiId ? [corretas[q.id][0]] : corretas[q.id];
            await put(`/simulado-attempts/${id}/answers/${q.id}`, aluno.token, {
                optionIds: marcar,
            });
        }
        await post(`/simulado-attempts/${id}/submit`, aluno.token);

        const rev = await get(`/simulado-attempts/${id}`, aluno.token);
        assert.ok(rev.body.questions.every((q: any) => "topic" in q));
        assert.deepEqual(rev.body.temasARevisar, [{ topic: "Tema B", erradas: 1, total: 1 }]);
    });

    test("não deixa enviar duas vezes", async () => {
        const aluno = await criarUsuarioLogado();
        const { slug } = await montarSimulado();
        const attempt = await post(`/simulados/${slug}/attempts`, aluno.token);
        const id = attempt.body.attemptId;

        await post(`/simulado-attempts/${id}/submit`, aluno.token);
        const segundo = await post(`/simulado-attempts/${id}/submit`, aluno.token);
        assert.equal(segundo.status, 409);
    });

    test("histórico lista a tentativa enviada", async () => {
        const aluno = await criarUsuarioLogado();
        const { slug, corretas } = await montarSimulado();
        const attempt = await post(`/simulados/${slug}/attempts`, aluno.token);
        const id = attempt.body.attemptId;
        for (const q of attempt.body.questions) {
            await put(`/simulado-attempts/${id}/answers/${q.id}`, aluno.token, {
                optionIds: corretas[q.id],
            });
        }
        await post(`/simulado-attempts/${id}/submit`, aluno.token);

        const hist = await get(`/me/simulado-attempts`, aluno.token);
        assert.equal(hist.status, 200);
        assert.equal(hist.body.length, 1);
        assert.equal(hist.body[0].passed, true);
        assert.equal(hist.body[0].score, 100);
    });
});

describe("Simulado: CRUD admin", () => {
    const novoSimulado = (over: Record<string, unknown> = {}) => ({
        slug: `admin-${++seq}`,
        name: "Simulado Admin",
        durationMinutes: 30,
        questionCount: 10,
        passPercent: 70,
        published: true,
        ...over,
    });
    const novaQuestao = (over: Record<string, unknown> = {}) => ({
        statement: "Enunciado da questão de teste",
        topic: "Tema X",
        explanation: "Porque sim.",
        options: [
            { text: "certa", isCorrect: true },
            { text: "errada", isCorrect: false },
        ],
        ...over,
    });

    test("admin cria simulado; comum recebe 403", async () => {
        const admin = await criarUsuarioLogado(true);
        assert.equal((await post("/simulados", admin.token, novoSimulado())).status, 201);

        const comum = await criarUsuarioLogado();
        assert.equal((await post("/simulados", comum.token, novoSimulado())).status, 403);
    });

    test("slug duplicado retorna 409", async () => {
        const admin = await criarUsuarioLogado(true);
        const s = novoSimulado();
        assert.equal((await post("/simulados", admin.token, s)).status, 201);
        assert.equal((await post("/simulados", admin.token, s)).status, 409);
    });

    test("questão sem alternativa correta é rejeitada (400)", async () => {
        const admin = await criarUsuarioLogado(true);
        const s = novoSimulado();
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

    test("fluxo: cria, adiciona questão, edita, exclui questão e simulado", async () => {
        const admin = await criarUsuarioLogado(true);
        const s = novoSimulado();
        await post("/simulados", admin.token, s);

        const criada = await post(`/simulados/${s.slug}/questions`, admin.token, novaQuestao());
        assert.equal(criada.status, 201);

        let det = await get(`/admin/simulados/${s.slug}`, admin.token);
        assert.equal(det.body.questions.length, 1);
        assert.ok(det.body.questions[0].options.some((o: any) => o.isCorrect === true));
        const qId = det.body.questions[0].id;

        const editou = await patch(
            `/simulado-questions/${qId}`,
            admin.token,
            novaQuestao({
                statement: "Enunciado editado",
                options: [
                    { text: "nova certa", isCorrect: true },
                    { text: "nova errada", isCorrect: false },
                    { text: "outra", isCorrect: false },
                ],
            }),
        );
        assert.equal(editou.status, 200);
        det = await get(`/admin/simulados/${s.slug}`, admin.token);
        assert.equal(det.body.questions[0].statement, "Enunciado editado");
        assert.equal(det.body.questions[0].options.length, 3);

        const lista = await get(`/admin/simulados`, admin.token);
        assert.equal(Number(lista.body.find((x: any) => x.slug === s.slug).questoes), 1);

        assert.equal((await del(`/simulado-questions/${qId}`, admin.token)).status, 200);
        det = await get(`/admin/simulados/${s.slug}`, admin.token);
        assert.equal(det.body.questions.length, 0);

        assert.equal((await del(`/simulados/${s.slug}`, admin.token)).status, 200);
        assert.equal((await get(`/admin/simulados/${s.slug}`, admin.token)).status, 404);
    });

    test("sincroniza (salvar tudo) de forma atômica", async () => {
        const admin = await criarUsuarioLogado(true);
        const s = novoSimulado();
        await post("/simulados", admin.token, s);
        const q = (t: string) => ({
            statement: `Enunciado ${t}`,
            topic: "Tema",
            options: [
                { text: "certa", isCorrect: true },
                { text: "errada", isCorrect: false },
            ],
        });

        // cria duas de uma vez
        let r = await put(`/admin/simulados/${s.slug}/questions`, admin.token, {
            questions: [q("A"), q("B")],
        });
        assert.equal(r.status, 200);
        let det = await get(`/admin/simulados/${s.slug}`, admin.token);
        assert.equal(det.body.questions.length, 2);

        // edita a 1a, remove a 2a, adiciona uma nova
        const q1Id = det.body.questions[0].id;
        r = await put(`/admin/simulados/${s.slug}/questions`, admin.token, {
            questions: [{ ...q("A"), id: q1Id, statement: "Editada" }, q("C")],
        });
        assert.equal(r.status, 200);
        det = await get(`/admin/simulados/${s.slug}`, admin.token);
        const enunciados = det.body.questions.map((x: any) => x.statement).sort();
        assert.deepEqual(enunciados, ["Editada", "Enunciado C"]);

        // atômico: uma questão inválida rejeita tudo, sem alterar o estado
        const ruim = await put(`/admin/simulados/${s.slug}/questions`, admin.token, {
            questions: [
                q("D"),
                { statement: "sem correta", options: [{ text: "a", isCorrect: false }] },
            ],
        });
        assert.equal(ruim.status, 400);
        det = await get(`/admin/simulados/${s.slug}`, admin.token);
        assert.equal(det.body.questions.length, 2);
    });
});
