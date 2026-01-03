import { Router } from "express";
import { login, refresh, me, logout } from "../controllers/auth.controller";

const router = Router();

router.post("/login", login);
router.post("/refresh", refresh);
router.get("/me", me);
router.post("/logout", logout);

export default router;
