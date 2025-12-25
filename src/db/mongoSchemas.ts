import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    tokenHash: { type: String, required: true },
    device: { type: String, default: "web" },
    expiresAt: { type: Date, required: true }
});

const mediaSchema = new mongoose.Schema({
    userId: String,
    mediaUrl: String,
    sentiment: String,
    summary: String,
    createdAt: { type: Date, default: Date.now }
});

export const TokenModel = mongoose.model("Token", tokenSchema);
export const MediaModel = mongoose.model("Media", mediaSchema);
