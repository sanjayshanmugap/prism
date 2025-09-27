# Prism AI Extension Installation Guide

## Quick Start

1. **Build the extension:**

   ```bash
   npm run build:extension
   ```

2. **Install in Chrome:**

   - Open Chrome
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

3. **Test the extension:**
   - Click the Prism AI icon in your browser toolbar
   - Go to a video call site (Google Meet, Zoom, etc.)
   - Click "Enable Overlay" in the popup
   - The AI overlay should appear on the page

## Features

### ✅ Working Features

- Extension popup with controls
- Content script injection
- Overlay display with glass morphism design
- Auto-detection of video call platforms
- Settings persistence
- Background service worker

### 🚧 To Be Implemented

- Actual AI/LLM integration
- Real voice recognition (Web Speech API)
- Live transcription
- Meeting insights generation
- Icon files (currently using placeholder text)

## Development

- **Watch mode:** `npm run build:extension:dev`
- **Package for store:** `npm run package:extension`

## Browser Support

- ✅ Chrome (primary target)
- ✅ Edge, Opera, Brave (Chromium-based)
- ⚠️ Firefox (would need Manifest V2 conversion)

## Next Steps

1. **Add proper icons** in `extension/icons/`
2. **Integrate AI services** (OpenAI, Anthropic, etc.)
3. **Implement Web Speech API** for voice recognition
4. **Add real-time transcription**
5. **Connect to meeting platforms APIs**

## File Structure

```
extension/
├── manifest.json      # Extension metadata & permissions
├── popup.html/css/js  # Extension popup interface
├── content.js/css     # Injected overlay code
├── background.js      # Service worker for cross-tab features
└── icons/             # Extension icons (placeholder)

dist/                  # Built extension files
webpack.config.js      # Build configuration
```

The extension successfully converts the React-based Next.js application into a browser extension that can inject an AI overlay into any webpage!
