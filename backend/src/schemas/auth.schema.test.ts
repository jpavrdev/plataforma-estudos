import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { registerSchema, loginSchema } from "./auth.schema.ts";

const validUser = {
    name: "Maria Silva",
    username: "maria_silva",
    email: "maria@email.com",
    password: "Senhaforte123!",
    birthDate: "1990-01-01",
    gender: "feminino",
    phone: "(11) 98888-7777",
};

describe("registerSchema", () => {
    test("accepts a valid sign-up", () => {
        const r = registerSchema.safeParse(validUser);
        assert.equal(r.success, true);
    });

    test("rejects a name with fewer than 2 characters", () => {
        const r = registerSchema.safeParse({ ...validUser, name: "M" });
        assert.equal(r.success, false);
    });

    test("rejects an invalid email", () => {
        const r = registerSchema.safeParse({ ...validUser, email: "naoehemail" });
        assert.equal(r.success, false);
    });

    test("rejects a username with invalid characters", () => {
        const r = registerSchema.safeParse({ ...validUser, username: "maria silva" });
        assert.equal(r.success, false);
    });

    test("rejects a username that is too short", () => {
        const r = registerSchema.safeParse({ ...validUser, username: "ab" });
        assert.equal(r.success, false);
    });

    test("rejects a username that is too long", () => {
        const r = registerSchema.safeParse({ ...validUser, username: "a".repeat(21) });
        assert.equal(r.success, false);
    });

    test("rejects a password with fewer than 12 characters", () => {
        const r = registerSchema.safeParse({ ...validUser, password: "abc123" });
        assert.equal(r.success, false);
    });

    test("rejects a password without a number", () => {
        const r = registerSchema.safeParse({ ...validUser, password: "senhasemnumero" });
        assert.equal(r.success, false);
    });

    test("rejects a password with more than 72 characters", () => {
        const r = registerSchema.safeParse({ ...validUser, password: "a1" + "x".repeat(72) });
        assert.equal(r.success, false);
    });

    test("accepts a password at the 12-character limit with every requirement", () => {
        const r = registerSchema.safeParse({ ...validUser, password: "Abcdefgh123!" });
        assert.equal(r.success, true);
    });

    test("rejects a password without an uppercase letter", () => {
        const r = registerSchema.safeParse({ ...validUser, password: "senhaforte123!" });
        assert.equal(r.success, false);
    });

    test("rejects a password without a lowercase letter", () => {
        const r = registerSchema.safeParse({ ...validUser, password: "SENHAFORTE123!" });
        assert.equal(r.success, false);
    });

    test("rejects a password without a special character", () => {
        const r = registerSchema.safeParse({ ...validUser, password: "Senhaforte123" });
        assert.equal(r.success, false);
    });

    test("rejects a birthDate in the wrong format", () => {
        const r = registerSchema.safeParse({ ...validUser, birthDate: "01/01/1990" });
        assert.equal(r.success, false);
    });

    test("rejects missing required fields", () => {
        const r = registerSchema.safeParse({ name: "Maria", email: "maria@email.com" });
        assert.equal(r.success, false);
    });
});

describe("loginSchema", () => {
    test("accepts a valid email and password", () => {
        const r = loginSchema.safeParse({ email: "maria@email.com", password: "x" });
        assert.equal(r.success, true);
    });

    test("rejects an invalid email", () => {
        const r = loginSchema.safeParse({ email: "invalido", password: "x" });
        assert.equal(r.success, false);
    });

    test("rejects an empty password", () => {
        const r = loginSchema.safeParse({ email: "maria@email.com", password: "" });
        assert.equal(r.success, false);
    });
});
