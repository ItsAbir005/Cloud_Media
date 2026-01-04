import { Router } from "express";
import { uploadMedia, myUploads } from "../controllers/media.controller";

const router = Router();

router.post("/upload", uploadMedia);
router.get("/my-uploads", myUploads);

export default router;
