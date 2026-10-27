import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app";
import { approvalService } from "../../src/services/approval/approval.service";

describe("Integration Tests (Supertest): AI Assistant Endpoints & Fallback Resilience", () => {
  it("GET /api/approvals should return 200 with seeded queue items", async () => {
    const res = await request(app).get("/api/approvals");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(4);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items[0].name).toBe("Site Patrol Onboarding & Checklists");
  });

  it("GET /api/assistant/greeting should return 200 with dynamic context-aware greeting", async () => {
    const res = await request(app).get("/api/assistant/greeting");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.greeting).toBeDefined();
    expect(res.body.data.pendingCount).toBe(approvalService.getPendingItems().length);
  });

  it("POST /api/assistant/summary (Success Path) should return 200 with Zod-validated structured JSON", async () => {
    const res = await request(app)
      .post("/api/assistant/summary")
      .send({ language: "en" })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalPending).toBe(approvalService.getPendingItems().length);
    expect(res.body.data.highPriorityCount).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(res.body.data.prioritizedItems)).toBe(true);
    expect(res.body.data.topRecommendation).toBeDefined();
  });

  it("POST /api/assistant/chat with invalid body should return 400 with validation error details", async () => {
    const res = await request(app)
      .post("/api/assistant/chat")
      .send({ action: "invalid_action_name" })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toBeDefined();
  });

  it("POST /api/assistant/chat (talk action) should return SSE stream with event-stream headers", async () => {
    const res = await request(app)
      .post("/api/assistant/chat")
      .send({
        action: "talk",
        message: "Which of these items needs my attention first and why?",
      })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/event-stream");
    expect(res.text).toContain("data: ");
    expect(res.text).toContain("[DONE]");
  });

  it("POST /api/assistant/chat (help action with RAG grounding) should return grounded policy response", async () => {
    const res = await request(app)
      .post("/api/assistant/chat")
      .send({
        action: "help",
        message: "What are the calibration requirements for vibration and thermal sensors?",
      })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/event-stream");
    expect(res.text).toContain("Section 2: Sensor & Equipment Technical Specifications");
  });
});
