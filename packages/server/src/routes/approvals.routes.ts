import { Router } from "express";
import { approvalsController } from "../controllers/approvals.controller";

export const approvalsRouter = Router();

approvalsRouter.get("/", approvalsController.getQueue);
approvalsRouter.get("/:id", approvalsController.getItemById);
