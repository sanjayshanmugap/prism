# Prism Desktop Setup Instructions

## Prerequisites

To run the Prism system-wide overlay, you need the following tools installed:

### 1. Install Node.js
- Download Node.js from: https://nodejs.org/
- Install the LTS version (recommended)
- This will also install npm (Node Package Manager)

### 2. Install pnpm (Package Manager)
After Node.js is installed, run:
```powershell
npm install -g pnpm
```

### 3. Install Dependencies
Navigate to the project directory and install all dependencies:
```powershell
cd "c:\VS Code Projects\Prism\prism"
pnpm install
```

## Running the System-Wide Overlay

### Option 1: Run Desktop App Only
```powershell
pnpm dev:desktop
```

### Option 2: Run All Applications (Desktop + Web + Agent)
```powershell
pnpm dev
```

## Testing the Overlay

Once the desktop app is running:

1. **System Tray**: Look for the Prism icon in your system tray (bottom-right corner of Windows)

2. **Global Shortcuts**:
   - **Ctrl+Shift+V**: Activate voice recognition
   - **Ctrl+Shift+/**: Explain selected text from any application
   - **Ctrl+Shift+Space**: Toggle overlay visibility

3. **Test Steps**:
   - Press **Ctrl+Shift+Space** to show the overlay
   - You should see transparent panels appear over your screen
   - Press **Ctrl+Shift+V** to activate voice recognition
   - Try selecting text in any application and press **Ctrl+Shift+/** for AI explanation

## Troubleshooting

### If the overlay doesn't appear:
- Check Windows Task Manager for "Prism" process
- Look for the app icon in the system tray
- Try right-clicking the tray icon and selecting "Show/Hide Overlay"

### If global shortcuts don't work:
- Make sure no other applications are using the same shortcuts
- Try restarting the application
- Check Windows permissions for the application

### If voice recognition fails:
- Ensure microphone permissions are granted
- Check Windows privacy settings for microphone access
- Try refreshing the page or restarting the app

## Next Steps After Installation

1. Install Node.js from the official website
2. Open a new PowerShell window (to refresh PATH)
3. Run: `npm install -g pnpm`
4. Navigate to project: `cd "c:\VS Code Projects\Prism\prism"`
5. Install dependencies: `pnpm install`
6. Start the app: `pnpm dev:desktop`

The system-wide overlay should then launch and be ready for testing!