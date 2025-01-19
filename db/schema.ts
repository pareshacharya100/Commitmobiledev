import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
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
  type: text("type").notNull(),
  targetReps: integer("target_reps").notNull(),
  betAmount: decimal("bet_amount").notNull(),
  status: text("status").default("active").notNull(),
  endDate: timestamp("end_date").notNull(),
  visibility: text("visibility").default("public").notNull(),
  teamSize: integer("team_size").default(1).notNull(),
  verificationMethod: text("verification_method").default("camera").notNull(),
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
  type: text("type").notNull(),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const wearableDevices = pgTable("wearable_devices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  deviceType: text("device_type").notNull(),
  deviceId: text("device_id").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  lastSyncedAt: timestamp("last_synced_at"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const wearableActivities = pgTable("wearable_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  deviceId: integer("device_id").references(() => wearableDevices.id).notNull(),
  activityType: text("activity_type").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  duration: integer("duration").notNull(),
  calories: integer("calories"),
  steps: integer("steps"),
  distance: decimal("distance"),
  heartRate: jsonb("heart_rate"),
  rawData: jsonb("raw_data"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const usersRelations = relations(users, ({ many }) => ({
  challenges: many(challenges),
  participations: many(participations),
  achievements: many(achievements),
  transactions: many(transactions),
  wearableDevices: many(wearableDevices),
  wearableActivities: many(wearableActivities)
}));

export const challengesRelations = relations(challenges, ({ one, many }) => ({
  creator: one(users, {
    fields: [challenges.creatorId],
    references: [users.id]
  }),
  participations: many(participations),
  transactions: many(transactions)
}));

export const wearableDevicesRelations = relations(wearableDevices, ({ one, many }) => ({
  user: one(users, {
    fields: [wearableDevices.userId],
    references: [users.id]
  }),
  activities: many(wearableActivities)
}));

export const wearableActivitiesRelations = relations(wearableActivities, ({ one }) => ({
  user: one(users, {
    fields: [wearableActivities.userId],
    references: [users.id]
  }),
  device: one(wearableDevices, {
    fields: [wearableActivities.deviceId],
    references: [wearableDevices.id]
  })
}));

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
export type Participation = typeof participations.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type WearableDevice = typeof wearableDevices.$inferSelect;
export type WearableActivity = typeof wearableActivities.$inferSelect;

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertWearableDeviceSchema = createInsertSchema(wearableDevices);
export const insertWearableActivitySchema = createInsertSchema(wearableActivities);