import { asyncWrap } from "../middlewares/asyncWrap";
import { prisma } from "../db/postgres";
import amqp from "amqplib";
import e, { Request, Response } from "express";
import { AppError } from "../errors/AppError"
export const uploadMedia = asyncWrap(async (req: Request, res: Response) => {
    const { filename, url, filetype } = req.body;
    const userId = "123";
    const media = await prisma.mediaMetadata.create({
    data: { userId, filename, url, filetype }
  });
  const conn = await amqp.connect(process.env.RABBIT_URL!);
  const ch = await conn.createChannel();
  await ch.assertQueue("media_events", { durable: true });
  ch.sendToQueue("media_events", Buffer.from(JSON.stringify({ userId, filename, url })));

  res.json({ success: true, data: media });
});
