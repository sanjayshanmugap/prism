import React, { useState } from 'react';
import { useAppStore } from '../../state/store';

export const Result: React.FC = () => {
  const { currentBrief, isSpeaking, setSpeaking, pinBrief } = useAppStore();
  const [isPlaying, setIsPlaying] = useState(false);

  if (!currentBrief) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-white/60 text-sm">No brief selected</div>
          <div className="text-white/40 text-xs mt-2">
            Ask a question to see results here
          </div>
        </div>
      </div>
    );
  }

  const handleTTS = () => {
    if (!window.speechSynthesis) {
      console.warn('Speech synthesis not supported');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(
      `${currentBrief.title}. ${currentBrief.summary} ${currentBrief.bullets.join('. ')}`
    );
    
    utterance.onstart = () => {
      setIsPlaying(true);
      setSpeaking(true);
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      setSpeaking(false);
    };
    
    utterance.onerror = () => {
      setIsPlaying(false);
      setSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePin = async () => {
    try {
      await pinBrief(currentBrief.id, true);
    } catch (error) {
      console.error('Failed to pin brief:', error);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Header with controls */}
      <div className="flex items-start justify-between">
        <h1 className="text-white font-semibold text-lg leading-tight flex-1">
          {currentBrief.title}
        </h1>
        <div className="flex items-center space-x-2 ml-3">
          <button
            onClick={handleTTS}
            className="glass-button p-2 text-white/70 hover:text-white transition-colors"
            title={isPlaying ? 'Stop reading' : 'Read aloud'}
          >
            {isPlaying ? '⏸️' : '🔊'}
          </button>
          <button
            onClick={handlePin}
            className="glass-button p-2 text-white/70 hover:text-white transition-colors"
            title="Pin this brief"
          >
            📌
          </button>
        </div>
      </div>

      {/* Context info */}
      {currentBrief.context && (
        <div className="glass-panel p-3">
          <div className="text-white/60 text-xs mb-1">Context</div>
          {currentBrief.context.url && (
            <div className="text-white/80 text-xs truncate">
              🔗 {currentBrief.context.url}
            </div>
          )}
          {currentBrief.context.timestampSec && (
            <div className="text-white/80 text-xs">
              ⏰ {Math.floor(currentBrief.context.timestampSec / 60)}:
              {String(currentBrief.context.timestampSec % 60).padStart(2, '0')}
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      <div className="space-y-2">
        <h3 className="text-white font-medium text-sm">Summary</h3>
        <p className="text-white/90 text-sm leading-relaxed">
          {currentBrief.summary}
        </p>
      </div>

      {/* Key Points */}
      <div className="space-y-2">
        <h3 className="text-white font-medium text-sm">Key Points</h3>
        <ul className="space-y-2">
          {currentBrief.bullets.map((bullet, index) => (
            <li key={index} className="flex items-start space-x-2">
              <span className="text-white/60 text-xs mt-1">•</span>
              <span className="text-white/90 text-sm leading-relaxed flex-1">
                {bullet}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Citations */}
      <div className="space-y-2">
        <h3 className="text-white font-medium text-sm">Sources</h3>
        <div className="space-y-2">
          {currentBrief.citations.map((citation, index) => (
            <a
              key={index}
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-button p-3 block hover:bg-white/15 transition-colors"
            >
              <div className="text-white text-sm font-medium truncate">
                {citation.title}
              </div>
              <div className="text-white/60 text-xs mt-1 flex items-center space-x-2">
                {citation.publisher && (
                  <span>{citation.publisher}</span>
                )}
                {citation.publishedAt && (
                  <span>• {new Date(citation.publishedAt).toLocaleDateString()}</span>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Timestamp */}
      <div className="text-white/40 text-xs text-center pt-4 border-t border-white/10">
        Generated {new Date(currentBrief.createdAt).toLocaleString()}
      </div>
    </div>
  );
};