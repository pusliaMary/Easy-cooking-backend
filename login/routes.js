import { login, logout, checkAuth } from "./controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router();

router.post("/login", login);
router.delete("/logout", authenticate, logout);
router.get("/me", authenticate, checkAuth);

export default router;
