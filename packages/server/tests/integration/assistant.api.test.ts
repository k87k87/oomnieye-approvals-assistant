import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app";
import { approvalService } from "../../src/services/approval/approval.service";

describe("assistant API endpoints", () => {
  it("GET /api/approvals returns 200 and seeded queue items", async () => {
    const res = await request(app).get("/api/approvals");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(4);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items[0].name).toBe("Site Patrol Onboarding & Checklists");
  });

  it("GET /api/assistant/greeting returns 200 and greeting object", async () => {
    const res = await request(app).get("/api/assistant/greeting");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.greeting).toBeDefined();
    expect(res.body.data.pendingCount).toBe(approvalService.getPendingItems().length);
  });

  it("POST /api/assistant/summary returns 200 and validated structured summary", async () => {
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

  it("POST /api/assistant/chat returns 400 when payload is invalid", async () => {
    const res = await request(app)
      .post("/api/assistant/chat")
      .send({ action: "invalid_action_name" })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toBeDefined();
  });

  it("POST /api/assistant/chat streams SSE response for talk action", async () => {
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

  it("POST /api/assistant/chat returns grounded policy citations for help action", async () => {
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
