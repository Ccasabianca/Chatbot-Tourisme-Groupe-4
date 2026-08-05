import { Router } from "express";
import { generateAnswer } from "../controllers/ai.controller.js";

const router = Router();
router.post("/chat", generateAnswer);
export default router;
