import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  points: integer("points").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'pushup', 'squat', etc.
  targetReps: integer("target_reps").notNull(),
  betAmount: decimal("bet_amount").notNull(),
  status: text("status").default("active").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const participations = pgTable("participations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  challengeId: integer("challenge_id").references(() => challenges.id).notNull(),
  currentReps: integer("current_reps").default(0).notNull(),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull()
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  challengeId: integer("challenge_id").references(() => challenges.id).notNull(),
  amount: decimal("amount").notNull(),
  type: text("type").notNull(), // 'bet', 'reward'
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const usersRelations = relations(users, ({ many }) => ({
  challenges: many(challenges),
  participations: many(participations),
  achievements: many(achievements),
  transactions: many(transactions)
}));

export const challengesRelations = relations(challenges, ({ one, many }) => ({
  creator: one(users, {
    fields: [challenges.creatorId],
    references: [users.id]
  }),
  participations: many(participations),
  transactions: many(transactions)
}));

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
export type Participation = typeof participations.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
