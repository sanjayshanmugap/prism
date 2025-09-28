import React from 'react';

export const Settings: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      <div className="space-y-4">
        <h2 className="text-white font-semibold text-lg">Settings</h2>
        
        {/* Shortcuts */}
        <div className="space-y-3">
          <h3 className="text-white font-medium text-sm">Keyboard Shortcuts</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center glass-panel p-3">
              <span className="text-white/90 text-sm">Voice Ask</span>
              <kbd className="px-2 py-1 bg-white/10 rounded text-white/70 text-xs">
                Ctrl+Shift+V
              </kbd>
            </div>
            <div className="flex justify-between items-center glass-panel p-3">
              <span className="text-white/90 text-sm">Highlight Explain</span>
              <kbd className="px-2 py-1 bg-white/10 rounded text-white/70 text-xs">
                Ctrl+Shift+/
              </kbd>
            </div>
            <div className="flex justify-between items-center glass-panel p-3">
              <span className="text-white/90 text-sm">Toggle Panel</span>
              <kbd className="px-2 py-1 bg-white/10 rounded text-white/70 text-xs">
                Ctrl+Shift+Space
              </kbd>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="space-y-3">
          <h3 className="text-white font-medium text-sm">Privacy</h3>
          <div className="space-y-2">
            <label className="flex items-center justify-between glass-panel p-3 cursor-pointer">
              <span className="text-white/90 text-sm">Auto-clear clipboard</span>
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-white/20 bg-white/10"
                defaultChecked
              />
            </label>
            <label className="flex items-center justify-between glass-panel p-3 cursor-pointer">
              <span className="text-white/90 text-sm">No-audio mode</span>
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-white/20 bg-white/10"
              />
            </label>
            <label className="flex items-center justify-between glass-panel p-3 cursor-pointer">
              <span className="text-white/90 text-sm">Click-through overlay</span>
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-white/20 bg-white/10"
              />
            </label>
          </div>
        </div>

        {/* About */}
        <div className="space-y-3">
          <h3 className="text-white font-medium text-sm">About</h3>
          <div className="glass-panel p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">Version</span>
              <span className="text-white/90 text-sm">0.1.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">Build</span>
              <span className="text-white/90 text-sm">Development</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};