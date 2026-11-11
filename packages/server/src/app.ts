import path from "path";
import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { apiRouter } from "./routes";
import { errorHandler } from "./errors/errorHandler";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

export function createApp(): Express {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
      credentials: true,
      methods: ["GET", "POST", "OPTIONS"],
    }),
  );

  app.use(express.json());
  app.use("/api", apiRouter);

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Endpoint not found",
      },
    });
  });

  app.use(errorHandler);

  return app;
}

export const app = createApp();
