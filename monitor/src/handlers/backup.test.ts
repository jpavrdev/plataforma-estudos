import assert from "node:assert/strict";
import { test } from "node:test";
import { ArmazenamentoS3 } from "../adaptadores/armazenamentoS3.ts";
import { AMBIENTE_DE_EXEMPLO, semAVariavel } from "../testes/ambiente.ts";
import { capturarConsole } from "../testes/console.ts";
import {
    ArmazenamentoFalso,
    NotificadorFalso,
    RelogioFalso,
    RepositorioEmMemoria,
} from "../testes/falsos.ts";
import { executarBackup, montarBackup } from "./backup.ts";

const MB = 1024 ** 2;

function cenario(armazenamento: ArmazenamentoFalso) {
    const relogio = new RelogioFalso("2026-10-23T07:00:00.000Z");
    const repositorio = new RepositorioEmMemoria();
    const notificador = new NotificadorFalso();
    return {
        repositorio,
        notificador,
        deps: {
            armazenamento,
            prefixo: "postgres/",
            repositorio,
            notificador,
            agora: relogio.agora,
        },
    };
}

test("dump do dia ausente avisa já na primeira execução", async (t) => {
    capturarConsole(t);
    const { notificador, deps } = cenario(
        new ArmazenamentoFalso({ "postgres/estudos-2026-10-22.dump": 100 * MB }),
    );
    await executarBackup(deps);
    assert.deepEqual(
        notificador.enviados.map((alerta) => alerta.assunto),
        ["[ensina.dev] Falha no backup do banco"],
    );
    assert.match(
        notificador.enviados[0]?.mensagem ?? "",
        /Detalhe: postgres\/estudos-2026-10-23\.dump não chegou ao bucket/,
    );
});

test("dump do dia no tamanho esperado grava ok, sem alerta", async (t) => {
    capturarConsole(t);
    const { repositorio, notificador, deps } = cenario(
        new ArmazenamentoFalso({
            "postgres/estudos-2026-10-23.dump": 101 * MB,
            "postgres/estudos-2026-10-22.dump": 100 * MB,
        }),
    );
    await executarBackup(deps);
    assert.equal(notificador.enviados.length, 0);
    assert.equal(repositorio.estados.get("backup")?.situacao, "ok");
});

test("montarBackup lê as variáveis do contrato", () => {
    const deps = montarBackup(AMBIENTE_DE_EXEMPLO);
    assert.equal(deps.prefixo, "postgres/");
    assert.ok(deps.armazenamento instanceof ArmazenamentoS3);
    const usadas = [
        "BUCKET_BACKUP",
        "PREFIXO_BACKUP",
        "REGIAO_BACKUP",
        "TABELA_ESTADO",
        "TOPICO_ALERTAS",
    ];
    for (const nome of usadas) {
        assert.throws(() => montarBackup(semAVariavel(nome)), {
            message: `a variável de ambiente ${nome} não está definida`,
        });
    }
});
