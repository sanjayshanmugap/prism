# Prism Setup and Installation Guide

## Prerequisites

Before running Prism, you need to install Node.js and a package manager:

### 1. Install Node.js
- Download Node.js from https://nodejs.org (version 18 or higher)
- OR use a version manager like nvm:
  ```bash
  # Install nvm (Windows)
  winget install CoreyButler.NVMforWindows
  
  # Install and use Node.js 20
  nvm install 20
  nvm use 20
  ```

### 2. Install pnpm (recommended)
```bash
npm install -g pnpm
```

## Installation Steps

### 1. Install Dependencies
```bash
# From the root directory
cd "c:\VS Code Projects\Prism\prism"
pnpm install
```

### 2. Build the Shared Package
```bash
pnpm --filter @prism/shared build
```

### 3. Set up Environment Variables

Create `.env.local` in the root directory:
```env
# Perplexity API
PERPLEXITY_API_KEY=your_perplexity_api_key_here

# Deepgram API (for voice recognition)
DEEPGRAM_API_KEY=your_deepgram_api_key_here

# YouTube Data API
YOUTUBE_API_KEY=your_youtube_api_key_here

# Database
DATABASE_PATH=./data/prism.db

# Agent WebSocket
AGENT_WS_PORT=8080
```

### 4. Create Required Directories
```bash
mkdir -p data
mkdir -p logs
mkdir -p temp
```

## Development

### Start Development Environment
```bash
# Terminal 1: Start the agent (backend)
cd apps/agent
pnpm dev

# Terminal 2: Start the desktop app (frontend)
cd apps/desktop
pnpm dev
```

### Building for Production
```bash
# Build all packages
pnpm build

# Package the Electron app
cd apps/desktop
pnpm package
```

## Architecture Overview

### Monorepo Structure
- `packages/shared/` - Shared types, schemas, and utilities
- `apps/agent/` - Mastra-powered AI agent backend
- `apps/desktop/` - Electron + React frontend

### Key Features Implemented
- ✅ **Voice Recognition**: Deepgram integration for speech-to-text
- ✅ **AI Agent**: Perplexity API for contextual responses
- ✅ **YouTube Integration**: YouTube Data API for video analysis
- ✅ **Database**: SQLite with FTS5 for brief storage and search
- ✅ **UI Components**: Glassmorphism design with smooth animations
- ✅ **Global Shortcuts**: System-wide hotkeys for activation
- ✅ **Overlay System**: Transparent overlay with click-through support

### Component Overview

#### Core UI Components
- `PrismOverlay.tsx` - Main overlay container with glassmorphism
- `VoiceWaveform.tsx` - Animated voice input visualization
- `MicrophoneButton.tsx` - Voice activation control
- `ControlBar.tsx` - Main interface controls
- `AIResponse.tsx` - AI response display with animations
- `LiveInsights.tsx` - Real-time content analysis

#### Views
- `Home.tsx` - Brief history and pinned items
- `Result.tsx` - Detailed results with TTS and citations
- `Settings.tsx` - Privacy and configuration controls
- `Tooltip.tsx` - Quick explain functionality

#### State Management
- `store.ts` - Zustand store for global app state
- Handles voice recognition state, AI responses, brief history

#### Agent Tools
- `getTranscriptSlice.ts` - Extract specific transcript segments
- `perplexitySearch.ts` - Perplexity API integration
- `recommendNext.ts` - Generate contextual recommendations

## API Keys Setup

### 1. Perplexity API
1. Sign up at https://www.perplexity.ai/
2. Get your API key from the dashboard
3. Add to `.env.local` as `PERPLEXITY_API_KEY`

### 2. Deepgram API
1. Sign up at https://deepgram.com/
2. Create a new project and get API key
3. Add to `.env.local` as `DEEPGRAM_API_KEY`

### 3. YouTube Data API
1. Go to Google Cloud Console
2. Enable YouTube Data API v3
3. Create credentials (API Key)
4. Add to `.env.local` as `YOUTUBE_API_KEY`

## Usage

### Global Shortcuts
- `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac) - Toggle overlay
- `Ctrl+Shift+V` (Windows/Linux) or `Cmd+Shift+V` (Mac) - Start voice input
- `Ctrl+Shift+H` (Windows/Linux) or `Cmd+Shift+H` (Mac) - Show help tooltip

### Voice Commands
- "Explain this" - Get contextual explanation
- "Summarize" - Create a brief summary
- "What's next?" - Get recommendations
- "Search for [topic]" - Perplexity search

### Text Selection
- Select any text on screen and use `Ctrl+Shift+E` for quick explanations
- Results appear in contextual tooltips or the main overlay

## Troubleshooting

### Common Issues

1. **TypeScript Errors**
   - Make sure all dependencies are installed: `pnpm install`
   - Rebuild shared package: `pnpm --filter @prism/shared build`

2. **Voice Recognition Not Working**
   - Check Deepgram API key in `.env.local`
   - Ensure microphone permissions are granted
   - Check browser/Electron microphone access

3. **Agent Not Responding**
   - Verify Perplexity API key is valid
   - Check agent WebSocket connection (port 8080)
   - Look at logs in `logs/` directory

4. **Database Issues**
   - Ensure `data/` directory exists and is writable
   - SQLite database will be created automatically on first run

### Development Debug Mode
```bash
# Enable debug logging
export DEBUG=prism:*

# Start with verbose logging
cd apps/desktop
pnpm dev --verbose
```

## Production Deployment

### Building Distributable
```bash
# Build for current platform
cd apps/desktop
pnpm build

# Build for specific platforms
pnpm build:win    # Windows
pnpm build:mac    # macOS
pnpm build:linux  # Linux
```

### Auto-updater Setup
The app includes electron-updater for automatic updates. Configure your update server in the build configuration.

## Contributing

### Code Structure
- Follow the existing TypeScript patterns
- Use Zustand for state management
- Implement proper error handling
- Add JSDoc comments for complex functions

### Testing
```bash
# Run unit tests
pnpm test

# Run E2E tests
pnpm e2e
```

## Security Considerations

- API keys are stored in environment variables
- Database is local SQLite (no remote data storage)
- Voice data is processed through Deepgram (check their privacy policy)
- Screen capture is limited to selected text regions
- All network requests are logged for debugging

## Performance

- SQLite FTS5 provides fast full-text search
- React components use proper memoization
- Electron process isolation for security
- Lazy loading of heavy components

---

**Current Status**: All core functionality implemented, ready for dependency installation and first run.

**Next Steps**: 
1. Install Node.js and pnpm
2. Run `pnpm install` to install all dependencies  
3. Configure API keys in `.env.local`
4. Start development servers
5. Test core functionality