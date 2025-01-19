import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { setupWebSocket } from "./websocket";
import { setupWearableRoutes } from "./wearable";
import { db } from "@db";
import { challenges, participations, transactions, users, achievements } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";

const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send("Not authenticated");
};

export function registerRoutes(app: Express): Server {
  // Set up authentication routes
  setupAuth(app);

  // Set up wearable device routes
  setupWearableRoutes(app);

  // Create HTTP server
  const httpServer = createServer(app);

  // Set up WebSocket
  const ws = setupWebSocket(httpServer);

  // Challenge routes
  app.get("/api/challenges", isAuthenticated, async (req, res) => {
    try {
      const allChallenges = await db.select().from(challenges).orderBy(desc(challenges.createdAt));
      res.json(allChallenges);
    } catch (error) {
      res.status(500).send("Failed to fetch challenges");
    }
  });

  app.get("/api/challenges/:id", isAuthenticated, async (req, res) => {
    try {
      const [challenge] = await db
        .select()
        .from(challenges)
        .where(eq(challenges.id, parseInt(req.params.id)))
        .limit(1);

      if (!challenge) {
        return res.status(404).send("Challenge not found");
      }

      res.json(challenge);
    } catch (error) {
      res.status(500).send("Failed to fetch challenge");
    }
  });

  const createChallengeSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    type: z.enum(["pushup", "squat", "situp"]),
    targetReps: z.number().min(1),
    betAmount: z.number().min(1),
    endDate: z.string().transform(str => new Date(str))
  });

  app.post("/api/challenges", isAuthenticated, async (req, res) => {
    try {
      const result = createChallengeSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).send(result.error.message);
      }

      const [challenge] = await db
        .insert(challenges)
        .values({
          title: result.data.title,
          description: result.data.description,
          type: result.data.type,
          targetReps: result.data.targetReps,
          betAmount: result.data.betAmount.toString(),
          endDate: result.data.endDate,
          creatorId: req.user!.id,
          status: "active"
        })
        .returning();

      ws.broadcastToAll({
        type: "challenge_update",
        payload: { action: "created", challenge }
      });

      res.json(challenge);
    } catch (error) {
      res.status(500).send("Failed to create challenge");
    }
  });

  app.post("/api/challenges/:id/join", isAuthenticated, async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const userId = req.user!.id;

      // Check if already participating
      const [existing] = await db
        .select()
        .from(participations)
        .where(
          and(
            eq(participations.challengeId, challengeId),
            eq(participations.userId, userId)
          )
        )
        .limit(1);

      if (existing) {
        return res.status(400).send("Already participating in this challenge");
      }

      const [challenge] = await db
        .select()
        .from(challenges)
        .where(eq(challenges.id, challengeId))
        .limit(1);

      if (!challenge) {
        return res.status(404).send("Challenge not found");
      }

      // Create participation and transaction records
      await db.transaction(async (tx) => {
        await tx.insert(participations).values({
          userId,
          challengeId,
          currentReps: 0,
          completed: false
        });

        await tx.insert(transactions).values({
          userId,
          challengeId,
          amount: challenge.betAmount,
          type: "bet",
          status: "pending"
        });
      });

      res.json({ message: "Successfully joined challenge" });
    } catch (error) {
      res.status(500).send("Failed to join challenge");
    }
  });

  app.post("/api/challenges/:id/progress", isAuthenticated, async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const userId = req.user!.id;
      const reps = parseInt(req.body.reps);

      if (isNaN(reps) || reps < 0) {
        return res.status(400).send("Invalid rep count");
      }

      const [participation] = await db
        .select()
        .from(participations)
        .where(
          and(
            eq(participations.challengeId, challengeId),
            eq(participations.userId, userId)
          )
        )
        .limit(1);

      if (!participation) {
        return res.status(404).send("Not participating in this challenge");
      }

      const updatedReps = participation.currentReps + reps;
      const [challenge] = await db
        .select()
        .from(challenges)
        .where(eq(challenges.id, challengeId))
        .limit(1);

      // Update participation and check for completion
      const completed = updatedReps >= challenge.targetReps;
      await db
        .update(participations)
        .set({
          currentReps: updatedReps,
          completed
        })
        .where(eq(participations.id, participation.id));

      // Award points and check for achievements
      await db
        .update(users)
        .set({
          points: req.user!.points + reps
        })
        .where(eq(users.id, userId));

      if (completed) {
        await db.insert(achievements).values({
          userId,
          type: "challenge_complete",
          title: "Challenge Champion",
          description: `Completed ${challenge.title}`
        });

        await db.insert(transactions).values({
          userId,
          challengeId,
          amount: (parseFloat(challenge.betAmount) * 2).toString(),
          type: "reward",
          status: "completed"
        });
      }

      ws.broadcastToAll({
        type: "challenge_update",
        payload: {
          action: "progress",
          challengeId,
          userId,
          updatedReps,
          completed
        }
      });

      res.json({ message: "Progress updated successfully" });
    } catch (error) {
      res.status(500).send("Failed to update progress");
    }
  });

  // Leaderboard route
  app.get("/api/leaderboard", isAuthenticated, async (req, res) => {
    try {
      const leaderboard = await db
        .select({
          id: users.id,
          username: users.username,
          points: users.points,
          level: users.level
        })
        .from(users)
        .orderBy(desc(users.points))
        .limit(10);

      res.json(leaderboard);
    } catch (error) {
      res.status(500).send("Failed to fetch leaderboard");
    }
  });

  return httpServer;
}