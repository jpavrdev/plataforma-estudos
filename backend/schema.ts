import { pgTable, uuid, varchar, date, timestamp, pgEnum, integer, text, unique, boolean } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["user", "admin", "moderator"]);
export const trailLevel = pgEnum("trail_level", ["iniciante", "intermediario", "avancado"]);

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    birthDate: date("birth_date").notNull(),
    gender: varchar("gender", { length: 50 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true}),
    role: userRole("role").default('user').notNull(),
    failedLoginAttempts: integer("failed_login_attempts").default(0).notNull(),
    lockedUntil: timestamp("locked_until", { withTimezone: true}),
});

export const tokens = pgTable("tokens", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    tokenHash: varchar("token_hash", { length: 64}).notNull().unique(),
    type: varchar("type", { length: 50}).notNull().default("refresh"),
    usedAt: timestamp("used_at", { withTimezone: true}),
    expiredAt: timestamp("expired_at", { withTimezone: true}).notNull()
});

export const trails = pgTable("trails", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    trailLevel: trailLevel("level").notNull(),
    description: text("description").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const modules = pgTable("modules", {
    id: uuid("id").primaryKey().defaultRandom(),
    trailId: uuid("trail_id").references(() => trails.id).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const lessons = pgTable("lessons", {
    id: uuid("id").primaryKey().defaultRandom(),
    trailId: uuid("trail_id").references(() => trails.id).notNull(),
    moduleId: uuid("module_id").references(() => modules.id).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content"),
    position: integer("position").notNull(),
    published: boolean("published").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const lessonProgress = pgTable("lessons_progress", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    lessonId: uuid("lesson_id").references(() => lessons.id).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [
    unique().on(table.userId, table.lessonId),
]);

export const questions = pgTable("questions", {
    id: uuid("id").primaryKey().defaultRandom(),
    lessonId: uuid("lesson_id").references(() => lessons.id).notNull(),
    statement: text("statement").notNull(),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const questionOptions = pgTable("question_options", {
    id: uuid("id").primaryKey().defaultRandom(),
    questionId: uuid("question_id").references(() => questions.id).notNull(),
    text: text("text").notNull(),
    isCorrect: boolean("is_correct").default(false).notNull(),
    position: integer("position").notNull()
});

export const questionAnswers = pgTable("question_answers", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    questionId: uuid("question_id").references(() => questions.id).notNull(),
    selectedOptionId: uuid("selected_option_id").references(() => questionOptions.id).notNull(),
    isCorrect: boolean("is_correct").notNull(),
    answeredAt: timestamp("answered_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [
    unique().on(table.userId, table.questionId),
]);