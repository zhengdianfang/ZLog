import { pgTable, serial, text, timestamp, integer, unique } from "drizzle-orm/pg-core";

export const logFiles = pgTable("log_files", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [unique("users_email_unique").on(table.email)]
);

export const keywordRules = pgTable("keyword_rules", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  description: text("description").notNull(),
  pattern: text("pattern").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
