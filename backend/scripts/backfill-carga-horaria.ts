// Preenche a carga horária das trilhas que estão sem ela.
//
// Trilha sem workload_hours não emite certificado: statusCertificado devolve o
// motivo "carga_horaria" e a emissão responde 409. O aluno conclui as 35 aulas,
// passa em todos os quizzes e não recebe nada, sem entender por quê. Foi o que
// aconteceu com quem terminou Redes.
//
// A carga não é derivada do tempo de leitura das aulas, que mede outra coisa. Ela
// segue a régua que o catálogo já usa, de cerca de quatro sétimos de hora por aula:
//
//   10 aulas ->  6h      28 aulas -> 16h      38 aulas -> 22h
//   14 aulas ->  8h      34 aulas -> 20h      46 aulas -> 26h
//   21 aulas -> 12h      35 aulas -> 20h      58 aulas -> 32h
//   27 aulas -> 15h      37 aulas -> 20h
//
// Em trilha multi-linguagem conta o melhor track (neutras mais uma linguagem), e não
// a soma de todas, senão a mesma aula em dois trilhos dobraria a carga. É a mesma
// régua da conclusão no roadmap e no certificado.
//
// Não sobrescreve quem já tem carga definida: quatro trilhas usam 24h para 35 aulas
// por decisão editorial, e o script não tem opinião sobre isso.
//
// Confere sem gravar:  node scripts/backfill-carga-horaria.ts
// Aplica:              node scripts/backfill-carga-horaria.ts --aplicar
import { db } from "../db.ts";
import { lessons, trails } from "../schema.ts";
import { and, eq, isNull } from "drizzle-orm";

const HORAS_POR_AULA = 4 / 7;

export function cargaPara(aulas: number) {
    return Math.max(1, Math.round(aulas * HORAS_POR_AULA));
}

/** Quantas aulas a trilha cobra de quem a conclui: neutras mais o maior track. */
function aulasQueContam(aulas: { language: string | null }[]) {
    const neutras = aulas.filter((a) => a.language === null).length;
    const porLinguagem = new Map<string, number>();
    for (const a of aulas) {
        if (a.language) porLinguagem.set(a.language, (porLinguagem.get(a.language) ?? 0) + 1);
    }
    const maiorTrack = porLinguagem.size ? Math.max(...porLinguagem.values()) : 0;
    return neutras + maiorTrack;
}

async function backfill() {
    const aplicar = process.argv.includes("--aplicar");

    const semCarga = await db.select().from(trails).where(isNull(trails.workloadHours));
    if (semCarga.length === 0) {
        console.log("Nenhuma trilha sem carga horaria. Nada a fazer.");
        return;
    }

    const planejadas: { id: string; nome: string; aulas: number; horas: number }[] = [];
    const vazias: string[] = [];
    for (const t of semCarga) {
        const aulas = await db
            .select({ language: lessons.language })
            .from(lessons)
            .where(and(eq(lessons.trailId, t.id), eq(lessons.published, true)));
        const contam = aulasQueContam(aulas);
        // Trilha sem aula publicada nao emite certificado de qualquer jeito, e chutar
        // uma carga para ela seria inventar numero.
        if (contam === 0) {
            vazias.push(t.name);
            continue;
        }
        planejadas.push({ id: t.id, nome: t.name, aulas: contam, horas: cargaPara(contam) });
    }

    planejadas.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    console.log(`${planejadas.length} trilha(s) sem carga horaria:\n`);
    for (const p of planejadas) {
        console.log(`  ${p.nome.padEnd(32)} ${String(p.aulas).padStart(3)} aulas -> ${p.horas}h`);
    }
    if (vazias.length) {
        console.log(`\nPuladas por nao terem aula publicada: ${vazias.join(", ")}`);
    }

    if (!aplicar) {
        console.log("\nNada gravado. Rode com --aplicar para gravar.");
        return;
    }

    for (const p of planejadas) {
        await db.update(trails).set({ workloadHours: p.horas }).where(eq(trails.id, p.id));
    }
    console.log(`\n${planejadas.length} trilha(s) atualizada(s).`);
}

backfill()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no backfill da carga horaria:", e);
        process.exit(1);
    });
