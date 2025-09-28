New & improved tech stack (Electron + CedarOS + Mastra + Perplexity)
1) Desktop shell & overlay
Electron 31+ (Main + Renderer)


Overlay window: transparent:true, frame:false, alwaysOnTop:true, resizable:false, focusable:true, skipTaskbar:true


Click-through mode toggle: win.setIgnoreMouseEvents(true, { forward:true }) for peek-through


Docking: snap left/right; secondary floating tooltip window for Highlight→Explain


Global hotkeys: globalShortcut (e.g., Cmd/Ctrl+Shift+/ explain, Cmd/Ctrl+Shift+V voice)


Screen/mic capture: desktopCapturer + navigator.mediaDevices.getUserMedia({ audio:true })


Tray: quick mic toggle, privacy toggle (“Hide overlay”), quit


Auto-updates: electron-updater


Secure storage: keytar for API keys; electron-store for local prefs


IPC: ipcMain/ipcRenderer to talk with the Mastra agent process


Optional (recommended): a tiny companion browser extension for precise DOM context (URL, selection HTML). Electron alone can do clipboard-based selection (see 5), but the extension gives perfect per-site metadata.

2) Frontend UI (CedarOS inside Electron)
CedarOS (React + TypeScript) mounted in the Renderer


UI: TailwindCSS + shadcn/ui (+ Framer Motion for smooth slide-in)


State: Zustand (overlay open/closed, current query, results, recos)


Panels/Views:


Cedar Panel (collapsible): Q&A results w/ citations; “Ask follow-up”


Inline tooltip (near selection): “Explain / Define / Compare sources”


Now Playing (video mode): current timestamp, “Explain this part”


Recommendations: 2–4 follow-ups based on current page/video


A11y: focus trap, keyboard navigation, ARIA labels


TTS (read aloud): Web Speech SpeechSynthesis in Renderer; fallback to say (uses macOS NSSpeechSynth/Windows SAPI)



3) Agent & orchestration (Mastra-first)
Mastra (TypeScript) as the brain, running outside the Renderer:


Where: spawn a Node worker process from Electron Main (keeps UI snappy)


Comms: IPC (Main ↔ Mastra worker), simple JSON contracts


Tools (Mastra “skills”):


perplexitySearch({ query, context }) → grounded answer + links


summarizeSelection({ text, url }) → neutral, Wikipedia-style explainer


getTranscriptSlice({ t0, t1, url? }) → captions if present, else STT on short audio


recommendNext({ topic, recent }) → 2–3 follow-ups with links


(optional) pinBrief/listPins → save/read later


Memory: lightweight (recent pages/videos, last N queries) persisted locally


Observability (dev mode): Mastra evals/trace; log to file; optional Sentry


Mastra gives you a ready agent loop + tooling. Keep the Renderer dumb: send a request → get a typed “Brief” JSON back.

4) Intelligence & search
Perplexity API — primary engine for Q&A with citations


Use for: voice questions while reading, Highlight→Explain, and video “explain this”


Keep prompts short; pass URL/title and small text chunks for grounding


(Optional fallback LLM): OpenAI/Anthropic for pure paraphrase or style clean-up if Perplexity rate-limits; keep this path off by default for the hackathon



5) Speech I/O
STT (voice commands & video fallback):


Primary (cloud): Deepgram streaming (fast, robust)


Offline fallback: whisper.cpp (Node native or WASM) on short clips


Clipboard trick for Highlight→Explain (no extension path): user selects text anywhere → press hotkey → app sends synthetic Cmd/Ctrl+C, reads clipboard.readText() securely, clears clipboard (opt-in)


TTS: Web Speech SpeechSynthesis; fallback say for OS-native voice


For system audio (true “what I’m hearing” capture): Windows WASAPI loopback works with native modules; macOS needs a virtual device (e.g., BlackHole). For a hackathon, rely on page captions or mic-pickup, then improve.

6) Context capture (reading & video)
Web pages:


With companion extension: exact selection HTML, URL, title, headings


Without: clipboard selection + active window title via Electron (BrowserWindow.getFocusedWindow() is limited for external apps; keep a manual URL input field in panel as fallback)


YouTube/Vimeo:


Pull captions via official tracks endpoints when available


Else: short audio snippet (user consent) → STT → Mastra→Perplexity


Chunking: 2–5s transcript slices around the timestamp for precise “explain this”



7) Data & persistence
Local-first DB: SQLite (via better-sqlite3)


Tables: briefs, recommendations, history, settings


FTS5 for local search over saved briefs


Sync (optional):


Neon Postgres (pgvector if you want semantic recall) or Supabase for auth + cross-device history


If you want pure vector DB later: Pinecone (not needed for MVP)



8) Infra, privacy & telemetry
API proxy (if you don’t want keys in-app): Cloudflare Workers or Vercel → forwards to Perplexity/Deepgram with rate-limits


Privacy toggles:


“Only send selected text + URL” (default)


“Never auto-capture audio”


“Hide overlay” quick toggle (and auto-hide when specific apps are foreground, configurable list)


Analytics: PostHog (events: query_started, query_completed, stopped)


Crashes: Sentry (main, renderer, agent process)



9) Packaging & DX
Monorepo: pnpm workspaces


apps/desktop (Electron shell + CedarOS UI)


apps/agent (Mastra worker)


packages/shared (types for Brief, Recommendation, IPC contracts)


Build: Vite (renderer), tsup (agent), electron-builder


Tests: Vitest (logic), Playwright (overlay smoke)


Lint/format: eslint + biome or prettier



10) Key UX flows (wired to the stack)
Voice while reading: Cmd/Ctrl+Shift+V → STT (Deepgram/whisper.cpp) → Mastra→Perplexity → Cedar panel shows “Cedar Brief” + citations; “Ask follow-up”


Highlight→Explain (1a): select text anywhere → Cmd/Ctrl+Shift+/ → clipboard read → Mastra summarizeSelection → inline tooltip + “Open in panel”


Video “Explain this part”: click Explain in mini controller → getTranscriptSlice(t±3s) → Mastra→Perplexity → panel pins a time-stamped brief


Recommendations: after any brief, Mastra recommendNext returns 2–4 cards; user can Pin (SQLite) for later



What you’ll implement first (MVP checklist)
Electron overlay window + global hotkeys + tray


CedarOS panel (React) with Tailwind/shadcn; IPC plumbing


Mastra worker with two tools: perplexitySearch, summarizeSelection


STT path (Deepgram first; whisper.cpp as optional flag)


Clipboard-based Highlight→Explain


SQLite for saved briefs + simple recos




