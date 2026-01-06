import { Server } from "socket.io";
import http from "http";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!);
const sub = redis.duplicate();

export const startWS = (app: any) => {
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      credentials: true
    }
  });

  sub.subscribe("media_done");
  
  sub.on("message", (channel, message) => {
    try {
      const data = JSON.parse(message);
      io.emit("analysis_done", data);
    } catch (error) {
      console.error("Error parsing Redis message:", error);
    }
  });

  sub.on("error", (error) => {
    console.error("Redis subscription error:", error);
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  server.listen(8081, () => console.log("WS running on 8081"));
};