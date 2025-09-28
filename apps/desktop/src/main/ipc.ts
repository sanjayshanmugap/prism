import { ipcMain } from 'electron';
import type { AskRequest, AskResponse } from '@prism/shared';
import { ChildProcess } from 'child_process';
import { v4 as uuidv4 } from 'uuid';

let agentProcess: ChildProcess | null = null;
const pendingRequests = new Map<string, (response: AskResponse) => void>();

export function setupIPC(agent: ChildProcess | null): void {
  agentProcess = agent;

  // Handle ask requests from renderer
  ipcMain.handle('agent:ask', async (event, request: AskRequest): Promise<AskResponse> => {
    if (!agentProcess) {
      return {
        ok: false,
        error: 'Agent process not available',
      };
    }

    return new Promise((resolve) => {
      const requestId = uuidv4();
      
      // Store the resolver
      pendingRequests.set(requestId, resolve);
      
      // Send request to agent
      agentProcess?.send({
        type: 'ask',
        id: requestId,
        data: request,
      });
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (pendingRequests.has(requestId)) {
          pendingRequests.delete(requestId);
          resolve({
            ok: false,
            error: 'Request timeout',
          });
        }
      }, 30000);
    });
  });

  // Handle agent status requests
  ipcMain.handle('agent:status', async () => {
    return {
      available: agentProcess !== null,
      pid: agentProcess?.pid,
    };
  });

  // Handle responses from agent process
  if (agentProcess) {
    agentProcess.on('message', (message: any) => {
      if (message.type === 'response' && message.id) {
        const resolver = pendingRequests.get(message.id);
        if (resolver) {
          resolver(message.data);
          pendingRequests.delete(message.id);
        }
      }
    });
  }
}

// Brief management
ipcMain.handle('briefs:save', async (event, brief) => {
  // Database operations will be implemented in database.ts
  return { success: true };
});

ipcMain.handle('briefs:search', async (event, query: string) => {
  // Database search will be implemented in database.ts  
  return { results: [] };
});

ipcMain.handle('briefs:listPins', async () => {
  // Database operations will be implemented in database.ts
  return { pins: [] };
});

// Overlay control handlers (these will be set up by the main app)
let overlayHandlers: {
  showOverlay: () => void;
  hideOverlay: () => void;
  toggleOverlay: () => void;
  toggleClickThrough: () => void;
} | null = null;

export function setOverlayHandlers(handlers: {
  showOverlay: () => void;
  hideOverlay: () => void;
  toggleOverlay: () => void;
  toggleClickThrough: () => void;
}): void {
  overlayHandlers = handlers;
  
  // Set up IPC handlers
  ipcMain.handle('overlay:show', () => {
    overlayHandlers?.showOverlay();
    return { success: true };
  });

  ipcMain.handle('overlay:hide', () => {
    overlayHandlers?.hideOverlay();
    return { success: true };
  });

  ipcMain.handle('overlay:toggle', () => {
    overlayHandlers?.toggleOverlay();
    return { success: true };
  });

  ipcMain.handle('overlay:toggle-click-through', () => {
    overlayHandlers?.toggleClickThrough();
    return { success: true };
  });
}