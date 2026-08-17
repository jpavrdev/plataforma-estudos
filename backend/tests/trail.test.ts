import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { startTestServer } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;

// Contador incremental garante email único mesmo em criações no mesmo milissegundo.
let seq = 0;
const novoUsuario = (over: Record<string, unknown> = {}) => ({
    name: "Aluno Teste",
    email: `aluno_${++seq}_${Math.round(performance.now() * 1000)}@email.com`,
    username: `aluno_${seq}`,
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
    return { email: dados.email, token: login.body.token };
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

// Monta uma trilha completa: 1 modulo, N aulas, cada aula com 5 questoes (opcao B correta).
async function montarTrilha(adminToken: string, qtdAulas = 2) {
    const trilha = await post("/trails", adminToken, {
        name: "Logica",
        level: "iniciante",
        description: "Base da programacao logica.",
    });
    const modulo = await post(`/trails/${trilha.body.id}/modules`, adminToken, {
        title: "Modulo 1",
        position: 1,
    });
    const lessons: string[] = [];
    for (let i = 1; i <= qtdAulas; i++) {
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
        // Publica a aula para os alunos a verem.
        await patch(`/lessons/${aula.body.id}/published`, adminToken, { published: true });
        lessons.push(aula.body.id);
    }
    return { trailId: trilha.body.id as string, lessonIds: lessons };
}

// Responde o quiz de uma aula; acertos = quantas marcar certas (resto erradas).
async function responderQuiz(token: string, lessonId: string, acertos: number) {
    const aula = await get(`/lessons/${lessonId}`, token);
    if (aula.status !== 200) return aula;
    const answers = aula.body.questions.map((q: any, idx: number) => ({
        questionId: q.id,
        optionId: q.options.find((o: any) => o.text === (idx < acertos ? "certa" : "errada")).id,
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

describe("Catalogo (admin)", () => {
    test("admin cria trilha; comum recebe 403", async () => {
        const admin = await criarUsuarioLogado(true);
        const ok = await post("/trails", admin.token, {
            name: "Trilha",
            level: "iniciante",
            description: "Descricao com dez caracteres.",
        });
        assert.equal(ok.status, 201);

        const comum = await criarUsuarioLogado();
        const negado = await post("/trails", comum.token, {
            name: "Trilha",
            level: "iniciante",
            description: "Descricao com dez caracteres.",
        });
        assert.equal(negado.status, 403);
    });

    test("rejeita nivel invalido (400)", async () => {
        const admin = await criarUsuarioLogado(true);
        const res = await post("/trails", admin.token, {
            name: "Trilha",
            level: "expert",
            description: "Descricao com dez caracteres.",
        });
        assert.equal(res.status, 400);
    });

    test("rejeita questao sem exatamente uma correta (400)", async () => {
        const admin = await criarUsuarioLogado(true);
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

describe("GET /lessons/:id (seguranca)", () => {
    test("nao revela qual opcao e a correta", async () => {
        const admin = await criarUsuarioLogado(true);
        const { lessonIds } = await montarTrilha(admin.token, 1);
        const aluno = await criarUsuarioLogado();

        const res = await get(`/lessons/${lessonIds[0]}`, aluno.token);
        assert.equal(res.status, 200);
        const temGabarito = res.body.questions.some((q: any) =>
            q.options.some((o: any) => "isCorrect" in o),
        );
        assert.equal(temGabarito, false);
    });
});

describe("Quiz e estado das aulas", () => {
    test("aulas sao acessiveis fora de ordem, mas o estado reflete o progresso", async () => {
        const admin = await criarUsuarioLogado(true);
        const { trailId, lessonIds } = await montarTrilha(admin.token, 2);
        const aluno = await criarUsuarioLogado();

        // Sem trava sequencial: a aula 2 abre mesmo sem concluir a aula 1
        const antes = await get(`/lessons/${lessonIds[1]}`, aluno.token);
        assert.equal(antes.status, 200);

        // Ainda assim o estado na trilha reflete o progresso: 1 current, 2 locked
        const trilhaAntes = await get(`/trails/${trailId}`, aluno.token);
        const estadosAntes = trilhaAntes.body.modules.flatMap((m: any) =>
            m.lessons.map((l: any) => l.state),
        );
        assert.deepEqual(estadosAntes, ["current", "locked"]);

        // Conclui a aula 1 com 5 acertos
        const quiz = await responderQuiz(aluno.token, lessonIds[0], 5);
        assert.equal(quiz.body.passed, true);
        assert.equal(quiz.body.lessonCompleted, true);

        // Estados na trilha: 1 done, 2 current
        const trilha = await get(`/trails/${trailId}`, aluno.token);
        const estados = trilha.body.modules.flatMap((m: any) => m.lessons.map((l: any) => l.state));
        assert.deepEqual(estados, ["done", "current"]);
    });

    test("quiz pode ser concluido fora de ordem", async () => {
        const admin = await criarUsuarioLogado(true);
        const { trailId, lessonIds } = await montarTrilha(admin.token, 2);
        const aluno = await criarUsuarioLogado();

        const quiz = await responderQuiz(aluno.token, lessonIds[1], 5);
        assert.equal(quiz.status, 200);
        assert.equal(quiz.body.lessonCompleted, true);

        const trilha = await get(`/trails/${trailId}`, aluno.token);
        const estados = trilha.body.modules.flatMap((m: any) => m.lessons.map((l: any) => l.state));
        assert.deepEqual(estados, ["current", "done"]);
    });

    test("menos de 4 acertos nao conclui a aula", async () => {
        const admin = await criarUsuarioLogado(true);
        const { lessonIds } = await montarTrilha(admin.token, 1);
        const aluno = await criarUsuarioLogado();

        const quiz = await responderQuiz(aluno.token, lessonIds[0], 2);
        assert.equal(quiz.body.correct, 2);
        assert.equal(quiz.body.passed, false);
        assert.equal(quiz.body.lessonCompleted, false);
    });

    test("aula nao publicada fica invisivel para o aluno", async () => {
        const admin = await criarUsuarioLogado(true);
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
        // aula criada sem publicar (default false)

        const aluno = await criarUsuarioLogado();
        // Nao aparece na trilha
        const trilha = await get(`/trails/${t.body.id}`, aluno.token);
        const totalAulas = trilha.body.modules.flatMap((md: any) => md.lessons).length;
        assert.equal(totalAulas, 0);
        // Acesso direto retorna 404
        const direto = await get(`/lessons/${a.body.id}`, aluno.token);
        assert.equal(direto.status, 404);

        // Admin enxerga a aula
        const trilhaAdmin = await get(`/trails/${t.body.id}`, admin.token);
        assert.equal(trilhaAdmin.body.modules[0].lessons.length, 1);

        // Apos publicar, o aluno ve
        await patch(`/lessons/${a.body.id}/published`, admin.token, { published: true });
        const depois = await get(`/trails/${t.body.id}`, aluno.token);
        assert.equal(depois.body.modules.flatMap((md: any) => md.lessons).length, 1);
    });

    test("o progresso de um aluno nao afeta outro", async () => {
        const admin = await criarUsuarioLogado(true);
        const { trailId, lessonIds } = await montarTrilha(admin.token, 2);

        const alunoA = await criarUsuarioLogado();
        await responderQuiz(alunoA.token, lessonIds[0], 5);

        const alunoB = await criarUsuarioLogado();
        const trilhaB = await get(`/trails/${trailId}`, alunoB.token);
        const estadosB = trilhaB.body.modules.flatMap((m: any) =>
            m.lessons.map((l: any) => l.state),
        );
        // Para B nada foi concluido: primeira current, resto locked
        assert.deepEqual(estadosB, ["current", "locked"]);
    });
});

describe("Trilha multi-linguagem", () => {
    test("sem lang explicito, continua no track da ultima aula concluida", async () => {
        const admin = await criarUsuarioLogado(true);
        const { trailId, lessonIds } = await montarTrilha(admin.token, 4);

        const { db } = await import("../db.ts");
        const { lessons } = await import("../schema.ts");
        const { eq } = await import("drizzle-orm");
        const definir = (id: string, language: string, position: number) =>
            db.update(lessons).set({ language, position }).where(eq(lessons.id, id));
        await definir(lessonIds[0], "javascript", 1);
        await definir(lessonIds[1], "javascript", 2);
        await definir(lessonIds[2], "python", 1);
        await definir(lessonIds[3], "python", 2);

        const aluno = await criarUsuarioLogado();

        const antes = await get(`/trails/${trailId}`, aluno.token);
        assert.equal(antes.body.activeLanguage, "javascript");

        const quiz = await responderQuiz(aluno.token, lessonIds[2], 5);
        assert.equal(quiz.body.lessonCompleted, true);

        const depois = await get(`/trails/${trailId}`, aluno.token);
        assert.equal(depois.body.activeLanguage, "python");
        const aulas = depois.body.modules.flatMap((m: any) => m.lessons);
        assert.equal(aulas.find((l: any) => l.state === "current")?.id, lessonIds[3]);

        const js = await get(`/trails/${trailId}?lang=javascript`, aluno.token);
        assert.equal(js.body.activeLanguage, "javascript");
    });

    test("estagio de roadmap conclui com um unico track completo", async () => {
        const admin = await criarUsuarioLogado(true);
        const { trailId, lessonIds } = await montarTrilha(admin.token, 4);

        const { db } = await import("../db.ts");
        const { lessons } = await import("../schema.ts");
        const { eq } = await import("drizzle-orm");
        const definir = (id: string, language: string, position: number) =>
            db.update(lessons).set({ language, position }).where(eq(lessons.id, id));
        await definir(lessonIds[0], "javascript", 1);
        await definir(lessonIds[1], "javascript", 2);
        await definir(lessonIds[2], "python", 1);
        await definir(lessonIds[3], "python", 2);

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

        const aluno = await criarUsuarioLogado();
        await responderQuiz(aluno.token, lessonIds[2], 5);
        await responderQuiz(aluno.token, lessonIds[3], 5);

        const det = await get(`/roadmaps/${rm.body.slug}`, aluno.token);
        assert.equal(det.status, 200);
        assert.equal(det.body.stages[0].completed, true);
    });
});

// Bug relatado em producao: o aluno refazia o quiz e acertava tudo, mas ao recarregar
// a aula o placar voltava ao da primeira tentativa, e a barra de dominio na aba de
// progresso nunca subia. A causa era a resposta ser gravada uma vez so e nunca
// atualizada. A regra agora tem duas metades, e cada teste cobre uma.
describe("Refazer o quiz", () => {
    async function respostasSalvas(token: string, lessonId: string) {
        const aula = await get(`/lessons/${lessonId}`, token);
        const qs = aula.body.questions as { answer: { isCorrect: boolean } | null }[];
        return {
            respondidas: qs.filter((q) => q.answer).length,
            certas: qs.filter((q) => q.answer?.isCorrect).length,
        };
    }

    // As linhas que ja contam como acerto, que e o que alimenta XP, ranking e dominio.
    async function acertosGravados(email: string) {
        const { db } = await import("../db.ts");
        const { questionAnswers, users } = await import("../schema.ts");
        const { and, eq, isNotNull } = await import("drizzle-orm");
        const [u] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
        return db
            .select()
            .from(questionAnswers)
            .where(and(eq(questionAnswers.userId, u.id), isNotNull(questionAnswers.acertouEm)));
    }

    test("a aula restaura a ultima tentativa, e nao a primeira", async () => {
        const admin = await criarUsuarioLogado(true);
        const aluno = await criarUsuarioLogado();
        const { lessonIds } = await montarTrilha(admin.token, 1);

        await responderQuiz(aluno.token, lessonIds[0], 2);
        assert.deepEqual(await respostasSalvas(aluno.token, lessonIds[0]), {
            respondidas: 5,
            certas: 2,
        });

        await responderQuiz(aluno.token, lessonIds[0], 5);
        assert.deepEqual(
            await respostasSalvas(aluno.token, lessonIds[0]),
            { respondidas: 5, certas: 5 },
            "depois de refazer e acertar tudo, o placar restaurado precisa ser 5 de 5",
        );
    });

    // O acerto conquistado nao volta atras: ele e a base do XP, do ranking e do
    // dominio, entao refazer e errar nao pode tirar nada de ninguem.
    test("errar ao refazer nao apaga o acerto ja conquistado", async () => {
        const admin = await criarUsuarioLogado(true);
        const aluno = await criarUsuarioLogado();
        const { lessonIds } = await montarTrilha(admin.token, 1);

        await responderQuiz(aluno.token, lessonIds[0], 5);
        const antes = await acertosGravados(aluno.email);
        assert.equal(antes.length, 5);

        await responderQuiz(aluno.token, lessonIds[0], 0);
        const depois = await acertosGravados(aluno.email);
        assert.equal(depois.length, 5, "os cinco acertos continuam valendo para XP e ranking");

        // Mas a aula mostra o que ele acabou de responder, que foi tudo errado.
        assert.deepEqual(await respostasSalvas(aluno.token, lessonIds[0]), {
            respondidas: 5,
            certas: 0,
        });
    });

    // O XP por questao e de uma vez so: a data do primeiro acerto nao se move, senao
    // refazer a mesma questao todo dia encheria o grafico de atividade.
    test("acertar de novo nao move a data do primeiro acerto", async () => {
        const admin = await criarUsuarioLogado(true);
        const aluno = await criarUsuarioLogado();
        const { lessonIds } = await montarTrilha(admin.token, 1);

        await responderQuiz(aluno.token, lessonIds[0], 5);
        const primeiro = (await acertosGravados(aluno.email))
            .map((l) => l.acertouEm!.toISOString())
            .sort();

        await responderQuiz(aluno.token, lessonIds[0], 5);
        const segundo = (await acertosGravados(aluno.email))
            .map((l) => l.acertouEm!.toISOString())
            .sort();

        assert.deepEqual(segundo, primeiro);
    });

    // Errar primeiro e acertar depois precisa render o acerto, senao o aluno nunca
    // fecha a trilha em 100% de dominio.
    test("acertar depois de errar passa a contar como acerto", async () => {
        const admin = await criarUsuarioLogado(true);
        const aluno = await criarUsuarioLogado();
        const { lessonIds } = await montarTrilha(admin.token, 1);

        await responderQuiz(aluno.token, lessonIds[0], 0);
        assert.equal((await acertosGravados(aluno.email)).length, 0);

        await responderQuiz(aluno.token, lessonIds[0], 5);
        assert.equal((await acertosGravados(aluno.email)).length, 5);
    });
});
