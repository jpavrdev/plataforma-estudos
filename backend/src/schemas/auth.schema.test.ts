import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { registerSchema, loginSchema } from "./auth.schema.ts";

const usuarioValido = {
    name: "Maria Silva",
    email: "maria@email.com",
    password: "senhaforte123",
    birthDate: "1990-01-01",
    gender: "feminino",
    phone: "(11) 98888-7777",
};

describe("registerSchema", () => {
    test("aceita um cadastro válido", () => {
        const r = registerSchema.safeParse(usuarioValido);
        assert.equal(r.success, true);
    });

    test("rejeita nome com menos de 2 caracteres", () => {
        const r = registerSchema.safeParse({ ...usuarioValido, name: "M" });
        assert.equal(r.success, false);
    });

    test("rejeita email inválido", () => {
        const r = registerSchema.safeParse({ ...usuarioValido, email: "naoehemail" });
        assert.equal(r.success, false);
    });

    test("rejeita senha com menos de 12 caracteres", () => {
        const r = registerSchema.safeParse({ ...usuarioValido, password: "abc123" });
        assert.equal(r.success, false);
    });

    test("rejeita senha sem número", () => {
        const r = registerSchema.safeParse({ ...usuarioValido, password: "senhasemnumero" });
        assert.equal(r.success, false);
    });

    test("rejeita senha com mais de 72 caracteres", () => {
        const r = registerSchema.safeParse({ ...usuarioValido, password: "a1" + "x".repeat(72) });
        assert.equal(r.success, false);
    });

    test("aceita senha no limite de 12 caracteres com número", () => {
        const r = registerSchema.safeParse({ ...usuarioValido, password: "abcdefghij12" });
        assert.equal(r.success, true);
    });

    test("rejeita birthDate em formato errado", () => {
        const r = registerSchema.safeParse({ ...usuarioValido, birthDate: "01/01/1990" });
        assert.equal(r.success, false);
    });

    test("rejeita quando faltam campos obrigatórios", () => {
        const r = registerSchema.safeParse({ name: "Maria", email: "maria@email.com" });
        assert.equal(r.success, false);
    });
});

describe("loginSchema", () => {
    test("aceita email e senha válidos", () => {
        const r = loginSchema.safeParse({ email: "maria@email.com", password: "x" });
        assert.equal(r.success, true);
    });

    test("rejeita email inválido", () => {
        const r = loginSchema.safeParse({ email: "invalido", password: "x" });
        assert.equal(r.success, false);
    });

    test("rejeita senha vazia", () => {
        const r = loginSchema.safeParse({ email: "maria@email.com", password: "" });
        assert.equal(r.success, false);
    });
});
