import { app, BrowserWindow, globalShortcut, Tray, Menu, nativeImage } from 'electron';
import { join } from 'path';
import { fork, ChildProcess } from 'child_process';
import { setupIPC } from './ipc';
import { setupDatabase } from './database';
import Store from 'electron-store';

class PrismApp {
  private mainWindow: BrowserWindow | null = null;
  private tray: Tray | null = null;
  private agentProcess: ChildProcess | null = null;
  private store: Store;

  constructor() {
    this.store = new Store({
      defaults: {
        windowBounds: { width: 400, height: 600 },
        shortcuts: {
          voiceAsk: 'CommandOrControl+Shift+V',
          highlightExplain: 'CommandOrControl+Shift+/',
          togglePanel: 'CommandOrControl+Shift+Space',
        },
        privacy: {
          autoClearClipboard: true,
          noAudioMode: false,
          clickThroughOverlay: false,
        },
      },
    });
  }

  async initialize(): Promise<void> {
    await app.whenReady();
    
    // Setup database
    await setupDatabase();
    
    // Create main window
    this.createMainWindow();
    
    // Setup IPC handlers
    setupIPC(this.agentProcess);
    
    // Start agent process
    await this.startAgentProcess();
    
    // Setup global shortcuts
    this.setupGlobalShortcuts();
    
    // Setup tray
    this.setupTray();
    
    // App event handlers
    this.setupAppEventHandlers();
  }

  private createMainWindow(): void {
    const bounds = this.store.get('windowBounds') as { width: number; height: number };
    
    this.mainWindow = new BrowserWindow({
      width: bounds.width,
      height: bounds.height,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      focusable: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(__dirname, '../preload/preload.js'),
      },
    });

    // Load the renderer
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadURL('http://localhost:5173');
      this.mainWindow.webContents.openDevTools({ mode: 'detach' });
    } else {
      this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
    }

    // Initially hide the window
    this.mainWindow.hide();

    // Save window bounds on resize
    this.mainWindow.on('resize', () => {
      if (this.mainWindow) {
        const bounds = this.mainWindow.getBounds();
        this.store.set('windowBounds', { width: bounds.width, height: bounds.height });
      }
    });
  }

  private async startAgentProcess(): Promise<void> {
    const agentPath = join(__dirname, '../../agent/dist/index.js');
    
    this.agentProcess = fork(agentPath, [], {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      env: {
        ...process.env,
        NODE_ENV: process.env.NODE_ENV || 'development',
      },
    });

    this.agentProcess.on('message', (message: any) => {
      if (message.type === 'ready') {
        console.log('Agent process ready');
      } else if (message.type === 'response') {
        // Forward response to renderer
        this.mainWindow?.webContents.send('agent-response', message);
      }
    });

    this.agentProcess.on('error', (error) => {
      console.error('Agent process error:', error);
    });

    // Wait for agent to be ready
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.warn('Agent process did not signal ready in time');
        resolve();
      }, 10000);

      this.agentProcess?.on('message', (message: any) => {
        if (message.type === 'ready') {
          clearTimeout(timeout);
          resolve();
        }
      });
    });
  }

  private setupGlobalShortcuts(): void {
    const shortcuts = this.store.get('shortcuts') as Record<string, string>;

    // Voice ask shortcut
    globalShortcut.register(shortcuts.voiceAsk, () => {
      this.showWindow();
      this.mainWindow?.webContents.send('trigger-voice-ask');
    });

    // Highlight explain shortcut
    globalShortcut.register(shortcuts.highlightExplain, () => {
      this.triggerHighlightExplain();
    });

    // Toggle panel shortcut
    globalShortcut.register(shortcuts.togglePanel, () => {
      this.toggleWindow();
    });
  }

  private setupTray(): void {
    // Create tray icon (you'll need to add an icon file)
    const icon = nativeImage.createEmpty(); // Replace with actual icon
    this.tray = new Tray(icon);

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show/Hide Panel',
        click: () => this.toggleWindow(),
      },
      {
        label: 'Voice Ask',
        accelerator: this.store.get('shortcuts.voiceAsk') as string,
        click: () => {
          this.showWindow();
          this.mainWindow?.webContents.send('trigger-voice-ask');
        },
      },
      { type: 'separator' },
      {
        label: 'Privacy Mode',
        type: 'checkbox',
        checked: this.store.get('privacy.noAudioMode') as boolean,
        click: (item) => {
          this.store.set('privacy.noAudioMode', item.checked);
          this.mainWindow?.webContents.send('privacy-mode-changed', item.checked);
        },
      },
      {
        label: 'Hide Overlay',
        type: 'checkbox',
        checked: false,
        click: (item) => {
          if (item.checked) {
            this.hideWindow();
          } else {
            this.showWindow();
          }
        },
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => app.quit(),
      },
    ]);

    this.tray.setContextMenu(contextMenu);
    this.tray.setToolTip('Prism AI Assistant');
  }

  private setupAppEventHandlers(): void {
    app.on('window-all-closed', () => {
      // Don't quit on window close - keep running in background
    });

    app.on('before-quit', () => {
      // Cleanup
      if (this.agentProcess) {
        this.agentProcess.kill();
      }
      globalShortcut.unregisterAll();
    });

    app.on('activate', () => {
      if (this.mainWindow === null) {
        this.createMainWindow();
      }
    });
  }

  private showWindow(): void {
    if (this.mainWindow) {
      this.mainWindow.show();
      this.mainWindow.focus();
    }
  }

  private hideWindow(): void {
    if (this.mainWindow) {
      this.mainWindow.hide();
    }
  }

  private toggleWindow(): void {
    if (this.mainWindow) {
      if (this.mainWindow.isVisible()) {
        this.hideWindow();
      } else {
        this.showWindow();
      }
    }
  }

  private async triggerHighlightExplain(): Promise<void> {
    try {
      // Simulate Ctrl+C to copy selection
      const { clipboard } = await import('electron');
      
      // Clear clipboard first
      clipboard.clear();
      
      // Send Ctrl+C keystroke
      const { globalShortcut } = await import('electron');
      
      // Small delay then read clipboard
      setTimeout(() => {
        const selectionText = clipboard.readText();
        if (selectionText && selectionText.trim().length > 0) {
          this.showWindow();
          this.mainWindow?.webContents.send('trigger-highlight-explain', selectionText);
          
          // Clear clipboard if privacy setting is enabled
          if (this.store.get('privacy.autoClearClipboard')) {
            setTimeout(() => clipboard.clear(), 1000);
          }
        }
      }, 100);
    } catch (error) {
      console.error('Error in highlight explain:', error);
    }
  }

  public getAgentProcess(): ChildProcess | null {
    return this.agentProcess;
  }

  public getStore(): Store {
    return this.store;
  }
}

// Create and initialize the app
const prismApp = new PrismApp();
prismApp.initialize().catch(console.error);

export { prismApp };