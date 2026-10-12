import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { embaralharComSemente } from "./embaralhar.ts";

describe("embaralharComSemente", () => {
    test("a mesma semente devolve sempre a mesma ordem", () => {
        const itens = ["a", "b", "c", "d", "e", "f"];
        assert.deepEqual(
            embaralharComSemente(itens, "att-q"),
            embaralharComSemente(itens, "att-q"),
        );
    });

    test("é uma permutação dos mesmos itens", () => {
        const itens = ["a", "b", "c", "d", "e", "f"];
        assert.deepEqual([...embaralharComSemente(itens, "s")].sort(), [...itens].sort());
    });

    test("sementes diferentes geram ordens diferentes", () => {
        const itens = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
        assert.notDeepEqual(
            embaralharComSemente(itens, "att1-q"),
            embaralharComSemente(itens, "att2-q"),
        );
    });

    test("não muta o array original", () => {
        const itens = ["a", "b", "c"];
        embaralharComSemente(itens, "s");
        assert.deepEqual(itens, ["a", "b", "c"]);
    });
});
