import express from "express";
import cookieParser from "cookie-parser";
import { globalError } from "./middlewares/globalError";
import authRoutes from "./routes/auth.routes";
import mediaRoutes from "./routes/media.routes";
import { testPostgres, pool } from "./db/postgres";
import { connectMongo } from "./db/mongo";
import mongoose from "mongoose";
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoutes);
app.use("/media", mediaRoutes);
app.get("/health", async (req, res, next) => {
  try {
    const health = {
      postgres: "disconnected",
      mongo: "disconnected",
      timestamp: new Date().toISOString()
    };
    try {
      await pool.query("SELECT 1");
      health.postgres = "connected";
    } catch (err) {
      console.error("Postgres health check failed:", err);
    }
    if (mongoose.connection.readyState === 1) {
      health.mongo = "connected";
    }

    const allHealthy = health.postgres === "connected" && health.mongo === "connected";

    res.status(allHealthy ? 200 : 503).json({
      success: allHealthy,
      message: allHealthy ? "All services healthy" : "Some services unavailable",
      data: health
    });
  } catch (err) {
    next(err);
  }
});
app.use(globalError);
const startServer = async () => {
  try {
    await testPostgres();
    await connectMongo();
    
    app.listen(8080, () => {
      console.log("Server running on port 8080");
      console.log("Environment:", process.env.NODE_ENV || "development");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
