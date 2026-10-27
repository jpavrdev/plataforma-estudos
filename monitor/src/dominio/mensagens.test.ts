import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { alertaDeFalha, alertaDeLembrete, alertaDeRecuperacao } from "./mensagens.ts";
import { POLITICAS } from "./politica.ts";
import type { EstadoVerificacao, Politica, Resultado } from "./tipos.ts";

const POLITICA: Politica = { falhasParaAlertar: 2, lembreteACadaHoras: 6 };
const DESDE = "2026-10-23T12:00:00.000Z";

function emFalha(verificacao: string, falhasSeguidas = 2): EstadoVerificacao {
    return {
        verificacao,
        situacao: "falha",
        falhasSeguidas,
        desde: DESDE,
        alertado: true,
        ultimoAlertaEm: DESDE,
    };
}

function medicao(verificacao: string, detalhe: string): Resultado {
    return { verificacao, situacao: "falha", detalhe, medidoEm: DESDE };
}

describe("alertaDeFalha", () => {
    test("diz o que falhou, desde quando e o detalhe", () => {
        const alerta = alertaDeFalha(
            emFalha("site"),
            medicao("site", "respondeu 502 em 15 ms"),
            POLITICA,
            new Date("2026-10-23T12:01:00.000Z"),
        );
        assert.equal(alerta.tipo, "falha");
        assert.equal(alerta.verificacao, "site");
        assert.equal(alerta.assunto, "[ensina.dev] Falha no site");
        assert.match(alerta.mensagem, /detectou falha no site em 2 verificações seguidas\./);
        assert.match(alerta.mensagem, /Detalhe: respondeu 502 em 15 ms/);
        assert.match(
            alerta.mensagem,
            /Em falha desde 23\/10\/2026 09:00 \(horário de Brasília\), há 1 min\./,
        );
        assert.match(alerta.mensagem, /um lembrete a cada 6 horas\./);
    });

    test("com uma falha só não fala em verificações seguidas", () => {
        const alerta = alertaDeFalha(
            emFalha("disco", 1),
            medicao("disco", "91% de uso, o limite é 85%"),
            POLITICA,
            new Date(DESDE),
        );
        assert.match(alerta.mensagem, /^O monitor detectou falha no disco de uploads\.$/m);
        assert.match(alerta.mensagem, /há menos de 1 min\./);
    });

    test("usa o artigo certo para cada verificação", () => {
        const assunto = (verificacao: string) =>
            alertaDeFalha(
                emFalha(verificacao),
                medicao(verificacao, "x"),
                POLITICA,
                new Date(DESDE),
            ).assunto;
        assert.equal(assunto("api"), "[ensina.dev] Falha na API");
        assert.equal(assunto("renderizacao"), "[ensina.dev] Falha na renderização do site");
        assert.equal(assunto("whatsapp"), "[ensina.dev] Falha no WhatsApp da recuperação de senha");
        assert.equal(assunto("backup"), "[ensina.dev] Falha no backup do banco");
    });
});

describe("alertaDeLembrete", () => {
    test("diz há quanto tempo continua em falha", () => {
        const alerta = alertaDeLembrete(
            emFalha("banco", 362),
            medicao("banco", "a API informou o banco com situação falha"),
            new Date("2026-10-23T18:02:00.000Z"),
        );
        assert.equal(alerta.tipo, "lembrete");
        assert.equal(alerta.assunto, "[ensina.dev] O banco de dados continua em falha");
        assert.match(
            alerta.mensagem,
            /^O banco de dados continua em falha há 6 h e 2 min, em 362 verificações seguidas\.$/m,
        );
        assert.match(alerta.mensagem, /Detalhe da última verificação: a API informou o banco/);
        assert.match(
            alerta.mensagem,
            /Em falha desde 23\/10\/2026 09:00 \(horário de Brasília\)\./,
        );
    });
});

describe("alertaDeRecuperacao", () => {
    test("diz quanto tempo ficou em falha e como está agora", () => {
        const alerta = alertaDeRecuperacao(
            emFalha("api"),
            { ...medicao("api", 'respondeu {"status":"ok"} em 90 ms'), situacao: "ok" },
            new Date("2026-10-23T12:14:00.000Z"),
        );
        assert.equal(alerta.tipo, "recuperacao");
        assert.equal(alerta.assunto, "[ensina.dev] A API voltou ao normal");
        assert.match(alerta.mensagem, /^A API voltou ao normal depois de 14 min em falha\.$/m);
        assert.match(
            alerta.mensagem,
            /A falha começou em 23\/10\/2026 09:00 \(horário de Brasília\)\./,
        );
        assert.match(alerta.mensagem, /Última verificação: respondeu \{"status":"ok"\} em 90 ms/);
    });
});

test("nenhum alerta tem travessão nem emoji, e o assunto cabe no SNS", () => {
    const agora = new Date("2026-10-24T03:00:00.000Z");
    for (const nome of [...Object.keys(POLITICAS), "verificacao-nova"]) {
        const estado = emFalha(nome);
        const resultado = medicao(nome, "detalhe qualquer");
        for (const alerta of [
            alertaDeFalha(estado, resultado, POLITICA, agora),
            alertaDeLembrete(estado, resultado, agora),
            alertaDeRecuperacao(estado, resultado, agora),
        ]) {
            const texto = `${alerta.assunto}\n${alerta.mensagem}`;
            assert.doesNotMatch(texto, /[\u2013\u2014]/);
            assert.doesNotMatch(texto, /\p{Extended_Pictographic}/u);
            assert.ok(alerta.assunto.length < 100);
            assert.doesNotMatch(alerta.assunto, /\n/);
        }
    }
});
