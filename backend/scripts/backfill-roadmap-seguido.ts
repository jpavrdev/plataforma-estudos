// Preenche user_roadmaps para quem já estudava antes da tabela existir, inferindo
// o caminho a partir do progresso. Grava como INFERIDO (explicito = false), então
// a escolha do próprio aluno depois sempre vence.
//
// Dois sinais, os mesmos do runtime. O prefixo contínuo (quantos estágios seguidos,
// a partir do primeiro, ele concluiu) captura a SEQUÊNCIA seguida, e é o que separa
// casos que o volume não separa: quem fez Lógica, Python e SQL tem prefixo 3 em
// Engenharia de Dados e 2 em Ciência de Dados, porque pulou Estatística. O peso por
// exclusividade da trilha desempata: trilha que está em sete roadmaps quase não
// informa, trilha exclusiva decide.
//
// Empate NÃO vira palpite: o aluno fica de fora e será resolvido no runtime assim
// que tocar uma trilha que diferencie. Medido na base de produção em 2026-08-07,
// decide 112 dos 489 alunos com progresso; o resto só tocou trilha compartilhada
// e genuinamente ainda não revelou caminho nenhum.
//
// Idempotente: quem já tem linha não é tocado. Só INSERE, nunca apaga nem altera
// linha existente, então o pior caso é uma associação errada que o aluno corrige
// sozinho ao seguir outro roadmap.
//
// ANTES DE RODAR EM PROD: tire um dump na hora. A rotina diária roda às 6h UTC e
// guarda em /opt/ensinadev/backups na PRÓPRIA máquina do banco, então ela cobre
// erro de operação e não cobre perda da VPS.
//
//   docker compose -f docker-compose.prod.yml exec -T db pg_dump -U <user> -Fc <db> > antes-backfill.dump
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/backfill-roadmap-seguido.ts
import { db } from "../db.ts";
import {
    roadmaps,
    roadmapStages,
    roadmapStageRefs,
    lessons,
    lessonProgress,
    userRoadmaps,
} from "../schema.ts";
import { eq, and } from "drizzle-orm";

async function backfill() {
    const publicados = await db.select().from(roadmaps).where(eq(roadmaps.published, true));
    const etapas = await db.select().from(roadmapStages);
    const refs = await db
        .select()
        .from(roadmapStageRefs)
        .where(eq(roadmapStageRefs.refType, "trail"));

    // trilha -> em quantos roadmaps publicados ela aparece (o peso)
    const roadmapDaEtapa = new Map(etapas.map((e) => [e.id, e.roadmapId]));
    const publicadosIds = new Set(publicados.map((r) => r.id));
    const roadmapsDaTrilha = new Map<string, Set<string>>();
    for (const r of refs) {
        const rid = roadmapDaEtapa.get(r.stageId);
        if (!rid || !publicadosIds.has(rid)) continue;
        const s = roadmapsDaTrilha.get(r.refId) ?? new Set<string>();
        s.add(rid);
        roadmapsDaTrilha.set(r.refId, s);
    }

    // trilha -> aulas publicadas dela (para saber se o aluno concluiu a trilha)
    const aulas = await db
        .select({ id: lessons.id, trailId: lessons.trailId })
        .from(lessons)
        .where(eq(lessons.published, true));
    const aulasDaTrilha = new Map<string, string[]>();
    for (const a of aulas) {
        const arr = aulasDaTrilha.get(a.trailId) ?? [];
        arr.push(a.id);
        aulasDaTrilha.set(a.trailId, arr);
    }

    // etapas por roadmap, em ordem, com as trilhas de cada uma
    const etapasDoRoadmap = new Map<string, { position: number; trilhas: string[] }[]>();
    for (const e of etapas) {
        if (!publicadosIds.has(e.roadmapId)) continue;
        const lista = etapasDoRoadmap.get(e.roadmapId) ?? [];
        lista.push({
            position: e.position,
            trilhas: refs.filter((r) => r.stageId === e.id).map((r) => r.refId),
        });
        etapasDoRoadmap.set(e.roadmapId, lista);
    }
    for (const lista of etapasDoRoadmap.values()) lista.sort((a, b) => a.position - b.position);

    const progresso = await db
        .select({ userId: lessonProgress.userId, lessonId: lessonProgress.lessonId })
        .from(lessonProgress);
    const aulasDoAluno = new Map<string, Set<string>>();
    for (const p of progresso) {
        const s = aulasDoAluno.get(p.userId) ?? new Set<string>();
        s.add(p.lessonId);
        aulasDoAluno.set(p.userId, s);
    }

    const jaTem = new Set((await db.select().from(userRoadmaps)).map((u) => u.userId));

    let decididos = 0;
    let empatados = 0;
    let pulados = 0;
    for (const [userId, feitas] of aulasDoAluno) {
        if (jaTem.has(userId)) {
            pulados++;
            continue;
        }
        // Trilha TOCADA, não concluída: quem está na décima aula de Python já
        // revelou o caminho. A primeira versão exigia a trilha inteira e por isso
        // decidiu 16 alunos onde a medição prometia 112.
        const tocou = (trailId: string) =>
            (aulasDaTrilha.get(trailId) ?? []).some((id) => feitas.has(id));

        const pontuados = publicados
            .map((r) => {
                const lista = etapasDoRoadmap.get(r.id) ?? [];
                if (!lista.length) return null;
                let prefixo = 0;
                for (const e of lista) {
                    if (!e.trilhas.some(tocou)) break;
                    prefixo++;
                }
                let pontos = 0;
                for (const e of lista)
                    for (const t of e.trilhas)
                        if (tocou(t)) pontos += 1 / (roadmapsDaTrilha.get(t)?.size ?? 1);
                return { roadmapId: r.id, slug: r.slug, prefixo, pontos };
            })
            .filter((x): x is NonNullable<typeof x> => x !== null && x.pontos > 0);

        if (!pontuados.length) continue;
        const melhor = pontuados.reduce((a, b) =>
            b.prefixo !== a.prefixo ? (b.prefixo > a.prefixo ? b : a) : b.pontos > a.pontos ? b : a,
        );
        const empate = pontuados.filter(
            (p) => p.prefixo === melhor.prefixo && Math.abs(p.pontos - melhor.pontos) < 1e-9,
        );
        if (empate.length > 1) {
            empatados++;
            continue;
        }

        await db
            .insert(userRoadmaps)
            .values({ userId, roadmapId: melhor.roadmapId, explicito: false });
        decididos++;
    }

    console.log(
        `Backfill concluido: ${decididos} aluno(s) associados, ${empatados} sem sinal suficiente (ficam para o runtime), ${pulados} ja tinham registro.`,
    );
}

backfill()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no backfill:", e);
        process.exit(1);
    });
