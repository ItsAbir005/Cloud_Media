import amqp from "amqplib";
import { MediaModel } from "../db/mongoSchemas";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!);

export const startWorker = async () => {
  const conn = await amqp.connect(process.env.RABBIT_URL!);
  const ch = await conn.createChannel();

  await ch.assertQueue("media_events", { durable: true });
  await ch.assertQueue("media_dlq", { durable: true });

  ch.consume("media_events", async (msg) => {
    if (!msg) return;
    const job = JSON.parse(msg.content.toString());

    try {
      const result = {
        userId: job.userId,
        mediaUrl: job.url,
        sentiment: "positive",
        summary: "Processed asynchronously",
        createdAt: new Date()
      };

      await MediaModel.create(result);
      await redis.publish("media_done", JSON.stringify({ id: job.id, result }));

      ch.ack(msg);

    } catch {
      ch.sendToQueue("media_dlq", Buffer.from(JSON.stringify(job)));
      ch.ack(msg);
    }
  });

  console.log("Worker running");
};
