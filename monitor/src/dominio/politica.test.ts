import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { avaliar, POLITICAS } from "./politica.ts";
import type { Alerta, EstadoVerificacao, Politica, Resultado, Situacao } from "./tipos.ts";

const POLITICA: Politica = { falhasParaAlertar: 2, lembreteACadaHoras: 6 };
const INICIO = Date.parse("2026-10-23T12:00:00.000Z");
const MINUTO = 60_000;
const HORA = 60 * MINUTO;

const em = (ms: number) => new Date(INICIO + ms);
const iso = (ms: number) => em(ms).toISOString();
const repetir = (situacao: Situacao, vezes: number): Situacao[] =>
    Array.from({ length: vezes }, () => situacao);

function medicao(situacao: Situacao, instante: Date): Resultado {
    return {
        verificacao: "site",
        situacao,
        detalhe: situacao === "ok" ? "respondeu 200 em 80 ms" : "respondeu 502 em 15 ms",
        medidoEm: instante.toISOString(),
    };
}

function rodarUmaPorMinuto(situacoes: Situacao[], politica = POLITICA) {
    let estado: EstadoVerificacao | undefined;
    const alertas: (Alerta["tipo"] | undefined)[] = [];
    for (const [minuto, situacao] of situacoes.entries()) {
        const agora = em(minuto * MINUTO);
        const avaliacao = avaliar(estado, medicao(situacao, agora), politica, agora);
        estado = avaliacao.estado;
        alertas.push(avaliacao.alerta?.tipo);
    }
    assert.ok(estado);
    return { estado, alertas };
}

describe("avaliar", () => {
    test("a primeira medição ok cria o estado sem alerta", () => {
        const { estado, alerta } = avaliar(undefined, medicao("ok", em(0)), POLITICA, em(0));
        assert.deepEqual(estado, {
            verificacao: "site",
            situacao: "ok",
            falhasSeguidas: 0,
            desde: iso(0),
            alertado: false,
        });
        assert.equal(alerta, undefined);
    });

    test("ok seguido de ok mantém o início da situação", () => {
        const { estado, alertas } = rodarUmaPorMinuto(["ok", "ok", "ok"]);
        assert.equal(estado.desde, iso(0));
        assert.deepEqual(alertas, [undefined, undefined, undefined]);
    });

    test("falhas abaixo do limite só contam", () => {
        const { estado, alertas } = rodarUmaPorMinuto(repetir("falha", 4), {
            falhasParaAlertar: 5,
            lembreteACadaHoras: 6,
        });
        assert.equal(estado.falhasSeguidas, 4);
        assert.equal(estado.alertado, false);
        assert.deepEqual(alertas, [undefined, undefined, undefined, undefined]);
    });

    test("alerta exatamente ao atingir o limite", () => {
        const { estado, alertas } = rodarUmaPorMinuto(["ok", "falha", "falha"]);
        assert.deepEqual(alertas, [undefined, undefined, "falha"]);
        assert.deepEqual(estado, {
            verificacao: "site",
            situacao: "falha",
            falhasSeguidas: 2,
            desde: iso(MINUTO),
            alertado: true,
            ultimoAlertaEm: iso(2 * MINUTO),
        });
    });

    test("com limite 1 a primeira falha já alerta", () => {
        const { alertas } = rodarUmaPorMinuto(["ok", "falha"], {
            falhasParaAlertar: 1,
            lembreteACadaHoras: 6,
        });
        assert.deepEqual(alertas, [undefined, "falha"]);
    });

    test("depois do alerta as falhas seguintes não repetem o aviso e o início não muda", () => {
        const { estado, alertas } = rodarUmaPorMinuto(repetir("falha", 30));
        assert.deepEqual(
            alertas.filter((tipo) => tipo !== undefined),
            ["falha"],
        );
        assert.equal(estado.falhasSeguidas, 30);
        assert.equal(estado.desde, iso(0));
    });

    test("falha acima do limite ainda sem aviso alerta, que é como um envio perdido é refeito", () => {
        const anterior: EstadoVerificacao = {
            verificacao: "site",
            situacao: "falha",
            falhasSeguidas: 4,
            desde: iso(0),
            alertado: false,
        };
        const agora = em(5 * MINUTO);
        const { estado, alerta } = avaliar(anterior, medicao("falha", agora), POLITICA, agora);
        assert.equal(alerta?.tipo, "falha");
        assert.equal(estado.falhasSeguidas, 5);
        assert.equal(estado.alertado, true);
        assert.equal(estado.ultimoAlertaEm, agora.toISOString());
    });

    test("a recuperação depois de um alerta avisa e zera o estado", () => {
        const { estado, alertas } = rodarUmaPorMinuto(["falha", "falha", "falha", "ok"]);
        assert.deepEqual(alertas, [undefined, "falha", undefined, "recuperacao"]);
        assert.deepEqual(estado, {
            verificacao: "site",
            situacao: "ok",
            falhasSeguidas: 0,
            desde: iso(3 * MINUTO),
            alertado: false,
            ultimoAlertaEm: iso(3 * MINUTO),
        });
    });

    test("a recuperação sem alerta anterior não avisa", () => {
        const { estado, alertas } = rodarUmaPorMinuto(["falha", "ok"]);
        assert.deepEqual(alertas, [undefined, undefined]);
        assert.equal(estado.situacao, "ok");
        assert.equal(estado.falhasSeguidas, 0);
        assert.equal(estado.desde, iso(MINUTO));
    });

    test("uma nova falha depois da recuperação recomeça a contagem", () => {
        const { alertas } = rodarUmaPorMinuto(["falha", "falha", "ok", "falha", "falha"]);
        assert.deepEqual(alertas, [undefined, "falha", "recuperacao", undefined, "falha"]);
    });

    describe("lembrete", () => {
        const alertado: EstadoVerificacao = {
            verificacao: "site",
            situacao: "falha",
            falhasSeguidas: 2,
            desde: iso(0),
            alertado: true,
            ultimoAlertaEm: iso(MINUTO),
        };

        test("não lembra antes de completar o intervalo", () => {
            const agora = em(MINUTO + 6 * HORA - 1);
            const { estado, alerta } = avaliar(alertado, medicao("falha", agora), POLITICA, agora);
            assert.equal(alerta, undefined);
            assert.equal(estado.ultimoAlertaEm, iso(MINUTO));
        });

        test("lembra ao completar o intervalo desde o último aviso", () => {
            const agora = em(MINUTO + 6 * HORA);
            const { estado, alerta } = avaliar(alertado, medicao("falha", agora), POLITICA, agora);
            assert.equal(alerta?.tipo, "lembrete");
            assert.equal(estado.ultimoAlertaEm, agora.toISOString());
            assert.equal(estado.falhasSeguidas, 3);
            assert.equal(estado.desde, iso(0));
        });

        test("o lembrete seguinte conta a partir do anterior", () => {
            const { alertas } = rodarUmaPorMinuto(repetir("falha", 12 * 60 + 2));
            const avisos = alertas.flatMap((tipo, minuto) => (tipo ? [`${minuto}:${tipo}`] : []));
            assert.deepEqual(avisos, ["1:falha", "361:lembrete", "721:lembrete"]);
        });
    });

    test("usa o relógio recebido, não o do sistema", () => {
        const passado = new Date("2001-01-01T00:00:00.000Z");
        const { estado } = avaliar(undefined, medicao("falha", passado), POLITICA, passado);
        assert.equal(estado.desde, "2001-01-01T00:00:00.000Z");

        const alertado = {
            ...estado,
            falhasSeguidas: 2,
            alertado: true,
            ultimoAlertaEm: estado.desde,
        };
        const seisHorasDepois = new Date("2001-01-01T06:00:00.000Z");
        const { alerta } = avaliar(
            alertado,
            medicao("falha", seisHorasDepois),
            POLITICA,
            seisHorasDepois,
        );
        assert.equal(alerta?.tipo, "lembrete");
    });
});

describe("POLITICAS", () => {
    test("segue a tabela do README", () => {
        const limites = Object.fromEntries(
            Object.entries(POLITICAS).map(([nome, politica]) => [nome, politica.falhasParaAlertar]),
        );
        assert.deepEqual(limites, {
            site: 2,
            api: 2,
            banco: 2,
            whatsapp: 5,
            disco: 1,
            renderizacao: 2,
            backup: 1,
        });
        for (const politica of Object.values(POLITICAS)) {
            assert.equal(politica.lembreteACadaHoras, 6);
        }
    });
});
