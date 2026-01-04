import { asyncWrap } from "../middlewares/asyncWrap";
import { prisma } from "../db/postgres";
import amqp from "amqplib";
import { AppError } from "../errors/AppError";
import Redis from "ioredis";
import { Request,Response} from "express";

const redis = new Redis(process.env.REDIS_URL!);
export const uploadMedia = asyncWrap(async (req: Request, res: Response) => {
  const { filename, url, filetype } = req.body;
  const userId = "19";

  if (!filename || !url || !filetype)
    throw new AppError("ERR_VALIDATION", "Missing fields", { filename, url, filetype }, 400);

  const media = await prisma.mediaMetadata.create({
    data: { userId, filename, url, filetype }
  });

  try {
    const conn = await amqp.connect(process.env.RABBIT_URL!);
    const ch = await conn.createChannel();
    await ch.assertQueue("media_events", { durable: true });
    ch.sendToQueue("media_events", Buffer.from(JSON.stringify({ id: media.id, userId, url })));
  } catch (err) {
    throw new AppError("ERR_QUEUE", "Failed to publish queue event", err, 500);
  }

  res.json({ success: true, data: media });
});

export const myUploads = asyncWrap(async (req: Request, res: Response) => {
  const userId = "19";
  const cacheKey = `uploads:${userId}`;

  const cached = await redis.get(cacheKey);
  if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });

  const uploads = await prisma.mediaMetadata.findMany({
    where: { userId },
    orderBy: { uploaded: "desc" }
  });

  await redis.set(cacheKey, JSON.stringify(uploads), "EX", 60);
  res.json({ success: true, data: uploads, cached: false });
});
