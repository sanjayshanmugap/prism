# Prism AI Browser Extension

A voice-activated AI overlay extension that provides real-time web analysis and insights.

## Features

- **Glassmorphism UI**: Beautiful translucent overlay that doesn't interfere with web browsing
- **Voice Activation**: Say "Hey Prism" or use keyboard shortcuts to activate
- **Real-time Analysis**: AI-powered insights and summaries of web content
- **Keyboard Shortcuts**: 
  - `⌘ ⇧` (Cmd + Shift): Toggle voice listening
  - `⌘ \` (Cmd + Backslash): Show/Hide overlay

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `extension` folder
4. The Prism AI extension will be installed and ready to use

## Usage

1. **Activate**: Click the extension icon in your browser toolbar or use keyboard shortcuts
2. **Voice Control**: Click the microphone button or say "Hey Prism" to start voice recognition
3. **Analysis**: The overlay will provide AI-powered insights about the current webpage
4. **Customize**: Use the popup menu to adjust settings and preferences

## Development

### File Structure

```
extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for background processing
├── content.js            # Content script injected into web pages
├── popup.html            # Extension popup interface
├── popup.js              # Popup script logic
├── overlay.css           # Styling for the overlay components
├── icons/                # Extension icons (16px, 32px, 48px, 128px)
└── README.md             # This file
```

### Key Components

- **Content Script**: Injects the overlay UI into web pages
- **Background Script**: Handles voice recognition and AI processing
- **Popup Interface**: Provides settings and quick controls
- **Overlay Components**: Glassmorphism UI panels for insights and responses

## Next Steps

This extension is ready for integration with:
- **CedarOS + Mastra**: For advanced AI processing and agentic control
- **OpenAI API**: For content analysis and summarization
- **Perplexity API**: For web search and source synthesis
- **Voice Recognition**: Enhanced speech-to-text capabilities

## Design Philosophy

The extension preserves the exact glassmorphism design from the original Next.js application while adapting it for universal browser compatibility. The overlay uses CSS custom properties and modern web standards to ensure consistent appearance across all websites.
