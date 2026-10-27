import fs from "fs";
import path from "path";
import { RetrievedPolicyChunk } from "../../prompts/ragHelp.prompt.v1";

export interface PolicyChunk {
  id: string;
  sectionTitle: string;
  content: string;
  keywords: string[];
}

export class RagService {
  private chunks: PolicyChunk[] = [];

  constructor() {
    this.ingestPolicyDocument();
  }

  private ingestPolicyDocument(): void {
    try {
      const filePath = path.resolve(__dirname, "../../data/approvalPolicy.md");
      const content = fs.readFileSync(filePath, "utf-8");

      // Split into logical sections by markdown heading (## Section)
      const sections = content.split(/^## /gm).filter(Boolean);

      this.chunks = sections.map((sec, idx) => {
        const firstLineEnd = sec.indexOf("\n");
        const title =
          firstLineEnd !== -1 ? sec.substring(0, firstLineEnd).trim() : `Policy Section ${idx + 1}`;
        const body = firstLineEnd !== -1 ? sec.substring(firstLineEnd).trim() : sec.trim();

        // Extract normalized keywords from title and body
        const rawWords = `${title} ${body}`
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, " ")
          .split(/\s+/)
          .filter((w) => w.length > 2);
        const keywords = Array.from(new Set(rawWords));

        return {
          id: `chunk-00${idx + 1}`,
          sectionTitle: title,
          content: body,
          keywords,
        };
      });
    } catch (err) {
      console.error("[RagService] Failed to ingest approvalPolicy.md:", err);
      this.chunks = [];
    }
  }

  public getChunks(): PolicyChunk[] {
    return this.chunks;
  }

  /**
   * Performs in-memory token/term relevance scoring across policy chunks
   */
  public retrieve(query: string, topK: number = 3): RetrievedPolicyChunk[] {
    if (!query || query.trim().length === 0) {
      // If no query specified, return top sections by default
      return this.chunks.slice(0, topK).map((c) => ({
        sectionTitle: c.sectionTitle,
        content: c.content,
        relevanceScore: 1.0,
      }));
    }

    const queryTokens = query
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2);

    const scored = this.chunks.map((chunk) => {
      let matchCount = 0;
      for (const token of queryTokens) {
        if (chunk.keywords.includes(token)) {
          matchCount += 1;
        }
        // Boost if title matches
        if (chunk.sectionTitle.toLowerCase().includes(token)) {
          matchCount += 2;
        }
      }

      const score = queryTokens.length > 0 ? matchCount / queryTokens.length : 0;
      return {
        sectionTitle: chunk.sectionTitle,
        content: chunk.content,
        relevanceScore: score,
      };
    });

    // Sort descending by relevance score
    scored.sort((a, b) => b.relevanceScore - a.relevanceScore);

    const maxScore = scored[0]?.relevanceScore || 0;

    // Only return chunks with strong relevance (above 0.35 and within 50% of top score)
    const matching = scored.filter(
      (s) => s.relevanceScore >= 0.35 && s.relevanceScore >= 0.5 * maxScore,
    );
    if (matching.length > 0) {
      return matching.slice(0, topK);
    }

    // If all scores were below threshold (unrelated query like "dd"), return chunks with relevanceScore = 0
    return this.chunks.slice(0, 2).map((c) => ({
      sectionTitle: c.sectionTitle,
      content: c.content,
      relevanceScore: 0,
    }));
  }

  /**
   * Deterministic fallback when AI is unavailable, rate-limited, or query needs direct policy excerpt
   */
  public getDirectPolicyFallback(query: string): { answer: string; citations: string[] } {
    const relevant = this.retrieve(query, 2);
    // Only cite sections that actually matched
    const citations = relevant.filter((r) => r.relevanceScore > 0).map((r) => r.sectionTitle);

    const queryClean = (query || "").trim();
    const queryTokens = queryClean
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2);

    const hasMatches = citations.length > 0;

    // If query is gibberish (e.g., "dd"), greeting, or has zero policy keyword matches:
    if (!hasMatches || queryTokens.length === 0) {
      return {
        answer: `Hello, Operator. I am grounded strictly in the **OomniEye Digital Twin Approval & Maintenance Policy (Rev 2.4)**.\n\nI couldn't find a direct policy section matching "${queryClean}". You can ask me operational policy questions such as:\n\n• **Drone Patrol Flight Rules**: *"What are the altitude and fps verification criteria for Level 2 Drone Videos?"*\n• **Sensor Calibration**: *"When should IoT vibration and thermal sensor specs be rejected?"*\n• **Camera Blind Spots**: *"What is the required field-of-view overlap for spatial zone camera layouts?"*\n• **Supervisor Escalation**: *"What is the 48-hour auto-escalation policy?"*`,
        citations: [], // No citations for unmatched queries
      };
    }

    const answer = relevant
      .filter((r) => r.relevanceScore > 0)
      .map((r) => `### [${r.sectionTitle}]\n${r.content}`)
      .join("\n\n");

    return {
      answer: `*Policy Document Reference (Grounded Retrieval)*:\n\n${answer}`,
      citations,
    };
  }
}

export const ragService = new RagService();
