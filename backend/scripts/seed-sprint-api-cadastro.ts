// Seed of the sprint game's first sprint: "API de cadastro" (Rust, v2 flavor).
// Idempotent: the sprint is matched by slug, tasks by (sprint, position).
//
// Run in prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-sprint-api-cadastro.ts
import { db } from "../db.ts";
import { sprints, sprintTasks } from "../schema.ts";
import { eq, and } from "drizzle-orm";

const SLUG = "api-de-cadastro";
const END_MS = (2 * 24 + 14) * 3_600_000 + 32 * 60_000;

const TASKS = [
    {
        position: 1,
        trackName: "Cadastro",
        title: "Implementar endpoint de cadastro",
        description: "Receber os dados, validar o que chega e devolver a resposta certa pra cada caso.",
        points: 5,
        criteria: [
            "Corpo válido: cria o usuário e responde 201 com o id.",
            "Campo faltando: responde 422 sem criar nada.",
            "E-mail malformado: responde 422.",
            "Senha curta demais: responde 422.",
            "Nada é gravado quando a validação falha.",
        ],
        tests: [
            { name: "corpo_valido_cria_usuario", ms: 9 },
            { name: "campo_faltando_devolve_422", ms: 7 },
            { name: "email_malformado_devolve_422", ms: 11 },
            { name: "senha_curta_devolve_422", ms: 6 },
            { name: "validacao_falha_nao_grava", ms: 23 },
        ],
        starterCode: `// Você comeca do zero: o time precisa de um endpoint de cadastro.
pub async fn cadastrar(
    State(db): State<Db>,
    Json(dados): Json<NovoUsuario>,
) -> Result<(StatusCode, Json<Criado>), ApiErro> {
    // TODO: validar os dados antes de gravar
    let id = db.salvar(&dados).await?;

    Ok((StatusCode::CREATED, Json(Criado { id })))
}`,
    },
    {
        position: 2,
        trackName: "Banco",
        title: "Guardar o usuário no banco",
        description: "Salvar quem passou na validação e devolver o id criado.",
        points: 3,
        criteria: [
            "Usuário válido é gravado uma única vez.",
            "A resposta carrega o id que o banco gerou.",
            "Id duplicado nunca é devolvido.",
            "Erro do banco vira 500, não panic.",
            "O que a task 1 validava segue passando.",
        ],
        tests: [
            { name: "usuario_valido_gravado_uma_vez", ms: 8 },
            { name: "resposta_carrega_id_do_banco", ms: 12 },
            { name: "id_duplicado_nunca_devolvido", ms: 7 },
            { name: "erro_do_banco_vira_500", ms: 15 },
            { name: "task_1_segue_passando", ms: 21 },
        ],
        starterCode: `// Você continua do ponto em que a task 1 parou.
pub async fn cadastrar(
    State(db): State<Db>,
    Json(dados): Json<NovoUsuario>,
) -> Result<(StatusCode, Json<Criado>), ApiErro> {
    dados.validar()?; // regras da task 1

    let id = db.salvar(&dados).await?; // TODO: garantir id unico

    Ok((StatusCode::CREATED, Json(Criado { id })))
}`,
    },
    {
        position: 3,
        trackName: "E-mail",
        title: "Barrar e-mail repetido",
        description: "Se o e-mail já existe, responder 409 em vez de criar de novo.",
        points: 3,
        criteria: [
            "E-mail novo: cria o usuário e responde 201.",
            "E-mail que já existe: responde 409 e não cria de novo.",
            "Maiúsculas não enganam: ANA@x.com e ana@x.com são o mesmo e-mail.",
            "Deu 409? Nada é gravado no banco.",
            "O que as tasks 1 e 2 já faziam continua passando.",
        ],
        tests: [
            { name: "email_novo_cria_usuario", ms: 9 },
            { name: "email_repetido_devolve_409", ms: 7 },
            { name: "maiusculas_nao_enganam", ms: 11 },
            { name: "conflito_nao_grava_nada", ms: 6 },
            { name: "tasks_1_e_2_seguem_ok", ms: 23 },
        ],
        starterCode: `// Você continua do ponto em que a task 2 parou.
pub async fn cadastrar(
    State(db): State<Db>,
    Json(dados): Json<NovoUsuario>,
) -> Result<(StatusCode, Json<Criado>), ApiErro> {
    dados.validar()?; // regras da task 1

    if db.existe_email(&dados.email).await? {
        return Err(ApiErro::Conflito("e-mail já cadastrado"));
    }

    let id = db.salvar(&dados).await?; // banco da task 2
    Ok((StatusCode::CREATED, Json(Criado { id })))
}`,
    },
    {
        position: 4,
        trackName: "Hash",
        title: "Proteger a senha com hash",
        description: "Guardar a senha protegida com salt, nunca em texto puro.",
        points: 5,
        criteria: [
            "A senha nunca é gravada em texto puro.",
            "Cada usuário ganha um salt próprio.",
            "Verificar a senha funciona com o hash gravado.",
            "Duas contas com a mesma senha têm hashes diferentes.",
            "O cadastro todo segue passando.",
        ],
        tests: [
            { name: "senha_nao_gravada_em_texto", ms: 10 },
            { name: "salt_proprio_por_usuario", ms: 8 },
            { name: "verificar_senha_funciona", ms: 14 },
            { name: "mesma_senha_hashes_diferentes", ms: 9 },
            { name: "cadastro_segue_passando", ms: 25 },
        ],
        starterCode: `// Você continua do ponto em que a task 3 parou.
pub async fn cadastrar(
    State(db): State<Db>,
    Json(dados): Json<NovoUsuario>,
) -> Result<(StatusCode, Json<Criado>), ApiErro> {
    dados.validar()?; // regras da task 1

    let email = dados.email.trim().to_lowercase(); // correcao da task 3
    if db.existe_email(&email).await? {
        return Err(ApiErro::Conflito("e-mail já cadastrado"));
    }

    // TODO: hashear a senha com salt antes de gravar
    let id = db.salvar(&dados).await?;

    Ok((StatusCode::CREATED, Json(Criado { id })))
}`,
    },
    {
        position: 5,
        trackName: "Login",
        title: "Endpoint de login",
        description: "Autenticar quem já tem conta e devolver a sessão.",
        points: 5,
        criteria: [
            "Credenciais certas devolvem a sessão.",
            "Senha errada responde 401 sem vazar qual campo errou.",
            "Usuário inexistente responde igual a senha errada.",
            "A senha é verificada pelo hash da task 4.",
            "O cadastro segue passando.",
        ],
        tests: [
            { name: "credenciais_certas_devolvem_sessao", ms: 11 },
            { name: "senha_errada_devolve_401", ms: 8 },
            { name: "usuario_inexistente_igual_senha_errada", ms: 7 },
            { name: "verificacao_usa_hash_da_task_4", ms: 16 },
            { name: "cadastro_segue_passando", ms: 24 },
        ],
        starterCode: `// Ultima task da sprint: quem cadastrou precisa conseguir entrar.
pub async fn login(
    State(db): State<Db>,
    Json(credenciais): Json<Credenciais>,
) -> Result<(StatusCode, Json<Sessao>), ApiErro> {
    // TODO: buscar o usuario e verificar a senha pelo hash
    let sessao = Sessao::nova(credenciais.email)?;

    Ok((StatusCode::OK, Json(sessao)))
}`,
    },
];

async function seed() {
    const [existing] = await db.select().from(sprints).where(eq(sprints.slug, SLUG));
    const endsAt = new Date(Date.now() + END_MS);
    let sprintId: string;
    if (!existing) {
        const [created] = await db
            .insert(sprints)
            .values({
                slug: SLUG,
                product: "API de cadastro",
                summary: "Um produto que cresce task por task: o que você entrega vira a base da próxima.",
                endsAt,
                position: 1,
                published: true,
            })
            .returning();
        sprintId = created.id;
        console.log(`Sprint criada: ${created.product}`);
    } else {
        sprintId = existing.id;
        await db
            .update(sprints)
            .set({
                product: "API de cadastro",
                summary: "Um produto que cresce task por task: o que você entrega vira a base da próxima.",
                endsAt,
                published: true,
            })
            .where(eq(sprints.id, sprintId));
        console.log("Sprint atualizada.");
    }

    for (const task of TASKS) {
        const [row] = await db
            .select()
            .from(sprintTasks)
            .where(and(eq(sprintTasks.sprintId, sprintId), eq(sprintTasks.position, task.position)));
        if (!row) {
            await db.insert(sprintTasks).values({ sprintId, tag: "RUST · V2", ...task });
        } else {
            await db
                .update(sprintTasks)
                .set({ ...task, tag: "RUST · V2" })
                .where(eq(sprintTasks.id, row.id));
        }
    }
    console.log(`Seed concluído: ${TASKS.length} tasks.`);
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed da sprint:", e);
        process.exit(1);
    });
