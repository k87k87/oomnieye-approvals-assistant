import { describe, it, expect } from "vitest";
import {
  GREETING_PROMPT_V1,
  SUMMARY_PROMPT_V1,
  TALK_PROMPT_V1,
  RAG_HELP_PROMPT_V1,
} from "../../src/prompts";
import { StructuredSummarySchema, ApprovalItem } from "@oomnieye/shared";

describe("prompts and schema validation", () => {
  const mockItems: ApprovalItem[] = [
    {
      id: "test-001",
      name: "Level 2 Drone Patrol Video Demo",
      type: "Video",
      submittedBy: "Alex HelpAdmin",
      date: "Sep 18",
      status: "Pending Review",
      urgent: true,
    },
    {
      id: "test-002",
      name: "Safety Equipment & Sensor Specs",
      type: "PDF",
      submittedBy: "Sam HelpAdmin",
      date: "Sep 18",
      status: "Pending Review",
      urgent: true,
    },
  ];

  it("injects pending count and urgent items into greeting prompt", () => {
    const prompt = GREETING_PROMPT_V1.buildSystemPrompt(mockItems);
    expect(prompt).toContain("Total pending approval requests: 2");
    expect(prompt).toContain("Critical/Urgent items: 2");
    expect(prompt).toContain("Level 2 Drone Patrol Video Demo");
  });

  it("builds summary prompt with required schema keys and target language", () => {
    const systemPrompt = SUMMARY_PROMPT_V1.buildSystemPrompt("es");
    expect(systemPrompt).toContain('specified language: "es"');
    expect(systemPrompt).toContain("prioritizedItems");
    expect(systemPrompt).toContain("topRecommendation");

    const userPrompt = SUMMARY_PROMPT_V1.buildUserPrompt(mockItems);
    expect(userPrompt).toContain("test-001");
    expect(userPrompt).toContain("Level 2 Drone Patrol Video Demo");
  });

  it("serializes queue items into talk context", () => {
    const prompt = TALK_PROMPT_V1.buildSystemPrompt(mockItems, "en");
    expect(prompt).toContain("test-001");
    expect(prompt).toContain("Alex HelpAdmin");
  });

  it("includes citations and policy boundaries in help prompt", () => {
    const prompt = RAG_HELP_PROMPT_V1.buildSystemPrompt([
      {
        sectionTitle: "Section 1: Drone Patrol Video Approvals",
        content: "Continuous boundary tracking at minimum 1080p / 60fps resolution.",
        relevanceScore: 0.9,
      },
    ]);
    expect(prompt).toContain("[Source 1: Section 1: Drone Patrol Video Approvals]");
    expect(prompt).toContain("ONLY use information explicitly stated");
    expect(prompt).toContain("escalate to the Shift Supervisor");
  });

  it("validates conforming structured summary payload", () => {
    const validLlmOutput = {
      overview: "Queue analyzed: 2 urgent safety items detected.",
      totalPending: 2,
      highPriorityCount: 2,
      prioritizedItems: [
        {
          itemId: "test-001",
          itemName: "Level 2 Drone Patrol Video Demo",
          urgency: "HIGH",
          reason: "Airspace perimeter video verification required.",
          recommendedAction: "Review 60fps telemetry.",
        },
      ],
      topRecommendation: "Review Drone Video first.",
      degraded: false,
    };

    const parsed = StructuredSummarySchema.parse(validLlmOutput);
    expect(parsed.totalPending).toBe(2);
    expect(parsed.prioritizedItems[0]?.urgency).toBe("HIGH");
  });

  it("rejects malformed summary payload missing required fields", () => {
    const brokenLlmOutput = {
      overview: "Malformed output",
      prioritizedItems: [
        {
          itemId: "test-001",
          urgency: "SUPER_URGENT",
        },
      ],
    };

    expect(() => StructuredSummarySchema.parse(brokenLlmOutput)).toThrow();
  });
});
