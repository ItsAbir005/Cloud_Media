import mongoose from "mongoose";

const mediaResultSchema = new mongoose.Schema({
    userId: String,
    mediaUrl: String,
    sentiment: String,
    summary: String,
    createdAt: Date,
});

export const MediaModel = mongoose.model("MediaResult", mediaResultSchema);
