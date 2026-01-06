import { Router } from "express";
import { uploadMedia, myUploads } from "../controllers/media.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
router.post("/upload", authenticate, uploadMedia);
router.get("/my-uploads", authenticate, myUploads);

export default router;
