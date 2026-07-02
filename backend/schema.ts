import {
    pgTable,
    uuid,
    varchar,
    date,
    timestamp,
    pgEnum,
    integer,
    text,
    unique,
    boolean,
    jsonb,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["user", "admin", "moderator"]);
export const trailLevel = pgEnum("trail_level", ["iniciante", "intermediario", "avancado"]);
export const questionDifficulty = pgEnum("question_difficulty", ["facil", "medio", "dificil"]);
export const challengeLanguage = pgEnum("challenge_language", ["javascript", "python", "csharp"]);
// stdin: aluno lê stdin e imprime stdout. function: aluno implementa uma função
// (class Solution.entry) chamada com os argumentos do teste; compara-se o retorno.
export const challengeKind = pgEnum("challenge_kind", ["stdin", "function"]);
export const challengeSubmissionStatus = pgEnum("challenge_submission_status", [
    "queued",
    "running",
    "passed",
    "failed",
    "error",
    "timeout",
]);

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    username: varchar("username", { length: 20 }).unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    // Opcionais: quem entra por login social (Google/GitHub) não informa esses campos.
    passwordHash: varchar("password_hash", { length: 255 }),
    birthDate: date("birth_date"),
    gender: varchar("gender", { length: 50 }),
    phone: varchar("phone", { length: 20 }),
    bio: text("bio"),
    location: varchar("location", { length: 120 }),
    occupation: varchar("occupation", { length: 120 }),
    languages: jsonb("languages").$type<string[]>(),
    github: varchar("github", { length: 200 }),
    linkedin: varchar("linkedin", { length: 200 }),
    avatarUrl: varchar("avatar_url", { length: 300 }),
    coverUrl: varchar("cover_url", { length: 300 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    role: userRole("role").default("user").notNull(),
    failedLoginAttempts: integer("failed_login_attempts").default(0).notNull(),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
});

// Identidades de login social vinculadas a um usuário. Um usuário pode ter mais de
// uma (ex.: Google e GitHub) e o par (provider, providerId) é único.
export const oauthAccounts = pgTable(
    "oauth_accounts",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: uuid("user_id")
            .references(() => users.id)
            .notNull(),
        provider: varchar("provider", { length: 20 }).notNull(),
        providerId: varchar("provider_id", { length: 255 }).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [unique().on(table.provider, table.providerId)],
);

export const tokens = pgTable("tokens", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .references(() => users.id)
        .notNull(),
    tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
    type: varchar("type", { length: 50 }).notNull().default("refresh"),
    usedAt: timestamp("used_at", { withTimezone: true }),
    expiredAt: timestamp("expired_at", { withTimezone: true }).notNull(),
});

export const trails = pgTable("trails", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    trailLevel: trailLevel("level").notNull(),
    description: text("description").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const modules = pgTable("modules", {
    id: uuid("id").primaryKey().defaultRandom(),
    trailId: uuid("trail_id")
        .references(() => trails.id)
        .notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const lessons = pgTable("lessons", {
    id: uuid("id").primaryKey().defaultRandom(),
    trailId: uuid("trail_id")
        .references(() => trails.id)
        .notNull(),
    moduleId: uuid("module_id")
        .references(() => modules.id)
        .notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content"),
    contentBlocks: jsonb("content_blocks").$type<{ type: string; value: string }[]>(),
    position: integer("position").notNull(),
    published: boolean("published").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const lessonProgress = pgTable(
    "lessons_progress",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: uuid("user_id")
            .references(() => users.id)
            .notNull(),
        lessonId: uuid("lesson_id")
            .references(() => lessons.id)
            .notNull(),
        completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [unique().on(table.userId, table.lessonId)],
);

export const questions = pgTable("questions", {
    id: uuid("id").primaryKey().defaultRandom(),
    lessonId: uuid("lesson_id")
        .references(() => lessons.id)
        .notNull(),
    statement: text("statement").notNull(),
    difficulty: questionDifficulty("difficulty").default("facil").notNull(),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const questionOptions = pgTable("question_options", {
    id: uuid("id").primaryKey().defaultRandom(),
    questionId: uuid("question_id")
        .references(() => questions.id)
        .notNull(),
    text: text("text").notNull(),
    isCorrect: boolean("is_correct").default(false).notNull(),
    position: integer("position").notNull(),
});

export const questionAnswers = pgTable(
    "question_answers",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: uuid("user_id")
            .references(() => users.id)
            .notNull(),
        questionId: uuid("question_id")
            .references(() => questions.id)
            .notNull(),
        selectedOptionId: uuid("selected_option_id")
            .references(() => questionOptions.id)
            .notNull(),
        isCorrect: boolean("is_correct").notNull(),
        answeredAt: timestamp("answered_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [unique().on(table.userId, table.questionId)],
);

export const tags = pgTable("tags", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 60 }).notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Conjunto canonico de linguagens do perfil (gerenciado pelo admin em Configuracoes).
export const languages = pgTable("languages", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 60 }).notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Conquistas: catalogo gerenciado pelo admin. Desbloqueiam sozinhas quando o
// aluno atinge o limite (threshold) do criterio escolhido.
export const achievementCriteria = pgEnum("achievement_criteria", [
    "xp_total",
    "lessons_completed",
    "questions_correct",
]);

export const achievements = pgTable("achievements", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 80 }).notNull().unique(),
    description: varchar("description", { length: 200 }).notNull(),
    icon: varchar("icon", { length: 30 }).notNull(),
    criteriaType: achievementCriteria("criteria_type").notNull(),
    threshold: integer("threshold").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Conquistas ja desbloqueadas por cada usuario (guarda quando foi pra montar o feed).
export const userAchievements = pgTable(
    "user_achievements",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: uuid("user_id")
            .references(() => users.id)
            .notNull(),
        achievementId: uuid("achievement_id")
            .references(() => achievements.id)
            .notNull(),
        earnedAt: timestamp("earned_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [unique().on(table.userId, table.achievementId)],
);

// Snapshot diário das posições do ranking (XP total), para calcular a movimentação.
export const rankingSnapshots = pgTable(
    "ranking_snapshots",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: uuid("user_id")
            .references(() => users.id)
            .notNull(),
        position: integer("position").notNull(),
        snapshotDate: date("snapshot_date").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [unique().on(table.userId, table.snapshotDate)],
);

export const trailTags = pgTable(
    "trail_tags",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        trailId: uuid("trail_id")
            .references(() => trails.id)
            .notNull(),
        tagId: uuid("tag_id")
            .references(() => tags.id)
            .notNull(),
    },
    (table) => [unique().on(table.trailId, table.tagId)],
);

// Prova cronometrada com banco de questões próprio, separado das aulas.
export const simulados = pgTable("simulados", {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 80 }).notNull().unique(),
    name: varchar("name", { length: 160 }).notNull(),
    description: text("description"),
    durationMinutes: integer("duration_minutes").notNull(),
    questionCount: integer("question_count").notNull(),
    passPercent: integer("pass_percent").notNull(),
    published: boolean("published").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const simuladoQuestions = pgTable("simulado_questions", {
    id: uuid("id").primaryKey().defaultRandom(),
    simuladoId: uuid("simulado_id")
        .references(() => simulados.id)
        .notNull(),
    statement: text("statement").notNull(),
    explanation: text("explanation"),
    topic: varchar("topic", { length: 60 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const simuladoOptions = pgTable("simulado_options", {
    id: uuid("id").primaryKey().defaultRandom(),
    questionId: uuid("question_id")
        .references(() => simuladoQuestions.id)
        .notNull(),
    text: text("text").notNull(),
    isCorrect: boolean("is_correct").default(false).notNull(),
    position: integer("position").notNull(),
});

// Uma execução do simulado por um usuário (sessão cronometrada).
export const simuladoAttempts = pgTable("simulado_attempts", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .references(() => users.id)
        .notNull(),
    simuladoId: uuid("simulado_id")
        .references(() => simulados.id)
        .notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    score: integer("score"),
    passed: boolean("passed"),
});

// Snapshot das questões sorteadas para a tentativa (ordem fixa, sobrevive a
// mudanças no banco de questões).
export const simuladoAttemptQuestions = pgTable(
    "simulado_attempt_questions",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        attemptId: uuid("attempt_id")
            .references(() => simuladoAttempts.id)
            .notNull(),
        questionId: uuid("question_id")
            .references(() => simuladoQuestions.id)
            .notNull(),
        position: integer("position").notNull(),
    },
    (table) => [unique().on(table.attemptId, table.questionId)],
);

// Opções marcadas pelo usuário (uma linha por opção: é o que permite multi-seleção).
export const simuladoAttemptAnswers = pgTable(
    "simulado_attempt_answers",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        attemptId: uuid("attempt_id")
            .references(() => simuladoAttempts.id)
            .notNull(),
        questionId: uuid("question_id")
            .references(() => simuladoQuestions.id)
            .notNull(),
        optionId: uuid("option_id")
            .references(() => simuladoOptions.id)
            .notNull(),
    },
    (table) => [unique().on(table.attemptId, table.questionId, table.optionId)],
);

// Desafios de código. O enunciado usa os mesmos blocos das aulas; activeDate marca
// o dia em que ele é "o desafio do dia" (única data com XP).
export const challenges = pgTable("challenges", {
    id: uuid("id").primaryKey().defaultRandom(),
    // Número de exibição (estilo LeetCode "142."). Atribuído no cadastro.
    number: integer("number").unique(),
    title: varchar("title", { length: 255 }).notNull(),
    // Tema(s) em uma string com separador " · " (ex.: "Array · Hash Table").
    topic: varchar("topic", { length: 160 }),
    kind: challengeKind("kind").default("stdin").notNull(),
    // Nome do método a chamar quando kind = function (ex.: "twoSum").
    entryPoint: varchar("entry_point", { length: 120 }),
    statementBlocks: jsonb("statement_blocks").$type<{ type: string; value: string }[]>(),
    difficulty: questionDifficulty("difficulty").default("facil").notNull(),
    // Código inicial por linguagem (javascript/python/csharp), já com a leitura do stdin.
    starterCode: jsonb("starter_code").$type<Record<string, string>>(),
    activeDate: date("active_date").unique(),
    published: boolean("published").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Casos de teste: os públicos aparecem no enunciado; os ocultos só contam na correção.
export const challengeTests = pgTable("challenge_tests", {
    id: uuid("id").primaryKey().defaultRandom(),
    challengeId: uuid("challenge_id")
        .references(() => challenges.id)
        .notNull(),
    input: text("input").notNull(),
    expectedOutput: text("expected_output").notNull(),
    isPublic: boolean("is_public").default(false).notNull(),
    position: integer("position").notNull(),
});

export const challengeSubmissions = pgTable("challenge_submissions", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .references(() => users.id)
        .notNull(),
    challengeId: uuid("challenge_id")
        .references(() => challenges.id)
        .notNull(),
    language: challengeLanguage("language").notNull(),
    code: text("code").notNull(),
    status: challengeSubmissionStatus("status").default("queued").notNull(),
    passedCount: integer("passed_count").default(0).notNull(),
    totalCount: integer("total_count").default(0).notNull(),
    // Saída de erro visível ao aluno (compilação ou caso público); nunca a de caso oculto.
    output: text("output"),
    // XP concedido nesta submissão (0 quando não gera XP; > 0 só na 1ª aprovação do desafio).
    xpEarned: integer("xp_earned").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
