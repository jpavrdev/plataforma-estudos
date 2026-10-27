import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { periodosSobrepoem, periodoValido, situacaoDoSorteio } from "./sorteio.ts";

const data = (iso: string) => new Date(iso);
const INICIO = data("2026-11-01T12:00:00Z");
const FIM = data("2026-11-08T12:00:00Z");
const sorteio = { inicio: INICIO, fim: FIM, sorteadoEm: null };

describe("situacaoDoSorteio", () => {
    test("antes do início está agendado", () => {
        assert.equal(situacaoDoSorteio(sorteio, data("2026-11-01T11:59:59.999Z")), "agendado");
    });

    test("o instante do início já está aberto", () => {
        assert.equal(situacaoDoSorteio(sorteio, INICIO), "aberto");
    });

    test("até o último milissegundo antes do fim está aberto", () => {
        assert.equal(situacaoDoSorteio(sorteio, data("2026-11-08T11:59:59.999Z")), "aberto");
    });

    test("o instante do fim já está encerrado", () => {
        assert.equal(situacaoDoSorteio(sorteio, FIM), "encerrado");
    });

    test("depois do fim, sem sorteio, segue encerrado", () => {
        assert.equal(situacaoDoSorteio(sorteio, data("2027-01-01T00:00:00Z")), "encerrado");
    });

    test("com sorteado_em preenchido é sorteado, qualquer que seja a hora", () => {
        const feito = { ...sorteio, sorteadoEm: data("2026-11-08T13:00:00Z") };
        assert.equal(situacaoDoSorteio(feito, data("2026-11-08T13:00:00Z")), "sorteado");
        assert.equal(situacaoDoSorteio(feito, INICIO), "sorteado");
    });
});

describe("periodoValido", () => {
    test("fim depois do início", () => {
        assert.equal(periodoValido({ inicio: INICIO, fim: FIM }), true);
    });

    test("fim igual ou antes do início", () => {
        assert.equal(periodoValido({ inicio: INICIO, fim: INICIO }), false);
        assert.equal(periodoValido({ inicio: FIM, fim: INICIO }), false);
    });
});

describe("periodosSobrepoem", () => {
    const periodo = (inicio: string, fim: string) => ({ inicio: data(inicio), fim: data(fim) });
    const base = periodo("2026-11-01T00:00:00Z", "2026-11-10T00:00:00Z");

    test("cruzamento parcial, de qualquer lado", () => {
        const depois = periodo("2026-11-09T00:00:00Z", "2026-11-20T00:00:00Z");
        assert.equal(periodosSobrepoem(base, depois), true);
        assert.equal(periodosSobrepoem(depois, base), true);
    });

    test("um dentro do outro e períodos iguais", () => {
        const dentro = periodo("2026-11-03T00:00:00Z", "2026-11-04T00:00:00Z");
        assert.equal(periodosSobrepoem(base, dentro), true);
        assert.equal(periodosSobrepoem(dentro, base), true);
        assert.equal(periodosSobrepoem(base, base), true);
    });

    test("um termina no instante em que o outro começa: não sobrepõe", () => {
        const emendado = periodo("2026-11-10T00:00:00Z", "2026-11-20T00:00:00Z");
        assert.equal(periodosSobrepoem(base, emendado), false);
        assert.equal(periodosSobrepoem(emendado, base), false);
    });

    test("separados não sobrepõem", () => {
        const longe = periodo("2026-12-01T00:00:00Z", "2026-12-02T00:00:00Z");
        assert.equal(periodosSobrepoem(base, longe), false);
    });
});
