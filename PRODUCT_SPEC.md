# Cedar News Copilot

Electron overlay app powered by **CedarOS** (React UI), **Mastra** (agent/workflow orchestrator), and **Perplexity API** (grounded answers with citations). Delivers in-context explanations for web articles and videos, plus recommendations and a compact “wiki card” for highlighted text.

---

## 1) Product overview

**Problem**: News readers/viewers get stuck on unfamiliar terms, claims, or context, and breaking flow to search ruins comprehension.

**Solution**: A desktop overlay that sits above any app. Press a hotkey or speak, and get:

* **Cedar Brief**: a concise, cited answer tailored to the page/video you’re on.
* **Highlight → Explain**: select text anywhere and get a Wikipedia‑style summary.
* **Video explainers**: ask about the current segment; we fetch captions or transcribe a short clip.
* **Recommendations**: 2–4 related articles/concepts to save for later.

**Non‑goals (MVP)**: long‑form RAG notebooks, full‑page scraping by default, account sync (optional), in‑page DOM modification (use optional companion extension if needed).

---

## 2) Primary user stories

1. **While reading**: “What does ‘Section 702 reauthorization’ mean?” → Press `Cmd/Ctrl+Shift+V`, speak the question → overlay returns a Cedar Brief with citations.
2. **Highlight → Explain (1a)**: User selects a paragraph → `Cmd/Ctrl+Shift+/` → inline tooltip shows a short neutral summary + links; user can expand into full panel.
3. **While watching video**: “Explain what they mean at 02:13 about bond yields.” → overlay pulls transcript around timestamp (or transcribes a 4–6s window) → Cedar Brief.
4. **Recommendations**: After any brief, the panel shows related reads. User can **Pin** to the local library.

---

## 3) UX & controls

* **Overlay window**: transparent, frameless, always-on-top; slide-in side panel (left/right), plus a minimal **inline tooltip**.
* **Global hotkeys** (configurable):

  * Voice ask: `Cmd/Ctrl+Shift+V`
  * Highlight → Explain: `Cmd/Ctrl+Shift+/`
  * Open/Close panel: `Cmd/Ctrl+Shift+Space`
* **Tray menu**: mic toggle, privacy toggle (no audio capture), “Hide overlay,” quit.
* **A11y**: full keyboard navigation, focus traps, TTS playback of any brief.

---

## 4) Architecture (high level)

```
+-------------------+           +---------------------+
|  Electron Main    |  IPC      |  Mastra Worker      |
|  (Node)           +---------->+  (Node/TS)          |
|  - windows        |           |  - agent runtime    |
|  - global hotkeys |<----------+  - tools (Perplexity|
|  - desktopCapture |  IPC      |    STT, captions)   |
+----+--------------+           +----------+----------+
     |                                     ^
     | BrowserWindow (Renderer)            | HTTP/SDK
     v                                     |
+----+-------------------------------------+--------+
|  CedarOS Panel (React/TS)                         |
|  - query composer & UI state (Zustand)            |
|  - inline Tooltip & Recommendations               |
|  - TTS playback                                   |
+---------------------------------------------------+

(Optional) Companion Browser Extension → for exact page selection/URL metadata
```

**Processes**

* **Renderer**: CedarOS React UI; never holds API keys.
* **Main**: user input, screen/mic capture, global shortcuts, key storage.
* **Mastra worker**: agent orchestration; owns all outbound API calls.

---

## 5) Data contracts (shared)

### 5.1 `Brief` (primary output)

```ts
export type Citation = { title: string; url: string; publisher?: string; publishedAt?: string };
export type Brief = {
  id: string;                    // uuid
  query: string;                 // user question or inferred topic
  context?: { url?: string; title?: string; timestampSec?: number };
  title: string;                 // headline for the brief
  summary: string;               // 2–4 sentence neutral summary
  bullets: string[];             // 3–7 concise takeaways
  citations: Citation[];         // unique, deduped
  createdAt: string;             // ISO string
};
```

### 5.2 IPC request/response

```ts
export type AskRequest = {
  query: string;
  mode: 'article' | 'video' | 'highlight';
  selectionText?: string;   // when mode==='highlight'
  context?: { url?: string; title?: string; timestampSec?: number };
};

export type AskResponse = { ok: true; brief: Brief } | { ok: false; error: string };
```

---

## 6) Mastra tools (minimum viable set)

1. **`perplexitySearch({ query, context }) → { answer, citations[] }`**

   * Input: user query plus optional page/video context (url/title/time, small excerpt)
   * Output: distilled answer + normalized citations `{title,url,publisher,date}`
   * Notes: Keep prompts short, ask for concise, source-linked facts; dedupe citations.

2. **`summarizeSelection({ text, url }) → { title, summary, bullets[], citations[] }`**

   * Input: raw selected text, optional source url
   * Behavior: neutral, Wikipedia-like tone; include 2–4 relevant links if available.

3. **`getTranscriptSlice({ url, t0, t1 }) → { text }`**

   * Strategy: prefer official caption tracks (YouTube/Vimeo). If missing, record a short audio window (user‑approved) and run STT.

4. **`recommendNext({ topic, recent[] }) → { cards: { title, url }[] }`**

   * Input: current brief/topic and lightweight history
   * Output: 2–4 cards with links (deduped against recent).

> The agent composes a `Brief` from these tool outputs and returns it over IPC.

---

## 7) Electron shell details

* **Overlay window**: `{ transparent:true, frame:false, alwaysOnTop:true, skipTaskbar:true }`.
* **Click-through toggle**: `setIgnoreMouseEvents(true, { forward: true })` for peek-through mode.
* **Global shortcuts**: register on app ready; unregister on quit.
* **desktopCapturer**: for video mode timestamp context; privacy gate for any audio capture.
* **Key storage**: `keytar` for API secrets; `electron-store` for prefs (hotkeys, privacy flags).

---

## 8) Context capture strategies

* **Articles**: without extension, use clipboard-based selection (hotkey triggers `Cmd/Ctrl+C`, read clipboard, then clear). With extension, send exact selection HTML, URL, and title.
* **Videos**: identify active video window heuristically; user hits “Explain this part” → capture ±3–5s transcript.

---

## 9) Persistence

* **SQLite (better-sqlite3)**: tables `briefs`, `recommendations`, `history`, `settings`.
* **FTS5** over `briefs(summary+bullets)` for local search.
* **Pins**: mark any brief as saved; export to Markdown.

---

## 10) Privacy & safety

* Default to **selection‑only** + URL; never scrape full DOM automatically.
* Show “Summarizing…” indicator and a **Stop** button for all long operations.
* Configurable **no-audio** mode (global).
* Clear clipboard after Highlight → Explain (opt‑in behavior noted in settings).

---

## 11) Telemetry & performance

* **PostHog** events: `ask_started`, `ask_completed`, `ask_failed`, `stt_started/ended`, `tooltip_opened`, `panel_toggled`.
* **Sentry** for crash reports (main/renderer/worker).
* **Perf targets**: tooltip < 600ms to visible, voice ask < 3.5s to first token, brief render < 120ms after data.

---

## 12) Environment variables

```
# Agent
PERPLEXITY_API_KEY=...
# Optional STT
DEEPGRAM_API_KEY=...        # if using Deepgram streaming
# Optional extras
OPENAI_API_KEY=...          # (fallback paraphrase or future)
SENTRY_DSN=...
POSTHOG_API_KEY=...
APP_ENV=development|production
```

---

## 13) Monorepo layout & build

```
repo/
  apps/
    desktop/           # Electron Main + Renderer (CedarOS panel)
    agent/             # Mastra worker (tools & orchestration)
  packages/
    shared/            # types: Brief, IPC contracts, schemas
  .vscode/
  package.json         # pnpm workspaces
```

* **Renderer**: Vite + React + Tailwind + shadcn.
* **Agent**: tsup build; exports `startAgent()`; listens on stdio/IPC.
* **Main**: electron-builder packaging, auto‑updates.

---

## 14) Prompts (high-level intent, used inside tools)

* **Perplexity Q&A**: “Answer concisely for a reader currently on {title/url}. Cite sources (2–5). If uncertain, say so.”
* **Selection summary**: “Neutral, Wikipedia‑style; define key terms; include 2–4 links to reputable sources.”
* **Recommendations**: “Suggest 2–4 next reads that deepen understanding; include titles + URLs; avoid duplicates.”

---

## 15) Acceptance criteria (MVP)

* Hotkeys work across apps; overlay opens reliably on macOS/Windows.
* Asking by voice returns a `Brief` with ≥2 citations.
* Highlight → Explain works in at least Chrome, VS Code, and Word with clipboard mode.
* Video mode works on YouTube with captioned videos.
* Pins saved in SQLite; local search returns pinned briefs.


# 2) GitHub Copilot prompt (paste into Copilot Chat)

**Context for Copilot**: The repo has a MD file named `TECH_STACK.md` (our technology choices). Use *this* document (`PRODUCT_SPEC.md`) as the ground truth for behavior, types, and flows. Generate TypeScript code and wire everything end‑to‑end.

**Your tasks:**

1. **Create monorepo scaffolding (pnpm workspaces)**

* Root `package.json` with workspaces `apps/*`, `packages/*`.
* Add `eslint`, `prettier`, `typescript` configs shared; strict TS.

2. **apps/desktop (Electron)**

* Implement Electron **Main**: overlay BrowserWindow (transparent, frameless, alwaysOnTop), tray, global shortcuts, secure key storage (keytar), IPC channels `agent:ask` and `agent:status`.
* Implement **Renderer**: React + Vite + Tailwind + shadcn.

  * Build **CedarOS Panel** with routes: Home (history), Result (brief view), Settings.
  * Inline **Tooltip** component shown for Highlight → Explain.
  * Zustand store for UI state and current `Brief`.
  * TTS via `window.speechSynthesis` with a play/pause button.
* Implement Clipboard selection flow for Highlight → Explain (simulate `Cmd/Ctrl+C`, read text, clear clipboard respectfully).

3. **apps/agent (Mastra worker)**

* Export `startAgent()` that listens for requests from Main over IPC and responds with `AskResponse`.
* Implement Mastra **tools** per PRODUCT_SPEC.md §6:

  * `perplexitySearch`
  * `summarizeSelection`
  * `getTranscriptSlice`
  * `recommendNext`
* Normalize all tool outputs into a shared `Brief` object.

4. **packages/shared**

* Export **types** from PRODUCT_SPEC.md §5 (`Brief`, `Citation`, `AskRequest`, `AskResponse`).
* Export a **zod** schema for `Brief` and validate before returning to Renderer.

5. **Perplexity integration**

* Add a small client that calls the Perplexity Search API. Input: `{ query, context }`. Output: `{ answer, citations[] }` with `{title,url,publisher,publishedAt}`.
* Implement a prompt template: concise, cited answers; refuse speculation; include 2–5 sources.

6. **STT & captions**

* Implement a basic **YouTube captions** fetcher (if url indicates YouTube), else fallback to **Deepgram streaming** (guarded by env var) or a stub that returns `"(captions unavailable)"`.
* Keep STT optional and behind a capability flag.

7. **Persistence (SQLite)**

* Initialize SQLite (better-sqlite3) in Main. Tables: `briefs(id, title, summary, bullets JSON, citations JSON, createdAt, context JSON)`, plus FTS5 virtual table.
* IPC handlers: `briefs:save`, `briefs:search`, `briefs:listPins`.

8. **Telemetry & errors**

* Wire PostHog for the Renderer (respect a `POSTHOG_API_KEY`).
* Add Sentry init for Main and Agent (if `SENTRY_DSN`).
* Gracefully surface errors in the panel (`AskResponse.ok=false`).

9. **Settings & privacy**

* UI toggles for: auto‑clear clipboard, no‑audio mode, click‑through overlay.
* Do not send full page DOM unless the user explicitly opts in.

10. **Build & scripts**

* Add scripts: `dev:desktop`, `dev:agent`, `dev` (concurrently), `build`, `package`, `lint`, `typecheck`.
* Electron‑builder config for macOS/Windows.

**Implementation details to follow exactly:**

* Use the **types and IPC contracts** from PRODUCT_SPEC.md §5.
* Return `Brief` objects that pass the zod schema before rendering.
* Deduplicate `citations` by canonical URL (strip tracking params; e.g., `utm_*`).
* Tooltip response must render in <600ms (show skeleton while waiting).
* Unit‑test the `perplexitySearch` normalizer and `Brief` schema (Vitest).

**File seeds to generate** (non‑exhaustive):

```
apps/desktop/src/main/main.ts
apps/desktop/src/main/ipc.ts
apps/desktop/src/renderer/index.tsx
apps/desktop/src/renderer/components/CedarPanel.tsx
apps/desktop/src/renderer/components/Tooltip.tsx
apps/desktop/src/renderer/state/store.ts
apps/agent/src/index.ts
apps/agent/src/tools/perplexitySearch.ts
apps/agent/src/tools/summarizeSelection.ts
apps/agent/src/tools/getTranscriptSlice.ts
apps/agent/src/tools/recommendNext.ts
packages/shared/src/types.ts
packages/shared/src/schemas.ts
```

**Coding style**

* TypeScript strict mode, async/await, no `any`.
* Small, pure functions; dependency injection for HTTP clients.
* Graceful errors with typed `Result<T,E>` where appropriate.

**Deliverables**

* A running dev app where:

  * `Cmd/Ctrl+Shift+V` opens voice ask; returns a cited `Brief`.
  * `Cmd/Ctrl+Shift+/` on selected text opens Tooltip with a mini `Brief`.
  * Results can be pinned and searched locally.

**Use TECH_STACK.md and this PRODUCT_SPEC.md as authoritative references**. If ambiguity arises, prefer the behaviors and types defined here.
