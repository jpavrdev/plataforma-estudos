// Troca a trilha do estágio de SQL nos dois roadmaps de dados: de "Banco de Dados
// e SQL" para "SQL para Dados".
//
// Por que existe: a trilha antiga foi escrita para o encaixe do Back-end, onde ela
// vem logo depois de APIs e Frameworks, e os módulos 6 e 7 dela são driver do Node,
// query na API, connection pool e Prisma. Em Engenharia de Dados ela é o estágio 3,
// logo após Python, sem API antes nem depois; e não cobre CTE, função de janela nem
// plano de execução, que são o dia a dia de quem trabalha com dados.
//
// Por que um script separado: os seeds dos dois roadmaps são idempotentes POR
// ESTÁGIO e pulam o estágio inteiro quando ele já existe, então nunca atualizam a
// referência de um estágio existente. Sem isto, a troca não chega em produção.
//
// O estágio VOLTA A ABERTO para quem já tinha concluído a trilha antiga, e isso é
// esperado e aceito: é uma trilha nova, com conteúdo que o aluno de fato não viu.
// O progresso dele na trilha antiga continua intacto no perfil e nas conquistas,
// só deixa de contar neste estágio.
//
// Idempotente: rodar de novo não muda nada. Se a trilha nova ainda não existir, o
// script avisa e não altera coisa alguma.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/trocar-sql-nos-roadmaps-de-dados.ts
import { db } from "../db.ts";
import { roadmaps, roadmapStages, roadmapStageRefs, trails } from "../schema.ts";
import { eq, and } from "drizzle-orm";

const TRILHA_NOVA = "SQL para Dados";
const ESTAGIO = "SQL e bancos de dados";
const ALVOS = ["engenharia-dados", "ciencia-dados"];

const DESCRICAO_NOVA =
    "SQL com profundidade de análise: junções que não estragam a soma, CTE, funções de janela, agregação em vários níveis, séries temporais e leitura de plano de execução.";
const TAGS_NOVAS = ["Janelas", "CTE", "Plano de execução"];

async function trocar() {
    const [nova] = await db.select().from(trails).where(eq(trails.name, TRILHA_NOVA));
    if (!nova) {
        console.log(
            `Trilha "${TRILHA_NOVA}" ainda não existe. Rode o seed dela antes. Nada feito.`,
        );
        return;
    }

    let trocados = 0;
    let jaCertos = 0;
    for (const slug of ALVOS) {
        const [rm] = await db.select().from(roadmaps).where(eq(roadmaps.slug, slug));
        if (!rm) {
            console.log(`  roadmap ${slug} não encontrado, pulando`);
            continue;
        }
        const [stage] = await db
            .select()
            .from(roadmapStages)
            .where(and(eq(roadmapStages.roadmapId, rm.id), eq(roadmapStages.title, ESTAGIO)));
        if (!stage) {
            console.log(`  ${slug}: estágio "${ESTAGIO}" não encontrado, pulando`);
            continue;
        }

        const refs = await db
            .select()
            .from(roadmapStageRefs)
            .where(eq(roadmapStageRefs.stageId, stage.id));
        if (refs.length === 1 && refs[0].refType === "trail" && refs[0].refId === nova.id) {
            jaCertos++;
            console.log(`  ${slug}: já aponta para ${TRILHA_NOVA}`);
            continue;
        }

        // Apaga o que estava e cria a ref nova. Trocar o refId no lugar daria no
        // mesmo, mas apagar e inserir mantém o script correto se um dia o estágio
        // tiver mais de uma referência.
        await db.delete(roadmapStageRefs).where(eq(roadmapStageRefs.stageId, stage.id));
        await db
            .insert(roadmapStageRefs)
            .values({ stageId: stage.id, refType: "trail", refId: nova.id, position: 1 });
        await db
            .update(roadmapStages)
            .set({ description: DESCRICAO_NOVA, tags: TAGS_NOVAS })
            .where(eq(roadmapStages.id, stage.id));
        trocados++;
        console.log(`  ${slug}: estágio "${ESTAGIO}" agora aponta para ${TRILHA_NOVA}`);
    }

    console.log(
        `Troca concluida: ${trocados} roadmap(s) alterado(s), ${jaCertos} ja estava(m) certo(s).`,
    );
}

trocar()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha na troca:", e);
        process.exit(1);
    });
