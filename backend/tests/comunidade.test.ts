import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { startTestServer } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;

let seq = 0;
const novoUsuario = () => ({
    name: "Membro Comunidade",
    email: `com_${++seq}_${Math.round(performance.now() * 1000)}@email.com`,
    username: `com_${seq}_${Math.round(performance.now())}`.slice(0, 20),
    password: "Senhaforte123!",
    birthDate: "1990-01-01",
    gender: "outro",
    phone: "11999998888",
});

async function verificarEmail(email: string) {
    const { db } = await import("../db.ts");
    const { users } = await import("../schema.ts");
    const { eq } = await import("drizzle-orm");
    await db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.email, email));
}

async function tornarApoiador(email: string) {
    const { db } = await import("../db.ts");
    const { users, subscriptions } = await import("../schema.ts");
    const { eq } = await import("drizzle-orm");
    const [u] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
    await db.insert(subscriptions).values({
        userId: u.id,
        plan: "mensal",
        status: "ativa",
        amountCents: 500,
        paidAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 86400000),
    });
}

async function criarUsuarioLogado() {
    const dados = novoUsuario();
    await server.request("POST", "/register", { body: dados });
    await verificarEmail(dados.email);
    const login = await server.request("POST", "/login", {
        body: { email: dados.email, password: dados.password },
    });
    return { ...dados, token: login.body.token as string };
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
async function del(path: string, token: string) {
    const res = await fetch(`${server.base}${path}`, { method: "DELETE", headers: auth(token) });
    return { status: res.status, body: await res.json().catch(() => null) };
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

describe("Comunidade", () => {
    test("cria publicação com tags e ela aparece no feed com o autor", async () => {
        const u = await criarUsuarioLogado();
        const criado = await post("/comunidade/posts", u.token, {
            kind: "duvida",
            content: "Por que meu while não para?",
            code: "while(true){}",
            codeLanguage: "javascript",
            tags: ["logica", "While", "logica"],
        });
        assert.equal(criado.status, 201);
        assert.ok(criado.body.id);

        const feed = await get("/comunidade/feed?filtro=recentes", u.token);
        assert.equal(feed.status, 200);
        assert.equal(feed.body.length, 1);
        const p = feed.body[0];
        assert.equal(p.content, "Por que meu while não para?");
        assert.equal(p.kind, "duvida");
        assert.equal(p.code, "while(true){}");
        assert.equal(p.likes, 0);
        assert.equal(p.comentarios, 0);
        assert.equal(p.curtido, false);
        assert.equal(p.autor.name, u.name);
        assert.equal(p.autor.username, u.username);
        assert.equal(p.autor.level, 1);
        // Tags normalizadas (minúsculas) e sem duplicata.
        assert.deepEqual([...p.tags].sort(), ["logica", "while"]);
    });

    test("rejeita publicação sem conteúdo", async () => {
        const u = await criarUsuarioLogado();
        const r = await post("/comunidade/posts", u.token, { kind: "post", content: "   " });
        assert.equal(r.status, 400);
    });

    test("exige autenticação no feed", async () => {
        const res = await fetch(`${server.base}/comunidade/feed`);
        assert.equal(res.status, 401);
    });

    test("curtir alterna o estado e a contagem", async () => {
        const autor = await criarUsuarioLogado();
        const outro = await criarUsuarioLogado();
        const criado = await post("/comunidade/posts", autor.token, { kind: "post", content: "Olá comunidade" });
        const id = criado.body.id;

        const curtir = await post(`/comunidade/posts/${id}/curtir`, outro.token);
        assert.equal(curtir.status, 200);
        assert.equal(curtir.body.curtido, true);
        assert.equal(curtir.body.likes, 1);

        const feedOutro = await get("/comunidade/feed?filtro=recentes", outro.token);
        assert.equal(feedOutro.body[0].curtido, true);
        assert.equal(feedOutro.body[0].likes, 1);

        // O autor não curtiu: vê o like, mas curtido=false.
        const feedAutor = await get("/comunidade/feed?filtro=recentes", autor.token);
        assert.equal(feedAutor.body[0].curtido, false);
        assert.equal(feedAutor.body[0].likes, 1);

        const descurtir = await post(`/comunidade/posts/${id}/curtir`, outro.token);
        assert.equal(descurtir.body.curtido, false);
        assert.equal(descurtir.body.likes, 0);
    });

    test("comentar aparece na contagem e no detalhe do post", async () => {
        const autor = await criarUsuarioLogado();
        const criado = await post("/comunidade/posts", autor.token, {
            kind: "duvida",
            content: "Como resolver?",
        });
        const id = criado.body.id;

        const c = await post(`/comunidade/posts/${id}/comentarios`, autor.token, { content: "Tente assim" });
        assert.equal(c.status, 201);

        const detalhe = await get(`/comunidade/posts/${id}`, autor.token);
        assert.equal(detalhe.status, 200);
        assert.equal(detalhe.body.comentarios, 1);
        assert.equal(detalhe.body.comentariosLista.length, 1);
        assert.equal(detalhe.body.comentariosLista[0].content, "Tente assim");
    });

    test("filtro por tipo e por 'sem resposta'", async () => {
        const u = await criarUsuarioLogado();
        const duvida = await post("/comunidade/posts", u.token, { kind: "duvida", content: "Uma dúvida" });
        await post("/comunidade/posts", u.token, { kind: "conquista", content: "Uma conquista" });

        const soDuvidas = await get("/comunidade/feed?filtro=duvida", u.token);
        assert.equal(soDuvidas.body.length, 1);
        assert.equal(soDuvidas.body[0].kind, "duvida");

        // Comenta na dúvida: deixa de aparecer em "sem resposta".
        await post(`/comunidade/posts/${duvida.body.id}/comentarios`, u.token, { content: "resposta" });
        const semResposta = await get("/comunidade/feed?filtro=sem-resposta", u.token);
        assert.equal(semResposta.body.length, 1);
        assert.equal(semResposta.body[0].kind, "conquista");
    });

    test("seguir habilita o filtro 'seguindo' e depois deixar de seguir o esvazia", async () => {
        const a = await criarUsuarioLogado();
        const b = await criarUsuarioLogado();
        await post("/comunidade/posts", b.token, { kind: "post", content: "Post do B" });

        // Antes de seguir, o feed 'seguindo' de A está vazio.
        const antes = await get("/comunidade/feed?filtro=seguindo", a.token);
        assert.equal(antes.body.length, 0);

        const seguir = await post(`/comunidade/seguir/${b.username}`, a.token);
        assert.equal(seguir.status, 200);
        assert.equal(seguir.body.seguindo, true);

        const depois = await get("/comunidade/feed?filtro=seguindo", a.token);
        assert.equal(depois.body.length, 1);
        assert.equal(depois.body[0].content, "Post do B");

        const parar = await del(`/comunidade/seguir/${b.username}`, a.token);
        assert.equal(parar.body.seguindo, false);
        const vazio = await get("/comunidade/feed?filtro=seguindo", a.token);
        assert.equal(vazio.body.length, 0);
    });

    test("não permite seguir a si mesmo", async () => {
        const a = await criarUsuarioLogado();
        const r = await post(`/comunidade/seguir/${a.username}`, a.token);
        assert.equal(r.status, 400);
    });

    test("barra lateral traz tópicos e a contagem de dúvidas em aberto", async () => {
        const u = await criarUsuarioLogado();
        await post("/comunidade/posts", u.token, { kind: "duvida", content: "Dúvida aberta", tags: ["logica"] });
        const respondida = await post("/comunidade/posts", u.token, {
            kind: "duvida",
            content: "Dúvida respondida",
            tags: ["logica", "javascript"],
        });
        await post(`/comunidade/posts/${respondida.body.id}/comentarios`, u.token, { content: "aqui está" });

        const lateral = await get("/comunidade/lateral", u.token);
        assert.equal(lateral.status, 200);
        // Apenas a dúvida sem comentário conta como aberta.
        assert.equal(lateral.body.duvidasAbertas, 1);
        const logica = lateral.body.topicos.find((t: { tag: string }) => t.tag === "logica");
        assert.equal(logica.count, 2);
    });

    test("filtrar o feed por tag", async () => {
        const u = await criarUsuarioLogado();
        await post("/comunidade/posts", u.token, { kind: "post", content: "Sobre arrays", tags: ["array"] });
        await post("/comunidade/posts", u.token, { kind: "post", content: "Sobre loops", tags: ["logica"] });

        const soArray = await get("/comunidade/feed?tag=array", u.token);
        assert.equal(soArray.body.length, 1);
        assert.equal(soArray.body[0].content, "Sobre arrays");
    });

    test("enviar imagem é bloqueado para quem não é apoiador", async () => {
        const u = await criarUsuarioLogado();
        const r = await post("/comunidade/imagem", u.token, {
            image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        });
        assert.equal(r.status, 403);
    });

    test("publicar com imagem é bloqueado para quem não é apoiador", async () => {
        const u = await criarUsuarioLogado();
        const r = await post("/comunidade/posts", u.token, {
            kind: "post",
            content: "olha essa imagem",
            imageUrl: "/uploads/comunidade/x.jpg",
        });
        assert.equal(r.status, 403);
    });

    test("apoiador consegue publicar com imagem", async () => {
        const u = await criarUsuarioLogado();
        await tornarApoiador(u.email);
        const r = await post("/comunidade/posts", u.token, {
            kind: "post",
            content: "olha essa imagem",
            imageUrl: "/uploads/comunidade/x.jpg",
        });
        assert.equal(r.status, 201);
        const feed = await get("/comunidade/feed?filtro=recentes", u.token);
        assert.equal(feed.body[0].imageUrl, "/uploads/comunidade/x.jpg");
        assert.equal(feed.body[0].autor.apoiador, true);
    });
});
