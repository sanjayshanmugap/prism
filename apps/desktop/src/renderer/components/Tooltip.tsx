import React, { useState, useEffect } from 'react';
import { useAppStore } from '../state/store';

interface TooltipProps {
  text?: string;
  x?: number;
  y?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, x = 100, y = 100 }) => {
  const { askAgent, isLoading } = useAppStore();
  const [brief, setBrief] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (text && text.trim().length > 0) {
      setIsVisible(true);
      handleExplainText(text);
    }
  }, [text]);

  const handleExplainText = async (selectedText: string) => {
    try {
      await askAgent({
        query: 'Explain this text',
        mode: 'highlight',
        selectionText: selectedText,
      });
    } catch (error) {
      console.error('Error explaining text:', error);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setBrief(null);
  };

  const handleExpandToPanel = () => {
    // The brief will already be set in the store from askAgent
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed z-50 pointer-events-auto"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        maxWidth: '320px',
      }}
    >
      <div className="glass-panel p-4 shadow-2xl border border-white/30">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-white font-medium text-sm">Quick Explain</div>
          <button
            onClick={handleClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="w-4 h-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
            <span className="ml-2 text-white/70 text-sm">Analyzing...</span>
          </div>
        ) : brief ? (
          <div className="space-y-3">
            {/* Summary */}
            <p className="text-white/90 text-sm leading-relaxed">
              {brief.summary}
            </p>

            {/* Key points (limit to 2 for tooltip) */}
            {brief.bullets && brief.bullets.length > 0 && (
              <ul className="space-y-1">
                {brief.bullets.slice(0, 2).map((bullet: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-white/60 text-xs mt-1">•</span>
                    <span className="text-white/80 text-xs leading-relaxed flex-1">
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                onClick={handleExpandToPanel}
                className="text-blue-300 hover:text-blue-200 text-xs font-medium transition-colors"
              >
                View Full Brief →
              </button>
              
              {brief.citations && brief.citations.length > 0 && (
                <a
                  href={brief.citations[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white/80 text-xs transition-colors"
                >
                  Source ↗
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="text-white/60 text-sm">
            Unable to analyze the selected text.
          </div>
        )}
      </div>
    </div>
  );
};