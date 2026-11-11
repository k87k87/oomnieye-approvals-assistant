# OomniEye Approvals Assistant

A fullstack application for the **OomniEye Approvals Assistant** panel, built with Next.js 14, Express, TypeScript, and Tailwind CSS. The assistant provides contextual summaries, conversational reasoning, grounded policy search, and onboarding guides over pending approval items, with streaming responses and deterministic fallbacks.

---

## 1. Overview

The assistant sits alongside an operator's approvals workflow to help review, prioritize, and verify items in the queue:

- **Token Streaming UI**: Responses stream progressively over Server-Sent Events (SSE) using a `ReadableStream` reader on the client.
- **Contract Enforcement with Zod**: API payloads, query responses, and structured LLM outputs are validated against shared Zod schemas (`@oomnieye/shared`).
- **Grounded Policy Retrieval (RAG)**: The "Help me" action retrieves matching excerpts from `approvalPolicy.md` to keep answers strictly grounded in official operating procedures.
- **Resilience & Graceful Degradation**: Calls to LLM providers are guarded by an 8-second `AbortController` timeout. If a call times out, encounters a rate limit, or lacks API credentials, the system falls back to rule-based data (`degraded: true`) instead of failing with a 500 or leaving the UI hanging.
- **Provider Support**: Works with Google Gemini, OpenAI, Anthropic Claude, or in mock mode out-of-the-box for local development without API keys.

---

## 2. Architecture & Tech Stack

```
                   ┌────────────────────────────────────────┐
                   │    Next.js 14 Client (Port 3000)       │
                   │  - Tailwind CSS + Lucide Icons         │
                   │  - Zustand Store (chat, stream state)  │
                   │  - SSE ReadableStream Consumer         │
                   └──────────────────┬─────────────────────┘
                                      │ HTTP / Server-Sent Events
                                      ▼
                   ┌────────────────────────────────────────┐
                   │      Express API Server (Port 5000)     │
                   │  - TypeScript (Strict Mode)            │
                   │  - express-rate-limit                  │
                   │  - withTimeout (8s AbortController)    │
                   │  - Prompts & Retrieval Layer           │
                   └──────┬──────────────────────┬──────────┘
                          │                      │
             In-Memory Retrieval           LLM Provider Layer
                          ▼                      ▼
               ┌──────────────────────┐┌──────────────────────┐
               │  RagService          ││ Gemini / OpenAI /    │
               │  (approvalPolicy.md) ││ Claude / Local Mock  │
               └──────────────────────┘└──────────────────────┘
                          ▲                      ▲
                          └──────────┬───────────┘
                                     │
                        ┌────────────────────────┐
                        │ Shared Zod Contracts   │
                        │ (@oomnieye/shared)     │
                        └────────────────────────┘
```

| Layer | Technologies | Notes |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React 18 | Approvals queue table, telemetry preview, and floating assistant widget. |
| **Styling** | Tailwind CSS | Modern command-center layout with glassmorphism and status indicators. |
| **State** | Zustand | Manages chat history, streaming token buffers, and view transitions. |
| **Backend** | Node.js, Express, TypeScript | Modular API with separated controllers, services, and middlewares. |
| **Contracts** | Zod | Single source of truth for request, response, and structured summary shapes. |
| **AI / LLM** | Gemini / OpenAI / Claude / Mock | Configurable via environment variables with built-in mock fallback. |
| **Retrieval** | In-Memory Token Scoring | Section chunking and keyword relevance matching over operational policy. |
| **Resilience** | `withTimeout` (8s timeout) | AbortSignal-based wrapper providing deterministic fallback data. |
| **Testing** | Vitest, Supertest, React Testing Library | Unit, API integration, and component tests. |

---

## 3. Design Decisions & AI Trade-offs

When designing an approvals assistant for an operations workflow, choosing where to rely on an LLM versus where deterministic logic is better is a critical decision:

- **Where AI is necessary**: **Talk to me** (open-ended chat) and **Present me Summary** (risk synthesis) genuinely require language model capabilities. Sorting algorithms alone cannot evaluate nuanced operational risk across changing asset types, submitter roles, and perimeter safety rules. Free-form queries such as *"Which of these needs my attention first and why?"* demand semantic reasoning over the entire queue.
- **Where AI is bounded (RAG)**: For **Help me**, operators need strict compliance answers, not creative prose. An in-memory retrieval step searches `approvalPolicy.md` chunks for relevant criteria (e.g. 60fps drone recording, ISO 9001 sensor calibration, 15% camera overlap) and injects only matching text into the prompt with guardrails against extrapolation.
- **Where AI is optional**: Features like **Replay Greeting** can use an LLM for natural variation, but a templated fallback referencing pending item counts achieves nearly the same utility with zero latency.
- **Fallback Strategy**: LLMs can stall, hit rate limits, or lose network connectivity. Wrapping every external call in an 8-second `AbortController` ensures that if a provider stalls, the server immediately returns deterministic rule-based results (`degraded: true`). The UI surfaces a subtle notification rather than showing an error screen.
- **What to improve next**: With additional time, we would move from keyword-based chunk scoring to dense vector embeddings using `pgvector`, add WebSocket streams for real-time queue synchronization across operators, and connect the Approve/Reject actions to an event bus or backend database.

---

## 4. Assistant Actions & Fallbacks

| Action | Trigger | LLM Behavior | Graceful Fallback (Timeout / Error) |
| :--- | :--- | :--- | :--- |
| **Present me Summary** | "Present me Summary" Card | Structured JSON analyzing risk and ranking items by urgency score. | Rule-based sorting prioritizing videos/sensors with canned action advice. |
| **Talk to me** | "Talk to me" Card | Multi-turn streaming conversation over queue items and priority questions. | Contextual summary message with standard recommended next steps. |
| **Help me** | "Help me" Card | Q&A grounded strictly in policy documentation; returns section citations. | Direct excerpt retrieval from matching `approvalPolicy.md` sections. |
| **Teach me** | "Teach me" Card | Interactive 4-step walkthrough for reviewing approvals; adapts to questions. | 4-step SOP guide with checklist requirements. |
| **Replay Greeting** | Refresh Icon in Header | Brief dynamic greeting reflecting pending item counts and high-priority items. | Canned template referencing total and high-priority item counts. |

---

## 5. Getting Started

### Prerequisites
- Node.js `v18+` or `v20+` (tested on Node v22).
- npm `v9+` or `v10+`.

### 1. Installation
```bash
git clone <repository-url>
cd oomnieye-approvals-assistant
npm install
```

### 2. Environment Setup (Optional)
The project runs **out of the box with local mock responses** if no API keys are provided. To connect a live LLM provider, create a `.env` file in `packages/server`:

```bash
cp packages/server/.env.example packages/server/.env
```

Example configuration (`packages/server/.env`):
```env
PORT=5000
CLIENT_ORIGIN=http://localhost:3000

# Provider options: "gemini" | "openai" | "anthropic" | "mock"
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

### 3. Running Locally
Start both backend (port 5000) and frontend (port 3000) from the root:
```bash
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 6. Testing

The project includes unit, integration, and component test suites:

```bash
# Run all workspace tests
npm test

# Run individual suites
npm run test:unit         # Server prompt and Zod schema tests
npm run test:integration  # Express + Supertest endpoint tests
npm run test:component    # Frontend Vitest + React Testing Library tests
```

### Test Coverage Summary:
- **`prompts.test.ts`**: Checks prompt builders, required variables, and verifies that `StructuredSummarySchema` rejects malformed JSON shapes.
- **`llmServiceMock.test.ts`**: Verifies greeting generation, structured summaries, and checks that a 1ms timeout triggers the graceful fallback path cleanly.
- **`assistant.api.test.ts`**: Tests `GET /api/approvals`, `GET /api/assistant/greeting`, `POST /api/assistant/summary`, and SSE streaming via `POST /api/assistant/chat`.
- **`AssistantWidget.test.tsx`**: Tests initial widget rendering, loading states during summary generation, token streaming, and fallback notices on error.

---

## 7. Project Structure

```
oomnieye-approvals-assistant/
├── packages/
│   ├── shared/                      # Shared types & Zod schemas
│   │   ├── src/contracts/           # approvals, chat, and summary schemas
│   │   └── src/index.ts
│   │
│   ├── server/                      # Express backend
│   │   ├── src/controllers/         # approvals and assistant route controllers
│   │   ├── src/data/                # approvalsQueue.json & approvalPolicy.md
│   │   ├── src/middlewares/         # rate limiting & request validation
│   │   ├── src/prompts/             # system & user prompt templates
│   │   ├── src/routes/              # Express API route definitions
│   │   ├── src/services/ai/         # LLM provider adapter & SSE streaming
│   │   ├── src/services/rag/        # in-memory chunking & keyword search
│   │   ├── src/utils/               # withTimeout utility
│   │   └── tests/                   # unit and integration tests
│   │
│   └── client/                      # Next.js frontend
│       ├── src/app/                 # App Router page & layout
│       ├── src/components/assistant/# floating assistant widget components
│       ├── src/components/dashboard/# approvals table and preview panels
│       ├── src/services/            # api client for fetching & SSE streaming
│       ├── src/store/               # Zustand assistant state store
│       └── tests/                   # React Testing Library component tests
│
├── IMPLEMENTATION_PLAN.md           # Architecture and technical design notes
└── README.md
```
