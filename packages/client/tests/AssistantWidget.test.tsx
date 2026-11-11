import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AssistantWidget } from "../src/components/assistant/AssistantWidget";
import { useAssistantStore } from "../src/store/useAssistantStore";
import { ApiClient } from "../src/services/api.client";

describe("<AssistantWidget />", () => {
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

  it("renders header, replay greeting button, and action cards initially", () => {
    render(<AssistantWidget />);

    expect(screen.getByText("Approvals Assistant")).toBeInTheDocument();
    expect(screen.getByText("Replay Greeting")).toBeInTheDocument();
    expect(screen.getByText("Present me Summary")).toBeInTheDocument();
    expect(screen.getByText("Talk to me")).toBeInTheDocument();
    expect(screen.getByText("Help me")).toBeInTheDocument();
    expect(screen.getByText("Teach me")).toBeInTheDocument();
  });

  it("shows loading indicator when summary action is triggered", async () => {
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

    expect(screen.getByText("Synthesizing approvals telemetry...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("HIGH URGENCY")).toBeInTheDocument();
      expect(screen.getByText("Level 2 Drone Patrol Video Demo")).toBeInTheDocument();
      expect(screen.getByText("Review Drone Video immediately.")).toBeInTheDocument();
    });
  });

  it("renders streamed tokens into chat feed", async () => {
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

  it("displays fallback notice when stream encounters an error or timeout", async () => {
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
