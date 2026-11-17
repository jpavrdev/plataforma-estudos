import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { startTestServer } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;

let seq = 0;
const newUser = () => ({
    name: "Membro Comunidade",
    email: `com_${++seq}_${Math.round(performance.now() * 1000)}@email.com`,
    username: `com_${seq}_${Math.round(performance.now())}`.slice(0, 20),
    password: "Senhaforte123!",
    birthDate: "1990-01-01",
    gender: "outro",
    phone: "11999998888",
});

async function verifyEmail(email: string) {
    const { db } = await import("../db.ts");
    const { users } = await import("../schema.ts");
    const { eq } = await import("drizzle-orm");
    await db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.email, email));
}

async function makeSupporter(email: string) {
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

async function createLoggedInUser() {
    const data = newUser();
    await server.request("POST", "/register", { body: data });
    await verifyEmail(data.email);
    const login = await server.request("POST", "/login", {
        body: { email: data.email, password: data.password },
    });
    return { ...data, token: login.body.token as string };
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

describe("Community", () => {
    test("creates a post with tags and it shows up in the feed with its author", async () => {
        const u = await createLoggedInUser();
        const created = await post("/comunidade/posts", u.token, {
            kind: "duvida",
            content: "Por que meu while não para?",
            code: "while(true){}",
            codeLanguage: "javascript",
            tags: ["logica", "While", "logica"],
        });
        assert.equal(created.status, 201);
        assert.ok(created.body.id);

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
        // Tags normalized (lowercase) and deduplicated.
        assert.deepEqual([...p.tags].sort(), ["logica", "while"]);
    });

    test("rejects a post without content", async () => {
        const u = await createLoggedInUser();
        const r = await post("/comunidade/posts", u.token, { kind: "post", content: "   " });
        assert.equal(r.status, 400);
    });

    test("requires authentication on the feed", async () => {
        const res = await fetch(`${server.base}/comunidade/feed`);
        assert.equal(res.status, 401);
    });

    test("liking toggles the state and the count", async () => {
        const author = await createLoggedInUser();
        const other = await createLoggedInUser();
        const created = await post("/comunidade/posts", author.token, {
            kind: "post",
            content: "Olá comunidade",
        });
        const id = created.body.id;

        const liked = await post(`/comunidade/posts/${id}/curtir`, other.token);
        assert.equal(liked.status, 200);
        assert.equal(liked.body.curtido, true);
        assert.equal(liked.body.likes, 1);

        const feedOther = await get("/comunidade/feed?filtro=recentes", other.token);
        assert.equal(feedOther.body[0].curtido, true);
        assert.equal(feedOther.body[0].likes, 1);

        // The author did not like it: sees the count, but curtido=false.
        const feedAuthor = await get("/comunidade/feed?filtro=recentes", author.token);
        assert.equal(feedAuthor.body[0].curtido, false);
        assert.equal(feedAuthor.body[0].likes, 1);

        const unliked = await post(`/comunidade/posts/${id}/curtir`, other.token);
        assert.equal(unliked.body.curtido, false);
        assert.equal(unliked.body.likes, 0);
    });

    test("commenting shows up in the count and in the post detail", async () => {
        const author = await createLoggedInUser();
        const created = await post("/comunidade/posts", author.token, {
            kind: "duvida",
            content: "Como resolver?",
        });
        const id = created.body.id;

        const c = await post(`/comunidade/posts/${id}/comentarios`, author.token, {
            content: "Tente assim",
        });
        assert.equal(c.status, 201);

        const detail = await get(`/comunidade/posts/${id}`, author.token);
        assert.equal(detail.status, 200);
        assert.equal(detail.body.comentarios, 1);
        assert.equal(detail.body.comentariosLista.length, 1);
        assert.equal(detail.body.comentariosLista[0].content, "Tente assim");
    });

    test("liking a comment toggles state and count per user", async () => {
        const author = await createLoggedInUser();
        const other = await createLoggedInUser();
        const created = await post("/comunidade/posts", author.token, {
            kind: "post",
            content: "Post",
        });
        const c = await post(`/comunidade/posts/${created.body.id}/comentarios`, author.token, {
            content: "Comentário",
        });

        const liked = await post(`/comunidade/comentarios/${c.body.id}/curtir`, other.token);
        assert.equal(liked.status, 200);
        assert.equal(liked.body.curtido, true);
        assert.equal(liked.body.likes, 1);

        // Whoever liked sees curtido=true; the author sees the count, but curtido=false.
        const detailOther = await get(`/comunidade/posts/${created.body.id}`, other.token);
        assert.equal(detailOther.body.comentariosLista[0].likes, 1);
        assert.equal(detailOther.body.comentariosLista[0].curtido, true);
        const detailAuthor = await get(`/comunidade/posts/${created.body.id}`, author.token);
        assert.equal(detailAuthor.body.comentariosLista[0].curtido, false);

        const unliked = await post(`/comunidade/comentarios/${c.body.id}/curtir`, other.token);
        assert.equal(unliked.body.curtido, false);
        assert.equal(unliked.body.likes, 0);

        const missing = await post(
            "/comunidade/comentarios/00000000-0000-0000-0000-000000000000/curtir",
            other.token,
        );
        assert.equal(missing.status, 404);
    });

    test("a reply hangs off the root comment, even when replying to a reply", async () => {
        const author = await createLoggedInUser();
        const created = await post("/comunidade/posts", author.token, {
            kind: "post",
            content: "Post",
        });
        const id = created.body.id;

        const root = await post(`/comunidade/posts/${id}/comentarios`, author.token, {
            content: "Raiz",
        });
        const reply = await post(`/comunidade/posts/${id}/comentarios`, author.token, {
            content: "Resposta",
            parentId: root.body.id,
        });
        assert.equal(reply.status, 201);
        // Replying to a reply flattens to the root (one-level thread).
        const grandchild = await post(`/comunidade/posts/${id}/comentarios`, author.token, {
            content: "Resposta da resposta",
            parentId: reply.body.id,
        });
        assert.equal(grandchild.status, 201);

        const detail = await get(`/comunidade/posts/${id}`, author.token);
        const list = detail.body.comentariosLista;
        assert.equal(list.length, 3);
        const byContent = (t: string) => list.find((c: { content: string }) => c.content === t);
        assert.equal(byContent("Raiz").parentId, null);
        assert.equal(byContent("Resposta").parentId, root.body.id);
        assert.equal(byContent("Resposta da resposta").parentId, root.body.id);

        // The post count adds up roots and replies.
        assert.equal(detail.body.comentarios, 3);
    });

    test("rejects replying to a comment from another post or to a missing one", async () => {
        const u = await createLoggedInUser();
        const postA = await post("/comunidade/posts", u.token, { kind: "post", content: "A" });
        const postB = await post("/comunidade/posts", u.token, { kind: "post", content: "B" });
        const commentA = await post(`/comunidade/posts/${postA.body.id}/comentarios`, u.token, {
            content: "No post A",
        });

        const cross = await post(`/comunidade/posts/${postB.body.id}/comentarios`, u.token, {
            content: "x",
            parentId: commentA.body.id,
        });
        assert.equal(cross.status, 404);

        const ghost = await post(`/comunidade/posts/${postA.body.id}/comentarios`, u.token, {
            content: "x",
            parentId: "00000000-0000-0000-0000-000000000000",
        });
        assert.equal(ghost.status, 404);
    });

    test("filter by kind and by 'sem resposta'", async () => {
        const u = await createLoggedInUser();
        const duvida = await post("/comunidade/posts", u.token, {
            kind: "duvida",
            content: "Uma dúvida",
        });
        await post("/comunidade/posts", u.token, { kind: "conquista", content: "Uma conquista" });

        const onlyQuestions = await get("/comunidade/feed?filtro=duvida", u.token);
        assert.equal(onlyQuestions.body.length, 1);
        assert.equal(onlyQuestions.body[0].kind, "duvida");

        // Comments on the question: it stops showing up under "sem resposta".
        await post(`/comunidade/posts/${duvida.body.id}/comentarios`, u.token, {
            content: "resposta",
        });
        const unanswered = await get("/comunidade/feed?filtro=sem-resposta", u.token);
        assert.equal(unanswered.body.length, 1);
        assert.equal(unanswered.body[0].kind, "conquista");
    });

    test("following enables the 'seguindo' filter and unfollowing empties it again", async () => {
        const a = await createLoggedInUser();
        const b = await createLoggedInUser();
        await post("/comunidade/posts", b.token, { kind: "post", content: "Post do B" });

        // Before following, A's 'seguindo' feed is empty.
        const before = await get("/comunidade/feed?filtro=seguindo", a.token);
        assert.equal(before.body.length, 0);

        const followed = await post(`/comunidade/seguir/${b.username}`, a.token);
        assert.equal(followed.status, 200);
        assert.equal(followed.body.seguindo, true);

        const after = await get("/comunidade/feed?filtro=seguindo", a.token);
        assert.equal(after.body.length, 1);
        assert.equal(after.body[0].content, "Post do B");

        const stopped = await del(`/comunidade/seguir/${b.username}`, a.token);
        assert.equal(stopped.body.seguindo, false);
        const empty = await get("/comunidade/feed?filtro=seguindo", a.token);
        assert.equal(empty.body.length, 0);
    });

    test("does not allow following yourself", async () => {
        const a = await createLoggedInUser();
        const r = await post(`/comunidade/seguir/${a.username}`, a.token);
        assert.equal(r.status, 400);
    });

    test("sidebar brings topics and the count of open questions", async () => {
        const u = await createLoggedInUser();
        await post("/comunidade/posts", u.token, {
            kind: "duvida",
            content: "Dúvida aberta",
            tags: ["logica"],
        });
        const answered = await post("/comunidade/posts", u.token, {
            kind: "duvida",
            content: "Dúvida respondida",
            tags: ["logica", "javascript"],
        });
        await post(`/comunidade/posts/${answered.body.id}/comentarios`, u.token, {
            content: "aqui está",
        });

        const sidebar = await get("/comunidade/lateral", u.token);
        assert.equal(sidebar.status, 200);
        // Only the question without comments counts as open.
        assert.equal(sidebar.body.duvidasAbertas, 1);
        const logica = sidebar.body.topicos.find((t: { tag: string }) => t.tag === "logica");
        assert.equal(logica.count, 2);
    });

    test("filtering the feed by tag", async () => {
        const u = await createLoggedInUser();
        await post("/comunidade/posts", u.token, {
            kind: "post",
            content: "Sobre arrays",
            tags: ["array"],
        });
        await post("/comunidade/posts", u.token, {
            kind: "post",
            content: "Sobre loops",
            tags: ["logica"],
        });

        const onlyArray = await get("/comunidade/feed?tag=array", u.token);
        assert.equal(onlyArray.body.length, 1);
        assert.equal(onlyArray.body[0].content, "Sobre arrays");
    });

    test("uploading an image is blocked for non-supporters", async () => {
        const u = await createLoggedInUser();
        const r = await post("/comunidade/imagem", u.token, {
            image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        });
        assert.equal(r.status, 403);
    });

    test("posting with an image is blocked for non-supporters", async () => {
        const u = await createLoggedInUser();
        const r = await post("/comunidade/posts", u.token, {
            kind: "post",
            content: "olha essa imagem",
            imageUrl: "/uploads/comunidade/x.jpg",
        });
        assert.equal(r.status, 403);
    });

    test("a supporter can post with an image", async () => {
        const u = await createLoggedInUser();
        await makeSupporter(u.email);
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
