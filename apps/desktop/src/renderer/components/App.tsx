import React, { useEffect } from 'react';
import { useAppStore } from '../state/store';
import { CedarPanel } from './CedarPanel';
import { Tooltip } from './Tooltip';

export const App: React.FC = () => {
  const { isVisible, activeView, setVisible, askAgent } = useAppStore();

  useEffect(() => {
    // For development, make the app visible by default
    if (!window.electronAPI) {
      setVisible(true);
    }

    // Listen for events from main process
    if (window.electronAPI) {
      window.electronAPI.onTriggerVoiceAsk(() => {
        setVisible(true);
        // Trigger voice input
        handleVoiceAsk();
      });

      window.electronAPI.onTriggerHighlightExplain((text: string) => {
        handleHighlightExplain(text);
      });

      window.electronAPI.onPrivacyModeChanged((enabled: boolean) => {
        console.log('Privacy mode changed:', enabled);
      });
    }
  }, [setVisible]);

  const handleVoiceAsk = async () => {
    // For MVP, we'll simulate voice input with a prompt
    const query = prompt('What would you like to know?');
    if (query) {
      await askAgent({
        query,
        mode: 'article',
        context: {
          url: window.location.href,
          title: document.title,
        },
      });
    }
  };

  const handleHighlightExplain = async (text: string) => {
    await askAgent({
      query: 'Explain this text',
      mode: 'highlight',
      selectionText: text,
      context: {
        url: window.location.href,
        title: document.title,
      },
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Glass overlay background */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto" 
           onClick={() => setVisible(false)} />
      
      {/* Main panel */}
      <div className="absolute right-4 top-4 bottom-4 w-96 pointer-events-auto">
        <CedarPanel />
      </div>
      
      {/* Tooltip for quick explanations */}
      {activeView === 'result' && (
        <Tooltip />
      )}
    </div>
  );
};