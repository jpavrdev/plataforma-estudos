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

async function criarUsuarioLogado() {
    const dados = novoUsuario();
    await server.request("POST", "/register", { body: dados });
    await ajustarUsuario(dados.email, { emailVerifiedAt: new Date() });
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
