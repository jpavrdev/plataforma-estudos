import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { startTestServer } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;

let seq = 0;
const novoUsuario = () => ({
    name: "Aluno Certificado",
    email: `cert_${++seq}_${Math.round(performance.now() * 1000)}@email.com`,
    username: `cert_${seq}`,
    password: "Senhaforte123!",
    birthDate: "1990-01-01",
    gender: "outro",
    phone: "11999998888",
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
    return { email: dados.email, token: login.body.token };
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

const CPF_VALIDO = "52998224725";

async function montarTrilha(adminToken: string, opts: { horas?: number | null } = {}) {
    const trilha = await post("/trails", adminToken, {
        name: "Logica",
        level: "iniciante",
        description: "Base da programacao logica.",
        ...(opts.horas !== null ? { workloadHours: opts.horas ?? 20 } : {}),
    });
    const modulo = await post(`/trails/${trilha.body.id}/modules`, adminToken, {
        title: "Modulo 1",
        position: 1,
    });
    const lessonIds: string[] = [];
    for (let i = 1; i <= 2; i++) {
        const aula = await post(`/modules/${modulo.body.id}/lessons`, adminToken, {
            title: `Aula ${i}`,
            position: i,
        });
        for (let q = 1; q <= 5; q++) {
            await post(`/lessons/${aula.body.id}/questions`, adminToken, {
                statement: `Questao numero ${q}`,
                position: q,
                options: [
                    { text: "errada", isCorrect: false },
                    { text: "certa", isCorrect: true },
                ],
            });
        }
        await patch(`/lessons/${aula.body.id}/published`, adminToken, { published: true });
        lessonIds.push(aula.body.id as string);
    }
    return { trailId: trilha.body.id as string, lessonIds };
}

async function passarNoQuiz(token: string, lessonId: string) {
    const aula = await get(`/lessons/${lessonId}`, token);
    const answers = aula.body.questions.map((q: any) => ({
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

describe("Certificado de conclusão", () => {
    test("fluxo completo: elegível após concluir, emite, valida no público e baixa o PDF", async () => {
        const admin = await criarUsuarioLogado(true);
        const { trailId, lessonIds } = await montarTrilha(admin.token);
        const aluno = await criarUsuarioLogado();

        const antes = await get(`/trails/${trailId}/certificado`, aluno.token);
        assert.equal(antes.body.elegivel, false);
        assert.equal(antes.body.motivo, "progresso");

        for (const id of lessonIds) await passarNoQuiz(aluno.token, id);

        const depois = await get(`/trails/${trailId}/certificado`, aluno.token);
        assert.equal(depois.body.elegivel, true);

        const emitido = await post(`/trails/${trailId}/certificado`, aluno.token, {
            cpf: "529.982.247-25",
            name: "Aluno Certificado da Silva",
        });
        assert.equal(emitido.status, 200);
        assert.match(emitido.body.code, /^ED(-[2-9A-HJKMNP-Z]{4}){3}$/);

        const publico = await get(`/certificados/${emitido.body.code}`);
        assert.equal(publico.status, 200);
        assert.equal(publico.body.studentName, "Aluno Certificado da Silva");
        assert.equal(publico.body.trailName, "Logica");
        assert.equal(publico.body.workloadHours, 20);
        assert.equal(publico.body.cpf, "***.982.247-**");

        const pdf = await fetch(`${server.base}/certificados/${emitido.body.code}/pdf`, {
            headers: auth(aluno.token),
        });
        assert.equal(pdf.status, 200);
        assert.equal(pdf.headers.get("content-type"), "application/pdf");
        const corpo = Buffer.from(await pdf.arrayBuffer());
        assert.equal(corpo.subarray(0, 5).toString(), "%PDF-");
        assert.ok(corpo.length > 2000);

        const anonimo = await fetch(`${server.base}/certificados/${emitido.body.code}/pdf`);
        assert.equal(anonimo.status, 401);
        const outro = await criarUsuarioLogado();
        const alheio = await fetch(`${server.base}/certificados/${emitido.body.code}/pdf`, {
            headers: auth(outro.token),
        });
        assert.equal(alheio.status, 403);

        const repetido = await post(`/trails/${trailId}/certificado`, aluno.token, {
            cpf: CPF_VALIDO,
            name: "Aluno Certificado da Silva",
        });
        assert.equal(repetido.body.code, emitido.body.code);
    });

    test("depois de emitido o CPF não muda, mesmo pedindo de novo com outro", async () => {
        const admin = await criarUsuarioLogado(true);
        const { trailId, lessonIds } = await montarTrilha(admin.token);
        const aluno = await criarUsuarioLogado();
        for (const id of lessonIds) await passarNoQuiz(aluno.token, id);

        const primeiro = await post(`/trails/${trailId}/certificado`, aluno.token, {
            cpf: CPF_VALIDO,
            name: "Aluno Certificado da Silva",
        });
        const tentativa = await post(`/trails/${trailId}/certificado`, aluno.token, {
            cpf: "111.444.777-35",
            name: "Outro Nome Qualquer",
        });
        assert.equal(tentativa.status, 200);
        assert.equal(tentativa.body.code, primeiro.body.code);

        const publico = await get(`/certificados/${primeiro.body.code}`);
        assert.equal(publico.body.cpf, "***.982.247-**");
    });

    test("sem concluir a trilha não emite; CPF inválido é rejeitado", async () => {
        const admin = await criarUsuarioLogado(true);
        const { trailId, lessonIds } = await montarTrilha(admin.token);
        const aluno = await criarUsuarioLogado();

        const cedo = await post(`/trails/${trailId}/certificado`, aluno.token, {
            cpf: CPF_VALIDO,
            name: "Aluno Certificado da Silva",
        });
        assert.equal(cedo.status, 409);

        for (const id of lessonIds) await passarNoQuiz(aluno.token, id);
        const invalido = await post(`/trails/${trailId}/certificado`, aluno.token, {
            cpf: "111.111.111-11",
            name: "Aluno Certificado da Silva",
        });
        assert.equal(invalido.status, 400);

        const nomeCurto = await post(`/trails/${trailId}/certificado`, aluno.token, {
            cpf: CPF_VALIDO,
            name: "Fulano",
        });
        assert.equal(nomeCurto.status, 400);
    });

    test("conclusão manual pelo roadmap não emite certificado", async () => {
        const admin = await criarUsuarioLogado(true);
        const { trailId } = await montarTrilha(admin.token);
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
        const aluno = await criarUsuarioLogado();
        await post(`/roadmap-stages/${st.body.id}/concluir`, aluno.token);

        const status = await get(`/trails/${trailId}/certificado`, aluno.token);
        assert.equal(status.body.elegivel, false);
        assert.equal(status.body.motivo, "manual");

        const tentativa = await post(`/trails/${trailId}/certificado`, aluno.token, {
            cpf: CPF_VALIDO,
            name: "Aluno Certificado da Silva",
        });
        assert.equal(tentativa.status, 409);
    });

    test("trilha sem carga horária não emite", async () => {
        const admin = await criarUsuarioLogado(true);
        const { trailId, lessonIds } = await montarTrilha(admin.token, { horas: null });
        const aluno = await criarUsuarioLogado();
        for (const id of lessonIds) await passarNoQuiz(aluno.token, id);

        const status = await get(`/trails/${trailId}/certificado`, aluno.token);
        assert.equal(status.body.motivo, "carga_horaria");
        const r = await post(`/trails/${trailId}/certificado`, aluno.token, {
            cpf: CPF_VALIDO,
            name: "Aluno Certificado da Silva",
        });
        assert.equal(r.status, 409);
    });

    test("trilha multi-linguagem: um track completo emite, com a linguagem no certificado", async () => {
        const admin = await criarUsuarioLogado(true);
        const { trailId, lessonIds } = await montarTrilha(admin.token);
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
        const par = await post(`/modules/${mod.id}/lessons`, admin.token, {
            title: "Aula 2 em Python",
            position: 3,
        });
        await patch(`/lessons/${par.body.id}/published`, admin.token, { published: true });
        await db.update(lessons).set({ language: "python" }).where(eq(lessons.id, par.body.id));

        const aluno = await criarUsuarioLogado();
        for (const id of lessonIds) await passarNoQuiz(aluno.token, id);

        const status = await get(`/trails/${trailId}/certificado`, aluno.token);
        assert.equal(status.body.elegivel, true);
        const emitido = await post(`/trails/${trailId}/certificado`, aluno.token, {
            cpf: CPF_VALIDO,
            name: "Aluno Certificado da Silva",
        });
        assert.equal(emitido.status, 200);
        const publico = await get(`/certificados/${emitido.body.code}`);
        assert.equal(publico.body.language, "JavaScript");
    });

    test("código inexistente retorna 404 na validação pública", async () => {
        const r = await get("/certificados/ED-XXXX-XXXX-XXXX");
        assert.equal(r.status, 404);
    });
});
