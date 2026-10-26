import { Request, Response, NextFunction } from "express";
import { approvalService } from "../services/approval/approval.service";
import { ApprovalQueueResponseSchema } from "@oomnieye/shared";

export class ApprovalsController {
  public getQueue(_req: Request, res: Response, next: NextFunction): void {
    try {
      const items = approvalService.getItems();
      const response = ApprovalQueueResponseSchema.parse({
        success: true,
        count: items.length,
        items,
      });
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  public getItemById(req: Request, res: Response, next: NextFunction): void {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, error: { message: "Item ID is required" } });
        return;
      }
      const item = approvalService.getItemById(id);
      if (!item) {
        res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: `Approval item with ID "${id}" was not found.` },
        });
        return;
      }
      res.json({ success: true, item });
    } catch (err) {
      next(err);
    }
  }
}

export const approvalsController = new ApprovalsController();
