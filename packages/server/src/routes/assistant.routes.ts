import { Router } from "express";
import { assistantController } from "../controllers/assistant.controller";
import { aiRateLimiter } from "../middlewares/rateLimiter";
import { validateBody } from "../middlewares/validateRequest";
import { ChatRequestSchema } from "@oomnieye/shared";

export const assistantRouter = Router();

// Throttle assistant endpoints per IP/session
assistantRouter.use(aiRateLimiter);

assistantRouter.get("/greeting", assistantController.getGreeting);
assistantRouter.post("/summary", assistantController.getSummary);
assistantRouter.post("/chat", validateBody(ChatRequestSchema), assistantController.streamChat);
