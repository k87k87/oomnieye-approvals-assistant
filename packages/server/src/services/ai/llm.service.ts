import { Response } from "express";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import {
  ApprovalItem,
  StructuredSummary,
  StructuredSummarySchema,
  ChatMessage,
} from "@oomnieye/shared";
import { withTimeout } from "../../utils/withTimeout";
import { GREETING_PROMPT_V1 } from "../../prompts/greeting.prompt.v1";
import { SUMMARY_PROMPT_V1 } from "../../prompts/summary.prompt.v1";
import { TALK_PROMPT_V1 } from "../../prompts/talk.prompt.v1";
import { RAG_HELP_PROMPT_V1 } from "../../prompts/ragHelp.prompt.v1";
import { TEACH_PROMPT_V1 } from "../../prompts/teach.prompt.v1";
import { ragService } from "../rag/rag.service";

export class LlmService {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private provider: "openai" | "anthropic" | "mock" = "mock";

  constructor() {
    this.initProvider();
  }

  private initProvider(): void {
    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const preferred = process.env.LLM_PROVIDER?.toLowerCase();

    if (preferred === "anthropic" && anthropicKey) {
      this.anthropic = new Anthropic({ apiKey: anthropicKey });
      this.provider = "anthropic";
    } else if (openaiKey) {
      this.openai = new OpenAI({ apiKey: openaiKey });
      this.provider = "openai";
    } else if (anthropicKey) {
      this.anthropic = new Anthropic({ apiKey: anthropicKey });
      this.provider = "anthropic";
    } else {
      this.provider = "mock";
      console.info(
        "[LlmService] No active LLM API keys detected. Operating in High-Fidelity Mock Mode.",
      );
    }
  }

  public getProvider(): string {
    return this.provider;
  }

  // ==========================================
  // ACTION 1: REPLAY GREETING
  // ==========================================
  public async generateGreeting(
    items: ApprovalItem[],
    timeoutMs: number = 8000,
  ): Promise<{ greeting: string; degraded: boolean }> {
    const fallback = (): { greeting: string; degraded: boolean } => {
      const urgentCount = items.filter(
        (i) => i.urgent || i.type === "Video" || i.type === "PDF",
      ).length;
      return {
        greeting: `Welcome back, Operator. You have ${items.length} pending approval requests in the queue, including ${urgentCount} high-priority items requiring attention.`,
        degraded: true,
      };
    };

    return withTimeout(
      async (signal) => {
        if (this.provider === "mock") {
          return {
            greeting: `Good afternoon, Operator. You have ${items.length} items pending review, notably Alex HelpAdmin's Level 2 Drone Patrol Video Demo and Sam HelpAdmin's Sensor Specs.`,
            degraded: false,
          };
        }

        if (this.provider === "openai" && this.openai) {
          const completion = await this.openai.chat.completions.create(
            {
              model: process.env.OPENAI_MODEL || "gpt-4o",
              messages: [{ role: "system", content: GREETING_PROMPT_V1.buildSystemPrompt(items) }],
              max_tokens: 120,
              temperature: 0.6,
            },
            { signal },
          );

          const text = completion.choices[0]?.message?.content?.trim();
          if (!text) throw new Error("Empty greeting returned by OpenAI");
          return { greeting: text, degraded: false };
        }

        if (this.provider === "anthropic" && this.anthropic) {
          const msg = await this.anthropic.messages.create(
            {
              model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest",
              max_tokens: 120,
              messages: [{ role: "user", content: GREETING_PROMPT_V1.buildSystemPrompt(items) }],
            },
            { signal },
          );

          const block = msg.content[0];
          const text = block?.type === "text" ? block.text.trim() : "";
          if (!text) throw new Error("Empty greeting returned by Anthropic");
          return { greeting: text, degraded: false };
        }

        return fallback();
      },
      () => fallback(),
      { timeoutMs, operationName: "Replay Greeting" },
    );
  }

  // ==========================================
  // ACTION 2: PRESENT ME SUMMARY (STRUCTURED JSON)
  // ==========================================
  public async generateSummary(
    items: ApprovalItem[],
    language: string = "en",
    timeoutMs: number = 8000,
  ): Promise<StructuredSummary> {
    const fallbackSummary = (reason: string): StructuredSummary => {
      const urgentItems = items.filter((i) => i.urgent || i.type === "Video" || i.type === "PDF");
      return {
        overview:
          "Operational Queue Synthesis (Deterministic Rule-Based Fallback): 4 pending items cataloged.",
        totalPending: items.length,
        highPriorityCount: urgentItems.length,
        prioritizedItems: items.map((i) => ({
          itemId: i.id,
          itemName: i.name,
          urgency:
            i.urgent || i.type === "Video" || i.type === "PDF"
              ? "HIGH"
              : i.type === "Image"
                ? "MEDIUM"
                : "LOW",
          reason:
            i.type === "Video"
              ? "Perimeter drone flight footage requires continuous boundary telemetry checks."
              : i.type === "PDF"
                ? "IoT hardware specs require ISO 9001 and OSHA safety threshold verification."
                : i.type === "Image"
                  ? "Spatial zone layout requires 15% camera overlap validation."
                  : "Standard operating checklists and technician sign-ins.",
          recommendedAction:
            i.type === "Video"
              ? "Review flight corridor footage and verify UTC telemetry clock sync."
              : i.type === "PDF"
                ? "Check calibration expiration dates against the 30-day policy rule."
                : "Verify metadata and perform checklist sign-off.",
        })),
        topRecommendation:
          "Execute immediate review of 'Level 2 Drone Patrol Video Demo' to prevent flight log expiry.",
        degraded: true,
        fallbackReason: reason,
        generatedAt: new Date().toISOString(),
      };
    };

    return withTimeout(
      async (signal) => {
        if (this.provider === "mock") {
          if (signal.aborted) {
            throw new Error("Operation timed out");
          }
          // Simulate small processing window so microsecond timeouts trigger abort
          await new Promise<void>((resolve, reject) => {
            const timer = setTimeout(() => resolve(), 30);
            signal.addEventListener("abort", () => {
              clearTimeout(timer);
              reject(new Error("Operation timed out"));
            });
          });

          const raw = fallbackSummary("Simulated high-fidelity structured output in mock mode");
          raw.degraded = false;
          delete raw.fallbackReason;
          return StructuredSummarySchema.parse(raw);
        }

        let rawJson = "";

        if (this.provider === "openai" && this.openai) {
          const completion = await this.openai.chat.completions.create(
            {
              model: process.env.OPENAI_MODEL || "gpt-4o",
              response_format: { type: "json_object" },
              messages: [
                { role: "system", content: SUMMARY_PROMPT_V1.buildSystemPrompt(language) },
                { role: "user", content: SUMMARY_PROMPT_V1.buildUserPrompt(items) },
              ],
              temperature: 0.2,
            },
            { signal },
          );

          rawJson = completion.choices[0]?.message?.content || "";
        } else if (this.provider === "anthropic" && this.anthropic) {
          const msg = await this.anthropic.messages.create(
            {
              model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest",
              max_tokens: 1500,
              messages: [
                {
                  role: "user",
                  content: `${SUMMARY_PROMPT_V1.buildSystemPrompt(language)}\n\n${SUMMARY_PROMPT_V1.buildUserPrompt(items)}`,
                },
              ],
            },
            { signal },
          );

          const block = msg.content[0];
          rawJson = block?.type === "text" ? block.text : "";
        }

        if (!rawJson) throw new Error("Empty response returned by LLM");

        // Parse and validate strictly with Zod
        const parsed = JSON.parse(rawJson);
        return StructuredSummarySchema.parse({
          ...parsed,
          degraded: false,
          generatedAt: new Date().toISOString(),
        });
      },
      (err) => fallbackSummary(err.message),
      { timeoutMs, operationName: "Present Summary" },
    );
  }

  // ==========================================
  // ACTION 3: TALK TO ME (STREAMING)
  // ==========================================
  public async streamTalk(
    items: ApprovalItem[],
    history: ChatMessage[],
    userMessage: string,
    res: Response,
    language: string = "en",
  ): Promise<void> {
    const systemPrompt = TALK_PROMPT_V1.buildSystemPrompt(items, language);
    await this.handleStreamWithFallback({
      res,
      operationName: "Talk to me",
      systemPrompt,
      history,
      userMessage,
      fallbackContent: `Based on current queue analysis:
- **Priority 1**: "Level 2 Drone Patrol Video Demo" submitted by Alex HelpAdmin. Drone flights have perimeter safety implications and require UTC telemetry clock sync.
- **Priority 2**: "Safety Equipment & Sensor Specs" submitted by Sam HelpAdmin. IoT vibration/thermal sensors must be verified against ISO 9001 and calibration thresholds (< 30 days must be rejected).
- **Priority 3**: "360° Spatial Zone Layout & Camera Map" submitted by Elena HelpAdmin. Verify 15% camera overlap to prevent blind spots.
- **Priority 4**: "Site Patrol Onboarding & Checklists" for standard routine sign-off.`,
    });
  }

  // ==========================================
  // ACTION 4: HELP ME (RAG-GROUNDED STREAMING)
  // ==========================================
  public async streamHelp(
    userMessage: string,
    res: Response,
    language: string = "en",
  ): Promise<void> {
    const retrievedChunks = ragService.retrieve(userMessage, 3);
    const systemPrompt = RAG_HELP_PROMPT_V1.buildSystemPrompt(retrievedChunks, language);
    const citations = retrievedChunks.map((c) => c.sectionTitle);

    const directFallback = ragService.getDirectPolicyFallback(userMessage);

    await this.handleStreamWithFallback({
      res,
      operationName: "Help me (RAG)",
      systemPrompt,
      history: [],
      userMessage:
        userMessage || "What are the approval criteria for drone patrol videos and sensor specs?",
      citations,
      fallbackContent: directFallback.answer,
    });
  }

  // ==========================================
  // ACTION 5: TEACH ME (STEP-BY-STEP STREAMING)
  // ==========================================
  public async streamTeach(
    step: number,
    history: ChatMessage[],
    userMessage: string,
    res: Response,
    language: string = "en",
  ): Promise<void> {
    const systemPrompt = TEACH_PROMPT_V1.buildSystemPrompt(step, language);
    await this.handleStreamWithFallback({
      res,
      operationName: "Teach me",
      systemPrompt,
      history,
      userMessage: userMessage || "How do I review an approval request in the command centre?",
      fallbackContent: `### OomniEye Standard Approval Procedure (4 Steps):
1. **Step 1 - Inspect Metadata**: Review the submitter, timestamp, and asset type in the Approvals table.
2. **Step 2 - Telemetry Verification**: For drone footage, verify 60fps and 15m–45m altitude limits. For sensors, check ISO 9001 compliance.
3. **Step 3 - Run Checklist**: Ensure all safety items are checked off with zero open alerts.
4. **Step 4 - Sign-off**: Record operational audit notes and click 'Approve' or 'Reject' with justification.

Would you like to practice Step 1 with the Drone Patrol Video?`,
    });
  }

  // ==========================================
  // COMMON RESILIENT SSE STREAM HANDLER
  // ==========================================
  private async handleStreamWithFallback(params: {
    res: Response;
    operationName: string;
    systemPrompt: string;
    history: ChatMessage[];
    userMessage: string;
    fallbackContent: string;
    citations?: string[];
    timeoutMs?: number;
  }): Promise<void> {
    const { res, operationName, systemPrompt, history, userMessage, fallbackContent, citations } =
      params;
    const timeoutMs = params.timeoutMs ?? 8000;

    // Set SSE Headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    const sendEvent = (data: Record<string, unknown>): void => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // If in mock mode, stream tokens naturally with simulated delay
    if (this.provider === "mock") {
      const words = fallbackContent.split(" ");
      for (const word of words) {
        sendEvent({ token: word + " ", degraded: false, citations });
        await new Promise((r) => setTimeout(r, 20));
      }
      sendEvent({ done: true, degraded: false, citations });
      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }

    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      if (this.provider === "openai" && this.openai) {
        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
          { role: "system", content: systemPrompt },
          ...history.map((h) => ({
            role: h.role as "user" | "assistant" | "system",
            content: h.content,
          })),
          { role: "user", content: userMessage },
        ];

        const stream = await this.openai.chat.completions.create(
          {
            model: process.env.OPENAI_MODEL || "gpt-4o",
            messages,
            stream: true,
          },
          { signal: controller.signal },
        );

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            sendEvent({ token: content, degraded: false, citations });
          }
        }
      } else if (this.provider === "anthropic" && this.anthropic) {
        const stream = this.anthropic.messages.stream(
          {
            model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest",
            max_tokens: 1024,
            system: systemPrompt,
            messages: [
              ...history.map((h) => ({
                role: (h.role === "system" ? "user" : h.role) as "user" | "assistant",
                content: h.content,
              })),
              { role: "user", content: userMessage },
            ],
          },
          { signal: controller.signal },
        );

        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            sendEvent({ token: event.delta.text, degraded: false, citations });
          }
        }
      }

      clearTimeout(timeoutTimer);
      sendEvent({ done: true, degraded: false, citations });
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (err) {
      clearTimeout(timeoutTimer);
      const error = err instanceof Error ? err : new Error(String(err));
      console.warn(
        `[Graceful Degradation] ${operationName} stream interrupted: "${error.message}". Emitting fallback chunk.`,
      );

      // Never crash or leave stream open; emit graceful fallback notice
      sendEvent({
        token: `\n\n*(Notice: AI response took longer than 8s or encountered a network delay. Showing operational fallback)*:\n\n${fallbackContent}`,
        degraded: true,
        done: true,
        citations,
      });
      res.write("data: [DONE]\n\n");
      res.end();
    }
  }
}

export const llmService = new LlmService();
