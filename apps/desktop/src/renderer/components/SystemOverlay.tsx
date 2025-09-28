import React, { useState, useEffect } from 'react';
import { Minimize2, Maximize2, X, Settings } from 'lucide-react';

interface SystemOverlayProps {
  isVisible: boolean;
  onVisibilityChange: (visible: boolean) => void;
}

interface VoiceState {
  isListening: boolean;
  transcript: string;
  isSpeaking: boolean;
  error?: string;
}

export const SystemOverlay: React.FC<SystemOverlayProps> = ({
  isVisible,
  onVisibilityChange,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    transcript: '',
    isSpeaking: false,
  });
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [insights, setInsights] = useState<string[]>([]);
  const [actions, setActions] = useState<Array<{text: string, type: string, active: boolean}>>([]);
  const [aiResponse, setAiResponse] = useState('');
  const [isLightBackground, setIsLightBackground] = useState(false);

  // Listen for electron events
  useEffect(() => {
    if (window.electronAPI) {
      // Listen for trigger events
      window.electronAPI.onTriggerVoiceAsk(() => {
        startVoiceRecognition();
      });

      window.electronAPI.onTriggerHighlightExplain((text: string) => {
        setCurrentQuestion(`Explain this: ${text}`);
      });

      window.electronAPI.onOverlayVisible((visible: boolean) => {
        onVisibilityChange(visible);
      });
    }
  }, [onVisibilityChange]);

  // Detect background brightness
  useEffect(() => {
    const detectBackgroundBrightness = () => {
      // Simple brightness detection based on time of day as fallback
      const hour = new Date().getHours();
      setIsLightBackground(hour >= 6 && hour <= 18);
    };

    detectBackgroundBrightness();
    const interval = setInterval(detectBackgroundBrightness, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const startVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setVoiceState(prev => ({ ...prev, isListening: true }));
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setVoiceState(prev => ({ ...prev, transcript }));
        
        // Check if it's a question
        if (transcript.length > 10 && (
          /^(what|how|why|when|where|who|which|can|could|would|should|is|are|do|does|did)\b/i.test(transcript.trim()) || 
          transcript.trim().endsWith('?')
        )) {
          setCurrentQuestion(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        setVoiceState(prev => ({ ...prev, error: event.error, isListening: false }));
      };

      recognition.onend = () => {
        setVoiceState(prev => ({ ...prev, isListening: false }));
      };

      recognition.start();
    }
  };

  const toggleVoice = () => {
    if (voiceState.isListening) {
      // Stop recognition
      setVoiceState(prev => ({ ...prev, isListening: false }));
    } else {
      startVoiceRecognition();
    }
  };

  const closeOverlay = () => {
    if (window.electronAPI) {
      window.electronAPI.hideOverlay();
    } else {
      onVisibilityChange(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="system-overlay">
      {/* Control Bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 system-overlay-interactive">
        <div className={`
          flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border theme-transition
          ${isLightBackground 
            ? 'bg-white/80 border-gray-200/50 text-gray-900' 
            : 'bg-black/80 border-gray-700/50 text-white'
          }
          shadow-lg transition-all duration-300
        `}>
          <button
            onClick={toggleVoice}
            className={`
              w-8 h-8 rounded-full flex items-center justify-center transition-all
              ${voiceState.isListening 
                ? 'bg-red-500 text-white voice-active' 
                : isLightBackground 
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }
            `}
          >
            🎤
          </button>
          
          <div className="text-sm font-medium">
            {voiceState.isListening ? 'Listening...' : 'Prism AI'}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className={`
                w-6 h-6 rounded flex items-center justify-center
                ${isLightBackground 
                  ? 'hover:bg-gray-200 text-gray-600' 
                  : 'hover:bg-gray-700 text-gray-300'
                }
              `}
            >
              {isMinimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
            </button>
            
            <button
              onClick={closeOverlay}
              className={`
                w-6 h-6 rounded flex items-center justify-center
                ${isLightBackground 
                  ? 'hover:bg-gray-200 text-gray-600' 
                  : 'hover:bg-gray-700 text-gray-300'
                }
              `}
            >
              <X size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Voice Indicator */}
      {voiceState.isListening && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 pointer-events-none">
          <div className={`
            px-3 py-2 rounded-lg backdrop-blur-md
            ${isLightBackground 
              ? 'bg-white/90 text-gray-900 border border-gray-200/50' 
              : 'bg-black/90 text-white border border-gray-700/50'
            }
            text-sm shadow-lg
          `}>
            {voiceState.transcript || 'Listening for your voice...'}
          </div>
        </div>
      )}

      {/* Main Content Panels */}
      {!isMinimized && (
        <div className="absolute inset-0 flex items-start justify-between p-6 pt-24 pointer-events-none gap-6">
          {/* Live Insights Panel */}
          <div className="w-80 system-overlay-interactive">
            <div className={`
              rounded-xl backdrop-blur-md border p-4 shadow-xl overlay-panel theme-transition
              ${isLightBackground 
                ? 'bg-white/90 border-gray-200/50' 
                : 'bg-black/90 border-gray-700/50'
              }
              max-h-[70vh] overflow-y-auto
            `}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <h3 className={`font-semibold ${isLightBackground ? 'text-gray-900' : 'text-white'}`}>
                  Live Insights
                </h3>
              </div>
              
              {insights.length > 0 ? (
                <div className="space-y-2">
                  {insights.map((insight, index) => (
                    <div key={index} className={`
                      p-2 rounded-lg text-sm
                      ${isLightBackground ? 'bg-gray-100 text-gray-700' : 'bg-gray-800 text-gray-300'}
                    `}>
                      {insight}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-sm ${isLightBackground ? 'text-gray-500' : 'text-gray-400'}`}>
                  Start speaking or browsing to see insights...
                </div>
              )}

              {actions.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className={`text-sm font-medium ${isLightBackground ? 'text-gray-700' : 'text-gray-300'}`}>
                    Quick Actions
                  </h4>
                  {actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(action.text)}
                      className={`
                        w-full text-left p-2 rounded-lg text-sm transition-all
                        ${action.active
                          ? 'bg-blue-500 text-white'
                          : isLightBackground 
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }
                      `}
                    >
                      {action.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* AI Response Panel */}
          <div className="w-80 system-overlay-interactive">
            <div className={`
              rounded-xl backdrop-blur-md border p-4 shadow-xl overlay-panel theme-transition
              ${isLightBackground 
                ? 'bg-white/90 border-gray-200/50' 
                : 'bg-black/90 border-gray-700/50'
              }
              max-h-[70vh] overflow-y-auto
            `}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <h3 className={`font-semibold ${isLightBackground ? 'text-gray-900' : 'text-white'}`}>
                  AI Response
                </h3>
              </div>
              
              {currentQuestion && (
                <div className={`
                  p-3 rounded-lg mb-4 border-l-4 border-blue-500
                  ${isLightBackground ? 'bg-blue-50 text-blue-900' : 'bg-blue-900/30 text-blue-100'}
                `}>
                  <div className="text-sm font-medium mb-1">Question:</div>
                  <div className="text-sm">{currentQuestion}</div>
                </div>
              )}
              
              {aiResponse ? (
                <div className={`
                  prose prose-sm max-w-none
                  ${isLightBackground ? 'text-gray-700' : 'text-gray-300'}
                `}>
                  {aiResponse}
                </div>
              ) : currentQuestion ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className={`text-sm ${isLightBackground ? 'text-gray-600' : 'text-gray-400'}`}>
                    Thinking...
                  </span>
                </div>
              ) : (
                <div className={`text-sm ${isLightBackground ? 'text-gray-500' : 'text-gray-400'}`}>
                  Ask a question to get started...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};