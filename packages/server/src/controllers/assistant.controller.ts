import { Request, Response, NextFunction } from "express";
import { approvalService } from "../services/approval/approval.service";
import { llmService } from "../services/ai/llm.service";
import { ChatRequest, SummaryResponseSchema, GreetingResponseSchema } from "@oomnieye/shared";

export class AssistantController {
  /**
   * Action 5: Replay Greeting (context-aware dynamic greeting)
   */
  public async getGreeting(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pendingItems = approvalService.getPendingItems();
      const result = await llmService.generateGreeting(pendingItems);

      const response = GreetingResponseSchema.parse({
        success: true,
        data: {
          greeting: result.greeting,
          pendingCount: pendingItems.length,
          degraded: result.degraded,
        },
      });

      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Action 1: Present me Summary (structured JSON output validated with Zod)
   */
  public async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const language = (req.body?.language as string) || "en";
      const pendingItems = approvalService.getPendingItems();
      const summary = await llmService.generateSummary(pendingItems, language);

      const response = SummaryResponseSchema.parse({
        success: true,
        data: summary,
      });

      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Streaming actions: Talk to me, Help me, Teach me
   */
  public async streamChat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body as ChatRequest;
      const { action, message, history, language } = payload;
      const pendingItems = approvalService.getPendingItems();

      switch (action) {
        case "talk":
          await llmService.streamTalk(pendingItems, history || [], message || "", res, language);
          break;

        case "help":
          await llmService.streamHelp(message || "", res, language);
          break;

        case "teach":
          await llmService.streamTeach(1, history || [], message || "", res, language);
          break;

        case "greeting":
        case "summary":
        default:
          res.status(400).json({
            success: false,
            error: {
              code: "INVALID_ACTION",
              message: `Action "${action}" should use its dedicated endpoint.`,
            },
          });
      }
    } catch (err) {
      next(err);
    }
  }
}

export const assistantController = new AssistantController();
