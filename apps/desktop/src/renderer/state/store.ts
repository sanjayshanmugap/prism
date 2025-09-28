import type { Brief, AskRequest, AskResponse } from '@prism/shared';
import { create } from 'zustand';

interface AppState {
  // UI State
  isVisible: boolean;
  isMinimized: boolean;
  activeView: 'home' | 'result' | 'settings';
  
  // Current data
  currentBrief: Brief | null;
  isLoading: boolean;
  error: string | null;
  
  // History and settings
  recentBriefs: Brief[];
  pinnedBriefs: Brief[];
  
  // TTS state
  isSpeaking: boolean;
  
  // Actions
  setVisible: (visible: boolean) => void;
  setMinimized: (minimized: boolean) => void;
  setActiveView: (view: 'home' | 'result' | 'settings') => void;
  setCurrentBrief: (brief: Brief | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setRecentBriefs: (briefs: Brief[]) => void;
  setPinnedBriefs: (briefs: Brief[]) => void;
  setSpeaking: (speaking: boolean) => void;
  
  // Async actions
  askAgent: (request: AskRequest) => Promise<void>;
  pinBrief: (briefId: string, pinned: boolean) => Promise<void>;
  searchBriefs: (query: string) => Promise<Brief[]>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  isVisible: false,
  isMinimized: false,
  activeView: 'home',
  currentBrief: null,
  isLoading: false,
  error: null,
  recentBriefs: [],
  pinnedBriefs: [],
  isSpeaking: false,
  
  // Simple setters
  setVisible: (visible) => set({ isVisible: visible }),
  setMinimized: (minimized) => set({ isMinimized: minimized }),
  setActiveView: (view) => set({ activeView: view }),
  setCurrentBrief: (brief) => set({ currentBrief: brief }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setRecentBriefs: (briefs) => set({ recentBriefs: briefs }),
  setPinnedBriefs: (briefs) => set({ pinnedBriefs: briefs }),
  setSpeaking: (speaking) => set({ isSpeaking: speaking }),
  
  // Async actions
  askAgent: async (request: AskRequest) => {
    set({ isLoading: true, error: null });
    
    try {
      if (!window.electronAPI) {
        // Mock response for browser development
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        
        const mockBrief: Brief = {
          id: Math.random().toString(36).substr(2, 9),
          query: request.query,
          title: `Response to: ${request.query}`,
          summary: `This is a mock response for: "${request.query}". In a real implementation, this would be powered by Perplexity AI and provide detailed insights based on your request.`,
          bullets: [
            'Mock bullet point explaining key concept 1',
            'Mock bullet point explaining key concept 2',
            'Mock bullet point with additional context'
          ],
          citations: [
            {
              title: 'Example Source 1',
              url: 'https://example.com/source1',
              publisher: 'Example Publisher'
            }
          ],
          createdAt: new Date().toISOString()
        };
        
        set({ 
          currentBrief: mockBrief,
          activeView: 'result',
          isLoading: false 
        });
        return;
      }

      const response: AskResponse = await window.electronAPI.askAgent(request);
      
      if (response.ok) {
        set({ 
          currentBrief: response.brief,
          activeView: 'result',
          isLoading: false 
        });
      } else {
        set({ 
          error: response.error,
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      });
    }
  },
  
  pinBrief: async (briefId: string, pinned: boolean) => {
    try {
      if (!window.electronAPI) {
        // Mock functionality for browser development
        console.log(`Mock: ${pinned ? 'Pinning' : 'Unpinning'} brief ${briefId}`);
        return;
      }

      await window.electronAPI.pinBrief(briefId, pinned);
      
      // Update local state
      const { currentBrief, recentBriefs, pinnedBriefs } = get();
      
      if (currentBrief && currentBrief.id === briefId) {
        // Update current brief (Note: Brief type doesn't have pinned field, this is conceptual)
      }
      
      // Refresh pinned briefs list
      const updatedPinned = await window.electronAPI.getPinnedBriefs();
      set({ pinnedBriefs: updatedPinned });
      
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to pin brief' });
    }
  },
  
  searchBriefs: async (query: string): Promise<Brief[]> => {
    try {
      if (!window.electronAPI) {
        // Mock search results for browser development
        return [];
      }
      
      return await window.electronAPI.searchBriefs(query);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Search failed' });
      return [];
    }
  },
}));

// Electron API interface
declare global {
  interface Window {
    electronAPI: {
      askAgent: (request: AskRequest) => Promise<AskResponse>;
      searchBriefs: (query: string) => Promise<Brief[]>;
      getPinnedBriefs: () => Promise<Brief[]>;
      pinBrief: (id: string, pinned: boolean) => Promise<void>;
      
      // Event listeners
      onTriggerVoiceAsk: (callback: () => void) => void;
      onTriggerHighlightExplain: (callback: (text: string) => void) => void;
      onPrivacyModeChanged: (callback: (enabled: boolean) => void) => void;
    };
  }
}