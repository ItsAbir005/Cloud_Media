import { Server } from "socket.io";
import http from "http";
import Redis from "ioredis";

const redis = new Redis();
const sub = redis.duplicate();

export const startWS = (app: any) => {
  const server = http.createServer(app);
  const io = new Server(server,
    { cors: { origin: "*" } }
  );

  sub.subscribe("media_done");
  sub.on("message", (_, message) => {
    io.emit("analysis_done", JSON.parse(message));
  });

  server.listen(8081, () => console.log(" WS running on 8081"));
};

