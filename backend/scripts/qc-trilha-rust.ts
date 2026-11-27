// QC estrutural da trilha Rust: contagens, gabarito único, equilíbrio de opções
// e vícios de formulação. Rodar com as env do backend.
import { MODULOS } from "./seed-trilha-rust.ts";

type Problema = { onde: string; detalhe: string };
const problemas: Problema[] = [];
let aulas = 0;
let questoes = 0;

const TELL = [
    "todas as anteriores",
    "nenhuma das anteriores",
    "todos os itens",
    "nenhum dos itens",
    "as acima",
];

for (const [mi, m] of MODULOS.entries()) {
    if (!m.titulo || !m.titulo.includes(`Módulo ${mi + 1}`)) {
        problemas.push({ onde: `módulo ${mi + 1}`, detalhe: `título fora do padrão: ${m.titulo}` });
    }
    if (m.aulas.length !== 5) {
        problemas.push({ onde: m.titulo, detalhe: `${m.aulas.length} aulas (esperado 5)` });
    }
    for (const [ai, a] of m.aulas.entries()) {
        aulas++;
        if (a.blocks.length < 3 || a.blocks.length > 7) {
            problemas.push({ onde: `${m.titulo} / ${a.titulo}`, detalhe: `${a.blocks.length} blocos` });
        }
        if (a.questions.length !== 5) {
            problemas.push({ onde: `${m.titulo} / ${a.titulo}`, detalhe: `${a.questions.length} questões (esperado 5)` });
        }
        for (const [qi, q] of a.questions.entries()) {
            questoes++;
            const ref = `${m.titulo} / a${ai + 1} q${qi + 1}`;
            if (q.options.length !== 4) {
                problemas.push({ onde: ref, detalhe: `${q.options.length} opções` });
                continue;
            }
            const corretas = q.options.filter((o) => o.isCorrect).length;
            if (corretas !== 1) {
                problemas.push({ onde: ref, detalhe: `${corretas} opções corretas` });
            }
            if (!q.explanation || q.explanation.trim().length < 20) {
                problemas.push({ onde: ref, detalhe: "explanation ausente ou curta" });
            }
            for (const [oi, o] of q.options.entries()) {
                const low = o.text.toLowerCase();
                if (TELL.some((t) => low.includes(t))) {
                    problemas.push({ onde: ref, detalhe: `opção ${oi + 1} com fuga: ${o.text}` });
                }
            }
            // Equilíbrio: a correta pode ser a mais longa, mas não sistematicamente.
            const tam = q.options.map((o) => o.text.length);
            const idxCorreta = q.options.findIndex((o) => o.isCorrect);
            const maiores = tam.filter((t) => t > tam[idxCorreta]).length;
            if (maiores === 0 && tam.filter((t) => t === tam[idxCorreta]).length === 1) {
                problemas.push({ onde: ref, detalhe: "correta é a mais longa (checar equilíbrio)" });
            }
        }
    }
}

// Resumo de dificuldade e repetição de enunciados.
const dif = { facil: 0, medio: 0, dificil: 0 } as Record<string, number>;
const vistos = new Map<string, number>();
for (const m of MODULOS) {
    for (const a of m.aulas) {
        for (const q of a.questions) {
            dif[q.difficulty] = (dif[q.difficulty] ?? 0) + 1;
            const chave = q.statement.trim().toLowerCase();
            vistos.set(chave, (vistos.get(chave) ?? 0) + 1);
        }
    }
}
for (const [chave, n] of vistos) {
    if (n > 1) problemas.push({ onde: "repetição", detalhe: `enunciado ${n}x: ${chave.slice(0, 60)}` });
}

console.log(`módulos: ${MODULOS.length}, aulas: ${aulas}, questões: ${questoes}`);
console.log(`dificuldade: ${JSON.stringify(dif)}`);
console.log(`correta-mais-longa (a conferir no olho): ver lista`);
if (problemas.length === 0) {
    console.log("QC OK: nenhum problema estrutural.");
} else {
    console.log(`${problemas.length} problema(s):`);
    for (const p of problemas) console.log(`- [${p.onde}] ${p.detalhe}`);
}
