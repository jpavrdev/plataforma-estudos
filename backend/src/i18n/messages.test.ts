import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { MESSAGES, t, translateMessage } from "./messages.ts";
import { localeFromHeader } from "./locale.ts";

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe("message catalog", () => {
    test("every entry has text in both languages and the same placeholders", () => {
        for (const [key, entry] of Object.entries(MESSAGES)) {
            assert.ok(entry["pt-BR"].trim(), `${key} without pt-BR`);
            assert.ok(entry.en.trim(), `${key} without en`);
            assert.deepEqual(placeholders(entry["pt-BR"]), placeholders(entry.en), key);
        }
    });

    test("no two keys share the same Portuguese text, so the bridge is unambiguous", () => {
        const seen = new Map<string, string>();
        for (const [key, entry] of Object.entries(MESSAGES)) {
            const texts = [entry["pt-BR"], ...("aliases" in entry ? entry.aliases : [])];
            for (const text of texts) {
                const normalized = text.trim().replace(/\.$/, "");
                assert.ok(
                    !seen.has(normalized),
                    `${key} repeats the text of ${seen.get(normalized)}`,
                );
                seen.set(normalized, key);
            }
        }
    });
});

describe("translateMessage", () => {
    test("a key becomes its text in each language", () => {
        assert.equal(translateMessage("pt-BR", "trail.notFound"), "Trilha não encontrada");
        assert.equal(translateMessage("en", "trail.notFound"), "Track not found");
    });

    test("a Portuguese text goes out unchanged in pt-BR", () => {
        assert.equal(
            translateMessage("pt-BR", "Refresh token inválido. "),
            "Refresh token inválido. ",
        );
    });

    test("the bridge finds the key by the Portuguese text, its variants and aliases", () => {
        assert.equal(translateMessage("en", "Credenciais inválidas"), "Invalid credentials");
        assert.equal(translateMessage("en", "Refresh token inválido. "), "Invalid refresh token");
        assert.equal(translateMessage("en", "Nao autenticado"), "Not authenticated");
    });

    test("the bridge fills the placeholders of a text with variable parts", () => {
        assert.equal(
            translateMessage("en", "Questão 3: enunciado muito curto."),
            "Question 3: statement too short.",
        );
        assert.equal(
            translateMessage("en", "Imagem muito grande (maximo 6MB)"),
            "Image too large (maximum 6MB)",
        );
    });

    test("an unknown text stays as it is", (t) => {
        t.mock.method(console, "warn", () => {});
        assert.equal(translateMessage("en", "Texto sem catálogo"), "Texto sem catálogo");
    });

    test("t fills the placeholders", () => {
        assert.equal(
            t("en", "resume.monthlyLimit", { limit: 30 }).startsWith("You have already run 30"),
            true,
        );
    });
});

describe("localeFromHeader", () => {
    test("English only when the header asks for it; pt-BR otherwise", () => {
        assert.equal(localeFromHeader("en"), "en");
        assert.equal(localeFromHeader("en-US"), "en");
        assert.equal(localeFromHeader("pt-BR"), "pt-BR");
        assert.equal(localeFromHeader(undefined), "pt-BR");
        assert.equal(localeFromHeader("fr"), "pt-BR");
    });
});

// Every message the code sends to people must have an English translation. Reads
// the sources with the TypeScript parser and checks AppError arguments, `erro` and
// `mensagem` properties and rate limiter messages. A template literal is checked
// with its expressions replaced by "1".
describe("catalog coverage", () => {
    const srcDir = path.resolve(import.meta.dirname, "..");
    const files = fs
        .readdirSync(srcDir, { recursive: true, encoding: "utf8" })
        .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"))
        .map((f) => path.join(srcDir, f));

    function messagesIn(file: string): string[] {
        const source = ts.createSourceFile(
            file,
            fs.readFileSync(file, "utf8"),
            ts.ScriptTarget.Latest,
            true,
        );
        const found: string[] = [];
        const textOf = (node: ts.Node | undefined): string | null => {
            if (!node) return null;
            if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
                return node.text;
            if (ts.isTemplateExpression(node)) {
                return (
                    node.head.text + node.templateSpans.map((s) => "1" + s.literal.text).join("")
                );
            }
            if (ts.isConditionalExpression(node)) {
                found.push(
                    ...[node.whenTrue, node.whenFalse].map(textOf).filter((x): x is string => !!x),
                );
            }
            return null;
        };
        const visit = (node: ts.Node) => {
            if (ts.isNewExpression(node) && node.expression.getText(source) === "AppError") {
                const text = textOf(node.arguments?.[1]);
                if (text) found.push(text);
            } else if (
                ts.isPropertyAssignment(node) &&
                ts.isIdentifier(node.name) &&
                ["erro", "mensagem"].includes(node.name.text)
            ) {
                const text = textOf(node.initializer);
                if (text) found.push(text);
            } else if (
                ts.isCallExpression(node) &&
                node.expression.getText(source) === "criarLimiter"
            ) {
                const text = textOf(node.arguments[1]);
                if (text) found.push(text);
            }
            ts.forEachChild(node, visit);
        };
        visit(source);
        return found;
    }

    test("every message sent by the code has an English translation", (t) => {
        t.mock.method(console, "warn", () => {});
        const missing: string[] = [];
        for (const file of files) {
            for (const text of messagesIn(file)) {
                if (Object.hasOwn(MESSAGES, text)) continue;
                if (translateMessage("en", text) === text) {
                    missing.push(`${path.relative(srcDir, file)}: ${text}`);
                }
            }
        }
        assert.deepEqual(missing, [], `messages without translation:\n${missing.join("\n")}`);
    });
});
