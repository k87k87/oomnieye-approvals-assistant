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

    // Return topK chunks (ensuring at least the most relevant is returned)
    const top = scored.slice(0, topK);
    // If all scores were 0, return the first 2 chunks so model has grounding
    if (top.every((t) => t.relevanceScore === 0)) {
      return this.chunks.slice(0, 2).map((c) => ({
        sectionTitle: c.sectionTitle,
        content: c.content,
        relevanceScore: 0.5,
      }));
    }

    return top;
  }

  /**
   * Deterministic fallback when AI is unavailable or timed out
   */
  public getDirectPolicyFallback(query: string): { answer: string; citations: string[] } {
    const relevant = this.retrieve(query, 2);
    const citations = relevant.map((r) => r.sectionTitle);

    const answer = relevant.map((r) => `### [${r.sectionTitle}]\n${r.content}`).join("\n\n");

    return {
      answer: `*Policy Document Reference (Direct Retrieval)*:\n\n${answer}`,
      citations,
    };
  }
}

export const ragService = new RagService();
