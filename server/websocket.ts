import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import type { SelectUser } from "@db/schema";

interface Client {
  id: string;
  ws: WebSocket;
  user?: SelectUser;
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ 
    server,
    path: '/ws',
    verifyClient: (info, cb) => {
      // Skip verification for vite HMR
      if (info.req.headers['sec-websocket-protocol'] === 'vite-hmr') {
        return cb(false);
      }
      cb(true);
    }
  });

  const clients = new Map<string, Client>();

  wss.on("connection", (ws: WebSocket) => {
    const clientId = Math.random().toString(36).substring(2);
    clients.set(clientId, { id: clientId, ws });

    ws.on("message", async (message: string | Buffer) => {
      try {
        const data = JSON.parse(message.toString());

        switch (data.type) {
          case "challenge_update":
            broadcastToAll({
              type: "challenge_update",
              payload: data.payload,
            });
            break;
          case "leaderboard_update":
            broadcastToAll({
              type: "leaderboard_update",
              payload: data.payload,
            });
            break;
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      clients.delete(clientId);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      clients.delete(clientId);
    });
  });

  function broadcastToAll(data: any) {
    const message = JSON.stringify(data);
    clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(message);
        } catch (error) {
          console.error("Error broadcasting to client:", error);
        }
      }
    });
  }

  return {
    broadcastToAll,
  };
}