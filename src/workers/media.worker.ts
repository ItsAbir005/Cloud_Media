import amqp from "amqplib";
import { MediaModel } from "../db/mongoSchemas"; 
  
(async () => {
  const conn = await amqp.connect(process.env.RABBIT_URL!);
  const ch = await conn.createChannel();
  await ch.assertQueue("media_events", { durable: true });

  ch.consume("media_events", async (msg) => {
    if (!msg) return;
    const job = JSON.parse(msg.content.toString());

    try {
      const result = {
        userId: job.userId,
        mediaUrl: job.url,
        sentiment: "positive",
        summary: "AI result later",
        createdAt: new Date()
      };

      await MediaModel.create(result);
      ch.ack(msg);
    } catch {
      ch.nack(msg, false, false);
    }
  });
})();