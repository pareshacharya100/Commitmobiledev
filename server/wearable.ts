import { type Express } from "express";
import { db } from "@db";
import { wearableDevices, wearableActivities, insertWearableDeviceSchema } from "@db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send("Not authenticated");
};

export function setupWearableRoutes(app: Express) {
  // Get user's connected devices
  app.get("/api/wearables", isAuthenticated, async (req, res) => {
    try {
      const devices = await db
        .select()
        .from(wearableDevices)
        .where(eq(wearableDevices.userId, req.user!.id));
      
      res.json(devices);
    } catch (error) {
      res.status(500).send("Failed to fetch wearable devices");
    }
  });

  // Connect new device
  app.post("/api/wearables/connect", isAuthenticated, async (req, res) => {
    try {
      const result = insertWearableDeviceSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).send(result.error.message);
      }

      const [device] = await db
        .insert(wearableDevices)
        .values({
          ...result.data,
          userId: req.user!.id,
        })
        .returning();

      res.json(device);
    } catch (error) {
      res.status(500).send("Failed to connect wearable device");
    }
  });

  // Sync device data
  app.post("/api/wearables/:deviceId/sync", isAuthenticated, async (req, res) => {
    try {
      const deviceId = parseInt(req.params.deviceId);
      const [device] = await db
        .select()
        .from(wearableDevices)
        .where(eq(wearableDevices.id, deviceId))
        .limit(1);

      if (!device || device.userId !== req.user!.id) {
        return res.status(404).send("Device not found");
      }

      // Here we'll implement the actual sync logic based on device type
      // For now, we'll just update the lastSyncedAt timestamp
      await db
        .update(wearableDevices)
        .set({ lastSyncedAt: new Date() })
        .where(eq(wearableDevices.id, deviceId));

      res.json({ message: "Sync completed successfully" });
    } catch (error) {
      res.status(500).send("Failed to sync device data");
    }
  });

  // Get device activities
  app.get("/api/wearables/:deviceId/activities", isAuthenticated, async (req, res) => {
    try {
      const deviceId = parseInt(req.params.deviceId);
      const [device] = await db
        .select()
        .from(wearableDevices)
        .where(eq(wearableDevices.id, deviceId))
        .limit(1);

      if (!device || device.userId !== req.user!.id) {
        return res.status(404).send("Device not found");
      }

      const activities = await db
        .select()
        .from(wearableActivities)
        .where(eq(wearableActivities.deviceId, deviceId))
        .orderBy(wearableActivities.startTime);

      res.json(activities);
    } catch (error) {
      res.status(500).send("Failed to fetch device activities");
    }
  });
}
