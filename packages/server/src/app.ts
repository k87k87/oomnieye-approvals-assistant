import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { apiRouter } from "./routes";
import { errorHandler } from "./errors/errorHandler";

import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

export function createApp(): Express {
  const app = express();

  // Basic CORS configuration
  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
      credentials: true,
      methods: ["GET", "POST", "OPTIONS"],
    }),
  );

  // Request body parsing
  app.use(express.json());

  // Mount API router
  app.use("/api", apiRouter);

  // 404 Handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Endpoint not found",
      },
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
