# Prism AI Browser Extension

This is the browser extension version of the Prism AI overlay application, converted from the original Next.js application.

## Features

- **Voice-activated AI overlay**: Inject an AI-powered overlay into any webpage
- **Auto-detection**: Automatically activates on video call platforms (Google Meet, Zoom, Teams, etc.)
- **Live Insights**: Real-time analysis and insights during meetings
- **Voice Recognition**: "Hey Prism" activation and voice commands
- **Cross-platform**: Works on Chrome, Firefox, and other Chromium-based browsers

## Installation

### For Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build the extension:

   ```bash
   npm run build:extension
   ```

3. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked" and select the `dist` folder

### For Distribution

1. Create a packaged extension:

   ```bash
   npm run package:extension
   ```

2. This will create `prism-extension.zip` which can be uploaded to browser extension stores.

## Development

- **Watch mode**: `npm run build:extension:dev` - Rebuilds automatically on changes
- **Next.js app**: The original Next.js app is still available via `npm run dev`

## Extension Structure

```
extension/
├── manifest.json     # Extension manifest
├── popup.html       # Extension popup UI
├── popup.css        # Popup styles
├── popup.js         # Popup functionality
├── content.js       # Content script (injected into pages)
├── content.css      # Overlay styles
├── background.js    # Background service worker
└── icons/           # Extension icons
```

## Key Differences from Next.js Version

- **No React**: Converted to vanilla JavaScript for better compatibility
- **Content Script**: Injects overlay directly into web pages
- **Extension APIs**: Uses Chrome Extension APIs instead of Next.js APIs
- **Storage**: Uses `chrome.storage` for settings persistence
- **Auto-activation**: Detects video call platforms automatically
- **Background processing**: Service worker handles cross-tab functionality

## Permissions

The extension requires the following permissions:

- `activeTab`: Access to current tab for overlay injection
- `storage`: Save user preferences and settings
- `tabs`: Detect video call platforms for auto-activation
- `host_permissions`: Access to all websites for overlay injection

## Browser Compatibility

- ✅ Chrome (Manifest V3)
- ✅ Edge (Chromium-based)
- ✅ Opera
- ✅ Brave
- ⚠️ Firefox (may need Manifest V2 version)

## Usage

1. Click the Prism AI extension icon in the browser toolbar
2. Toggle "Enable Overlay" to activate on the current page
3. Use "Start Listening" to begin voice recognition
4. The overlay will auto-activate on supported video call platforms
5. Say "Hey Prism" or click the microphone for voice commands

## Development Notes

The extension maintains the core functionality of the original Next.js application while adapting to browser extension constraints:

- **Components converted**: React components → Vanilla JS classes
- **State management**: React state → Chrome storage + local variables
- **Styling**: Tailwind classes → CSS custom properties and classes
- **APIs**: Next.js APIs → Chrome Extension APIs
- **Routing**: Next.js routing → Extension popup/content script architecture
