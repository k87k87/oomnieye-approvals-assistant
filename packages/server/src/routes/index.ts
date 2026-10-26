import { Router } from "express";
import { approvalsRouter } from "./approvals.routes";
import { assistantRouter } from "./assistant.routes";

export const apiRouter = Router();

apiRouter.use("/approvals", approvalsRouter);
apiRouter.use("/assistant", assistantRouter);

apiRouter.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    service: "oomnieye-command-centre-api",
    timestamp: new Date().toISOString(),
  });
});
