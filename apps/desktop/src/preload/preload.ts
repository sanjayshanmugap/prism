import { contextBridge, ipcRenderer } from 'electron';
import type { AskRequest } from '@prism/shared';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Agent communication
  askAgent: (request: AskRequest) => ipcRenderer.invoke('agent:ask', request),
  getAgentStatus: () => ipcRenderer.invoke('agent:status'),
  
  // Brief management
  searchBriefs: (query: string) => ipcRenderer.invoke('briefs:search', query),
  getPinnedBriefs: () => ipcRenderer.invoke('briefs:listPins'),
  pinBrief: (id: string, pinned: boolean) => ipcRenderer.invoke('briefs:pin', id, pinned),
  saveBrief: (brief: any) => ipcRenderer.invoke('briefs:save', brief),
  
  // Event listeners
  onTriggerVoiceAsk: (callback: () => void) => {
    ipcRenderer.on('trigger-voice-ask', callback);
    return () => ipcRenderer.removeListener('trigger-voice-ask', callback);
  },
  
  onTriggerHighlightExplain: (callback: (text: string) => void) => {
    ipcRenderer.on('trigger-highlight-explain', (_event, text) => callback(text));
    return () => ipcRenderer.removeListener('trigger-highlight-explain', callback);
  },
  
  onPrivacyModeChanged: (callback: (enabled: boolean) => void) => {
    ipcRenderer.on('privacy-mode-changed', (_event, enabled) => callback(enabled));
    return () => ipcRenderer.removeListener('privacy-mode-changed', callback);
  },
  
  onAgentResponse: (callback: (response: any) => void) => {
    ipcRenderer.on('agent-response', (_event, response) => callback(response));
    return () => ipcRenderer.removeListener('agent-response', callback);
  },
  
  // Overlay control
  showOverlay: () => ipcRenderer.invoke('overlay:show'),
  hideOverlay: () => ipcRenderer.invoke('overlay:hide'),
  toggleOverlay: () => ipcRenderer.invoke('overlay:toggle'),
  toggleClickThrough: () => ipcRenderer.invoke('overlay:toggle-click-through'),
  
  onOverlayVisible: (callback: (visible: boolean) => void) => {
    ipcRenderer.on('overlay-visible', (_event, visible) => callback(visible));
    return () => ipcRenderer.removeListener('overlay-visible', callback);
  },
});

// Also expose versions
contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
});