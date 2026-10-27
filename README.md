# OomniEye Approvals AI Assistant · Digital Twin Command Centre
**Assessment**: Sr. Fullstack Developer — MERN + AI (Wave 2 Technical Take-Home)  
**Target UI**: OomniEye Digital-Twin Approvals & Review Assistant Panel  

---

## 1. Project Overview

This repository is a production-grade fullstack web application rebuilding the **OomniEye Digital-Twin Approvals Assistant** panel. The assistant lives inside an operator's approvals workflow, where every user action is powered by a genuine server-side Large Language Model (LLM) decision layer (supporting OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, and a zero-config high-fidelity mock provider for cost-free review).

Key capabilities implemented:
- **Token-by-Token Streaming UI**: AI responses stream progressively via Server-Sent Events (SSE) with real-time token rendering—no spinner-then-dump.
- **Strict Zod Contracts**: All API requests, responses, and structured LLM outputs are validated with Zod prior to reaching the UI.
- **In-Memory RAG Grounding**: Operational Q&A for *"Help me"* is grounded strictly in a 300-word maintenance policy document over 4 section chunks.
- **8-Second Timeout & Graceful Degradation**: Every LLM call is governed by an `AbortController` timeout (8s max) that catches stalled calls, key failures, or rate limits, degrading into deterministic rule-based fallbacks rather than raw 500s or frozen UIs.
- **Test-First Discipline (TDD)**: 19 automated tests spanning Vitest unit tests, Supertest integration tests, and React Testing Library component tests.
- **Git Safety Automation**: Husky git hooks enforcing linting, formatting, conventional commit messages, and automated pre-push test suites.

---

## 2. Architecture & Tech Stack

```
                   ┌────────────────────────────────────────┐
                   │    Next.js 14 Client (Port 3000)       │
                   │  - Tailwind CSS + Glassmorphism Theme  │
                   │  - Zustand Conversation & Stream Store │
                   │  - SSE ReadableStream Consumer         │
                   └──────────────────┬─────────────────────┘
                                      │ HTTP / Server-Sent Events
                                      ▼
                   ┌────────────────────────────────────────┐
                   │      Express API Server (Port 5000)     │
                   │  - TypeScript Strict Mode              │
                   │  - express-rate-limit Throttling       │
                   │  - withTimeout (8s AbortController)    │
                   │  - Versioned Prompts (/prompts/*.ts)   │
                   └──────┬──────────────────────┬──────────┘
                          │                      │
             In-Memory Retrieval           LLM Decision Layer
                          ▼                      ▼
               ┌──────────────────────┐┌──────────────────────┐
               │  RagService          ││ OpenAI / Anthropic   │
               │  (approvalPolicy.md) ││ / High-Fidelity Mock │
               └──────────────────────┘└──────────────────────┘
                          ▲                      ▲
                          └──────────┬───────────┘
                                     │
                        ┌────────────────────────┐
                        │ Shared Zod Contracts   │
                        │ (@oomnieye/shared)     │
                        └────────────────────────┘
```

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router) + React 18 | High-fidelity OomniEye Digital Twin Approvals UI and floating assistant widget. |
| **Styling** | Tailwind CSS + CSS Modules | Glassmorphism, animations, custom scrollbars, and digital-twin preview overlays. |
| **State** | Zustand | Multi-turn chat session, streaming token buffers, and UI view transitions. |
| **Backend** | Node.js + Express (TypeScript Strict) | Decoupled API server with native Supertest integration testability. |
| **Contracts** | Zod (`zod`) | OpenAPI-first validation of requests, responses, and LLM structured JSON. |
| **AI / LLM** | OpenAI GPT-4o / Claude 3.5 Sonnet | Server-side only via official SDKs, with zero-config high-fidelity mock mode. |
| **RAG** | In-Memory Token Relevance Search | Chunking and similarity retrieval over 300-word operational policy. |
| **Resilience** | `withTimeout` (8s) | Prevents UI freeze; ensures graceful deterministic degradation. |
| **Safety** | Husky + lint-staged + commitlint | Pre-commit linting, formatting, conventional commits, pre-push test execution. |
| **Testing** | Vitest + Supertest + RTL | Unit, Integration, and Component test suites. |

---

## 3. Architecture & AI Judgment Essay (150–250 Words)

> ### AI-Necessary vs. AI-Unnecessary Breakdown, Fallbacks & Future Trade-offs
>
> In high-stakes command centres, deploying an LLM requires rigorous operational judgment. We classify **Talk to me** and **Present me Summary** as **AI-necessary**: free-form conversational reasoning over dynamic queue attributes and contextual risk synthesis (weighing flight safety against calibration expirations) require semantic reasoning that static heuristics fail to capture. For **Help me**, AI is **high-value but bounded**: the model must synthesize natural explanations, but general knowledge is disabled in favor of strict RAG grounding in the maintenance policy document. Conversely, **Replay Greeting** is **AI-unnecessary/augmented**: while generating context-aware greetings adds polish, deterministic templates referencing queue counts achieve 90% of the utility with zero latency or API cost.
>
> **Fallback Design**: Network latency and LLM outages are inevitable. Every AI call is wrapped with an `AbortController` capped at 8,000ms. If an API key is revoked, rate limits trip, or the timeout fires, the system catches the error, marks the response as `degraded: true`, and returns deterministic rule-based output (e.g. sorting videos/sensors to high priority, or returning verbatim policy chunks). The UI immediately presents a non-intrusive fallback badge without throwing raw 500s or freezing.
>
> **What We'd Do Differently With More Time**: We would replace in-memory keyword retrieval with a persistent vector database (`pgvector` via PostgreSQL) using dense semantic embeddings, add full WebSocket bidirectional telemetry streaming, and implement live approval action mutations (Approve/Reject) syncing directly into digital-twin hardware.

---

## 4. The 5 Core AI Entry Points & Fallback Matrix

| Entry Point | UI Trigger | Real LLM Behavior | AI Necessity | Graceful Fallback (8s Timeout / Key Failure) |
| :--- | :--- | :--- | :--- | :--- |
| **1. Present me Summary** | "Present me Summary" Card | Structured JSON analysis ranking items by urgency score & operational risk. | **AI-Necessary** | Rule-based sort (Video/PDF prioritized) + deterministic action advice. |
| **2. Talk to me** | "Talk to me" Card | Multi-turn streaming dialogue (e.g., *"Which of these needs my attention first?"*). | **AI-Necessary** | Contextual queue status message with standard action prompts. |
| **3. Help me** | "Help me" Card | Q&A grounded in `approvalPolicy.md` chunks; returns section citations. | **High-Value Bounded AI** | Direct excerpt retrieval of matching policy sections. |
| **4. Teach me** | "Teach me" Card | Step-by-step interactive onboarding for new operators; adapts to questions. | **Partially AI-Necessary** | Deterministic 4-step SOP walkthrough with interactive checklists. |
| **5. Replay Greeting** | Top-right Refresh Button | Context-aware greeting referencing current pending item counts and types. | **AI-Augmented** | Dynamic template: *"Welcome back, Operator. You have 4 pending requests."* |

---

## 5. Quickstart & Installation

### Prerequisites
- Node.js `v18+` or `v20+` (tested on Node v24).
- npm `v9+` or `v10+`.

### 1. Clone & Install Dependencies
```bash
git clone <your-repo-url>
cd Assessment
npm install
```
*(Husky hooks are automatically configured on install).*

### 2. Configure Environment Variables (Optional)
The project runs **out of the box in High-Fidelity Mock Mode** with zero configuration required. To connect live Google Gemini, OpenAI, or Anthropic keys:
```bash
cp packages/server/.env.example packages/server/.env
```
Edit `packages/server/.env`:
```env
PORT=5000
CLIENT_ORIGIN=http://localhost:3000

# Select provider: "gemini" | "openai" | "anthropic" | "mock"
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

### 3. Run Development Servers
From the root directory, start both Backend (Port 5000) and Frontend (Port 3000) with a single command:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 6. Automated Testing Verification (TDD)

Per the assignment specification, tests cover Unit, Integration (Supertest), and Component levels, specifically validating schema enforcement, token streaming, and 8-second timeout fallbacks.

Run the entire monorepo test suite with one command:
```bash
npm test
```

### Individual Test Suites:
```bash
# 1. Run Server Unit Tests (Prompt templates & Zod schema validation)
npm run test:unit

# 2. Run Server Integration Tests (Supertest endpoint & 8s timeout fallback)
npm run test:integration

# 3. Run Frontend Component Tests (Vitest + React Testing Library)
npm run test:component
```

### Test Coverage Highlights:
- **`prompts.test.ts`**: Verifies versioned prompt templates inject queue metadata, and verifies that `StructuredSummarySchema` strictly rejects malformed AI outputs, preventing silent LLM format errors.
- **`llmServiceMock.test.ts`**: Verifies that forced 1ms timeouts trigger the `withTimeout` graceful degradation path without throwing unhandled exceptions.
- **`assistant.api.test.ts` (Supertest)**: Verifies `GET /api/assistant/greeting`, `POST /api/assistant/summary` (Zod structured response), and `POST /api/assistant/chat` (SSE event-stream headers and chunks).
- **`AssistantWidget.test.tsx` (RTL)**: Verifies initial render of the 4 cards, loading state spinner, token-by-token streaming, and visible error banner rendering.

---

## 7. Code Quality & Production Standards

- **Strict TypeScript**: `"strict": true`, `"noImplicitAny": true`, `"noUnusedParameters": true` across all packages.
- **Shared Contracts (`packages/shared`)**: Single source of truth for Zod contracts and inferred types.
- **Global Error Handling**: Custom `AppError` hierarchy (`ValidationError`, `TimeoutError`, `RateLimitExceededError`, `LLMServiceError`) with clean JSON serialization.
- **Rate Limiting**: `express-rate-limit` configured on all `/api/assistant/*` endpoints.
- **Husky & Git Automation**:
  - `pre-commit`: Runs `lint-staged` with Prettier formatting and `tsc --noEmit`.
  - `commit-msg`: Validates conventional commit standard.
  - `pre-push`: Runs automated test suite.

---

## 8. AI-Augmented Workflow & Tool Usage

Per the Take-Home logistics guidance (§7), modern engineering pairs human judgment with AI acceleration:
- **Architecture & Schema Design**: Used AI assistants to draft and stress-test initial Zod contract boundaries between client and server, ensuring strict type-safety across SSE event boundaries.
- **Adversarial Test Generation**: Formulated edge-case test payloads (e.g. malformed LLM responses with missing counts, microsecond timeouts triggering `AbortController`, and invalid action enums) to verify our graceful degradation guarantees.
- **RAG Policy & Prompt Engineering**: Crafted versioned system prompts (`/prompts/*.ts`) and chunking boundaries for `approvalPolicy.md` to ensure zero hallucinations and deterministic policy citations.
- **Full Review & Verification**: Every line of code, test case, and configuration was human-reviewed, audited for TypeScript strictness, and executed locally across all workspaces.
