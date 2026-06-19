import { pgTable, uuid, varchar, date, timestamp } from "drizzle-orm/pg-core";

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
});

export const tokens = pgTable("tokens", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    tokenHash: varchar("token_hash", { length: 64}).notNull().unique(),
    type: varchar("type", { length: 50}).notNull().default("refresh"),
    usedAt: timestamp("used_at", { withTimezone: true}),
    expiredAt: timestamp("expired_at", { withTimezone: true}).notNull()
});