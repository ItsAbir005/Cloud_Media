import express from "express";
import cookieParser from "cookie-parser";
import { globalError } from "./middlewares/globalError";
import authRoutes from "./routes/auth.routes";
import mediaRoutes from "./routes/media.routes";
import { testPostgres } from "./db/postgres";
import { connectMongo } from "./db/mongo";
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoutes);
app.use("/media", mediaRoutes);
app.get("/health", async (req, res, next) => {
  try {
    await testPostgres();
    await connectMongo();
    res.json({ success: true, message: "All services healthy" });
  } catch (err) {
    next(err);
  }
});
app.use(globalError);
app.listen(8080, () => console.log("Server running on 8080"));
