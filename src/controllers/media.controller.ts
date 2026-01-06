import { asyncWrap } from "../middlewares/asyncWrap";
import { prisma } from "../db/postgres";
import amqp from "amqplib";
import { AppError } from "../errors/AppError";
import Redis from "ioredis";
import { Request, Response } from "express";

const redis = new Redis(process.env.REDIS_URL!);
const ALLOWED_FILETYPES = ["image/jpeg", "image/png", "image/gif", "video/mp4", "audio/mpeg"];
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const uploadMedia = asyncWrap(async (req: Request, res: Response) => {
  const { filename, url, filetype } = req.body;
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError("ERR_UNAUTH", "User not authenticated", null, 401);
  }
  if (!filename || !url || !filetype) {
    throw new AppError(
      "ERR_VALIDATION",
      "Missing required fields",
      { required: ["filename", "url", "filetype"] },
      400
    );
  }
  if (!isValidUrl(url)) {
    throw new AppError("ERR_VALIDATION", "Invalid URL format", { url }, 400);
  }
  if (!ALLOWED_FILETYPES.includes(filetype)) {
    throw new AppError(
      "ERR_VALIDATION",
      "Unsupported file type",
      { allowed: ALLOWED_FILETYPES, received: filetype },
      400
    );
  }
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    throw new AppError("ERR_VALIDATION", "Invalid filename", { filename }, 400);
  }

  const media = await prisma.mediaMetadata.create({
    data: { userId, filename, url, filetype }
  });

  try {
    const conn = await amqp.connect(process.env.RABBIT_URL!);
    const ch = await conn.createChannel();
    await ch.assertQueue("media_events", { durable: true });
    ch.sendToQueue(
      "media_events",
      Buffer.from(JSON.stringify({ id: media.id, userId, url })),
      { persistent: true }
    );
    await ch.close();
    await conn.close();
  } catch (err) {
    console.error("Queue error:", err);
    throw new AppError("ERR_QUEUE", "Failed to publish queue event", null, 500);
  }
  const cacheKey = `uploads:${userId}`;
  await redis.del(cacheKey);

  res.json({ success: true, data: media });
});

export const myUploads = asyncWrap(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError("ERR_UNAUTH", "User not authenticated", null, 401);
  }

  const cacheKey = `uploads:${userId}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json({ 
      success: true, 
      data: JSON.parse(cached), 
      cached: true 
    });
  }
  const uploads = await prisma.mediaMetadata.findMany({
    where: { userId },
    orderBy: { uploaded: "desc" }
  });
  await redis.set(cacheKey, JSON.stringify(uploads), "EX", 60);
  res.json({ success: true, data: uploads, cached: false });
});