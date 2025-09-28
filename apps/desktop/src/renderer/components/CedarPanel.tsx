import React from 'react';
import { useAppStore } from '../state/store';
import { Home } from './views/Home';
import { Result } from './views/Result';
import { Settings } from './views/Settings';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';

export const CedarPanel: React.FC = () => {
  const { 
    activeView, 
    isLoading, 
    error, 
    isMinimized, 
    setMinimized, 
    setVisible,
    setActiveView
  } = useAppStore();

  return (
    <div className="h-full flex flex-col bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white font-medium">Prism AI</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMinimized(!isMinimized)}
            className="p-1 hover:bg-white/10 rounded text-white/70 hover:text-white transition-colors"
          >
            {isMinimized ? '□' : '−'}
          </button>
          <button
            onClick={() => setVisible(false)}
            className="p-1 hover:bg-white/10 rounded text-white/70 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Navigation */}
      {!isMinimized && (
        <div className="flex border-b border-white/10">
          {[
            { key: 'home', label: 'Home' },
            { key: 'result', label: 'Result' },
            { key: 'settings', label: 'Settings' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveView(key as any)}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                activeView === key
                  ? 'text-white bg-white/10'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isMinimized ? (
          <div className="p-4 text-center">
            <div className="text-white/70 text-sm">
              Prism AI - Ready
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="p-4">
                <ErrorMessage message={error} />
              </div>
            )}
            
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                {activeView === 'home' && <Home />}
                {activeView === 'result' && <Result />}
                {activeView === 'settings' && <Settings />}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};