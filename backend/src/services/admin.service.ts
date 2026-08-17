import { db } from "../../db.ts";
import { sql, type SQL } from "drizzle-orm";
import { calcularXp, XP_POR_AULA, XP_POR_QUESTAO } from "../domain/xp.ts";

// Linha de atividade unificada (aula, simulado, desafio, conquista). Serve para
// derivar "última atividade" e "usuários ativos" sem uma coluna de last-seen.
const ATIVIDADE = sql`
    select user_id, completed_at ts from lessons_progress
    union all select user_id, submitted_at from simulado_attempts
    union all select user_id, created_at from challenge_submissions
    union all select user_id, earned_at from user_achievements
`;

export async function visaoGeral() {
    const usuarios = (
        await db.execute(sql`
            select
                count(*)::int total,
                count(*) filter (where username is not null and username <> '')::int perfil_completo,
                count(*) filter (where password_hash is null)::int social,
                count(*) filter (where created_at >= now() - interval '7 days')::int novos_7d,
                count(*) filter (where created_at >= now() - interval '30 days')::int novos_30d
            from users
        `)
    ).rows[0] as Record<string, number>;

    const ativos = (
        await db.execute(sql`
            select
                count(distinct user_id) filter (where ts >= now() - interval '7 days')::int ativos_7d,
                count(distinct user_id) filter (where ts >= now() - interval '30 days')::int ativos_30d
            from (${ATIVIDADE}) z
        `)
    ).rows[0] as Record<string, number>;

    const conteudo = (
        await db.execute(sql`
            select
                (select count(*) from lessons_progress)::int aulas_concluidas,
                (select count(*) from simulado_attempts)::int simulados_feitos,
                (select count(*) from challenge_submissions where xp_earned > 0)::int desafios_resolvidos,
                (select count(*) from trails)::int trilhas,
                (select count(*) from lessons)::int aulas_total
        `)
    ).rows[0] as Record<string, number>;

    const cadastros = (
        await db.execute(sql`
            select created_at::date dia, count(*)::int n
            from users
            group by dia
            order by dia
        `)
    ).rows as { dia: string; n: number }[];

    // Alunos distintos com aula concluída em cada trilha (o gráfico decide o corte).
    const porTrilha = (
        await db.execute(sql`
            select t.name nome, count(distinct lp.user_id)::int n
            from lessons_progress lp
            join lessons l on l.id = lp.lesson_id
            join trails t on t.id = l.trail_id
            group by t.name
            order by n desc, t.name
        `)
    ).rows as { nome: string; n: number }[];

    // Funil de onboarding por coorte de ano de cadastro: onde cada safra de
    // usuários para no caminho registro -> prática. O "todos" é somado no cliente.
    const funilPorAno = (
        await db.execute(sql`
            select
                to_char(u.created_at, 'YYYY') ano,
                count(*)::int registrados,
                count(*) filter (where username is not null and username <> '')::int com_username,
                count(*) filter (where exists (
                    select 1 from lessons_progress lp where lp.user_id = u.id
                ))::int concluiu_aula,
                count(*) filter (where exists (
                    select 1 from challenge_submissions cs where cs.user_id = u.id and cs.xp_earned > 0
                ) or exists (
                    select 1 from simulado_attempts sa where sa.user_id = u.id
                ))::int praticou
            from users u
            group by ano
            order by ano
        `)
    ).rows as Record<string, any>[];

    return {
        usuarios: usuarios.total,
        perfilCompleto: usuarios.perfil_completo,
        social: usuarios.social,
        novos7d: usuarios.novos_7d,
        novos30d: usuarios.novos_30d,
        ativos7d: ativos.ativos_7d,
        ativos30d: ativos.ativos_30d,
        aulasConcluidas: conteudo.aulas_concluidas,
        simuladosFeitos: conteudo.simulados_feitos,
        desafiosResolvidos: conteudo.desafios_resolvidos,
        trilhas: conteudo.trilhas,
        aulasTotal: conteudo.aulas_total,
        cadastrosPorDia: cadastros,
        usuariosPorTrilha: porTrilha,
        funilPorAno: funilPorAno.map((f) => ({
            ano: f.ano as string,
            registrados: f.registrados as number,
            comUsername: f.com_username as number,
            concluiuAula: f.concluiu_aula as number,
            praticou: f.praticou as number,
        })),
    };
}

// Métricas por usuário para o CRM, agregadas em uma query só (sem N+1).
// A busca por nome/username/email é feita no servidor.
// Colunas ordenáveis do CRM (whitelist: o nome vem da query string). O XP é
// derivado, então a ordenação reproduz a fórmula do domínio em SQL.
const ORDENACOES: Record<string, SQL> = {
    name: sql`u.name`,
    criadoEm: sql`u.created_at`,
    aulas: sql`coalesce(ap.n, 0)`,
    trilhas: sql`coalesce(ta.n, 0)`,
    simulados: sql`coalesce(sa.n, 0)`,
    desafios: sql`coalesce(ds.n, 0)`,
    conquistas: sql`coalesce(cq.n, 0)`,
    xp: sql`(coalesce(ap.n, 0) * ${XP_POR_AULA} + coalesce(ac.n, 0) * ${XP_POR_QUESTAO} + coalesce(ds.xp, 0))`,
    ultimaAtividade: sql`la.ultima`,
};

export async function usuariosCrm(
    busca?: string,
    pagina = 1,
    porPagina = 20,
    ordenarPor = "criadoEm",
    direcao: "asc" | "desc" = "desc",
) {
    const termo = busca?.trim();
    const filtro = termo
        ? sql`where u.name ilike ${`%${termo}%`} or u.username ilike ${`%${termo}%`} or u.email ilike ${`%${termo}%`}`
        : sql``;

    const [{ total }] = (
        await db.execute(sql`select count(*)::int total from users u ${filtro}`)
    ).rows as { total: number }[];

    const ordem = ORDENACOES[ordenarPor] ?? ORDENACOES.criadoEm;
    const sentido = direcao === "asc" ? sql`asc nulls first` : sql`desc nulls last`;
    const offset = (Math.max(1, pagina) - 1) * porPagina;

    const { rows } = await db.execute(sql`
        select
            u.id, u.name, u.username, u.email, u.created_at,
            (u.password_hash is null) as social,
            oa.provider,
            coalesce(ap.n, 0)::int aulas,
            coalesce(ac.n, 0)::int questoes,
            coalesce(ds.n, 0)::int desafios,
            coalesce(ds.xp, 0)::int desafios_xp,
            coalesce(sa.n, 0)::int simulados,
            coalesce(cq.n, 0)::int conquistas,
            coalesce(ta.n, 0)::int trilhas,
            la.ultima as ultima_atividade
        from users u
        left join (select user_id, count(*) n from lessons_progress group by user_id) ap on ap.user_id = u.id
        left join (select user_id, count(*) n from question_answers where acertou_em is not null group by user_id) ac on ac.user_id = u.id
        left join (
            select user_id, count(*) n, sum(xp_earned) xp
            from challenge_submissions where xp_earned > 0 group by user_id
        ) ds on ds.user_id = u.id
        left join (select user_id, count(*) n from simulado_attempts group by user_id) sa on sa.user_id = u.id
        left join (select user_id, count(*) n from user_achievements group by user_id) cq on cq.user_id = u.id
        left join (
            select f.user_id, count(*) n
            from (
                select lp.user_id, l.trail_id, count(distinct lp.lesson_id) f
                from lessons_progress lp
                join lessons l on l.id = lp.lesson_id
                group by lp.user_id, l.trail_id
            ) f
            join (select trail_id, count(*) t from lessons group by trail_id) tot on tot.trail_id = f.trail_id
            where f.f >= tot.t
            group by f.user_id
        ) ta on ta.user_id = u.id
        left join (
            select user_id, max(ts) ultima from (${ATIVIDADE}) z group by user_id
        ) la on la.user_id = u.id
        left join (
            select user_id, min(provider) provider from oauth_accounts group by user_id
        ) oa on oa.user_id = u.id
        ${filtro}
        order by ${ordem} ${sentido}, u.created_at desc
        limit ${porPagina} offset ${offset}
    `);

    const usuarios = (rows as Record<string, any>[]).map((r) => ({
        id: r.id as string,
        name: r.name as string,
        username: (r.username as string | null) ?? null,
        email: r.email as string,
        origem: r.social ? "social" : "email",
        provider: (r.provider as string | null) ?? null,
        criadoEm: r.created_at as string,
        ultimaAtividade: (r.ultima_atividade as string | null) ?? null,
        aulas: r.aulas as number,
        trilhas: r.trilhas as number,
        simulados: r.simulados as number,
        desafios: r.desafios as number,
        conquistas: r.conquistas as number,
        questoesCertas: r.questoes as number,
        xp: calcularXp({ aulas: r.aulas, questoes: r.questoes, desafiosXp: r.desafios_xp }),
    }));

    return { rows: usuarios, total };
}
