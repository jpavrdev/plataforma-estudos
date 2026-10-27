import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { startTestServer } from "./helpers/server.ts";
import { limparBanco } from "./helpers/db.ts";

let server: Awaited<ReturnType<typeof startTestServer>>;

let seq = 0;
const novoUsuario = () => ({
    name: `Aluno ${++seq}`,
    email: `sorteio_${seq}_${Math.round(performance.now() * 1000)}@email.com`,
    username: `sorteio_${seq}`,
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
    return { email: dados.email, username: dados.username, token: login.body.token as string };
}

async function chamar(metodo: string, caminho: string, token: string, corpo?: unknown) {
    const res = await fetch(`${server.base}${caminho}`, {
        method: metodo,
        headers: {
            Authorization: `Bearer ${token}`,
            ...(corpo === undefined ? {} : { "Content-Type": "application/json" }),
        },
        body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
    return { status: res.status, body: await res.json().catch(() => null) };
}

// As regras dependem do relógio de verdade, então as datas são relativas a agora.
const daquiA = (minutos: number) => new Date(Date.now() + minutos * 60_000).toISOString();

const dadosDoSorteio = (inicio: number, fim: number, titulo = "Sorteio de teste") => ({
    titulo,
    descricao: "Três prêmios.\nBoa sorte!",
    inicio: daquiA(inicio),
    fim: daquiA(fim),
});

async function criarSorteio(admin: string, inicio: number, fim: number, titulo?: string) {
    const res = await chamar("POST", "/sorteios", admin, dadosDoSorteio(inicio, fim, titulo));
    assert.equal(res.status, 201);
    return res.body;
}

// Fecha as inscrições trazendo o fim para o passado, como o admin faria pela edição.
async function encerrar(admin: string, id: string) {
    const res = await chamar("PATCH", `/sorteios/${id}`, admin, { fim: daquiA(-1) });
    assert.equal(res.status, 200);
    assert.equal(res.body.situacao, "encerrado");
}

const ZAP = { canal: "whatsapp", pais: "BR", ddd: "(11)", numero: "98765-4321" };
const INSTA = { canal: "instagram", usuario: "@Fulano.Dev" };
const EMAIL = { canal: "email", email: " Fulano@Email.com " };

const inscrever = (
    token: string,
    id: string,
    corpo: unknown = { primario: ZAP, secundario: INSTA },
) => chamar("POST", `/sorteios/${id}/participacao`, token, corpo);

const ativo = async (token: string) => (await chamar("GET", "/sorteios/ativo", token)).body;

before(async () => {
    server = await startTestServer();
});
after(async () => {
    await server.close();
});
beforeEach(async () => {
    await limparBanco();
});

describe("Sorteios: aluno", () => {
    test("vê só o sorteio aberto; agendado e encerrado não aparecem", async () => {
        const admin = await criarUsuarioLogado(true);
        const aluno = await criarUsuarioLogado();
        await criarSorteio(admin.token, -120, -60);
        await criarSorteio(admin.token, 60, 120);
        assert.equal(await ativo(aluno.token), null);

        const aberto = await criarSorteio(admin.token, -30, 30);
        const corpo = await ativo(aluno.token);
        assert.deepEqual(Object.keys(corpo).sort(), [
            "descricao",
            "fim",
            "id",
            "inicio",
            "participacao",
            "titulo",
        ]);
        assert.equal(corpo.id, aberto.id);
        assert.equal(corpo.descricao, "Três prêmios.\nBoa sorte!");
        assert.equal(corpo.participacao, null);
    });

    test("inscrição cria com 201 e normaliza os contatos; a segunda dá 409 e nada muda", async () => {
        const admin = await criarUsuarioLogado(true);
        const aluno = await criarUsuarioLogado();
        const sorteio = await criarSorteio(admin.token, -30, 30);

        const primeira = await inscrever(aluno.token, sorteio.id);
        assert.equal(primeira.status, 201);
        assert.deepEqual(Object.keys(primeira.body).sort(), ["contatos", "inscritoEm"]);
        assert.deepEqual(primeira.body.contatos, {
            primario: { canal: "whatsapp", pais: "BR", ddi: "55", ddd: "11", numero: "987654321" },
            secundario: { canal: "instagram", usuario: "fulano.dev" },
        });
        assert.ok(primeira.body.inscritoEm);

        const segunda = await inscrever(aluno.token, sorteio.id, { primario: EMAIL });
        assert.equal(segunda.status, 409);
        assert.equal(segunda.body.erro, "Você já está inscrito neste sorteio");

        assert.deepEqual((await ativo(aluno.token)).participacao, primeira.body);
        const detalhe = await chamar("GET", `/studio/sorteios/${sorteio.id}`, admin.token);
        assert.equal(detalhe.body.participantes.length, 1);
        assert.deepEqual(detalhe.body.participantes[0].contatos, primeira.body.contatos);
    });

    test("dois envios ao mesmo tempo inscrevem uma vez só", async () => {
        const admin = await criarUsuarioLogado(true);
        const aluno = await criarUsuarioLogado();
        const sorteio = await criarSorteio(admin.token, -30, 30);

        const respostas = await Promise.all([
            inscrever(aluno.token, sorteio.id),
            inscrever(aluno.token, sorteio.id),
        ]);
        assert.deepEqual(respostas.map((r) => r.status).sort(), [201, 409]);
        const detalhe = await chamar("GET", `/studio/sorteios/${sorteio.id}`, admin.token);
        assert.equal(detalhe.body.participantes.length, 1);
    });

    test("inscrição só com o principal guarda o secundário como null", async () => {
        const admin = await criarUsuarioLogado(true);
        const aluno = await criarUsuarioLogado();
        const sorteio = await criarSorteio(admin.token, -30, 30);

        const res = await inscrever(aluno.token, sorteio.id, { primario: INSTA });
        assert.equal(res.status, 201);
        assert.deepEqual(res.body.contatos, {
            primario: { canal: "instagram", usuario: "fulano.dev" },
            secundario: null,
        });
    });

    test("contato inválido dá 400 e não inscreve", async () => {
        const admin = await criarUsuarioLogado(true);
        const aluno = await criarUsuarioLogado();
        const sorteio = await criarSorteio(admin.token, -30, 30);

        const invalidos = [
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
        for (const corpo of invalidos) {
            const res = await inscrever(aluno.token, sorteio.id, corpo);
            assert.equal(res.status, 400, JSON.stringify(corpo));
        }
        assert.equal((await ativo(aluno.token)).participacao, null);
    });

    test("fora do período dá 409; sorteio inexistente dá 404", async () => {
        const admin = await criarUsuarioLogado(true);
        const aluno = await criarUsuarioLogado();
        const agendado = await criarSorteio(admin.token, 60, 120);
        const encerrado = await criarSorteio(admin.token, -120, -60);

        for (const sorteio of [agendado, encerrado]) {
            assert.equal((await inscrever(aluno.token, sorteio.id)).status, 409);
        }

        assert.equal((await inscrever(aluno.token, randomUUID())).status, 404);
        assert.equal((await inscrever(aluno.token, "nao-e-um-id")).status, 400);
    });

    test("aluno sem @ não se inscreve", async () => {
        const admin = await criarUsuarioLogado(true);
        const aluno = await criarUsuarioLogado();
        const sorteio = await criarSorteio(admin.token, -30, 30);
        await ajustarUsuario(aluno.email, { username: null });

        assert.equal((await inscrever(aluno.token, sorteio.id)).status, 403);
    });
});

describe("Sorteios: estúdio", () => {
    test("admin cria; período sobreposto dá 409 e período emendado passa", async () => {
        const admin = await criarUsuarioLogado(true);
        const criado = await chamar("POST", "/sorteios", admin.token, {
            ...dadosDoSorteio(10, 20),
            titulo: "  Sorteio de novembro  ",
        });
        assert.equal(criado.status, 201);
        assert.equal(criado.body.titulo, "Sorteio de novembro");
        assert.equal(criado.body.situacao, "agendado");
        assert.equal(criado.body.sorteadoEm, null);
        assert.deepEqual(criado.body.ganhadores, []);
        assert.deepEqual(criado.body.participantes, []);

        const sobreposto = await chamar("POST", "/sorteios", admin.token, dadosDoSorteio(15, 25));
        assert.equal(sobreposto.status, 409);

        const emendado = await chamar("POST", "/sorteios", admin.token, {
            ...dadosDoSorteio(0, 30),
            inicio: criado.body.fim,
        });
        assert.equal(emendado.status, 201);

        const invadindo = await chamar("PATCH", `/sorteios/${emendado.body.id}`, admin.token, {
            inicio: daquiA(19),
        });
        assert.equal(invadindo.status, 409);
    });

    test("valida título, descrição e datas", async () => {
        const admin = await criarUsuarioLogado(true);
        const criado = await criarSorteio(admin.token, 10, 20);
        const invalidos = [
            { ...dadosDoSorteio(40, 50), titulo: "ab" },
            { ...dadosDoSorteio(40, 50), titulo: "x".repeat(121) },
            { ...dadosDoSorteio(40, 50), descricao: "   " },
            { ...dadosDoSorteio(40, 50), descricao: "x".repeat(2001) },
            { ...dadosDoSorteio(40, 50), inicio: "2026-12-01T10:00", fim: "2026-12-02T10:00" },
            dadosDoSorteio(50, 40),
        ];
        for (const corpo of invalidos) {
            const res = await chamar("POST", "/sorteios", admin.token, corpo);
            assert.equal(res.status, 400, JSON.stringify(corpo).slice(0, 120));
        }

        // Só o fim na edição, antes do início que já estava gravado.
        const edicao = await chamar("PATCH", `/sorteios/${criado.id}`, admin.token, {
            fim: daquiA(5),
        });
        assert.equal(edicao.status, 400);
        const vazia = await chamar("PATCH", `/sorteios/${criado.id}`, admin.token, {});
        assert.equal(vazia.status, 400);
    });

    test("aluno comum leva 403 nas rotas do admin", async () => {
        const admin = await criarUsuarioLogado(true);
        const aluno = await criarUsuarioLogado();
        const { id } = await criarSorteio(admin.token, -30, 30);

        const rotas: Array<[string, string, unknown?]> = [
            ["GET", "/studio/sorteios"],
            ["GET", `/studio/sorteios/${id}`],
            ["POST", "/sorteios", dadosDoSorteio(60, 120)],
            ["PATCH", `/sorteios/${id}`, { titulo: "Outro título" }],
            ["DELETE", `/sorteios/${id}`],
            ["POST", `/sorteios/${id}/sortear`],
        ];
        for (const [metodo, caminho, corpo] of rotas) {
            const res = await chamar(metodo, caminho, aluno.token, corpo);
            assert.equal(res.status, 403, `${metodo} ${caminho}`);
        }
    });

    test("lista traz situação e inscritos, do início mais recente para o mais antigo", async () => {
        const admin = await criarUsuarioLogado(true);
        await criarSorteio(admin.token, -120, -60, "Passado");
        const aberto = await criarSorteio(admin.token, -30, 30, "Atual");
        await criarSorteio(admin.token, 60, 120, "Futuro");
        for (const aluno of [await criarUsuarioLogado(), await criarUsuarioLogado()]) {
            await inscrever(aluno.token, aberto.id);
        }

        const lista = await chamar("GET", "/studio/sorteios", admin.token);
        assert.equal(lista.status, 200);
        assert.deepEqual(
            lista.body.map((s: any) => [s.titulo, s.situacao, s.participantes]),
            [
                ["Futuro", "agendado", 0],
                ["Atual", "aberto", 2],
                ["Passado", "encerrado", 0],
            ],
        );
        assert.deepEqual(Object.keys(lista.body[0]).sort(), [
            "fim",
            "id",
            "inicio",
            "participantes",
            "situacao",
            "sorteadoEm",
            "titulo",
        ]);
    });

    test("excluir leva as inscrições junto", async () => {
        const admin = await criarUsuarioLogado(true);
        const aluno = await criarUsuarioLogado();
        const sorteio = await criarSorteio(admin.token, -30, 30);
        await inscrever(aluno.token, sorteio.id);

        const res = await chamar("DELETE", `/sorteios/${sorteio.id}`, admin.token);
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { ok: true });
        const detalhe = await chamar("GET", `/studio/sorteios/${sorteio.id}`, admin.token);
        assert.equal(detalhe.status, 404);
        assert.equal(await ativo(aluno.token), null);

        const { db } = await import("../db.ts");
        const { sorteioParticipacoes } = await import("../schema.ts");
        assert.equal((await db.select().from(sorteioParticipacoes)).length, 0);
    });
});

describe("Sorteios: sortear", () => {
    async function sorteioComInscritos(admin: string, quantos: number) {
        const sorteio = await criarSorteio(admin, -60, 60);
        const alunos = [];
        for (let i = 0; i < quantos; i++) {
            const aluno = await criarUsuarioLogado();
            assert.equal((await inscrever(aluno.token, sorteio.id)).status, 201);
            alunos.push(aluno);
        }
        return { sorteio, alunos };
    }

    test("antes do fim dá 409", async () => {
        const admin = await criarUsuarioLogado(true);
        const { sorteio } = await sorteioComInscritos(admin.token, 1);

        const res = await chamar("POST", `/sorteios/${sorteio.id}/sortear`, admin.token);
        assert.equal(res.status, 409);
        const detalhe = await chamar("GET", `/studio/sorteios/${sorteio.id}`, admin.token);
        assert.equal(detalhe.body.situacao, "aberto");
    });

    test("com 5 inscritos saem 3 ganhadores e os demais perdem o contato", async () => {
        const admin = await criarUsuarioLogado(true);
        const { sorteio, alunos } = await sorteioComInscritos(admin.token, 5);
        await encerrar(admin.token, sorteio.id);

        const res = await chamar("POST", `/sorteios/${sorteio.id}/sortear`, admin.token);
        assert.equal(res.status, 200);
        assert.equal(res.body.situacao, "sorteado");
        assert.ok(res.body.sorteadoEm);
        assert.deepEqual(
            res.body.ganhadores.map((g: any) => g.posicao),
            [1, 2, 3],
        );
        const ganhadores = res.body.ganhadores.map((g: any) => g.username);
        assert.equal(new Set(ganhadores).size, 3);
        for (const ganhador of res.body.ganhadores) {
            assert.ok(ganhador.nome);
            assert.equal(ganhador.contatos.primario.canal, "whatsapp");
        }

        assert.deepEqual(
            res.body.participantes.map((p: any) => p.username),
            alunos.map((a) => a.username),
        );
        for (const participante of res.body.participantes) {
            const ganhou = ganhadores.includes(participante.username);
            assert.equal(participante.contatos === null, !ganhou, participante.username);
        }

        const repetido = await chamar("POST", `/sorteios/${sorteio.id}/sortear`, admin.token);
        assert.equal(repetido.status, 409);
        const edicao = await chamar("PATCH", `/sorteios/${sorteio.id}`, admin.token, {
            titulo: "Outro título",
        });
        assert.equal(edicao.status, 409);
    });

    test("dois cliques ao mesmo tempo sorteiam uma vez só", async () => {
        const admin = await criarUsuarioLogado(true);
        const { sorteio } = await sorteioComInscritos(admin.token, 4);
        await encerrar(admin.token, sorteio.id);

        const caminho = `/sorteios/${sorteio.id}/sortear`;
        const respostas = await Promise.all([
            chamar("POST", caminho, admin.token),
            chamar("POST", caminho, admin.token),
        ]);
        assert.deepEqual(respostas.map((r) => r.status).sort(), [200, 409]);
        const detalhe = await chamar("GET", `/studio/sorteios/${sorteio.id}`, admin.token);
        assert.equal(detalhe.body.ganhadores.length, 3);
    });

    test("com 2 inscritos saem 2 ganhadores", async () => {
        const admin = await criarUsuarioLogado(true);
        const { sorteio } = await sorteioComInscritos(admin.token, 2);
        await encerrar(admin.token, sorteio.id);

        const res = await chamar("POST", `/sorteios/${sorteio.id}/sortear`, admin.token);
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

    test("sem inscritos dá 409 e o sorteio segue encerrado", async () => {
        const admin = await criarUsuarioLogado(true);
        const sorteio = await criarSorteio(admin.token, -120, -60);

        const res = await chamar("POST", `/sorteios/${sorteio.id}/sortear`, admin.token);
        assert.equal(res.status, 409);
        const detalhe = await chamar("GET", `/studio/sorteios/${sorteio.id}`, admin.token);
        assert.equal(detalhe.body.situacao, "encerrado");
        assert.equal(detalhe.body.sorteadoEm, null);
    });

    test("sorteio inexistente dá 404", async () => {
        const admin = await criarUsuarioLogado(true);
        const res = await chamar("POST", `/sorteios/${randomUUID()}/sortear`, admin.token);
        assert.equal(res.status, 404);
    });
});
