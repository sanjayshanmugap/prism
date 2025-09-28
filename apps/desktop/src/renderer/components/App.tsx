import React, { useEffect, useState } from 'react';
import { useAppStore } from '../state/store';
import { SystemOverlay } from './SystemOverlay';

export const App: React.FC = () => {
  const { isVisible, setVisible, askAgent } = useAppStore();
  const [overlayVisible, setOverlayVisible] = useState(false);

  useEffect(() => {
    // For development, make the app visible by default
    if (!window.electronAPI) {
      setOverlayVisible(true);
    }

    // Listen for events from main process
    if (window.electronAPI) {
      window.electronAPI.onTriggerVoiceAsk(() => {
        setOverlayVisible(true);
      });

      window.electronAPI.onTriggerHighlightExplain((text: string) => {
        setOverlayVisible(true);
        handleHighlightExplain(text);
      });

      window.electronAPI.onOverlayVisible((visible: boolean) => {
        setOverlayVisible(visible);
      });

      window.electronAPI.onPrivacyModeChanged((enabled: boolean) => {
        console.log('Privacy mode changed:', enabled);
      });
    }
  }, []);

  const handleHighlightExplain = async (text: string) => {
    await askAgent({
      query: 'Explain this text',
      mode: 'highlight',
      selectionText: text,
      context: {
        url: 'System-wide selection',
        title: 'Highlighted Text',
      },
    });
  };

  const handleVisibilityChange = (visible: boolean) => {
    setOverlayVisible(visible);
    if (window.electronAPI && !visible) {
      window.electronAPI.hideOverlay();
    }
  };

  return (
    <SystemOverlay
      isVisible={overlayVisible}
      onVisibilityChange={handleVisibilityChange}
    />
  );
};