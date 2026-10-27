import {
  ApprovalQueueResponse,
  ApprovalQueueResponseSchema,
  GreetingResponse,
  GreetingResponseSchema,
  SummaryResponse,
  SummaryResponseSchema,
  ChatMessage,
  ActionType,
} from "@oomnieye/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export class ApiClient {
  /**
   * Fetch pending approval queue items
   */
  public static async getApprovals(): Promise<ApprovalQueueResponse> {
    const res = await fetch(`${API_BASE}/approvals`, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Failed to fetch approvals queue (${res.status})`);
    }
    const data = await res.json();
    return ApprovalQueueResponseSchema.parse(data);
  }

  /**
   * Action 5: Replay Greeting
   */
  public static async getGreeting(): Promise<GreetingResponse> {
    const res = await fetch(`${API_BASE}/assistant/greeting`);
    if (!res.ok) {
      throw new Error(`Failed to fetch assistant greeting (${res.status})`);
    }
    const data = await res.json();
    return GreetingResponseSchema.parse(data);
  }

  /**
   * Action 1: Present me Summary (structured JSON)
   */
  public static async getSummary(language: string = "en"): Promise<SummaryResponse> {
    const res = await fetch(`${API_BASE}/assistant/summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language }),
    });
    if (!res.ok) {
      throw new Error(`Failed to generate approvals summary (${res.status})`);
    }
    const data = await res.json();
    return SummaryResponseSchema.parse(data);
  }

  /**
   * Streaming for Talk to me, Help me, Teach me
   */
  public static async streamAssistantAction(params: {
    action: ActionType;
    message?: string;
    history?: ChatMessage[];
    language?: string;
    onToken: (token: string, degraded?: boolean, citations?: string[]) => void;
    onComplete: () => void;
    onError: (err: Error) => void;
  }): Promise<void> {
    const { action, message, history, language, onToken, onComplete, onError } = params;

    try {
      const response = await fetch(`${API_BASE}/assistant/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          action,
          message: message || "",
          history: history || [],
          language: language || "en",
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No readable response body returned for stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;

          const rawData = trimmed.replace(/^data:\s*/, "");
          if (rawData === "[DONE]") {
            onComplete();
            return;
          }

          try {
            const parsed = JSON.parse(rawData);
            if (parsed.token) {
              onToken(parsed.token, parsed.degraded, parsed.citations);
            }
            if (parsed.done) {
              onComplete();
              return;
            }
          } catch {
            // Ignore malformed partial chunks
          }
        }
      }

      onComplete();
    } catch (err) {
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  }
}
