# System Design & Implementation Notes: OomniEye Approvals Assistant

## 1. Project Overview & Architecture

The **OomniEye Approvals Assistant** is an interactive copilot embedded in an approvals workflow dashboard. It assists operations technicians with prioritizing pending queue items, answering policy questions against standard operating procedures, and walking through multi-step review protocols.

### High-Level Architecture
- **Client**: Next.js 14 App Router, React 18, Tailwind CSS, Zustand for chat and streaming state management. Consumes Server-Sent Events (SSE) via the Fetch API `ReadableStream` interface.
- **Server**: Node.js, Express, TypeScript (strict mode). Encapsulates prompt templates, retrieval logic, rate limiting, and timeout guards.
- **Shared Contracts**: Single source of truth in `packages/shared` defining Zod validation schemas for request bodies, approvals items, and structured LLM outputs.

---

## 2. Core Decisions & LLM Integration Strategy

| Feature | Primary Function | Model Interaction | Fallback Behavior |
| :--- | :--- | :--- | :--- |
| **Present me Summary** | Risk ranking & prioritization | Structured JSON output validated with Zod | Priority heuristic sort (video/sensor first) with standard recommendations |
| **Talk to me** | Conversational queue queries | SSE token-by-token streaming | Contextual queue status message with recommended actions |
| **Help me** | Grounded policy search & Q&A | In-memory chunk retrieval over `approvalPolicy.md` | Direct text excerpts of matching policy sections |
| **Teach me** | Interactive onboarding | Multi-step tutorial dialogue | 4-step checklist review procedure |
| **Replay Greeting** | Dynamic shift briefing | Single-sentence contextual summary | Templated greeting with queue and urgent item counts |

---

## 3. Resilience & Timeout Handling

External LLM APIs introduce latency variability and network transient errors. To protect the operator experience:

1. **8-Second Timeout Guard**:
   Every LLM request is bounded using `withTimeout`, which wraps execution in an `AbortController` (8,000ms max).
2. **Deterministic Fallbacks**:
   When an operation aborts or throws an error (e.g. rate limit exceeded, missing API key, network timeout), the server catches the failure, logs a warning, flags the response as `degraded: true`, and returns local fallback data.
3. **No Unhandled 500s**:
   The client receives structured fallback data or an event stream with a degradation notice rather than an empty screen or frozen UI.

---

## 4. Policy Retrieval (RAG)

Operational Q&A under the "Help me" feature is grounded in `approvalPolicy.md`:
- The policy document is chunked on startup into logical sections (Drone Patrol Video Standards, Sensor & Safety Sign-offs, Spatial Zone Overlaps, Escalation SLAs).
- When a user submits a query, `RagService.retrieve()` normalizes query tokens and scores chunks by term frequency with heading boosts.
- Only excerpts matching relevance thresholds are passed to the system prompt with strict instructions not to hallucinate beyond the provided text.
- If a query has no matching policy keywords, the system returns clear suggestions on available policy topics.

---

## 5. Testing Strategy

1. **Unit Tests**:
   - Verify prompt construction logic across language and item parameters.
   - Test Zod validation rules against valid and intentionally malformed payloads.
   - Verify `llmService` mock output and timeout fallback behavior.
2. **Integration Tests (Supertest)**:
   - Validate HTTP status codes and response bodies across `/api/approvals` and `/api/assistant/*`.
   - Verify SSE streaming headers (`Content-Type: text/event-stream`) and token event formatting.
3. **Component Tests (Vitest + React Testing Library)**:
   - Test initial assistant widget rendering and action buttons.
   - Verify loading spinner during summary generation.
   - Test incremental token updates and error banners.
