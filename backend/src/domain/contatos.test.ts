import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { normalizarContato, normalizarContatos } from "./contatos.ts";
import type { EntradaContato, ResultadoContato, ResultadoContatos } from "./contatos.ts";

const whatsapp = (pais: string, numero: string, ddd?: string | null) =>
    normalizarContato({ canal: "whatsapp", pais, ddd, numero });
const instagram = (usuario: string) => normalizarContato({ canal: "instagram", usuario });
const email = (valor: string) => normalizarContato({ canal: "email", email: valor });

function recusado(resultado: ResultadoContato, campo: string) {
    assert.equal(resultado.ok, false);
    if (!resultado.ok) assert.equal(resultado.campo, campo);
}

const caminhos = (resultado: ResultadoContatos) =>
    resultado.ok ? [] : resultado.problemas.map((problema) => problema.caminho.join("."));

describe("WhatsApp no Brasil", () => {
    test("tira a máscara e pega o DDI da lista", () => {
        assert.deepEqual(whatsapp("BR", "98765-4321", "(11)"), {
            ok: true,
            contato: { canal: "whatsapp", pais: "BR", ddi: "55", ddd: "11", numero: "987654321" },
        });
    });

    test("aceita os DDDs das pontas da lista", () => {
        for (const ddd of ["11", "19", "55", "79", "99"]) {
            assert.equal(whatsapp("BR", "987654321", ddd).ok, true, ddd);
        }
    });

    test("recusa DDD fora da lista", () => {
        for (const ddd of ["10", "20", "23", "25", "36", "52", "70", "72", "90", "00"]) {
            recusado(whatsapp("BR", "987654321", ddd), "ddd");
        }
    });

    test("recusa DDD ausente ou com três dígitos", () => {
        recusado(whatsapp("BR", "987654321"), "ddd");
        recusado(whatsapp("BR", "987654321", null), "ddd");
        recusado(whatsapp("BR", "987654321", ""), "ddd");
        recusado(whatsapp("BR", "987654321", "011"), "ddd");
    });

    test("recusa número curto", () => {
        recusado(whatsapp("BR", "8765-4321", "11"), "numero");
    });

    test("recusa número longo", () => {
        recusado(whatsapp("BR", "998765-4321", "11"), "numero");
    });

    test("recusa celular sem o 9 na frente", () => {
        recusado(whatsapp("BR", "88765-4321", "11"), "numero");
    });
});

describe("WhatsApp fora do Brasil", () => {
    test("guarda o número com o código de área e sem DDD", () => {
        assert.deepEqual(whatsapp("PT", "912 345 678"), {
            ok: true,
            contato: { canal: "whatsapp", pais: "PT", ddi: "351", ddd: null, numero: "912345678" },
        });
    });

    test("tira o 0 de discagem nacional, menos na Itália", () => {
        assert.deepEqual(whatsapp("GB", "07911 123456"), {
            ok: true,
            contato: { canal: "whatsapp", pais: "GB", ddi: "44", ddd: null, numero: "7911123456" },
        });
        assert.deepEqual(whatsapp("IT", "06 1234 5678"), {
            ok: true,
            contato: { canal: "whatsapp", pais: "IT", ddi: "39", ddd: null, numero: "0612345678" },
        });
    });

    test("ignora DDD avulso", () => {
        assert.deepEqual(whatsapp("US", "(415) 555-2671", "21"), {
            ok: true,
            contato: { canal: "whatsapp", pais: "US", ddi: "1", ddd: null, numero: "4155552671" },
        });
    });

    test("aceita o código do país em minúsculas", () => {
        assert.deepEqual(whatsapp("pt", "912345678"), {
            ok: true,
            contato: { canal: "whatsapp", pais: "PT", ddi: "351", ddd: null, numero: "912345678" },
        });
    });

    test("recusa país fora da lista", () => {
        recusado(whatsapp("XX", "912345678"), "pais");
        recusado(whatsapp("", "912345678"), "pais");
    });

    test("número de 7 a 14 dígitos", () => {
        assert.equal(whatsapp("DE", "1234567").ok, true);
        recusado(whatsapp("DE", "123456"), "numero");
        assert.equal(whatsapp("US", "1".repeat(14)).ok, true);
        recusado(whatsapp("US", "1".repeat(15)), "numero");
    });

    test("DDI mais número no máximo com 15 dígitos (E.164)", () => {
        assert.equal(whatsapp("PT", "9".repeat(12)).ok, true);
        recusado(whatsapp("PT", "9".repeat(13)), "numero");
        assert.equal(whatsapp("TL", "7".repeat(12)).ok, true);
        recusado(whatsapp("TL", "7".repeat(13)), "numero");
    });
});

describe("Instagram", () => {
    test("tira espaços e o @ e passa para minúsculas", () => {
        assert.deepEqual(instagram("  @Fulano.Dev "), {
            ok: true,
            contato: { canal: "instagram", usuario: "fulano.dev" },
        });
    });

    test("aceita underline, números e o tamanho máximo de 30", () => {
        assert.equal(instagram("fulano_dev_2026").ok, true);
        assert.equal(instagram("a".repeat(30)).ok, true);
    });

    test("recusa ponto no começo, no fim ou dois seguidos", () => {
        recusado(instagram(".fulano"), "usuario");
        recusado(instagram("@.fulano"), "usuario");
        recusado(instagram("fulano."), "usuario");
        recusado(instagram("fulano..dev"), "usuario");
    });

    test("recusa vazio, mais de 30 e caractere fora da regra", () => {
        recusado(instagram(""), "usuario");
        recusado(instagram("@"), "usuario");
        recusado(instagram("a".repeat(31)), "usuario");
        recusado(instagram("fulano-dev"), "usuario");
        recusado(instagram("fulano dev"), "usuario");
        recusado(instagram("@@fulano"), "usuario");
    });
});

describe("Email", () => {
    test("tira espaços e passa para minúsculas", () => {
        assert.deepEqual(email("  Fulano.Dev@Email.COM "), {
            ok: true,
            contato: { canal: "email", email: "fulano.dev@email.com" },
        });
    });

    test("recusa formato inválido", () => {
        const invalidos = ["", "fulano", "fulano@", "@email.com", "fulano@email", "ful ano@a.com"];
        for (const valor of invalidos) recusado(email(valor), "email");
    });

    test("aceita até 254 caracteres", () => {
        // 247 caracteres de domínio, com rótulos dentro do limite de 63 do DNS.
        const dominio = ["a", "b", "c", "d"].map((letra) => letra.repeat(60)).join(".") + ".com";
        assert.equal(email(`${"x".repeat(6)}@${dominio}`).ok, true);
        recusado(email(`${"x".repeat(7)}@${dominio}`), "email");
    });
});

describe("normalizarContatos", () => {
    const zap: EntradaContato = { canal: "whatsapp", pais: "BR", ddd: "11", numero: "98765-4321" };
    const insta: EntradaContato = { canal: "instagram", usuario: "@Fulano" };

    test("normaliza os dois contatos", () => {
        assert.deepEqual(normalizarContatos({ primario: zap, secundario: insta }), {
            ok: true,
            contatos: {
                primario: {
                    canal: "whatsapp",
                    pais: "BR",
                    ddi: "55",
                    ddd: "11",
                    numero: "987654321",
                },
                secundario: { canal: "instagram", usuario: "fulano" },
            },
        });
    });

    test("secundário ausente ou null vira null", () => {
        for (const secundario of [undefined, null]) {
            const resultado = normalizarContatos({ primario: insta, secundario });
            assert.equal(resultado.ok, true);
            if (resultado.ok) assert.equal(resultado.contatos.secundario, null);
        }
    });

    test("recusa os dois no mesmo canal", () => {
        const resultado = normalizarContatos({
            primario: insta,
            secundario: { canal: "instagram", usuario: "outro" },
        });
        assert.deepEqual(caminhos(resultado), ["secundario.canal"]);
    });

    test("aponta o campo de cada contato inválido", () => {
        const resultado = normalizarContatos({
            primario: { canal: "whatsapp", pais: "BR", ddd: "20", numero: "987654321" },
            secundario: { canal: "email", email: "sem-arroba" },
        });
        assert.deepEqual(caminhos(resultado), ["primario.ddd", "secundario.email"]);
    });

    test("secundário inválido recusa mesmo com o principal certo", () => {
        const resultado = normalizarContatos({
            primario: zap,
            secundario: { canal: "instagram", usuario: ".fulano" },
        });
        assert.deepEqual(caminhos(resultado), ["secundario.usuario"]);
    });
});
