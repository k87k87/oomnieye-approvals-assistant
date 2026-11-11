import { describe, it, expect } from "vitest";
import { llmService } from "../../src/services/ai/llm.service";
import { ApprovalItem } from "@oomnieye/shared";

describe("llmService (mock & fallbacks)", () => {
  const mockItems: ApprovalItem[] = [
    {
      id: "mock-1",
      name: "Level 2 Drone Patrol Video Demo",
      type: "Video",
      submittedBy: "Alex HelpAdmin",
      date: "Sep 18",
      status: "Pending Review — Sep 18",
      urgent: true,
    },
    {
      id: "mock-2",
      name: "360° Spatial Zone Layout & Camera Map",
      type: "Image",
      submittedBy: "Elena HelpAdmin",
      date: "Sep 18",
      status: "Pending Review — Sep 18",
      urgent: false,
    },
  ];

  it("generates greeting referencing pending items", async () => {
    const result = await llmService.generateGreeting(mockItems);
    expect(result).toBeDefined();
    expect(result.greeting).toContain("2 items pending review");
    expect(typeof result.degraded).toBe("boolean");
  });

  it("returns structured summary with urgency rankings", async () => {
    const summary = await llmService.generateSummary(mockItems, "en");
    expect(summary).toBeDefined();
    expect(summary.totalPending).toBe(2);
    expect(summary.prioritizedItems.length).toBe(2);

    const droneItem = summary.prioritizedItems.find((i) => i.itemId === "mock-1");
    expect(droneItem).toBeDefined();
    expect(droneItem?.urgency).toBe("HIGH");
  });

  it("gracefully degrades when timeout fires without throwing", async () => {
    // 1ms timeout forces fallback branch
    const degradedSummary = await llmService.generateSummary(mockItems, "en", 1);
    expect(degradedSummary).toBeDefined();
    expect(degradedSummary.degraded).toBe(true);
    expect(degradedSummary.fallbackReason).toBeDefined();
    expect(degradedSummary.totalPending).toBe(2);
    expect(degradedSummary.prioritizedItems.length).toBe(2);
  });
});
