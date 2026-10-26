import { app } from "./app";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.info(`[OomniEye API] Server running at http://localhost:${PORT}`);
  console.info(`[OomniEye API] Health check at http://localhost:${PORT}/api/health`);
});

// Graceful termination handling
process.on("SIGTERM", () => {
  console.info("[OomniEye API] SIGTERM received. Closing HTTP server.");
  server.close(() => {
    console.info("[OomniEye API] HTTP server closed.");
    process.exit(0);
  });
});
