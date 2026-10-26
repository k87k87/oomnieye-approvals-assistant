import { Router } from "express";
import { assistantController } from "../controllers/assistant.controller";
import { aiRateLimiter } from "../middlewares/rateLimiter";
import { validateBody } from "../middlewares/validateRequest";
import { ChatRequestSchema } from "@oomnieye/shared";

export const assistantRouter = Router();

// Apply per-session / IP rate limiting to all AI assistant routes
assistantRouter.use(aiRateLimiter);

assistantRouter.get("/greeting", (req, res, next) =>
  assistantController.getGreeting(req, res, next),
);
assistantRouter.post("/summary", (req, res, next) =>
  assistantController.getSummary(req, res, next),
);
assistantRouter.post("/chat", validateBody(ChatRequestSchema), (req, res, next) =>
  assistantController.streamChat(req, res, next),
);
