import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AssistantWidget } from "../src/components/assistant/AssistantWidget";
import { useAssistantStore } from "../src/store/useAssistantStore";
import { ApiClient } from "../src/services/api.client";

describe("Component Tests: Approvals Assistant Panel & Resilient UX States", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAssistantStore.setState({
      isWidgetOpen: true,
      activeView: "cards",
      activeAction: null,
      greetingText: "Welcome back, Operator. 4 items pending review.",
      greetingDegraded: false,
      isGreetingLoading: false,
      structuredSummary: null,
      isSummaryLoading: false,
      messages: [],
      streamingTokenBuffer: "",
      isStreaming: false,
      isDegraded: false,
      errorMessage: null,
      currentCitations: [],
    });
  });

  it("should render avatar/header, replay greeting button, and 4 action cards on initial state", () => {
    render(<AssistantWidget />);

    expect(screen.getByText("Approvals Assistant")).toBeInTheDocument();
    expect(screen.getByText("Replay Greeting")).toBeInTheDocument();
    expect(screen.getByText("Present me Summary")).toBeInTheDocument();
    expect(screen.getByText("Talk to me")).toBeInTheDocument();
    expect(screen.getByText("Help me")).toBeInTheDocument();
    expect(screen.getByText("Teach me")).toBeInTheDocument();
  });

  it("should visibly handle loading state when Present me Summary is clicked", async () => {
    // Mock getSummary to delay response
    vi.spyOn(ApiClient, "getSummary").mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              success: true,
              data: {
                overview: "Queue analyzed: 2 critical items.",
                totalPending: 4,
                highPriorityCount: 2,
                prioritizedItems: [
                  {
                    itemId: "appr-002",
                    itemName: "Level 2 Drone Patrol Video Demo",
                    urgency: "HIGH",
                    reason: "Flight telemetry check required.",
                    recommendedAction: "Review flight video.",
                  },
                ],
                topRecommendation: "Review Drone Video immediately.",
                degraded: false,
              },
            });
          }, 50);
        }),
    );

    render(<AssistantWidget />);

    const summaryCard = screen.getByText("Present me Summary");
    fireEvent.click(summaryCard);

    // Verify loading state is visibly shown
    expect(screen.getByText("Synthesizing approvals telemetry...")).toBeInTheDocument();

    // Verify structured output arrives and renders urgency badges
    await waitFor(() => {
      expect(screen.getByText("HIGH URGENCY")).toBeInTheDocument();
      expect(screen.getByText("Level 2 Drone Patrol Video Demo")).toBeInTheDocument();
      expect(screen.getByText("Review Drone Video immediately.")).toBeInTheDocument();
    });
  });

  it("should render token-by-token streaming state without freezing", async () => {
    vi.spyOn(ApiClient, "streamAssistantAction").mockImplementation(
      async ({ onToken, onComplete }) => {
        onToken("Drone ");
        onToken("telemetry ");
        onToken("verified.");
        onComplete();
      },
    );

    render(<AssistantWidget />);

    const talkCard = screen.getByText("Talk to me");
    fireEvent.click(talkCard);

    await waitFor(() => {
      expect(screen.getByText(/Drone telemetry verified/)).toBeInTheDocument();
    });
  });

  it("should render graceful error / degraded state visibly when stream or timeout fails", async () => {
    vi.spyOn(ApiClient, "streamAssistantAction").mockImplementation(async ({ onError }) => {
      onError(new Error("AI operation exceeded 8s timeout threshold"));
    });

    render(<AssistantWidget />);

    const helpCard = screen.getByText("Help me");
    fireEvent.click(helpCard);

    await waitFor(() => {
      expect(screen.getByText(/AI operation exceeded 8s timeout threshold/)).toBeInTheDocument();
      expect(screen.getByText(/Operational fallback displayed below/)).toBeInTheDocument();
    });
  });
});
