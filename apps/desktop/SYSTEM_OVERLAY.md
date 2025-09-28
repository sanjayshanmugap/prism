# Prism System-Wide Overlay

The Prism overlay has been transformed into a system-wide overlay that appears over any browser window, not limited to specific tabs or extensions.

## Features

### System-Wide Operation
- **Full Screen Overlay**: Covers the entire screen as a transparent overlay
- **Always On Top**: Stays above all other windows including browsers
- **Click-Through Mode**: Can be configured to allow clicking through the overlay to interact with underlying applications
- **Browser Agnostic**: Works with any browser (Chrome, Firefox, Safari, Edge, etc.)

### Global Shortcuts
- **Ctrl+Shift+V** (Cmd+Shift+V on Mac): Activate voice recognition
- **Ctrl+Shift+/** (Cmd+Shift+/ on Mac): Explain selected text from any application
- **Ctrl+Shift+Space** (Cmd+Shift+Space on Mac): Toggle overlay visibility

### Smart Features
- **Automatic Text Selection**: Highlight text in any application and press the shortcut to get AI explanations
- **Voice Recognition**: Built-in speech recognition that works system-wide
- **Background Brightness Detection**: Automatically adjusts UI colors based on the background
- **Privacy Mode**: Can disable audio recording and auto-clear clipboard
- **Minimizable Panels**: Collapse panels when not needed

## Architecture

### Electron Main Process
- Creates a full-screen, transparent, always-on-top window
- Manages global shortcuts and system integration
- Handles click-through functionality
- Communicates with the renderer process via IPC

### Renderer Process
- Displays the overlay UI using React and Tailwind CSS
- Handles voice recognition and AI interactions
- Manages panel states and animations
- Provides real-time insights and responses

### Agent Process
- Runs in background to handle AI processing
- Integrates with external APIs (OpenAI, Perplexity, etc.)
- Provides intelligent responses and insights

## Usage

### First Launch
1. Run the desktop application: `pnpm dev:desktop`
2. The app starts minimized in the system tray
3. Use global shortcuts or tray menu to show the overlay

### Voice Interaction
1. Press **Ctrl+Shift+V** to activate voice recognition
2. Speak your question naturally
3. The AI will process and respond in the overlay panels

### Text Explanation
1. Select any text in any application
2. Press **Ctrl+Shift+/** to get an AI explanation
3. The explanation appears in the AI Response panel

### Toggle Modes
- **Click-Through**: Right-click tray icon → "Click-Through Mode" to allow/disallow clicking through overlay
- **Privacy Mode**: Right-click tray icon → "Privacy Mode" to disable audio features
- **Show/Hide**: Press **Ctrl+Shift+Space** or use tray menu

## Configuration

Settings are stored in the Electron Store and include:
- Window bounds and positioning
- Global shortcuts customization
- Privacy settings (auto-clear clipboard, no audio mode)
- Click-through preferences

## Development

### File Structure
```
apps/desktop/src/
├── main/
│   ├── main.ts          # Main Electron process
│   ├── ipc.ts           # Inter-process communication
│   └── database.ts      # Local data storage
├── renderer/
│   ├── components/
│   │   ├── App.tsx      # Main app component
│   │   └── SystemOverlay.tsx  # System overlay component
│   ├── state/           # State management
│   └── styles.css       # Tailwind and custom styles
└── preload/
    └── preload.ts       # Secure bridge between main and renderer
```

### Key Technologies
- **Electron**: Cross-platform desktop framework
- **React**: UI framework
- **Tailwind CSS**: Styling framework
- **Zustand**: State management
- **Web Speech API**: Voice recognition
- **IPC**: Secure communication between processes

## Security

The overlay maintains security by:
- Using contextIsolated preload scripts
- Disabling node integration in renderer
- Implementing secure IPC communication
- Optional privacy modes for sensitive environments

## Platform Support

- **Windows**: Full support with all features
- **macOS**: Full support with native shortcuts
- **Linux**: Basic support (some features may be limited)

## Troubleshooting

### Overlay Not Showing
- Check if the app is running in the system tray
- Try toggling with **Ctrl+Shift+Space**
- Ensure no other overlay applications are conflicting

### Voice Recognition Not Working
- Check microphone permissions
- Ensure browser/system audio permissions are granted
- Try toggling Privacy Mode off

### Global Shortcuts Not Working
- Check for conflicts with other applications
- Restart the application
- Customize shortcuts in the settings if needed