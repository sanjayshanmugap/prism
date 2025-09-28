# Prism AI Desktop App

This is the complete monorepo implementation for Prism AI - a desktop overlay powered by CedarOS, Mastra, and Perplexity API.

## Architecture

```
prism/
├── apps/
│   ├── desktop/          # Electron app (Main + Renderer)
│   └── agent/            # Mastra worker process  
├── packages/
│   └── shared/           # Shared types and schemas
└── package.json          # Monorepo root
```

## Quick Start

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Add your API keys:
   # PERPLEXITY_API_KEY=your_key_here
   # DEEPGRAM_API_KEY=your_key_here (optional)
   ```

3. **Start development**:
   ```bash
   pnpm dev
   ```

## Features Implemented

### ✅ Monorepo Structure
- **pnpm workspaces** with proper TypeScript configuration
- **Shared types** and Zod schemas in `packages/shared`
- **ESLint/Prettier** configuration across all packages

### ✅ Agent (Mastra Worker)
- **Perplexity API integration** with citation extraction
- **Selection summarization** with keyword extraction  
- **YouTube transcript fetching** (placeholder with mock data)
- **Smart recommendations** based on topic analysis
- **Structured Brief generation** with validation

### ✅ Electron Desktop App
- **Overlay window** (transparent, frameless, always-on-top)
- **Global shortcuts**: Voice ask, Highlight→Explain, Toggle panel
- **System tray** with privacy controls
- **SQLite database** with FTS5 search
- **IPC communication** with agent process

### ✅ React UI (CedarOS Panel)
- **Glassmorphism design** with backdrop blur
- **Zustand state management** for UI and data
- **TTS integration** via Web Speech API
- **Responsive layout** with minimize/maximize
- **Error handling** with graceful fallbacks

## Key Components

### Agent Tools (`apps/agent/src/tools/`)
1. **`perplexitySearch.ts`** - Calls Perplexity API, extracts citations
2. **`summarizeSelection.ts`** - Analyzes text, generates Wikipedia-style summaries  
3. **`getTranscriptSlice.ts`** - YouTube transcript fetching (with fallback)
4. **`recommendNext.ts`** - Topic-based news and educational recommendations

### Electron Main (`apps/desktop/src/main/`)
1. **`main.ts`** - App initialization, window management, global shortcuts
2. **`ipc.ts`** - IPC handlers for agent communication
3. **`database.ts`** - SQLite operations with FTS5 search

### React UI (`apps/desktop/src/renderer/`)
1. **`components/CedarPanel.tsx`** - Main panel with glassmorphism
2. **`components/Tooltip.tsx`** - Inline explanations
3. **`state/store.ts`** - Zustand store for app state

## Usage Flows

### 1. Voice Ask (`Cmd/Ctrl+Shift+V`)
```
User presses hotkey → Electron shows overlay → Voice input → 
Agent processes with Perplexity → Returns Brief with citations → 
UI displays results with TTS option
```

### 2. Highlight→Explain (`Cmd/Ctrl+Shift+/`)  
```
User selects text → Presses hotkey → Clipboard read → 
Agent summarizes selection → Tooltip shows mini-Brief →
Option to expand to full panel
```

### 3. Video Mode
```
User watches video → Asks question at timestamp → 
Agent fetches transcript slice → Combines with Perplexity search → 
Returns contextualized Brief
```

## Build Commands

```bash
# Development (runs all in parallel)
pnpm dev

# Build for production  
pnpm build

# Package for distribution
pnpm package

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## Environment Variables

```env
# Required
PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional  
DEEPGRAM_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENTRY_DSN=https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@xxxxxxx.ingest.sentry.io/xxxxxxx
POSTHOG_API_KEY=phc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Technical Details

### Data Flow
1. **Renderer** sends IPC message to **Main**
2. **Main** forwards to **Agent** via child process
3. **Agent** processes with tools (Perplexity, etc.)
4. **Agent** returns validated `Brief` object
5. **Main** forwards to **Renderer** for display

### Brief Schema
```typescript
type Brief = {
  id: string;               // UUID
  query: string;            // User question
  title: string;            // Generated headline  
  summary: string;          // 2-4 sentence overview
  bullets: string[];        // Key takeaways
  citations: Citation[];    // Source links
  createdAt: string;        // ISO timestamp
  context?: {               // Optional context
    url?: string;
    title?: string; 
    timestampSec?: number;
  };
};
```

### Privacy Features
- **Auto-clear clipboard** after highlight explain
- **No-audio mode** toggle in tray
- **Click-through overlay** option
- **Local SQLite storage** (no cloud by default)

## Development Notes

### Current Status
This implementation provides the complete foundation with:
- ✅ Working monorepo structure
- ✅ Agent with Perplexity integration  
- ✅ Electron shell with IPC
- ✅ React UI components
- ⚠️ Some TypeScript config issues to resolve
- ⚠️ Need to add actual React dependencies

### Next Steps for Production
1. **Fix TypeScript configuration** across workspaces
2. **Add missing React/Electron dependencies**
3. **Implement real voice recognition** (Deepgram/whisper.cpp)
4. **Add YouTube Data API** for real transcripts
5. **Create app icons and packaging config**
6. **Add telemetry** (PostHog/Sentry) integration
7. **Write tests** for agent tools and UI components

### Testing the Implementation
Once dependencies are installed:
```bash
# Test agent standalone
pnpm --filter @prism/agent dev

# Test electron app  
pnpm --filter @prism/desktop dev

# Test full integration
pnpm dev
```

The app will create a transparent overlay that responds to global shortcuts and provides AI-powered explanations with proper citations.

## License

MIT - see LICENSE file for details.