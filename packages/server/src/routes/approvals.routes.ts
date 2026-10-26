import { Router } from "express";
import { approvalsController } from "../controllers/approvals.controller";

export const approvalsRouter = Router();

approvalsRouter.get("/", (req, res, next) => approvalsController.getQueue(req, res, next));
approvalsRouter.get("/:id", (req, res, next) => approvalsController.getItemById(req, res, next));
